#!/bin/bash

# Pre-commit Checklist Script
# Run this before committing to GitHub to ensure everything is ready

echo "🔍 Pre-Commit Checklist for llm-code-deployment"
echo "================================================"
echo ""

ERRORS=0
WARNINGS=0

# Check 1: .env file exists but is NOT staged for commit
echo "✓ Checking .env file..."
if [ -f .env ]; then
    if git ls-files --error-unmatch .env 2>/dev/null; then
        echo "  ❌ ERROR: .env file is staged for commit!"
        echo "     Run: git rm --cached .env"
        ERRORS=$((ERRORS + 1))
    else
        echo "  ✅ .env exists and is not staged (correct)"
    fi
else
    echo "  ⚠️  WARNING: No .env file found"
    WARNINGS=$((WARNINGS + 1))
fi

# Check 2: .env.example exists and IS staged
echo ""
echo "✓ Checking .env.example file..."
if [ -f .env.example ]; then
    echo "  ✅ .env.example exists"
else
    echo "  ❌ ERROR: .env.example is missing"
    echo "     This file should be committed as a template"
    ERRORS=$((ERRORS + 1))
fi

# Check 3: LICENSE file exists
echo ""
echo "✓ Checking LICENSE file..."
if [ -f LICENSE ]; then
    if grep -q "MIT License" LICENSE; then
        echo "  ✅ LICENSE file exists with MIT license"
    else
        echo "  ⚠️  WARNING: LICENSE exists but may not be MIT"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo "  ❌ ERROR: LICENSE file is missing"
    echo "     Required by project specification"
    ERRORS=$((ERRORS + 1))
fi

# Check 4: README.md is professional
echo ""
echo "✓ Checking README.md..."
if [ -f README.md ]; then
    LINES=$(wc -l < README.md)
    if [ $LINES -gt 50 ]; then
        echo "  ✅ README.md exists and appears detailed ($LINES lines)"
    else
        echo "  ⚠️  WARNING: README.md might be too short ($LINES lines)"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo "  ❌ ERROR: README.md is missing"
    ERRORS=$((ERRORS + 1))
fi

# Check 5: package.json exists
echo ""
echo "✓ Checking package.json..."
if [ -f package.json ]; then
    echo "  ✅ package.json exists"
else
    echo "  ❌ ERROR: package.json is missing"
    ERRORS=$((ERRORS + 1))
fi

# Check 6: .gitignore properly configured
echo ""
echo "✓ Checking .gitignore..."
if [ -f .gitignore ]; then
    if grep -q "node_modules/" .gitignore && \
       grep -q ".env" .gitignore && \
       grep -q "generated-repos/" .gitignore; then
        echo "  ✅ .gitignore properly configured"
    else
        echo "  ⚠️  WARNING: .gitignore might be missing important entries"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo "  ❌ ERROR: .gitignore is missing"
    ERRORS=$((ERRORS + 1))
fi

# Check 7: node_modules is NOT staged
echo ""
echo "✓ Checking node_modules..."
if git ls-files --error-unmatch node_modules/ 2>/dev/null | grep -q .; then
    echo "  ❌ ERROR: node_modules is staged for commit!"
    echo "     Run: git rm -r --cached node_modules/"
    ERRORS=$((ERRORS + 1))
else
    echo "  ✅ node_modules is not staged (correct)"
fi

# Check 8: generated-repos is NOT staged
echo ""
echo "✓ Checking generated-repos..."
if [ -d generated-repos ]; then
    if git ls-files --error-unmatch generated-repos/ 2>/dev/null | grep -q .; then
        echo "  ❌ ERROR: generated-repos is staged for commit!"
        echo "     Run: git rm -r --cached generated-repos/"
        ERRORS=$((ERRORS + 1))
    else
        echo "  ✅ generated-repos is not staged (correct)"
    fi
else
    echo "  ✅ generated-repos doesn't exist (will be created at runtime)"
fi

# Check 9: Source files exist
echo ""
echo "✓ Checking source files..."
if [ -f src/api/taskHandler.js ] && \
   [ -f src/github/githubManager.js ] && \
   [ -f src/generator/codeGenerator.js ]; then
    echo "  ✅ Core source files exist"
else
    echo "  ❌ ERROR: Some core source files are missing"
    ERRORS=$((ERRORS + 1))
fi

# Check 10: Check for potential secrets in tracked files
echo ""
echo "✓ Checking for potential secrets in staged files..."
SECRET_PATTERNS=("ghp_" "sk-" "AIza" "AKIA" "-----BEGIN")
FOUND_SECRETS=0

for pattern in "${SECRET_PATTERNS[@]}"; do
    if git diff --cached --name-only | xargs grep -l "$pattern" 2>/dev/null | grep -v ".env.example"; then
        echo "  ❌ ERROR: Potential secret pattern '$pattern' found in staged files!"
        FOUND_SECRETS=1
        ERRORS=$((ERRORS + 1))
    fi
done

if [ $FOUND_SECRETS -eq 0 ]; then
    echo "  ✅ No obvious secrets found in staged files"
fi

# Summary
echo ""
echo "================================================"
echo "📊 Summary"
echo "================================================"
echo "Errors: $ERRORS"
echo "Warnings: $WARNINGS"
echo ""

if [ $ERRORS -gt 0 ]; then
    echo "❌ FAILED: Fix $ERRORS error(s) before committing"
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo "⚠️  WARNING: $WARNINGS warning(s) found"
    echo "You can proceed but consider fixing warnings"
    exit 0
else
    echo "✅ SUCCESS: All checks passed!"
    echo "You're ready to commit to GitHub"
    exit 0
fi