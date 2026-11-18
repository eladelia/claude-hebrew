// hebrew-final 1.2.0: the final reply reaches the user in Hebrew, once.
// A `turn.step` hook holds every chunk of a main-loop model response until the response is whole. A step that
// calls tools is released as it came (working notes between tool calls may stay English). A step with no tool
// call is the turn's answer: its visible text is measured, and when Latin letters are 50% or more of its letters
// (code fences, inline code and links not counted) the text is translated to Hebrew by one small, tool-less
// model call and only the translation is released, so it is what the screen shows and the transcript records.
// Below the threshold the text is released as written. Any failure of the translation releases the original.
// Cost: the answer appears whole instead of streaming; a translated answer costs one extra small call on the
// text alone, never a second pass over the conversation.
import type { Register } from 'claude-code'

const SHARE = 0.5          // Latin share at or above this: translate
const MIN_LETTERS = 40     // shorter answers are released as they are ("OK", a path)
const TRANSLATOR = 'sonnet'
const HEB = /[֐-׿]/g
const LAT = /[A-Za-z]/g
const STRIP = /```[\s\S]*?```|`[^`\n]*`|https?:\/\/\S+|www\.\S+/g

const SYSTEM = [
  'You translate a Claude Code reply into natural, direct Hebrew for a Hebrew-speaking user.',
  'Rules: translate everything that is prose. Keep Markdown structure. Keep code blocks, inline code, commands, file paths, URLs, identifiers, server names, product names and ticket numbers exactly as they are.',
  'Every line must begin with a Hebrew word or a digit: when a line would begin with a Latin term, put a short Hebrew word before it (for example "הפקודה npm install" or "הקובץ config.json").',
  'Use a plain hyphen only, never an em dash. Do not add, omit, summarize or comment; output only the translated reply, nothing else.',
].join(' ')

const BOX_SYSTEM = [
  'You translate the short texts of a Claude Code end-of-turn box into natural Hebrew: a recap (two or three sentences), a question (one sentence) and button labels (one to three words each).',
  'The input holds these parts separated by a line of five equals signs (=====). Output the same number of parts, in the same order, separated the same way, translated; an empty part stays empty.',
  'Keep commands, file paths, identifiers, server names and product names exactly as they are. Begin each part with a Hebrew word or a digit. Plain hyphen only. Output nothing else.',
].join(' ')

type Chunk = { kind: string; index?: number; text?: string; [k: string]: unknown }

export function latinShare(text: string): { heb: number; lat: number; share: number } {
  const prose = text.replace(STRIP, ' ')
  const heb = (prose.match(HEB) ?? []).length
  const lat = (prose.match(LAT) ?? []).length
  return { heb, lat, share: heb + lat ? lat / (heb + lat) : 0 }
}

export const register: Register = on => {
  // 1.2.0: the box is translated instead of refused. A refusal drew a red "Failed" row for the
  // tool call; a rewrite of the call's own input (next({ ...e, recap, ask, actions })) draws nothing extra and needs
  // no second call by the model. The recap, the ask and each label are translated together in one small call; if
  // the translation fails the box goes through as written (the writing rules still ask for Hebrew).
  on('tool.call', { tool: 'mcp__ccd_turn__wrap_up' }, async ($, e, next) => {
    const x = e as unknown as { recap?: string; ask?: string; actions?: { label?: string; action?: string }[] }
    const labels = (x.actions ?? []).map(a => a.label ?? '')
    const parts = [x.recap ?? '', x.ask ?? '', ...labels]
    const { heb, lat, share } = latinShare(parts.join('\n'))
    if (heb + lat < 10 || share < SHARE) return next(e)
    const SEP = '\n=====\n'
    try {
      const r = await $.model.complete({
        model: TRANSLATOR,
        system: BOX_SYSTEM,
        prompt: parts.join(SEP),
        effort: 'low',
        maxTokens: 2000,
        timeoutMs: 60000,
      })
      if (!r.isAnswered) { return next(e) }
      const out = r.text.split(/\n?=====\n?/).map(s => s.trim())
      if (out.length !== parts.length) { return next(e) }
      const [recap, ask, ...newLabels] = out
      const actions = (x.actions ?? []).map((a, i) => (a.label ? { ...a, label: newLabels[i] || a.label } : a)) 
      return next({ ...e, ...(x.recap !== undefined ? { recap } : {}), ...(x.ask !== undefined ? { ask } : {}), ...(x.actions ? { actions } : {}) } as typeof e)
    } catch (err) { 
      return next(e)
    }
  }).catch(($, e, next) => next(e))

  on('turn.step', async function* ($, e, next) {
    if (e.agentId !== undefined) return yield* next(e)
    // Hold the whole response. The stream's return value is the step's result.
    const buf: Chunk[] = []
    const stream = next(e)
    let result: unknown
    for (;;) {
      const n = await stream.next()
      if (n.done) { result = n.value; break }
      buf.push(n.value as Chunk)
    }
    const hasTool = buf.some(c => c.kind === 'tool')
    const textChunks = buf.filter(c => c.kind === 'text' && typeof c.text === 'string')
    const text = textChunks.map(c => c.text as string).join('')
    if (hasTool || !text.trim()) {
      for (const c of buf) yield c as never
      return result as never
    }
    const { heb, lat, share } = latinShare(text)
    if (heb + lat < MIN_LETTERS || share < SHARE) {
      for (const c of buf) yield c as never
      return result as never
    }
    let translated = ''
    try {
      const r = await $.model.complete({
        model: TRANSLATOR,
        system: SYSTEM,
        prompt: text,
        effort: 'low',
        maxTokens: Math.min(32000, Math.max(1500, text.length + 500)),
        timeoutMs: 120000,
      })
      if (r.isAnswered && r.text.trim()) translated = r.text.trim()
    } catch {
      // the original is released below
    }
    if (!translated) {
      for (const c of buf) yield c as never
      return result as never
    }
    // Release everything in order; the first text chunk carries the whole translation, the other text chunks
    // are dropped (a block whose chunks are all dropped is dropped).
    let placed = false
    for (const c of buf) {
      if (c.kind === 'text') {
        if (placed) continue
        placed = true
        yield { ...c, text: translated } as never
      } else {
        yield c as never
      }
    }
    return result as never
  })
}
