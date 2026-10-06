# Releasing

The npm package is versioned independently of kiln. Update the manifest and lockfile without creating an npm-generated tag:

```bash
npm version X.Y.Z --no-git-tag-version
nix run --inputs-from . nixpkgs#prefetch-npm-deps -- package-lock.json
```

Update `npmDepsHash` in `default.nix`, run the development checks in the README, and commit the verified release preparation. Tag that commit and push the tag when the release is approved:

```bash
git tag vX.Y.Z
git push origin vX.Y.Z
```

The `release.yml` workflow checks that the tag matches the package version, runs the command tests, and publishes through npm's GitHub OIDC trusted publisher. Stable versions use `latest`, and prereleases use `next`. After npm publication succeeds, the same workflow creates a GitHub release with generated notes.

Configure the trusted publisher for `@kiln-ssg/tailwindcss` to allow `hakula139/kiln-tailwindcss` through `release.yml` before the first release from this repository. Changing repository metadata requires a new package version. npm versions are immutable, so preserve `0.1.0` and use the prepared `0.1.1` version for the repository migration. Rerun only failed jobs, and fix an already published package with a new version.
