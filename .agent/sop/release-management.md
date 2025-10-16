# Release Management

## Version Bumping Guidelines
- **Patch (1.0.41 → 1.0.42)**: Bug fixes, small updates.
- **Minor (1.0.41 → 1.1.0)**: New features, backwards-compatible.
- **Major (1.0.41 → 2.0.0)**: Breaking changes.

## Best Practices
- Use conventional commits: `feat:`, `fix:`, `BREAKING CHANGE:`.
- Bump version based on changes since last release.
- Update README with new features/changes.
- Test with `npm run local` before pushing.

## Timing for Releases
- Release patch: After bug fixes.
- Release minor: After new features accumulate.
- Release major: When ready for breaking changes.