# 护士商城静态验收脚本：在项目根目录运行 `powershell -ExecutionPolicy Bypass -File scripts/check-project.ps1`。
$ErrorActionPreference = 'Stop'
$failed = $false

function Fail([string]$message) {
  $script:failed = $true
  Write-Host "[FAIL] $message" -ForegroundColor Red
}

function Pass([string]$message) {
  Write-Host "[PASS] $message" -ForegroundColor Green
}

# 1. JSON 与页面四件套。
Get-ChildItem -Recurse -Filter *.json | Where-Object { $_.FullName -notmatch '\\work\\' } | ForEach-Object {
  try { Get-Content -Raw -Encoding UTF8 $_.FullName | ConvertFrom-Json | Out-Null } catch { Fail "JSON 无法解析：$($_.FullName)" }
}
if (-not $failed) { Pass '全部 JSON 可解析' }

$app = Get-Content -Raw -Encoding UTF8 app.json | ConvertFrom-Json
foreach ($page in $app.pages) {
  foreach ($ext in @('.js', '.json', '.wxml', '.wxss')) {
    if (-not (Test-Path "$page$ext")) { Fail "页面文件缺失：$page$ext" }
  }
}
$corePages = @('pages/home/home','pages/certification/certification','pages/product-detail/product-detail','pages/partner/partner','pages/profile/profile')
$missingCore = $corePages | Where-Object { $app.pages -notcontains $_ }
if ($missingCore.Count -eq 0) { Pass "5 个核心页面及 $($app.pages.Count - 5) 个辅助页面均已注册" } else { Fail "核心页面缺失：$($missingCore -join ', ')" }

# 2. JS 语法（通过 stdin 避免 Windows 工具对中文用户路径的 realpath 限制）。
if (Get-Command node -ErrorAction SilentlyContinue) {
  Get-ChildItem -Recurse -Filter *.js | Where-Object { $_.FullName -notmatch '\\work\\' } | ForEach-Object {
    Get-Content -Raw -Encoding UTF8 $_.FullName | node --check -
    if ($LASTEXITCODE -ne 0) { Fail "JS 语法错误：$($_.FullName)" }
  }
  if (-not $failed) { Pass '全部 JS 通过语法检查' }
} else { Write-Host '[SKIP] 未找到 node，跳过 JS 语法检查' -ForegroundColor Yellow }

# 3. WXML 原生标签、公共组件标签与事件处理函数。
$allowedTags = @('view','text','button','scroll-view','swiper','swiper-item','image','input','canvas','block','slot','product-card','order-item','commission-stats','compliance-notice')
Get-ChildItem pages,components -Recurse -Filter *.wxml | ForEach-Object {
  $wxml = Get-Content -Raw -Encoding UTF8 $_.FullName
  $jsPath = [IO.Path]::ChangeExtension($_.FullName, '.js')
  $js = Get-Content -Raw -Encoding UTF8 $jsPath
  [regex]::Matches($wxml, '<\/?([a-zA-Z-]+)') | ForEach-Object {
    $tag = $_.Groups[1].Value
    if ($allowedTags -notcontains $tag) { Fail "非原生/未注册标签 <$tag>：$($_.FullName)" }
  }
  [regex]::Matches($wxml, '(?:bind|catch)(?::|[a-z]+)="([a-zA-Z0-9_]+)"') | ForEach-Object {
    $handler = $_.Groups[1].Value
    if ($js -notmatch "\b$handler\s*\(") { Fail "缺少事件方法 $handler：$($_.FullName)" }
  }
}
if (-not $failed) { Pass '页面标签与事件绑定完整' }

# 4. 资源、安全边界与组件复用。
$assetBytes = (Get-ChildItem assets\images -File | Measure-Object Length -Sum).Sum
if ($assetBytes -lt 1MB) { Pass "图片总量 $([math]::Round($assetBytes / 1KB)) KB，小于 1 MB" } else { Fail '图片总量超过 1 MB' }

$sourceFiles = Get-ChildItem pages,components,utils -Recurse -File
$unsafe = $sourceFiles | Select-String -Pattern 'wx\.request|wx\.cloud|requestPayment|usingPlugin'
if ($unsafe) { Fail '发现外部接口、云开发、真实支付或插件调用' } else { Pass '无外部接口、云开发、真实支付或第三方插件' }

$deprecated = $sourceFiles | Select-String -Pattern 'wx\.getSystemInfoSync|wx\.chooseImage'
if ($deprecated) { Fail '发现已知弃用 API' } else { Pass '未使用已知弃用 API' }

$allSource = ($sourceFiles | ForEach-Object { Get-Content -Raw -Encoding UTF8 $_.FullName }) -join "`n"
[regex]::Matches($allSource, '/assets/images/[a-zA-Z0-9._-]+') | ForEach-Object {
  $assetPath = $_.Value.TrimStart('/').Replace('/', '\')
  if (-not (Test-Path $assetPath)) { Fail "图片引用不存在：$($_.Value)" }
}
if (-not $failed) { Pass '全部本地图片引用均存在' }

if ($app.window.pageOrientation -eq 'portrait') { Pass '全局竖屏方向已锁定' } else { Fail '未在 app.json window 中锁定竖屏' }

foreach ($component in @('product-card','order-item','commission-stats','compliance-notice')) {
  if (-not (Select-String -Path pages\*\*.wxml -Pattern "<$component" -Quiet)) { Fail "公共组件未实际使用：$component" }
}
if (-not $failed) { Pass '四类公共组件均已实际复用' }

$complianceCount = (Select-String -Path pages\*\*.wxml -Pattern '<compliance-notice' | Measure-Object).Count
if ($complianceCount -ge 5) { Pass "已有 $complianceCount 个页面展示合规提示" } else { Fail "合规提示页面数至少为 5，实际为 $complianceCount" }

if ($failed) { Write-Host 'CHECK FAILED' -ForegroundColor Red; exit 1 }
Write-Host 'ALL CHECKS PASSED' -ForegroundColor Cyan
