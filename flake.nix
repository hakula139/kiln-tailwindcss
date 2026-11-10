{
  description = "Tailwind CSS processor for kiln";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-26.05";
    devkit = {
      url = "github:hakula139/devkit/v3";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs =
    {
      devkit,
      nixpkgs,
      ...
    }:
    devkit.lib.eachSystem devkit.lib.systems (
      system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        dk = devkit.lib.mkLib pkgs;
        processor = pkgs.callPackage ./default.nix dk.nodeToolchain;

        preCommit = dk.preCommit {
          src = ./.;
          hooks = {
            actionlint.enable = true;
            check-yaml.enable = true;
            cspell.enable = true;
            deadnix.enable = true;
            dprint.enable = true;
            eslint.enable = true;
            markdownlint-cli2.enable = true;
            nixfmt.enable = true;
            prettier.enable = true;
            shellcheck.enable = true;
            shfmt.enable = true;
            sort-file-contents.enable = true;
            statix.enable = true;
          };
        };
      in
      {
        packages.default = processor;
        checks.package = processor;
        devShells.default = pkgs.mkShell {
          name = "kiln-tailwindcss-dev";
          packages = builtins.attrValues dk.nodeToolchain;
          inputsFrom = [
            preCommit
          ];
        };
        formatter = pkgs.nixfmt-tree;
      }
    );
}
