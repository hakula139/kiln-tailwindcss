{
  description = "Tailwind CSS processor for kiln";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-26.05";
    flake-utils.url = "github:numtide/flake-utils";
    devkit = {
      url = "github:hakula139/devkit/44782b619d0c4cd9562c5000f6230aa9582e67ac";
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
