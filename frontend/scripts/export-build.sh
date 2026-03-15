#!/bin/bash
# Build script for static export (GitHub Pages)
# Temporarily moves incompatible files out of the way, then restores them

FRONTEND_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKUP_DIR="$FRONTEND_DIR/.export-backup"

cd "$FRONTEND_DIR"

rm -rf "$BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

# Restore function — always runs, even on failure
cleanup() {
  echo "==> Restoring files..."
  [ -d "$BACKUP_DIR/api" ] && mv "$BACKUP_DIR/api" src/app/api
  [ -f "$BACKUP_DIR/robots.ts" ] && mv "$BACKUP_DIR/robots.ts" src/app/robots.ts
  [ -f "$BACKUP_DIR/sitemap.ts" ] && mv "$BACKUP_DIR/sitemap.ts" src/app/sitemap.ts
  [ -f "$BACKUP_DIR/middleware.ts" ] && mv "$BACKUP_DIR/middleware.ts" src/middleware.ts
  
  # Restore slug directories
  [ -d "$BACKUP_DIR/news-slug" ] && mv "$BACKUP_DIR/news-slug" "src/app/[locale]/about/news/[slug]"
  [ -d "$BACKUP_DIR/products-slug" ] && mv "$BACKUP_DIR/products-slug" "src/app/[locale]/products/[slug]"
  [ -d "$BACKUP_DIR/solutions-slug" ] && mv "$BACKUP_DIR/solutions-slug" "src/app/[locale]/solutions/[slug]"
  
  rm -rf "$BACKUP_DIR"
}
trap cleanup EXIT

echo "==> Moving incompatible files for static export..."

# API routes — server-only, incompatible with output:export
[ -d "src/app/api" ] && mv src/app/api "$BACKUP_DIR/api"

# Dynamic metadata routes
[ -f "src/app/robots.ts" ] && mv src/app/robots.ts "$BACKUP_DIR/robots.ts"
[ -f "src/app/sitemap.ts" ] && mv src/app/sitemap.ts "$BACKUP_DIR/sitemap.ts"

# Middleware — incompatible with static export
[ -f "src/middleware.ts" ] && mv src/middleware.ts "$BACKUP_DIR/middleware.ts"

# Dynamic [slug] routes (generateStaticParams returns [], no pages to render)
[ -d "src/app/[locale]/about/news/[slug]" ] && mv "src/app/[locale]/about/news/[slug]" "$BACKUP_DIR/news-slug"
[ -d "src/app/[locale]/products/[slug]" ] && mv "src/app/[locale]/products/[slug]" "$BACKUP_DIR/products-slug"
[ -d "src/app/[locale]/solutions/[slug]" ] && mv "src/app/[locale]/solutions/[slug]" "$BACKUP_DIR/solutions-slug"

echo "==> Running Next.js build with static export (webpack)..."
rm -rf .next out
NEXT_EXPORT=true npx next build --webpack

BUILD_EXIT=$?
echo "==> Build exit code: $BUILD_EXIT"
exit $BUILD_EXIT
