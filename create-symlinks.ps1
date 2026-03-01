# Script PowerShell pour créer des liens symboliques BMAD
# EXÉCUTER EN TANT QU'ADMINISTRATEUR : Click droit > "Exécuter en tant qu'administrateur"

$FrontendPath = "C:\Users\Mounkaila\WebstormProjects\icall26-front"
$BackendPath = "C:\laragon\www\backend-api"

Write-Host "=== Création des liens symboliques BMAD ===" -ForegroundColor Cyan
Write-Host ""

# Fonction pour créer un lien symbolique
function Create-SymLink {
    param(
        [string]$LinkPath,
        [string]$TargetPath,
        [string]$Name
    )

    Write-Host "Création du lien: $Name" -ForegroundColor Yellow
    Write-Host "  Cible: $TargetPath"
    Write-Host "  Lien:  $LinkPath"

    # Vérifier si le lien existe déjà
    if (Test-Path $LinkPath) {
        Write-Host "  ⚠ Le lien existe déjà, suppression..." -ForegroundColor Yellow
        Remove-Item $LinkPath -Force -Recurse -ErrorAction SilentlyContinue
    }

    # Vérifier si la cible existe
    if (-not (Test-Path $TargetPath)) {
        Write-Host "  ✗ ERREUR: La cible n'existe pas!" -ForegroundColor Red
        return $false
    }

    try {
        # Créer le lien symbolique
        New-Item -ItemType SymbolicLink -Path $LinkPath -Target $TargetPath -Force -ErrorAction Stop | Out-Null
        Write-Host "  ✓ Lien créé avec succès!" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "  ✗ ERREUR: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }

    Write-Host ""
}

# Créer les liens symboliques
Write-Host "Dossier Frontend: $FrontendPath" -ForegroundColor Cyan
Write-Host "Dossier Backend:  $BackendPath" -ForegroundColor Cyan
Write-Host ""

$success = 0
$failed = 0

# Lien 1: _bmad
if (Create-SymLink -LinkPath "$FrontendPath\_bmad" -TargetPath "$BackendPath\_bmad" -Name "_bmad") {
    $success++
} else {
    $failed++
}

# Lien 2: _bmad-output
if (Create-SymLink -LinkPath "$FrontendPath\_bmad-output" -TargetPath "$BackendPath\_bmad-output" -Name "_bmad-output") {
    $success++
} else {
    $failed++
}

# Lien 3: .claude
if (Create-SymLink -LinkPath "$FrontendPath\.claude" -TargetPath "$BackendPath\.claude" -Name ".claude") {
    $success++
} else {
    $failed++
}

# Résumé
Write-Host ""
Write-Host "=== RÉSUMÉ ===" -ForegroundColor Cyan
Write-Host "✓ Succès: $success" -ForegroundColor Green
Write-Host "✗ Échecs: $failed" -ForegroundColor $(if ($failed -gt 0) { "Red" } else { "Gray" })
Write-Host ""

if ($success -eq 3) {
    Write-Host "✓ Tous les liens symboliques ont été créés avec succès!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Vous pouvez maintenant utiliser les agents BMAD dans votre projet frontend." -ForegroundColor Cyan
} else {
    Write-Host "⚠ Certains liens n'ont pas pu être créés." -ForegroundColor Yellow
    Write-Host "Assurez-vous d'exécuter ce script en tant qu'administrateur." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Appuyez sur une touche pour fermer..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
