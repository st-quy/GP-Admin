param(
    [string]$TeacherUrl = 'https://127.0.0.1:3000/',
    [string]$ApiDocsUrl = 'https://127.0.0.1:3010/api-docs/',
    [string]$ApiContainer = 'greenprep_api'
)

$ErrorActionPreference = 'Stop'

Write-Host "Checking teacher admin UI: $TeacherUrl" -ForegroundColor Cyan
curl.exe -k -I $TeacherUrl

Write-Host ""
Write-Host "Checking API docs: $ApiDocsUrl" -ForegroundColor Cyan
curl.exe -k -I $ApiDocsUrl

Write-Host ""
Write-Host "Recent API logs from ${ApiContainer}:" -ForegroundColor Green
docker logs $ApiContainer --tail 60
