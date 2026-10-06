{
  buildNpmPackage,
  lib,
  nodejs,
}:

let
  package = lib.importJSON ./package.json;
in
buildNpmPackage {
  pname = "kiln-tailwindcss";
  inherit (package) version;
  inherit nodejs;

  src = lib.fileset.toSource {
    root = ./.;
    fileset = lib.fileset.unions [
      ./LICENSE
      ./README.md
      ./compiler.mjs
      ./package.json
      ./package-lock.json
      ./test
    ];
  };
  npmDepsHash = "sha256-2sOr+e5gDUUPFhngltT7z6P2Jx9o6YQFsNLglNrHDdU=";
  dontNpmBuild = true;
  doCheck = true;
  checkPhase = ''
    runHook preCheck
    npm test
    runHook postCheck
  '';

  meta = {
    description = "Tailwind CSS compiler for kiln";
    homepage = "https://github.com/hakula139/kiln-tailwindcss";
    license = lib.licenses.mit;
    mainProgram = "kiln-tailwindcss";
  };
}
