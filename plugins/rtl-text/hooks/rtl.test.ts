import { expect, test } from 'claude-code/testing'

const ROW = { plugin: 'rtl-text', component: 'AssistantMessage' } as const

test('a line opening with a Latin word is drawn with a right-to-left mark, on terminal and desktop', async ($, on) => {
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  let seen = ''
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)
    seen = String((e.props as { text?: string }).text ?? '')
    return h(Text, {}, seen)
  })
  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ ...ROW, surface, props: { text: 'TERM10 שלח את המייל.\nהשורה הזאת בעברית.\n```\nls -la\n```\n10 שרתים עלו.\nChecking the service now.', isFirstOfReply: true } })
    expect(seen.split('\n')[0]).toBe('‏TERM10 שלח את המייל.')
    expect(seen.split('\n')[1]).toBe('השורה הזאת בעברית.')
    expect(seen.split('\n')[3]).toBe('ls -la')
    expect(seen.split('\n')[5]).toBe('10 שרתים עלו.')
    expect(seen.split('\n')[6]).toBe('Checking the service now.')
    await ui.unmount()
  }
})
