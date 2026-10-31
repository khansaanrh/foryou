# ==========================================================
#  optimize-photos.ps1
#  Membuat SALINAN foto yang lebih kecil untuk website.
#  File asli di "foto khansa" dan "fotobareng" TIDAK diubah.
#
#  Cara pakai (dari folder project, di terminal PowerShell):
#     powershell -ExecutionPolicy Bypass -File .\tools\optimize-photos.ps1
#
#  Hasil:
#     assets/photos/khansa/    <- dari "foto khansa"
#     assets/photos/together/  <- dari "fotobareng"
# ==========================================================

Add-Type -AssemblyName System.Drawing

$root     = Split-Path -Parent $PSScriptRoot
$maxEdge  = 1600   # sisi terpanjang (px)
$quality  = 80     # kualitas JPEG (0-100)

$jobs = @(
  @{ src = "foto khansa"; dst = "assets/photos/khansa" },
  @{ src = "fotobareng";  dst = "assets/photos/together" }
)

$codec  = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
$params = New-Object System.Drawing.Imaging.EncoderParameters 1
$params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), ([long]$quality)

foreach ($job in $jobs) {
  $srcDir = Join-Path $root $job.src
  $dstDir = Join-Path $root $job.dst
  New-Item -ItemType Directory -Force $dstDir | Out-Null

  Get-ChildItem $srcDir -File -Include *.jpg, *.jpeg, *.png -Recurse | ForEach-Object {
    $out = Join-Path $dstDir ([System.IO.Path]::ChangeExtension($_.Name, ".jpg"))
    if (Test-Path $out) { return }   # sudah ada, lewati

    $img = [System.Drawing.Image]::FromFile($_.FullName)

    # Hormati orientasi EXIF supaya foto tidak miring
    try {
      $o = $img.GetPropertyItem(274).Value[0]
      switch ($o) {
        3 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate180FlipNone) }
        6 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate90FlipNone) }
        8 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate270FlipNone) }
      }
    } catch {}

    $scale = [math]::Min([double]1, [double]$maxEdge / [math]::Max($img.Width, $img.Height))
    $w = [int]($img.Width * $scale)
    $h = [int]($img.Height * $scale)

    $bmp = New-Object System.Drawing.Bitmap $w, $h
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode     = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode   = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.DrawImage($img, 0, 0, $w, $h)

    $bmp.Save($out, $codec, $params)
    $g.Dispose(); $bmp.Dispose(); $img.Dispose()

    "{0,-45} {1,6} KB  ->  {2,5} KB" -f $_.Name, [int]($_.Length / 1KB), [int]((Get-Item $out).Length / 1KB)
  }
}

"Selesai <3"
