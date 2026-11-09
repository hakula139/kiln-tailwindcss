{
  description = "Tailwind CSS processor for kiln";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-26.05";
    devkit = {
      url = "github:hakula139/devkit/v2";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs =
    {
      nixpkgs,
      devkit,
      ...
    }:
    devkit.lib.eachSystem devkit.lib.systems (
      system:
      let
        pkgs = import nixpkgs { inherit system; };
        processor = pkgs.callPackage ./default.nix { nodejs = pkgs.nodejs_26; };

        dk = devkit.lib.mkLib pkgs;
        preCommit = dk.preCommit {
          src = ./.;
          hooks = {
            actionlint.enable = true;
            check-yaml.enable = true;
            cspell.enable = true;
            deadnix.enable = true;
            dprint.enable = true;
            markdownlint-cli2.enable = true;
            nixfmt.enable = true;
            prettier.enable = true;
            shellcheck.enable = true;
            shfmt.enable = true;
            sort-file-contents.enable = true;
            statix.enable = true;
          };
          devHooks.eslint = {
            enable = true;
            entry = "./node_modules/.bin/eslint --fix";
            files = "\\.mjs$";
          };
        };

      in
      {
        packages = {
          default = processor;
          kiln-tailwindcss = processor;
        };
        devShells.default = pkgs.mkShell {
          packages = [
            pkgs.nodejs_26
            pkgs.prefetch-npm-deps
          ];
          inputsFrom = [ preCommit.shell ];
        };
        checks.pre-commit = preCommit.check;
        formatter = pkgs.nixfmt-tree;
      }
    );
}
