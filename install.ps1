# install.ps1 - install dsh-workspace-folders into the web profile (dsh v0.2.0-rc.2).
#
# Run from anywhere:  powershell -ExecutionPolicy Bypass -File install.ps1
#
# The ONLY supported install is the harness's own: this script packs this
# folder into a tarball (pnpm pack) and runs
#   pnpm dsh plugin --profile web add <that tarball>
# from the harness checkout. That registers the package as a profile bundle:
# the harness adds it to the profile manifest, installs a REAL COPY of the
# package into the profile's node_modules, and loads cordis.patch.yml from the
# bundle as an overlay row. The Plugins page then lists the plugin with the
# enable switch and the settings form (the plugins.bundle.config slot).
# Because the profile holds its own copy, this folder can be moved or deleted
# at any time without breaking the running plugin.
#
# This script performs, in order:
#   1. vendor the config-schema library into .\deps (ships with the bundle);
#   2. remove the legacy file:// row older installers wrote into the profile
#      patch (a leftover would double-register the package and break the
#      rc.2 client-module scan);
#   3. remove the legacy installed copy under %DSH_HOME%\plugins (old flow);
#   4. pack the folder, run the official `dsh plugin add <tarball>`, then
#      delete the packed artifact (pointwise: the exact name-version path,
#      plus the exact tarball the profile previously referenced).
#
# Idempotent: re-running refreshes everything. After editing the plugin
# source, re-run this script so the profile copies the new bytes.
# ASCII-only source: Windows PowerShell 5.1 reads BOM-less files as ANSI.
#
# Folder data lives separately in
# %DSH_HOME%\plugin-data\dsh-workspace-folders\folders.json and is NEVER
# touched by install or uninstall.

param(
  # Harness source checkout (provides vendor\schemastery and the dsh CLI).
  # Probed automatically when omitted.
  [string]$HarnessRoot = '',
  # Profile to install into. The web app is this plugin's target.
  [string]$Profile = 'web'
)

$ErrorActionPreference = 'Stop'

# --- Locate the delivery folder ------------------------------------------------
$PluginDir = $PSScriptRoot
if ([string]::IsNullOrEmpty($PluginDir)) {
  throw 'install.ps1 must run as a saved script file (needs $PSScriptRoot).'
}

# --- Resolve the harness home ---------------------------------------------------
$DshHome = $env:DSH_HOME
if ([string]::IsNullOrEmpty($DshHome)) { $DshHome = Join-Path $env:USERPROFILE '.dsh' }

# --- Locate the harness checkout -------------------------------------------------
$HarnessCandidates = @(
  $HarnessRoot,
  $env:DSH_ROOT,
  'C:\Deepseek-Harness\deepseek-harness-v0.2.0-rc.2',
  'C:\Deepseek-Harness\deepseek-harness'
) | Where-Object { -not [string]::IsNullOrEmpty($_) }

$Harness = $null
foreach ($Root in $HarnessCandidates) {
  if (Test-Path (Join-Path $Root 'vendor/schemastery/lib/index.cjs')) { $Harness = $Root; break }
  if (Test-Path (Join-Path $Root 'apps/cli/package.json')) { $Harness = $Root; break }
}
if ($null -eq $Harness) {
  throw ("Harness checkout not found. Pass it explicitly: install.ps1 -HarnessRoot <path> " +
         "(looked in: $($HarnessCandidates -join '; ')).")
}
Write-Host "Harness checkout : $Harness"

