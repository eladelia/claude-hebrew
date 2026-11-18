# claude-hebrew

Hebrew replies in Claude Code: right-aligned, in Hebrew, once.

A small package for Hebrew speakers who use [Claude Code](https://claude.com/claude-code) and want its replies in Hebrew, without the model drifting into English and without paragraphs flipping to left alignment. It does not touch the work itself: code, commands, working notes between tool calls and everything the model does behind the scenes stay in English. Only the final reply you read is in Hebrew.

## What's inside

| Part | What it does |
| --- | --- |
| `rules/CLAUDE.md` | A rules snippet you append to your global `~/.claude/CLAUDE.md`. It prevents English replies up front, and in the vast majority of cases it is enough on its own. |
| `plugins/hebrew-final` | Holds the final reply of a turn until it is whole. If the reply is mostly English (50% or more of its letters are Latin, not counting code), it is translated to Hebrew by one small model call before it is shown. You see one reply, in Hebrew, and the model does not redo the work. If the desktop app's end-of-turn box (recap, question, buttons) comes out mostly in English, it is refused before it is drawn and the model writes it again in Hebrew; the refused call shows as one quiet line, not a red error. |
| `plugins/rtl-text` | Display only. The app sets a paragraph's direction from its first letter, so a Hebrew line that opens with a Latin term (a command, a server name, a ticket id) is left-aligned. The plugin adds an invisible right-to-left mark to such lines in the drawing only. Lines with no Hebrew stay left-to-right. |
| `hooks/hebrew-guard.py` + `hooks/settings-snippet.json` | An optional Stop hook that runs after every reply. If a reply still comes out mostly English, it asks the model once to rewrite it in Hebrew. With both plugins installed it almost never fires. |

## Requirements

- Claude Code with plugin support.
- Python 3, only for the optional Stop hook.

Everything runs on your own machine. No server, no extra account.

## Installation

### 1. Plugins

From a terminal, in any folder:

```bash
claude plugin marketplace add eladelia/claude-hebrew
claude plugin install hebrew-final@claude-hebrew --scope user
claude plugin install rtl-text@claude-hebrew --scope user
```

In the Claude desktop app you can instead click the plus next to the message box, choose **Plugins**, add the marketplace `eladelia/claude-hebrew`, and then add both plugins.

### 2. Rules

Clone the repository (or download the ZIP from the **Code** button on this page):

```bash
git clone https://github.com/eladelia/claude-hebrew.git ~/claude-hebrew
```

Append the contents of `rules/CLAUDE.md` to the end of `~/.claude/CLAUDE.md`. If you have no such file yet, copy it there as is:

```bash
cat ~/claude-hebrew/rules/CLAUDE.md >> ~/.claude/CLAUDE.md
```

### 3. Stop hook (optional)

Copy the hook into place:

```bash
mkdir -p ~/.claude/hooks
cp ~/claude-hebrew/hooks/hebrew-guard.py ~/.claude/hooks/
```

Then merge `hooks/settings-snippet.json` into `~/.claude/settings.json`. If that file already has a `hooks` key, add the `Stop` entry inside it. On Windows, replace `python3` with `python` and `$HOME` with the full path of your user folder.

### 4. Reload

Start a new session, or type `/reload-plugins` in an open one. The rules are read only when a session starts.

## Checking that it works

1. Ask Claude explicitly: "Write me a paragraph in English about the weather." With everything installed you get a single paragraph in Hebrew, with no English version before it.
2. Ask: "Start a line with the word SERVER01 and continue it with a sentence in Hebrew." The line is right-aligned.

## Good to know

- The final reply appears all at once when it is ready instead of streaming word by word. That is the cost of checking it before it is shown.
- A translated reply is stored in the conversation in its translated form, so the rest of the conversation continues in Hebrew.
- Translation uses a small model (Sonnet) on the reply text alone, without the conversation history, so it is cheap. The model, the 50% threshold and the translation prompt are constants at the top of `plugins/hebrew-final/hooks/register.ts`.
- English working notes between tool calls are left alone on purpose: they save tokens, and they are not meant for you to read.

## Uninstall

```bash
claude plugin uninstall hebrew-final@claude-hebrew --scope user
claude plugin uninstall rtl-text@claude-hebrew --scope user
claude plugin marketplace remove claude-hebrew
```

Then remove the `Stop` hook entry from `~/.claude/settings.json`, delete `~/.claude/hooks/hebrew-guard.py`, and remove the rules snippet from `~/.claude/CLAUDE.md`.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Changes are listed in [CHANGELOG.md](CHANGELOG.md).

## License

[MIT](LICENSE) © 2026 Elad Elia
