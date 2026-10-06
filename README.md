# @kiln-ssg/tailwindcss

The Tailwind CSS processor for [kiln](https://github.com/hakula139/kiln). It includes Tailwind CSS and its typography plugin, exposing the `kiln-tailwindcss` command that kiln invokes for site and page stylesheets.

## Installation

Install the published package with Node.js 20 or later:

```bash
npm install -g @kiln-ssg/tailwindcss
```

Nix users can install the package from this repository:

```bash
nix profile add github:hakula139/kiln-tailwindcss
```

Kiln's Nix package supplies this processor automatically. Set `[css] processor = "tailwind"` in the site or theme configuration to select it.

## Command contract

```bash
kiln-tailwindcss input.css > output.css
```

The command reads one UTF-8 stylesheet, resolves imports and plugins relative to that input and the processor's installed dependencies, scans Tailwind's declared sources, and writes compiled CSS to stdout. Compilation errors produce a nonzero exit status and diagnostics on stderr. Kiln generates the input stylesheet with its content and template sources and shared stylesheet references.

## Development

```bash
nix develop
npm ci
npm test
npm run format
npm run lint
npm run spellcheck
nix flake check
nix build .#kiln-tailwindcss
```

The flake exposes `packages.<system>.default` and `packages.<system>.kiln-tailwindcss`.

See [RELEASING.md](RELEASING.md) for independent npm releases.
