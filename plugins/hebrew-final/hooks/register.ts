// hebrew-final 1.0.0: the final reply reaches the user in Hebrew, once.
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

type Chunk = { kind: string; index?: number; text?: string; [k: string]: unknown }

export function latinShare(text: string): { heb: number; lat: number; share: number } {
  const prose = text.replace(STRIP, ' ')
  const heb = (prose.match(HEB) ?? []).length
  const lat = (prose.match(LAT) ?? []).length
  return { heb, lat, share: heb + lat ? lat / (heb + lat) : 0 }
}

export const register: Register = on => {
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
