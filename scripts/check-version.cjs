#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

// Read package.json
let pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
let currentVersion = pkg.version;

// Get the latest tag
const latestTag = execSync('git tag --sort=-version:refname | head -1', { encoding: 'utf8' }).trim().replace('v', '');

// Compare versions
const [major, minor, patch] = currentVersion.split('.').map(Number);
const [tagMajor, tagMinor, tagPatch] = latestTag.split('.').map(Number);

if (major < tagMajor || (major === tagMajor && minor < tagMinor) || (major === tagMajor && minor === tagMinor && patch <= tagPatch)) {
  // Auto-bump patch version
  const newVersion = `${major}.${minor}.${patch + 1}`;
  pkg.version = newVersion;
  fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
  console.log(`Auto-bumped version from ${currentVersion} to ${newVersion}`);

  // Update README.md
  const readmePath = 'README.md';
  if (fs.existsSync(readmePath)) {
    let readme = fs.readFileSync(readmePath, 'utf8');
    const versionRegex = /## \d+\.\d+\.\d+ – Stability Release/;
    const newHeader = `## ${newVersion} – Stability Release`;
    readme = readme.replace(versionRegex, newHeader);
    fs.writeFileSync(readmePath, readme);
    console.log(`Updated README.md to ${newVersion}`);
  }

  // Re-stage the updated files
  execSync('git add package.json README.md');

  currentVersion = newVersion;
}

console.log(`Version check passed: ${currentVersion} > ${latestTag}`);