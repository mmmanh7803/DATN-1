# Script download audio va images cho HSK1 H10901
# Chay tu thu muc Backend/data

$baseOutputPath = "..\..\Frontend\public"

# Tao thu muc
$audioPath = "$baseOutputPath\audio\hsk1"
$imagePath = "$baseOutputPath\images\hsk1"

New-Item -ItemType Directory -Force -Path $audioPath | Out-Null
New-Item -ItemType Directory -Force -Path $imagePath | Out-Null

Write-Host "=== Download HSK1 H10901 Media ===" -ForegroundColor Cyan

# === AUDIO ===
Write-Host "[1/2] Downloading Audio..." -ForegroundColor Yellow
$audioUrl = "https://content.libsyn.com/p/9/9/3/993be123b94107db/H10901.mp3"
$audioFile = "$audioPath\h10901.mp3"

try {
    Invoke-WebRequest -Uri $audioUrl -OutFile $audioFile -UseBasicParsing
    Write-Host "  OK Audio saved: $audioFile" -ForegroundColor Green
}
catch {
    Write-Host "  FAIL to download audio" -ForegroundColor Red
}

# === IMAGES ===
Write-Host "[2/2] Downloading Images..." -ForegroundColor Yellow

$images = @(
    "https://mandarinbean.com/wp-content/uploads/2020/12/H1_1.png"
    "https://mandarinbean.com/wp-content/uploads/2020/12/H1_2.png"
    "https://mandarinbean.com/wp-content/uploads/2020/12/H1_3.png"
    "https://mandarinbean.com/wp-content/uploads/2020/12/H1_4.png"
    "https://mandarinbean.com/wp-content/uploads/2020/12/H1_5.png"
    "https://mandarinbean.com/wp-content/uploads/2020/12/H1_6.png"
    "https://mandarinbean.com/wp-content/uploads/2020/12/H1_7-1.jpg"
    "https://mandarinbean.com/wp-content/uploads/2020/12/H1_8.jpg"
    "https://mandarinbean.com/wp-content/uploads/2020/12/H1_9.jpg"
    "https://mandarinbean.com/wp-content/uploads/2020/12/H1_10.jpg"
    "https://mandarinbean.com/wp-content/uploads/2020/12/H1_21.jpg"
    "https://mandarinbean.com/wp-content/uploads/2020/12/H1_22.jpg"
    "https://mandarinbean.com/wp-content/uploads/2020/12/H1_23.jpg"
    "https://mandarinbean.com/wp-content/uploads/2020/12/H1_24.jpg"
    "https://mandarinbean.com/wp-content/uploads/2020/12/H1_25.jpg"
    "https://mandarinbean.com/wp-content/uploads/2020/12/H1_part1-1.jpg"
    "https://mandarinbean.com/wp-content/uploads/2020/12/H1_part2.jpg"
    "https://mandarinbean.com/wp-content/uploads/2020/12/H1_part3.jpg"
    "https://mandarinbean.com/wp-content/uploads/2020/12/H1_part5.jpg"
    "https://mandarinbean.com/wp-content/uploads/2020/12/H1_part6.jpg"
)

$count = 0
$total = $images.Count

foreach ($url in $images) {
    $name = [System.IO.Path]::GetFileName($url)
    $output = "$imagePath\$name"
    
    try {
        Invoke-WebRequest -Uri $url -OutFile $output -UseBasicParsing
        $count++
        Write-Host "  OK [$count/$total] $name" -ForegroundColor Green
    }
    catch {
        Write-Host "  FAIL $name" -ForegroundColor Red
    }
}

Write-Host "=== Download Complete ===" -ForegroundColor Cyan
Write-Host "Audio: $audioPath"
Write-Host "Images: $imagePath ($count/$total files)"
