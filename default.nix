{
  fetchPnpmDeps,
  lib,
  nodejs,
  pnpm,
  pnpmConfigHook,
  stdenv,
}:

let
  package = lib.importJSON ./package.json;
in
stdenv.mkDerivation (finalAttrs: {
  pname = "kiln-tailwindcss";
  inherit (package) version;

  src = lib.fileset.toSource {
    root = ./.;
    fileset = lib.fileset.unions [
      ./compiler.mjs
      ./package.json
      ./pnpm-lock.yaml
      ./pnpm-workspace.yaml
      ./test
    ];
  };
  pnpmDeps = fetchPnpmDeps {
    inherit (finalAttrs) pname version src;
    inherit pnpm;
    fetcherVersion = 5;
    hash = "sha256-1EoDSHJxVUhgsU8AuB0FKkHhd8coXTILcmMBD+5yI4I=";
  };

  nativeBuildInputs = [
    nodejs
    pnpm
    pnpmConfigHook
  ];
  buildInputs = [ nodejs ];

  doCheck = true;
  checkPhase = ''
    runHook preCheck
    pnpm test
    runHook postCheck
  '';

  installPhase = ''
    runHook preInstall

    rm -r node_modules
    pnpm install \
      --offline \
      --prod \
      --frozen-lockfile \
      --ignore-scripts

    package=$out/lib/node_modules/${package.name}
    install -D --mode=755 --target-directory="$package" compiler.mjs
    cp -r package.json node_modules "$package"
    mkdir $out/bin
    ln -s "$package/compiler.mjs" $out/bin/kiln-tailwindcss

    runHook postInstall
  '';

  meta = {
    description = "Tailwind CSS compiler for kiln";
    homepage = "https://github.com/hakula139/kiln-tailwindcss";
    license = lib.licenses.mit;
    mainProgram = "kiln-tailwindcss";
  };
})
