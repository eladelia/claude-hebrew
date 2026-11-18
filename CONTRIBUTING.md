# Contributing

Issues and pull requests are welcome. The project is small, so please keep changes focused.

## Layout

- `.claude-plugin/marketplace.json` - the `claude-hebrew` marketplace, listing both plugins.
- `plugins/rtl-text`, `plugins/hebrew-final` - each plugin has `.claude-plugin/plugin.json` and `hooks/` (`hooks.json` plus the `register.ts` module).
- `hooks/hebrew-guard.py` - the optional Stop hook, installed by hand (see the README).
- `rules/CLAUDE.md` - the rules snippet users append to `~/.claude/CLAUDE.md`.

## Checking a change

From the repository root, validate the marketplace and each plugin:

```bash
claude plugin validate .
claude plugin validate plugins/rtl-text
claude plugin validate plugins/hebrew-final
```

Run the plugin tests (currently `plugins/rtl-text/hooks/rtl.test.ts`):

```bash
claude plugin test plugins/rtl-text
```

To try a change locally, add your clone as a marketplace (`claude plugin marketplace add /path/to/claude-hebrew`) after removing any copy of the same plugins you already have installed, so two versions do not run side by side.

## Versioning

- Every change to a plugin bumps `version` in that plugin's `.claude-plugin/plugin.json` (and the version in the header comment of its `register.ts`). Installed copies update only when the version changes.
- Use semantic versioning: patch for fixes, minor for new behavior, major for changes that need users to act.
- Add an entry to `CHANGELOG.md` under a new version heading.

## Language

Code, comments and commit messages are in English. User-facing Hebrew text (`rules/CLAUDE.md` and the Hebrew strings in the code) keeps its rules: every line opens with a Hebrew word or a digit, plain hyphens only, no tables.
