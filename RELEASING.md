# Releasing

Use the [release skill](https://github.com/hakula139/plugins/blob/main/plugins/hakula-workflow/skills/release/SKILL.md) for the shared procedure. The npm package is versioned independently of kiln. Bump the manifest without an npm-generated tag:

```bash
pnpm version X.Y.Z --no-git-tag-version
```

`release.yml` publishes the package with `pnpm publish --provenance` through npm's GitHub OIDC trusted publisher, using `latest` for stable versions and `next` for prereleases. It creates the GitHub release with generated notes.

The trusted publisher for `@kiln-ssg/tailwindcss` allows `hakula139/kiln-tailwindcss` through `release.yml`, so renaming the workflow breaks publishing.
