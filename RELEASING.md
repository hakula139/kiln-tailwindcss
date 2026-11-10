# Releasing

Use the [release skill](https://github.com/hakula139/plugins/blob/main/plugins/hakula-workflow/skills/release/SKILL.md) for the shared procedure. The npm package is versioned independently of kiln. Bump the manifest without an npm-generated tag:

```bash
pnpm version X.Y.Z --no-git-tag-version
```

On the pushed tag, `release.yml` checks that the tag matches the package version, waits for CI on the tagged commit, and runs `pnpm publish --provenance` through npm's GitHub OIDC trusted publisher, with `latest` for stable versions and `next` for prereleases. It then creates the GitHub release with generated notes.

The trusted publisher for `@kiln-ssg/tailwindcss` allows `hakula139/kiln-tailwindcss` through `release.yml`, so renaming the workflow breaks publishing. npm versions are immutable, so fix a published version with a new one. Run npm-only commands such as `npm trust` outside the checkout, as [devkit's pnpm guide](https://github.com/hakula139/devkit/blob/v3/docs/hooks.md#declare-pnpm) explains.
