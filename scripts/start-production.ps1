param(
  [int]$Port = 8081,
  [string]$HostName = "0.0.0.0",
  [string]$HomeAssistantBaseUrl = "http://192.168.0.100:8123",
  [string]$HomeAssistantFallbackUrls = "http://homeassistant.local:8123",
  [string]$HomeAssistantToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJkMWY3YzQxOTA4ODM0MjE4YWZkMTM3YzI2NGRmMjM5MiIsImlhdCI6MTc3OTc3MDQwNCwiZXhwIjoyMDk1MTMwNDA0fQ.7cFXZD8i1QVtp7ysZ7Z-xCIzQHFsnwml4tdWMe9C3wc",
  [string]$HttpsCertFile = "",
  [string]$HttpsKeyFile = ""
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot

Set-Location $ProjectRoot
npm ci
npm run build

$env:PORT = $Port
$env:HOST = $HostName
$env:HA_DASHBOARD_BASE_URL = $HomeAssistantBaseUrl
$env:HA_DASHBOARD_FALLBACK_URLS = $HomeAssistantFallbackUrls
$env:HA_DASHBOARD_TOKEN = $HomeAssistantToken

if ($HttpsCertFile -and $HttpsKeyFile) {
  $env:HTTPS_CERT_FILE = $HttpsCertFile
  $env:HTTPS_KEY_FILE = $HttpsKeyFile
}

npm run start
