#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

// Read package.json
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const currentVersion = pkg.version;

// Get the latest tag
const latestTag = execSync('git tag --sort=-version:refname | head -1', { encoding: 'utf8' }).trim().replace('v', '');

// Compare versions
const [major, minor, patch] = currentVersion.split('.').map(Number);
const [tagMajor, tagMinor, tagPatch] = latestTag.split('.').map(Number);

if (major < tagMajor || (major === tagMajor && minor < tagMinor) || (major === tagMajor && minor === tagMinor && patch <= tagPatch)) {
  console.error(`Error: Package version (${currentVersion}) must be higher than the latest tag (${latestTag}).`);
  process.exit(1);
}

console.log(`Version check passed: ${currentVersion} > ${latestTag}`);