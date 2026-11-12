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
  runtimeFiles = package.files ++ [
    "LICENSE"
    "README.md"
    "package.json"
  ];
in
stdenv.mkDerivation (finalAttrs: {
  pname = "kiln-tailwindcss";
  inherit (package) version;

  src = lib.fileset.toSource {
    root = ./.;
    fileset = lib.fileset.unions (
      map (file: ./. + "/${file}") runtimeFiles
      ++ [
        ./pnpm-lock.yaml
        ./pnpm-workspace.yaml
        ./test
      ]
    );
  };

  pnpmInstallFlags = [ "--prod" ];
  pnpmDeps = fetchPnpmDeps {
    inherit (finalAttrs)
      pname
      version
      src
      pnpmInstallFlags
      ;
    inherit pnpm;
    fetcherVersion = 5;
    hash = "sha256-eiiat9rwG5Ivp6Xrb2u7iSCz1qMAOJ00OD+V0Tb5TOA=";
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

    dest="$out/lib/node_modules/${package.name}"
    mkdir -p "$dest" "$out/bin"
    cp -r ${lib.escapeShellArgs runtimeFiles} node_modules "$dest"
  ''
  + lib.concatStrings (
    lib.mapAttrsToList (name: file: ''
      chmod +x "$dest/${file}"
      ln -s "$dest/${file}" "$out/bin/${name}"
    '') package.bin
  )
  + ''

    runHook postInstall
  '';

  meta = {
    inherit (package) description homepage;
    license = lib.licenses.mit;
    mainProgram = "kiln-tailwindcss";
  };
})
