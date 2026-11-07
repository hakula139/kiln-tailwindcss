# Releasing

Follow the [shared release procedure](https://github.com/hakula139/devkit/blob/88f619538cc3a79bf223e538504251264e02b4e9/docs/releasing.md). Prepare a release PR, merge it after approval and passing checks, then separately obtain approval to tag its squash commit.

The npm package is versioned independently of kiln. Update its manifest and lockfile without creating an npm-generated tag:

```bash
npm version X.Y.Z --no-git-tag-version
nix run --inputs-from . nixpkgs#prefetch-npm-deps -- package-lock.json
```

Update `npmDepsHash` in `default.nix` and run the development checks in the README. This package uses GitHub generated release notes.

The `release.yml` workflow verifies that the tag matches the package version, runs command tests, and publishes through npm's GitHub OIDC trusted publisher. Stable versions use `latest`, and prereleases use `next`. The GitHub release follows successful npm publication.

Configure the trusted publisher for `@kiln-ssg/tailwindcss` to allow `hakula139/kiln-tailwindcss` through `release.yml`. npm versions are immutable. Fix an already published package with a new version.
