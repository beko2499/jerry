$dir = "c:\Users\win 10\Desktop\app\src\sections\Admin"
$files = Get-ChildItem -Path $dir -Recurse -Filter "*.tsx"

foreach ($f in $files) {
    $content = Get-Content $f.FullName -Raw
    if ($content -match "import \{ adminFetch, API_URL \} from '@/lib/api';") {
        $content = $content.Replace(
            "import { adminFetch, API_URL } from '@/lib/api';",
            "import { adminFetch } from '@/lib/api';"
        )
        Set-Content $f.FullName $content -NoNewline
        Write-Host "Fixed: $($f.Name)"
    }
}

# Fix Dashboard.tsx - remove unused API_URL_RAW
$dashFile = "c:\Users\win 10\Desktop\app\src\sections\Dashboard.tsx"
$dashContent = Get-Content $dashFile -Raw
$dashContent = $dashContent.Replace(
    "const API_URL_RAW = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';",
    ""
)
Set-Content $dashFile $dashContent -NoNewline
Write-Host "Fixed: Dashboard.tsx"
Write-Host "Done!"
