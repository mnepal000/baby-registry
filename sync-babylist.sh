#!/bin/bash
# Sync Babylist purchase status into the site; commit+push only when it changed.
# Called by the babylist-purchase-sync cron every 2 hours.
set -u
cd "$HOME/workspace/baby-registry" || exit 1

if ! node sync-babylist.mjs; then
  echo "sync failed, keeping previous babylist-purchased.json"
  exit 1
fi

if git diff --quiet -- babylist-purchased.json; then
  echo "no purchase changes"
  exit 0
fi

git add babylist-purchased.json
git -c user.name="dallu" -c user.email="dallu@local" commit -qm "Sync Babylist purchase status"
git push origin main
echo "pushed purchase update"
