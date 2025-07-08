param(
  [string]$PrinterName,
  [string]$FilePath
)

Add-Type -AssemblyName System.Drawing

$printerSettings = New-Object System.Drawing.Printing.PrinterSettings
$printerSettings.PrinterName = $PrinterName

if (-not $printerSettings.IsValid) {
  Write-Host "Invalid printer: $PrinterName"
  exit 1
}

$printJob = Get-Content $FilePath -Raw
[System.IO.File]::WriteAllText("$env:TEMP\\_temp_receipt.txt", $printJob)

Start-Process -FilePath "$env:TEMP\\_temp_receipt.txt" -Verb Print -WindowStyle Hidden
