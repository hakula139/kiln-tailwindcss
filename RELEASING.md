# Releasing

Use the [release skill][release-skill] for preparation, notes curation, the release PR, approved tagging, and recovery. This document defines the kiln-tailwindcss release contract.

The npm package is versioned independently of kiln. Update its manifest and lockfile without creating an npm-generated tag:

```bash
npm version X.Y.Z --no-git-tag-version
nix run --inputs-from . nixpkgs#prefetch-npm-deps -- package-lock.json
```

Update `npmDepsHash` in `default.nix` and run the development checks in the README. This package uses GitHub generated release notes.

The `release.yml` workflow verifies that the tag matches the package version, runs command tests, and publishes through npm's GitHub OIDC trusted publisher. Stable versions use `latest`, and prereleases use `next`. The GitHub release follows successful npm publication.

Configure the trusted publisher for `@kiln-ssg/tailwindcss` to allow `hakula139/kiln-tailwindcss` through `release.yml`. npm versions are immutable. Fix an already published package with a new version.

[release-skill]: https://github.com/hakula139/plugins/blob/main/plugins/hakula-workflow/skills/release/SKILL.md
