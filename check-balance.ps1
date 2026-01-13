# check-balance.ps1
param(
    [string]$address = "0x4acC19Ebe7FE566f0fb0c61BE5492e7C9d81def1"
)

$body = @{
    jsonrpc = "2.0"
    method = "eth_getBalance"
    params = @($address, "latest")
    id = 1
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "https://rpc.testnet.arc.network" -Method POST -ContentType "application/json" -Body $body

$balanceWei = [Convert]::ToInt64($response.result, 16)
$balanceUSDC = $balanceWei / 1e18

Write-Host "Balance: $balanceUSDC USDC" -ForegroundColor Green
Write-Host "Explorer: https://testnet.arcscan.app/address/$address" -ForegroundColor Cyan

#Run this command: .\check-balance.ps1