# --- 1. Vendor the config-schema library into the bundle -------------------------
# host.mjs requires '@deepseek-ai/schemastery' first; outside the harness tree
# that name does not resolve, so the bundle carries a vendored CJS copy in
# deps\. The CJS build is loaded synchronously (createRequire, no TLA) and
# needs @deepseek-ai/cosmokit beside it (Node 24 require(esm) handles it).
$DepsDir = Join-Path $PluginDir 'deps'
$SchemaSource = Join-Path $Harness 'vendor/schemastery/lib/index.cjs'
$CosmoSource = Join-Path $Harness 'vendor/cosmokit'
if (Test-Path $SchemaSource) {
  New-Item -ItemType Directory -Force -Path (Join-Path $DepsDir 'node_modules/@deepseek-ai/cosmokit/lib') | Out-Null
  Copy-Item -Force $SchemaSource (Join-Path $DepsDir 'schemastery.cjs')
  Copy-Item -Force (Join-Path $CosmoSource 'package.json') (Join-Path $DepsDir 'node_modules/@deepseek-ai/cosmokit/package.json')
  Copy-Item -Force (Join-Path $CosmoSource 'lib/index.js') (Join-Path $DepsDir 'node_modules/@deepseek-ai/cosmokit/lib/index.js')
  Write-Host "Vendored the config-schema library from $Harness."
} elseif (Test-Path (Join-Path $DepsDir 'schemastery.cjs')) {
  Write-Host 'Using the vendored config-schema library already in deps\.'
} else {
  Write-Host 'WARNING: schemastery vendor copy not found and deps\ has none.' -ForegroundColor Yellow
  Write-Host '         The tree runs with defaults; the Plugins-page form is absent.' -ForegroundColor Yellow
}

# --- 2. Remove the legacy file:// row (migration from the pre-bundle flow) -------
# Older installers wrote a managed block into the profile patch pointing at the
# installed copy. With the bundle installed that package would resolve from two
# active sources, which rc.2's client-module scanner refuses. Idempotent strip.
$ProfilePatch = Join-Path $DshHome "profiles/$Profile/cordis.patch.yml"
$RowMarker = '# dsh-workspace-folders (managed by install.ps1)'
if (Test-Path $ProfilePatch) {
  $ExistingText = [System.IO.File]::ReadAllText($ProfilePatch)
  if ($ExistingText.Contains($RowMarker)) {
    $Existing = $ExistingText -split "`r?`n"
    $Kept = @()
    $SkipRow = $false
    foreach ($Line in $Existing) {
      if ($Line -eq $RowMarker) { $SkipRow = $true; continue }
      if ($SkipRow) {
        # The managed row ends at the first blank line or at a line that starts
        # a new top-level item.
        if ($Line -match '^\s' -or $Line -match '^-' -or $Line -eq '') { continue }
        $SkipRow = $false
      }
      $Kept += $Line
    }
    while ($Kept.Count -gt 0 -and $Kept[$Kept.Count - 1] -eq '') {
      $Kept = if ($Kept.Count -eq 1) { @() } else { $Kept[0..($Kept.Count - 2)] }
    }
    [System.IO.File]::WriteAllText($ProfilePatch, (($Kept -join "`r`n") + "`r`n"), (New-Object System.Text.UTF8Encoding($false)))
    Write-Host 'Removed the legacy managed row from the profile patch.'
  }
}

# --- 3. Remove the legacy installed copy (old flow artifact) ----------------------
$LegacyCopy = Join-Path $DshHome 'plugins/dsh-workspace-folders'
if (Test-Path $LegacyCopy) {
  Remove-Item -Recurse -Force $LegacyCopy
  Write-Host 'Removed the legacy installed copy under %DSH_HOME%\plugins.'
}

# --- 4. The official install: a profile bundle from a packed tarball ---------------
# The profile receives a REAL COPY of the package (pnpm installs the tarball),
# so this master folder can be moved or deleted without breaking the running
# plugin. After editing the plugin source, re-run install.ps1 to refresh the
# copy. (A directory spec would instead create a junction back to this folder,
# which dies the moment the folder moves.)
#
# ARTIFACT POLICY (profile safety): the profile manifest keeps a file: reference
# to the packed tarball, and `dsh plugin add` of ANY bundle runs a full pnpm
# install that resolves EVERY dependency - one missing artifact breaks every
# other bundle's install (even remove). Therefore:
#   - artifacts live in "<DSH_HOME>\profiles\<profile>\.artifacts" and the
#     CURRENT artifact referenced by the manifest is KEPT (never deleted);
#   - the pack runs from a staging copy of this folder WITHOUT *.tgz files
#     (otherwise an older archive gets nested inside the new tarball);
#   - after a successful add, only OUTDATED versions of THIS package are
#     deleted, pointwise, from .artifacts and from the master folder.
# Ordering note: a dangling reference (this or a foreign bundle's) is resolved
# BEFORE the add - see 4a/4b below.
Write-Host ''

