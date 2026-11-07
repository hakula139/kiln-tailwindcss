{
  description = "Tailwind CSS processor for kiln";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-26.05";
    flake-utils.url = "github:numtide/flake-utils";
    devkit = {
      url = "github:hakula139/devkit/e0d835ba91cf38c7f6d950c8a56c0d68e74366bd";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs =
    {
      nixpkgs,
      flake-utils,
      devkit,
      ...
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs { inherit system; };
        processor = pkgs.callPackage ./default.nix { nodejs = pkgs.nodejs_26; };

        dk = devkit.lib.mkLib pkgs;
        preCommit = dk.preCommit {
          src = ./.;
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
