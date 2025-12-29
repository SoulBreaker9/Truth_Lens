
# Power-Cleaning Script
Write-Host "--- PURGING TEMP FILES ---"
Remove-Item -Path "temp_*.mp4" -ErrorAction SilentlyContinue
Remove-Item -Path "frames_*" -Recurse -Force -ErrorAction SilentlyContinue
if (Test-Path "temp_frames") {
    Remove-Item -Path "temp_frames\*" -Recurse -Force -ErrorAction SilentlyContinue
} else {
    New-Item -ItemType Directory -Path "temp_frames" -Force
}
Write-Host "--- CLEANUP COMPLETE ---"