# The exact artifact name this run will produce: <name>-<version>.tgz, packed
# into the profile's .artifacts folder (created on demand).
$Manifest = Get-Content (Join-Path $PluginDir 'package.json') -Raw | ConvertFrom-Json
$ArtifactName = '{0}-{1}.tgz' -f $Manifest.name, $Manifest.version
$ArtifactsDir = Join-Path $DshHome "profiles/$Profile/.artifacts"
New-Item -ItemType Directory -Force -Path $ArtifactsDir | Out-Null
$ArtifactPath = Join-Path $ArtifactsDir $ArtifactName
$ProfileManifestPath = Join-Path $DshHome "profiles/$Profile/package.json"

# Packs $SourceDir into $DestDir from a staging copy that carries NO *.tgz at
# any depth (a leftover archive would end up nested inside the new tarball).
# Returns the produced artifact's full path, or $null on failure. The staging
# directory is always removed. $SourceDir is only ever read.
function New-StagingPack([string]$SourceDir, [string]$DestDir, [string]$ExpectedName) {
  $Staging = Join-Path ([System.IO.Path]::GetTempPath()) ('dsh-bundle-pack-' + [guid]::NewGuid().ToString('N').Substring(0, 12))
  try {
    $null = robocopy $SourceDir $Staging /E /NFL /NDL /NJH /NJS /NP /XF *.tgz
    if ($LASTEXITCODE -ge 8) { Write-Host "robocopy staging failed (exit code $LASTEXITCODE)." -ForegroundColor Yellow; return $null }
    Push-Location $Staging
    try {
      & pnpm pack --pack-destination $DestDir
      if ($LASTEXITCODE -ne 0) { Write-Host "pnpm pack failed (exit code $LASTEXITCODE)." -ForegroundColor Yellow; return $null }
    } finally {
      Pop-Location
    }
    $Produced = Join-Path $DestDir $ExpectedName
    if (-not (Test-Path -LiteralPath $Produced)) { Write-Host "pnpm pack produced no $ExpectedName." -ForegroundColor Yellow; return $null }
    return $Produced
  } finally {
    if (Test-Path -LiteralPath $Staging) { Remove-Item -Force -Recurse -LiteralPath $Staging }
  }
}

