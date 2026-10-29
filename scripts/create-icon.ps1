Add-Type -AssemblyName System.Drawing
$taskRoot = Split-Path -Parent $PSScriptRoot
$taskBuild = Join-Path $taskRoot 'build'
$taskBitmap = New-Object System.Drawing.Bitmap(256, 256)
$taskGraphics = [System.Drawing.Graphics]::FromImage($taskBitmap)
$taskGraphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$taskGraphics.Clear([System.Drawing.Color]::Transparent)
$taskPath = New-Object System.Drawing.Drawing2D.GraphicsPath
$taskPath.AddArc(8, 8, 80, 80, 180, 90)
$taskPath.AddArc(168, 8, 80, 80, 270, 90)
$taskPath.AddArc(168, 168, 80, 80, 0, 90)
$taskPath.AddArc(8, 168, 80, 80, 90, 90)
$taskPath.CloseFigure()
$taskBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(237, 108, 70))
$taskGraphics.FillPath($taskBrush, $taskPath)
$taskPen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, 12)
$taskPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$taskPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$taskGraphics.DrawLine($taskPen, 104, 167, 104, 87)
$taskGraphics.DrawLine($taskPen, 104, 87, 182, 69)
$taskGraphics.DrawLine($taskPen, 182, 69, 182, 149)
$taskGraphics.DrawLine($taskPen, 106, 108, 180, 90)
$taskGraphics.FillEllipse([System.Drawing.Brushes]::White, 66, 154, 44, 32)
$taskGraphics.FillEllipse([System.Drawing.Brushes]::White, 144, 136, 44, 32)
$taskBitmap.Save((Join-Path $taskBuild 'icon.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$taskSizes = @(16, 24, 32, 48, 64, 128, 256)
$taskPngs = @()
foreach ($taskSize in $taskSizes) {
  $taskSmall = New-Object System.Drawing.Bitmap($taskSize, $taskSize)
  $taskSmallGraphics = [System.Drawing.Graphics]::FromImage($taskSmall)
  $taskSmallGraphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $taskSmallGraphics.DrawImage($taskBitmap, 0, 0, $taskSize, $taskSize)
  $taskStream = New-Object System.IO.MemoryStream
  $taskSmall.Save($taskStream, [System.Drawing.Imaging.ImageFormat]::Png)
  $taskPngs += ,$taskStream.ToArray()
  $taskSmallGraphics.Dispose(); $taskSmall.Dispose(); $taskStream.Dispose()
}
$taskIconStream = [System.IO.File]::Create((Join-Path $taskBuild 'icon.ico'))
$taskWriter = New-Object System.IO.BinaryWriter($taskIconStream)
$taskWriter.Write([uint16]0); $taskWriter.Write([uint16]1); $taskWriter.Write([uint16]$taskSizes.Count)
$taskOffset = 6 + 16 * $taskSizes.Count
for ($taskIndex = 0; $taskIndex -lt $taskSizes.Count; $taskIndex++) {
  $taskDimension = $taskSizes[$taskIndex] % 256
  $taskWriter.Write([byte]$taskDimension); $taskWriter.Write([byte]$taskDimension)
  $taskWriter.Write([byte]0); $taskWriter.Write([byte]0)
  $taskWriter.Write([uint16]1); $taskWriter.Write([uint16]32)
  $taskWriter.Write([uint32]$taskPngs[$taskIndex].Length); $taskWriter.Write([uint32]$taskOffset)
  $taskOffset += $taskPngs[$taskIndex].Length
}
foreach ($taskBytes in $taskPngs) { $taskWriter.Write([byte[]]$taskBytes) }
$taskWriter.Dispose(); $taskIconStream.Dispose()
$taskPen.Dispose(); $taskBrush.Dispose(); $taskPath.Dispose(); $taskGraphics.Dispose(); $taskBitmap.Dispose()
Write-Output 'Generated build/icon.png and build/icon.ico'
