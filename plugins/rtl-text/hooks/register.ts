// rtl-text 1.0.0: display only. A reply line that opens with a Latin letter is drawn left-to-right by the app
// (direction follows the first strong letter), which left-aligns the whole paragraph for a Hebrew reader. This
// mod prepends a right-to-left mark (U+200F, invisible) to such lines in the DRAWING of an assistant block, on
// every surface. The stored message and what the model wrote are untouched. Lines inside code fences are left
// alone. Nothing else is changed.
import type { Register } from 'claude-code'

const RLM = '‏'
const HEB = /[֐-׿]/
const LAT = /[A-Za-z]/

function opensLatin(line: string): boolean {
  for (const ch of line) {
    if (HEB.test(ch)) return false
    if (LAT.test(ch)) return true
  }
  return false
}

export function rtlFix(text: string): string {
  let fence = false
  return text.split('\n').map(line => {
    const s = line.trimStart()
    if (s.startsWith('```')) { fence = !fence; return line }
    if (fence || !s || s.startsWith(RLM)) return line
    if (!opensLatin(s)) return line
    const pad = line.length - s.length
    return line.slice(0, pad) + RLM + s
  }).join('\n')
}

export const register: Register = on => {
  on('ui.render', { component: 'AssistantMessage' }, async ($, e, next) => {
    const p = e.props as { text?: string; isSummary?: true }
    if (p.isSummary || typeof p.text !== 'string') return next(e)
    const fixed = rtlFix(p.text)
    if (fixed === p.text) return next(e)
    return next({ ...e, props: { ...e.props, text: fixed } })
  }).catch(($, e, next) => next(e))
}