# --- 4a. Resolve every dangling file: reference BEFORE the add ---------------------
# `dsh plugin add` runs a full pnpm install of the profile, which resolves EVERY
# manifest dependency. Each bundle installer deletes its packed tarball after a
# successful add, so every OTHER installed bundle's reference is dangling by
# then and would fail this install with ENOENT. The repair mirrors what every
# install.ps1 relies on for its own package: re-pack the referenced master
# folder, which recreates the tarball at the exact referenced path. Only when a
# master cannot be rebuild (no manifest / version mismatch) does the flow fall
# back to the official removal of that bundle - with the bundle's live row
# config mirrored into its own master patch first, so a later reinstall
# restores the user's values.
if (Test-Path -LiteralPath $ProfileManifestPath) {
  $ProfileDeps = (Get-Content $ProfileManifestPath -Raw | ConvertFrom-Json).dependencies
  if ($null -ne $ProfileDeps) {
    foreach ($Property in @($ProfileDeps.PSObject.Properties)) {
      if ($Property.Name -eq $Manifest.name) { continue } # handled below
      $DepValue = [string]$Property.Value
      if ($DepValue -notmatch '^file:(.+\.tgz)$') { continue }
      $RefTarball = [System.IO.Path]::GetFullPath($Matches[1])
      if (Test-Path -LiteralPath $RefTarball) { continue }
      $RefLeaf = Split-Path -Leaf $RefTarball
      # The referenced master folder: the reference's own parent (the classic
      # pack-in-master flow), or - when the reference points into .artifacts -
      # the bundle's conventional master folder next to this one.
      $RefMasterCandidates = @()
      $RefDir = Split-Path -Parent $RefTarball
      if (Test-Path -LiteralPath (Join-Path $RefDir 'package.json')) { $RefMasterCandidates += $RefDir }
      $Sibling = Join-Path (Split-Path -Parent $PluginDir) $Property.Name
      if ($Sibling -ne $RefDir) { $RefMasterCandidates += $Sibling }
      foreach ($RefMaster in $RefMasterCandidates) {
        $RefManifestPath = Join-Path $RefMaster 'package.json'
        if (-not (Test-Path -LiteralPath $RefManifestPath)) { continue }
        $RefVersion = $null
        try { $RefVersion = [string](Get-Content $RefManifestPath -Raw | ConvertFrom-Json).version } catch { $RefVersion = $null }
        if ($null -eq $RefVersion -or $RefLeaf -ne ('{0}-{1}.tgz' -f $Property.Name, $RefVersion)) { continue }
        Write-Host "Re-packing $($Property.Name) from its master folder to resolve the profile reference..."
        $Produced = New-StagingPack -SourceDir $RefMaster -DestDir (Split-Path -Parent $RefTarball) -ExpectedName $RefLeaf
        if ($null -eq $Produced) { continue }
        if (([System.IO.Path]::GetFullPath($Produced)) -ne $RefTarball -and -not (Test-Path -LiteralPath $RefTarball)) {
          Copy-Item -Force -LiteralPath $Produced -Destination $RefTarball
        }
        if (Test-Path -LiteralPath $RefTarball) {
          Write-Host "Resolved the reference to $($Property.Name): $RefLeaf"
          break
        }
      }
      if (Test-Path -LiteralPath $RefTarball) { continue }
      $RefMaster = if ($RefMasterCandidates.Count -gt 0) { $RefMasterCandidates[0] } else { $RefDir }
      Write-Host "Cannot rebuild $($Property.Name) from $RefMaster; clearing the stale bundle first." -ForegroundColor Yellow
      # Preserve the user's live settings: the row's config block dies with the
      # remove, so mirror its values into the bundle's own master patch when
      # one is discoverable (profile is only read; the write lands elsewhere).
      $ProfilePatchPath = Join-Path $DshHome "profiles/$Profile/cordis.patch.yml"
      $BundlePatchPath = Join-Path $RefMaster 'cordis.patch.yml'
      if ((Test-Path -LiteralPath $ProfilePatchPath) -and (Test-Path -LiteralPath $BundlePatchPath)) {
        $ProfileLines = [System.IO.File]::ReadAllLines($ProfilePatchPath)
        $RowIdx = -1
        for ($i = 0; $i -lt $ProfileLines.Count; $i++) {
          if ($ProfileLines[$i] -match ('name:\s*' + [regex]::Escape($Property.Name) + '\s*$')) {
            # Walk back to the row start ("- id: ...") if present.
            for ($k = $i; $k -ge [Math]::Max(0, $i - 3); $k--) {
              if ($ProfileLines[$k] -match '^\s*-\s+id:\s*([A-Za-z0-9_-]+)\s*$') { $RowIdx = $k; break }
            }
            if ($RowIdx -lt 0) { $RowIdx = $i }
            break
          }
        }
        if ($RowIdx -ge 0) {
          $RowIndent = $ProfileLines[$RowIdx].Length - $ProfileLines[$RowIdx].TrimStart().Length
          $ConfigVals = @{}
          $InConfig = $false
          $ConfigIndent = 0
          for ($j = $RowIdx + 1; $j -lt $ProfileLines.Count; $j++) {
            $L = $ProfileLines[$j]
            if ($L.Trim() -eq '') { continue }
            $Ind = $L.Length - $L.TrimStart().Length
            if ($Ind -le $RowIndent) { break }
            if ($L.Trim() -eq 'config:') { $InConfig = $true; $ConfigIndent = $Ind; continue }
            if ($InConfig) {
              if ($Ind -le $ConfigIndent) { $InConfig = $false; continue }
              if ($L -match '^\s*([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$') { $ConfigVals[$Matches[1]] = $Matches[2].Trim() }
            }
          }
          if ($ConfigVals.Count -gt 0) {
            $BundleLines = [System.IO.File]::ReadAllLines($BundlePatchPath)
            $BIdx = -1
            for ($i = 0; $i -lt $BundleLines.Count; $i++) {
              if ($BundleLines[$i].Trim() -eq 'config:') { $BIdx = $i; break }
            }
            if ($BIdx -ge 0) {
              $BCfgIndent = $BundleLines[$BIdx].Length - $BundleLines[$BIdx].TrimStart().Length
              $Changed = 0
              for ($j = $BIdx + 1; $j -lt $BundleLines.Count; $j++) {
                $L = $BundleLines[$j]
                if ($L.Trim() -eq '') { continue }
                $Ind = $L.Length - $L.TrimStart().Length
                if ($Ind -le $BCfgIndent) { break }
                if ($L -match '^(\s*([A-Za-z_][A-Za-z0-9_]*):\s*)(.*)$') {
                  $Key = $Matches[2]
                  if ($ConfigVals.ContainsKey($Key) -and $Matches[3] -ne $ConfigVals[$Key]) {
                    $BundleLines[$j] = $Matches[1] + $ConfigVals[$Key]
                    $Changed++
                  }
                }
              }
              if ($Changed -gt 0) {
                [System.IO.File]::WriteAllText($BundlePatchPath, (($BundleLines -join "`r`n") + "`r`n"), (New-Object System.Text.UTF8Encoding($false)))
                Write-Host "Preserved $Changed live setting(s) of $($Property.Name) into its master patch."
              }
            }
          }
        }
      }
      Push-Location $Harness
      try {
        & pnpm dsh plugin --profile $Profile remove $Property.Name
        if ($LASTEXITCODE -ne 0) {
          Write-Host "dsh plugin remove reported exit code $LASTEXITCODE (continuing)." -ForegroundColor Yellow
        }
      } finally {
        Pop-Location
      }
    }
  }
}

