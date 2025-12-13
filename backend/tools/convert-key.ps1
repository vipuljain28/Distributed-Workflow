$path = Read-Host "../sa.json"
$json = Get-Content $path -Raw | ConvertFrom-Json
$key = $json.private_key -replace "`n","\\n"
Write-Host "`nAdd to .env:`n"
Write-Host "GOOGLE_SA_EMAIL=$($json.client_email)"
Write-Host "GOOGLE_SA_KEY=\"$key\""
