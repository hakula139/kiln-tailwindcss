{
  description = "Tailwind CSS processor for kiln";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-26.05";
    flake-utils.url = "github:numtide/flake-utils";
    git-hooks-nix = {
      url = "github:cachix/git-hooks.nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs =
    {
      nixpkgs,
      flake-utils,
      git-hooks-nix,
      ...
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs { inherit system; };
        processor = pkgs.callPackage ./default.nix { nodejs = pkgs.nodejs_24; };

        nodeHook =
          name: command:
          let
            wrapper = pkgs.writeShellApplication {
              inherit name;
              runtimeInputs = [ pkgs.nodejs_24 ];
              text = ''
                if [ ! -d node_modules ]; then
                  exit 0
                fi
                ./node_modules/.bin/${command} "$@"
              '';
            };
          in
          "${wrapper}/bin/${name}";

        preCommitCheck = git-hooks-nix.lib.${system}.run {
          src = ./.;
          hooks = {
            check-added-large-files.enable = true;
            check-yaml.enable = true;
            end-of-file-fixer.enable = true;
            trim-trailing-whitespace = {
              enable = true;
              args = [ "--markdown-linebreak-ext=md" ];
            };
            nixfmt.enable = true;
            statix.enable = true;
            deadnix.enable = true;
            prettier = {
              enable = true;
              entry = nodeHook "prettier-write" "prettier --write --ignore-unknown";
              files = "\\.(json|mjs)$";
            };
            dprint = {
              enable = true;
              entry = nodeHook "dprint-write" "dprint fmt";
              files = "\\.md$";
            };
            eslint = {
              enable = true;
              entry = nodeHook "eslint" "eslint --fix";
              files = "\\.mjs$";
            };
            markdownlint = {
              enable = true;
              entry = nodeHook "markdownlint" "markdownlint-cli2 --fix";
              files = "\\.md$";
            };
            cspell = {
              enable = true;
              entry = nodeHook "cspell" "cspell --no-must-find-files --no-progress";
              types = [ "text" ];
            };
          };
        };
      in
      {
        packages = {
          default = processor;
          kiln-tailwindcss = processor;
        };
        devShells.default = pkgs.mkShell {
          packages = preCommitCheck.enabledPackages ++ [
            pkgs.nodejs_24
            pkgs.prefetch-npm-deps
          ];
          inherit (preCommitCheck) shellHook;
        };
        checks.pre-commit = preCommitCheck;
        formatter = pkgs.nixfmt-tree;
      }
    );
}