# --- 4b. Our own current reference must resolve before the add ---------------------
# Normally the pack below recreates the referenced path (same version, same
# .artifacts folder). The one gap: an OLD reference pointing somewhere else
# (e.g. the classic master-folder path from a pre-.artifacts install) whose
# file is gone. Drop a rescue copy of the fresh artifact at that exact path;
# after the add the reference is re-pointed to .artifacts and the copy is
# deleted as an outdated artifact of this package.
$LegacySelfRef = $null
if (Test-Path -LiteralPath $ProfileManifestPath) {
  try { $SelfDep = [string]((Get-Content $ProfileManifestPath -Raw | ConvertFrom-Json).dependencies.($Manifest.name)) } catch { $SelfDep = '' }
  if ($SelfDep -match '^file:(.+\.tgz)$') {
    $SelfRefPath = [System.IO.Path]::GetFullPath($Matches[1])
    if (-not (Test-Path -LiteralPath $SelfRefPath) -and $SelfRefPath -ne [System.IO.Path]::GetFullPath($ArtifactPath)) {
      $LegacySelfRef = $SelfRefPath
    }
  }
}

# Pointwise pre-clean: the same-named artifact left by an interrupted earlier
# run - otherwise pnpm pack nests it INSIDE the new tarball. Safe: the pack
# below recreates this exact path before the add resolves dependencies.
if (Test-Path -LiteralPath $ArtifactPath) {
  Remove-Item -Force -LiteralPath $ArtifactPath
  Write-Host "Removed the stale same-version artifact: $ArtifactName"
}

