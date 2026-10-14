# download-images.ps1
# Downloads 36 high-resolution interior photos from Unsplash CDN.
# All photos are free to use under the Unsplash License.

$ErrorActionPreference = 'Stop'
$out = Join-Path $PSScriptRoot 'public\images'
if (-not (Test-Path $out)) { New-Item -ItemType Directory -Path $out | Out-Null }

# Filename -> Unsplash photo ID.
# Each file is a distinct, hand-picked interior photo.
$images = @{
  # Hero & featured
  'hero-living.jpg'            = '1618221195710-dd6b41faaea6'   # warm modern living
  'cream-living.jpg'           = '1493809842364-78817add7ffb'   # neutral living
  'living-room.jpg'            = '1567016432779-094069958ea5'   # classic living
  'minimal-living.jpg'         = '1616486338812-3dadae4b4ace'   # minimal living

  # Bedrooms
  'bedroom.jpg'                = '1616594039964-ae9021a400a0'   # modern bedroom
  'calm-bedroom.jpg'           = '1522771739844-6a9f6d5f14af'   # calm bedroom
  'cozy-bedroom.jpg'           = '1560185007-c5ca9d2c014d'      # cozy bedroom
  'kids-bedroom.jpg'           = '1600607687920-4e2a09cf159d'   # kids room
  'guest-bedroom.jpg'          = '1505693416388-ac5ce068fe85'   # guest bedroom
  'master-suite.jpg'           = '1618377385526-83c01b4a7e8d'   # master suite

  # Kitchens
  'kitchen.jpg'                = '1556909212-d5b604d0c90d'      # bright kitchen
  'modern-kitchen.jpg'         = '1600489000022-c2086d79f9d4'   # modern kitchen
  'island-kitchen.jpg'         = '1600585154340-be6161a56a0c'   # island kitchen
  'white-kitchen.jpg'          = '1571624436279-b272aff752b5'   # minimal white kitchen

  # Dining
  'dining-room.jpg'            = '1617806118233-18e1de247200'   # dining room
  'japandi-dining.jpg'         = '1595515106969-1ce29566ff1c'   # japandi dining
  'family-dining.jpg'          = '1615874959474-d609969a20ed'   # family dining

  # Home Office
  'home-office.jpg'            = '1593642532973-d31b6557fa68'   # home office
  'executive-study.jpg'        = '1524758631624-e2822e304c36'   # executive study

  # Bathrooms
  'spa-bathroom.jpg'           = '1620626011761-996317b8d101'   # spa bathroom
  'guest-bathroom.jpg'         = '1600566753086-00f18fb6b3ea'   # guest bathroom

  # Pooja & decor
  'pooja-unit.jpg'             = '1601613967204-5d1a84b7e5f4'   # carved unit
  'decor-details.jpg'          = '1616627561950-9f746e330187'   # decor detail
  'accessories.jpg'            = '1616486029423-aaa4789e8c9a'   # accessories

  # Balcony
  'balcony-retreat.jpg'        = '1600210492493-0946911123ea'   # balcony

  # Full home / villa
  'villa-interior.jpg'         = '1600596542815-ffad4c1539a9'   # villa living
  'apartment-interior.jpg'     = '1502672260266-1c1ef2d93688'   # apartment
  'heritage-interior.jpg'      = '1560448204-e02f11c3d0e2'      # heritage

  # Textures & materials
  'material-wood.jpg'          = '1503387762-592deb58ef4e'      # wood
  'material-stone.jpg'         = '1541123437800-1bb1317badc2'   # stone
  'material-textile.jpg'       = '1618354691373-d851c5c3a990'   # textile
  'material-brass.jpg'         = '1524678606370-a47ad25cb82a'   # brass
  'material-marble.jpg'        = '1517488171931-e361577c6b13'   # marble
  'material-ceramic.jpg'       = '1516975080664-ed2fc6a32937'   # ceramic

  # Dining & lounge extras
  'reading-nook.jpg'           = '1519710164239-da123dc03ef4'   # reading nook
  'boho-lounge.jpg'            = '1616137466211-f939a420be84'   # boho living
  'art-deco-lounge.jpg'        = '1567538096630-e0c55bd6374c'   # art deco
}

$base = 'https://images.unsplash.com/photo-'
$params = '?w=2000&q=85&auto=format&fit=crop'

$success = 0
$failed = 0

foreach ($name in $images.Keys | Sort-Object) {
  $id = $images[$name]
  $url = "$base$id$params"
  $dest = Join-Path $out $name
  Write-Host "Downloading $name ..." -ForegroundColor Cyan -NoNewline
  try {
    Invoke-WebRequest -Uri $url -OutFile $dest -UseBasicParsing
    $kb = [math]::Round((Get-Item $dest).Length / 1KB)
    Write-Host " $kb KB" -ForegroundColor Green
    $success++
  } catch {
    Write-Host " FAILED ($($_.Exception.Message))" -ForegroundColor Red
    $failed++
  }
}

Write-Host ""
Write-Host "Downloaded $success files, $failed failed." -ForegroundColor Yellow
Write-Host "Verifying dimensions..." -ForegroundColor Yellow
Add-Type -AssemblyName System.Drawing
Get-ChildItem "$out\*.jpg" | Sort-Object Name | ForEach-Object {
  $img = [System.Drawing.Image]::FromFile($_.FullName)
  "{0,-30} {1,5} x {2,5}" -f $_.Name, $img.Width, $img.Height
  $img.Dispose()
}
