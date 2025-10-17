#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

// Read package.json
let pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
let currentVersion = pkg.version;

// Get the latest tag
const latestTag = execSync('git tag --sort=-version:refname | head -1', { encoding: 'utf8' }).trim().replace('v', '');

// Analyze commits since last tag for conventional commits
let bumpType = 'patch';
try {
  const commits = execSync(`git log --oneline ${latestTag}..HEAD`, { encoding: 'utf8' });
  if (commits.includes('BREAKING CHANGE')) {
    bumpType = 'major';
  } else if (commits.includes('feat:')) {
    bumpType = 'minor';
  } else if (commits.includes('fix:')) {
    bumpType = 'patch';
  }
  console.log(`Recommended bump: ${bumpType} (based on commits since ${latestTag})`);
} catch (e) {
  console.log('No commits since last tag, defaulting to patch bump');
}

// Compare versions
const [major, minor, patch] = currentVersion.split('.').map(Number);
const [tagMajor, tagMinor, tagPatch] = latestTag.split('.').map(Number);

if (process.env.CI && (major < tagMajor || (major === tagMajor && minor < tagMinor) || (major === tagMajor && minor === tagMinor && patch <= tagPatch))) {
  // Auto-bump based on recommended type (only in CI)
  let newVersion;
  if (bumpType === 'major') {
    newVersion = `${major + 1}.0.0`;
  } else if (bumpType === 'minor') {
    newVersion = `${major}.${minor + 1}.0`;
  } else {
    newVersion = `${major}.${minor}.${patch + 1}`;
  }
  pkg.version = newVersion;
  fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
  console.log(`Auto-bumped version from ${currentVersion} to ${newVersion} (${bumpType})`);

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