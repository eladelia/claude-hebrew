# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and versions follow
[Semantic Versioning](https://semver.org/).

## [1.0.0] - 2026-11-18

### Added

- `hebrew-final` plugin 1.0.0: holds the final reply of a turn until it is whole and translates a mostly-English reply (50% or more Latin letters) to Hebrew with one small model call before it is shown or recorded.
- `rtl-text` plugin 1.0.0: draws reply lines that open with a Latin letter right-to-left (an invisible U+200F mark in the drawing only).
- `hooks/hebrew-guard.py`: a Stop hook that asks once for a Hebrew rewrite when a final reply is still mostly English, with `hooks/settings-snippet.json`.
- `rules/CLAUDE.md`: Hebrew reply rules to append to `~/.claude/CLAUDE.md`.
- Marketplace manifest `.claude-plugin/marketplace.json` listing both plugins.
