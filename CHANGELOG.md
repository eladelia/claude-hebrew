# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and versions follow
[Semantic Versioning](https://semver.org/).

## [1.3.0] - 2026-11-18

### Changed

- `hebrew-final` plugin 1.3.0: a mostly-English end-of-turn box is refused again, and the model writes it again in Hebrew. The 1.2.0 rewrite was accepted by the engine, but the desktop app drew the box as the model first sent it, so the English box still showed. The refused call's row is now drawn as one quiet Hebrew line instead of a red "Failed" row.

## [1.2.0] - 2026-11-18

### Changed

- `hebrew-final` plugin 1.2.0: a mostly-English end-of-turn box is now translated instead of refused. The recap, question and button labels are translated together in one small model call and the Hebrew version is drawn, with no failed tool call on screen and no second call by the model. If the translation fails, the box goes through as written.

## [1.1.0] - 2026-11-18

### Added

- `hebrew-final` plugin 1.1.0: the desktop app's end-of-turn box (the `wrap_up` tool: recap, question and button labels) is held to Hebrew too. A box written mostly in English is refused before it is drawn, and the model writes it again in Hebrew.

## [1.0.2] - 2026-11-18

### Changed

- `rtl-text` plugin 1.0.2: the plugin description and the header comment of `register.ts` now state the 1.0.1 behavior (a Hebrew line that opens with a Latin term is drawn right-to-left; a line with no Hebrew stays left-to-right). No change in behavior.

## [1.0.1] - 2026-11-18

### Changed

- `rtl-text` plugin 1.0.1: the right-to-left mark is added only to a line that holds Hebrew; a line with no Hebrew at all (working notes between tool calls, or a reply written in English) stays left-to-right.

## [1.0.0] - 2026-11-18

### Added

- `hebrew-final` plugin 1.0.0: holds the final reply of a turn until it is whole and translates a mostly-English reply (50% or more Latin letters) to Hebrew with one small model call before it is shown or recorded.
- `rtl-text` plugin 1.0.0: draws reply lines that open with a Latin letter right-to-left (an invisible U+200F mark in the drawing only).
- `hooks/hebrew-guard.py`: a Stop hook that asks once for a Hebrew rewrite when a final reply is still mostly English, with `hooks/settings-snippet.json`.
- `rules/CLAUDE.md`: Hebrew reply rules to append to `~/.claude/CLAUDE.md`.
- Marketplace manifest `.claude-plugin/marketplace.json` listing both plugins.
