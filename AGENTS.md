# AGENTS.md

This repository owns the `@kiln-ssg/tailwindcss` npm package and `kiln-tailwindcss` command. Preserve the command's one-input-file, stdout-CSS, nonzero-error contract with kiln.

Follow the global instructions and load `git-workflow` before commits, pushes, PR updates, or approved merges. Keep independent work in isolated worktrees. Do not publish npm versions or create release tags without an explicit release request.

Use Node's built-in test runner. Group command scenarios by successful behavior, variants, and errors. Keep fixtures temporary, verify emitted CSS and failures, and place helpers after their callers. Use the existing formatting and lint configurations. Markdown paragraphs are not hard-wrapped.

Versions are independent of kiln. Release tags use `vX.Y.Z`, and the single `release.yml` workflow owns npm publication and GitHub releases. Assign PRs to `hakula139`, use `enhancement` for features and `bug` for fixes, and use `## Summary` followed by `## Test plan` with a contiguous verification checklist.

Verify changes with `npm test`, `npm run format`, `npm run lint`, `npm run spellcheck`, `nix flake check`, and `nix build .#kiln-tailwindcss`. Changes to npm dependencies also require refreshing `npmDepsHash` in `default.nix`.
