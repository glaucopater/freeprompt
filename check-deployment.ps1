$url = "https://deploy-preview-33--freeprompt.netlify.app/"
Write-Host "Checking deployed site: $url"
Write-Host ""

# Get HTML
$response = Invoke-WebRequest -Uri $url -UseBasicParsing
$html = $response.Content

Write-Host "HTTP Status: $($response.StatusCode)"
Write-Host "Cache-Control: $($response.Headers['Cache-Control'])"
Write-Host ""

# Check for version query strings
if ($html -like '*?v=*') {
    Write-Host "✓ HTML contains version query strings"
} else {
    Write-Host "✗ HTML missing version query strings"
}

Write-Host ""
Write-Host "Asset references in HTML:"

# Extract JS file
if ($html -match 'src="([^"]*index-[^"]*\.js[^"]*)"') {
    Write-Host "  JS: $($matches[1])"
}

# Extract CSS file  
if ($html -match 'href="([^"]*index-[^"]*\.css[^"]*)"') {
    Write-Host "  CSS: $($matches[1])"
}

# Extract manifest
if ($html -match 'href="([^"]*manifest-[^"]*\.json[^"]*)"') {
    Write-Host "  Manifest: $($matches[1])"
}

Write-Host ""
Write-Host "Testing if assets exist:"

# Test JS
if ($html -match 'src="([^"]*index-[^"]*\.js[^"]*)"') {
    $jsUrl = $matches[1] -replace '\?v=[^"]*', ''
    $jsUrl = $jsUrl -replace '^/', '/'
    $fullJsUrl = "https://deploy-preview-33--freeprompt.netlify.app$jsUrl"
    try {
        $jsResponse = Invoke-WebRequest -Uri $fullJsUrl -UseBasicParsing -ErrorAction Stop
        Write-Host "  JS ($jsUrl): ✓ $($jsResponse.StatusCode)"
    } catch {
        Write-Host "  JS ($jsUrl): ✗ $($_.Exception.Response.StatusCode.value__)"
    }
}

# Test CSS
if ($html -match 'href="([^"]*index-[^"]*\.css[^"]*)"') {
    $cssUrl = $matches[1] -replace '\?v=[^"]*', ''
    $cssUrl = $cssUrl -replace '^/', '/'
    $fullCssUrl = "https://deploy-preview-33--freeprompt.netlify.app$cssUrl"
    try {
        $cssResponse = Invoke-WebRequest -Uri $fullCssUrl -UseBasicParsing -ErrorAction Stop
        Write-Host "  CSS ($cssUrl): ✓ $($cssResponse.StatusCode)"
    } catch {
        Write-Host "  CSS ($cssUrl): ✗ $($_.Exception.Response.StatusCode.value__)"
    }
}

# Test manifest
if ($html -match 'href="([^"]*manifest-[^"]*\.json[^"]*)"') {
    $manifestUrl = $matches[1] -replace '\?v=[^"]*', ''
    $manifestUrl = $manifestUrl -replace '^/', '/'
    $fullManifestUrl = "https://deploy-preview-33--freeprompt.netlify.app$manifestUrl"
    try {
        $manifestResponse = Invoke-WebRequest -Uri $fullManifestUrl -UseBasicParsing -ErrorAction Stop
        Write-Host "  Manifest ($manifestUrl): ✓ $($manifestResponse.StatusCode)"
    } catch {
        Write-Host "  Manifest ($manifestUrl): ✗ $($_.Exception.Response.StatusCode.value__)"
    }
}