# Pack from the staging copy (no *.tgz inside) into .artifacts - the current
# artifact lands there and STAYS (the profile manifest will reference it).
$Produced = New-StagingPack -SourceDir $PluginDir -DestDir $ArtifactsDir -ExpectedName $ArtifactName
if ($null -eq $Produced) { throw "Packing the bundle failed." }
$Bundle = Get-Item -LiteralPath $ArtifactPath
Write-Host "Packed the bundle: $($Bundle.Name) (kept in $ArtifactsDir)"

if ($null -ne $LegacySelfRef) {
  Copy-Item -Force -LiteralPath $ArtifactPath -Destination $LegacySelfRef
  Write-Host "Rescue copy for the old reference: $(Split-Path $LegacySelfRef -Leaf)"
}

Write-Host "Installing the bundle: pnpm dsh plugin --profile $Profile add `"$($Bundle.FullName)`""
Push-Location $Harness
try {
  & pnpm dsh plugin --profile $Profile add $Bundle.FullName
  if ($LASTEXITCODE -ne 0) {
    throw "dsh plugin add failed (exit code $LASTEXITCODE)."
  }
} finally {
  Pop-Location
}

# --- 4c. Post-add cleanup: only OUTDATED versions of THIS package ------------------
# The current artifact referenced by the manifest is KEPT. Verify the re-point
# first; then delete, pointwise: the old-reference rescue copy, other versions
# of this package in .artifacts, and any tarballs of this package left in the
# master folder (the manifest no longer references the master folder at all).
$ReferencedNow = $null
try {
  $RefValue = [string]((Get-Content $ProfileManifestPath -Raw | ConvertFrom-Json).dependencies.($Manifest.name))
  if ($RefValue -match '^file:(.+\.tgz)$') { $ReferencedNow = [System.IO.Path]::GetFullPath($Matches[1]) }
} catch { $ReferencedNow = $null }
if ($null -eq $ReferencedNow -or $ReferencedNow -ne [System.IO.Path]::GetFullPath($ArtifactPath)) {
  Write-Host 'The manifest did not re-point to .artifacts; keeping every artifact in place.' -ForegroundColor Yellow
} else {
  Write-Host "The profile now references: $ArtifactName (kept)."
  if ($null -ne $LegacySelfRef -and (Test-Path -LiteralPath $LegacySelfRef)) {
    Remove-Item -Force -LiteralPath $LegacySelfRef
    Write-Host "Removed the outdated artifact: $(Split-Path $LegacySelfRef -Leaf)"
  }
  $StaleArtifacts = @()
  if (Test-Path -LiteralPath $ArtifactsDir) {
    $StaleArtifacts += Get-ChildItem -LiteralPath $ArtifactsDir -Filter ($Manifest.name + '-*.tgz') |
      Where-Object { $_.Name -ne $ArtifactName }
  }
  $StaleArtifacts += Get-ChildItem -LiteralPath $PluginDir -Filter ($Manifest.name + '-*.tgz') -ErrorAction SilentlyContinue
  foreach ($Stale in $StaleArtifacts) {
    Remove-Item -Force -LiteralPath $Stale.FullName
    Write-Host "Removed the outdated artifact: $($Stale.Name)"
  }
}

Write-Host ''
Write-Host 'dsh-workspace-folders installed as a profile bundle.' -ForegroundColor Green
Write-Host "  master folder : $PluginDir (portable - move or delete it freely, the profile holds its own copy)"
Write-Host "  profile copy  : $DshHome\profiles\$Profile\node_modules\dsh-workspace-folders (refreshed by install.ps1)"
Write-Host ''
Write-Host 'Restart "pnpm dsh web" if the harness was running. The Plugins page then'
Write-Host 'lists Workspace folders with the enable switch and the settings form.'
Write-Host 'To uninstall later, run uninstall.ps1.'
