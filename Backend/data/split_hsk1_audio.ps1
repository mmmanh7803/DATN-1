# Script tach audio HSK1 H10901 thanh tung cau hoi
# Can cai dat FFmpeg truoc: winget install ffmpeg
# Chay tu thu muc Backend/data

$inputFile = "..\..\Frontend\public\audio\hsk1\h10901.mp3"
$outputDir = "..\..\Frontend\public\audio\hsk1\questions"

# Tao thu muc output
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

Write-Host "=== Split HSK1 H10901 Audio ===" -ForegroundColor Cyan
Write-Host "Input: $inputFile"
Write-Host "Output: $outputDir"

# Moc thoi gian cho tung cau (can dieu chinh theo audio thuc te)
# Format: StartTime, Duration (seconds)
# HSK1 H10901 - Du lieu mau, can cap nhat theo audio thuc te

$questions = @(
    # Part 1 (1-5): True/False - Moi cau khoang 8-10 giay
    @{ Q = 1;  Start = "00:00:25"; Duration = 10 },
    @{ Q = 2;  Start = "00:00:35"; Duration = 10 },
    @{ Q = 3;  Start = "00:00:45"; Duration = 10 },
    @{ Q = 4;  Start = "00:00:55"; Duration = 10 },
    @{ Q = 5;  Start = "00:01:05"; Duration = 10 },
    
    # Part 2 (6-10): Select Image - Moi cau khoang 12-15 giay
    @{ Q = 6;  Start = "00:01:30"; Duration = 15 },
    @{ Q = 7;  Start = "00:01:45"; Duration = 15 },
    @{ Q = 8;  Start = "00:02:00"; Duration = 15 },
    @{ Q = 9;  Start = "00:02:15"; Duration = 15 },
    @{ Q = 10; Start = "00:02:30"; Duration = 15 },
    
    # Part 3 (11-15): Matching - Moi cau khoang 12-15 giay
    @{ Q = 11; Start = "00:03:00"; Duration = 15 },
    @{ Q = 12; Start = "00:03:15"; Duration = 15 },
    @{ Q = 13; Start = "00:03:30"; Duration = 15 },
    @{ Q = 14; Start = "00:03:45"; Duration = 15 },
    @{ Q = 15; Start = "00:04:00"; Duration = 15 },
    
    # Part 4 (16-20): Multiple Choice - Moi cau khoang 20-25 giay
    @{ Q = 16; Start = "00:04:30"; Duration = 25 },
    @{ Q = 17; Start = "00:04:55"; Duration = 25 },
    @{ Q = 18; Start = "00:05:20"; Duration = 25 },
    @{ Q = 19; Start = "00:05:45"; Duration = 25 },
    @{ Q = 20; Start = "00:06:10"; Duration = 25 }
)

Write-Host "`nDang tach $($questions.Count) cau hoi..." -ForegroundColor Yellow

foreach ($q in $questions) {
    $outputFile = "$outputDir\q$($q.Q).mp3"
    $startTime = $q.Start
    $duration = $q.Duration
    
    # Lenh ffmpeg de cat audio
    $cmd = "ffmpeg -y -i `"$inputFile`" -ss $startTime -t $duration -acodec libmp3lame -q:a 2 `"$outputFile`" 2>&1"
    
    try {
        $result = Invoke-Expression $cmd
        Write-Host "  OK Cau $($q.Q): $outputFile" -ForegroundColor Green
    }
    catch {
        Write-Host "  FAIL Cau $($q.Q): $_" -ForegroundColor Red
    }
}

Write-Host "`n=== Hoan tat ===" -ForegroundColor Cyan
Write-Host "Cac file audio da duoc luu tai: $outputDir"
Write-Host "`nLuu y: Can dieu chinh moc thoi gian trong script cho phu hop voi audio thuc te!"
Write-Host "Mo file audio bang Audacity de xac dinh chinh xac thoi gian bat dau/ket thuc moi cau."

