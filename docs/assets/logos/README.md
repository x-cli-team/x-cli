# X CLI Logo Assets

This directory contains all logo assets for the X CLI project.

## Files

### Core Logo Files

- **`x-cli-logo.svg`** - Standard logo (100x100px)
- **`x-cli-logo-small.svg`** - Small version (32x32px)
- **`x-cli-logo-large.svg`** - Large version (200x200px)

### Specialized Assets

- **`favicon.svg`** - Favicon for web use (32x32px)
- **`github-social-preview.svg`** - GitHub repository social preview (1200x630px)

## Usage Guidelines

### Colors

- **Red**: `#ea4335` (Google Red)
- **Yellow**: `#fbbc04` (Google Yellow)
- **Green**: `#34a853` (Google Green)
- **Blue**: `#4285f4` (Google Blue)
- **Center**: `#1a73e8` (Darker Blue)

### Design Elements

- Chrome-inspired circular design with 4 color segments
- Central blue circle with white inner circle
- "X" symbol in center representing the CLI name
- Clean, professional appearance suitable for terminal tools

### Recommended Usage

- **README.md**: Use `x-cli-logo-large.svg` at 120px width
- **Documentation**: Use `x-cli-logo.svg` at 100px width
- **Icons**: Use `x-cli-logo-small.svg` or `favicon.svg`
- **Social Media**: Use `github-social-preview.svg`

## Brand Guidelines

### Do's

✅ Use the logo with sufficient white space  
✅ Maintain aspect ratio when scaling  
✅ Use on light or dark backgrounds with proper contrast  
✅ Use SVG format for crisp display at any size

### Don'ts

❌ Modify the colors or proportions  
❌ Add effects, shadows, or outlines  
❌ Use on busy backgrounds that reduce visibility  
❌ Stretch or distort the logo

## Integration

These assets are automatically included in NPM packages via the `files` field in `package.json`:

```json
{
  "files": ["docs/assets/logos/**/*"]
}
```

## Attribution

Logo design inspired by Chrome's visual language, customized for X CLI branding.
