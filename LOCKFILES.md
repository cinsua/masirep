# Lockfile Management in Masirep

## Overview

This project uses npm as the package manager and may encounter warnings about multiple lockfiles. Here's how to handle them:

## Lockfiles in This Project

### Primary Lockfile
- `package-lock.json` - **PRIMARY** lockfile for npm dependencies
- **KEEP**: This file is version-controlled and should be committed

### Secondary Lockfiles
- `node_modules/**/yarn.lock` - Lockfiles from npm packages that use yarn internally
- **IGNORED**: These are automatically ignored via `.gitignore`

## Warning Resolution

### "Multiple lockfiles detected" Warning

This warning may appear when:
1. An npm package includes its own `yarn.lock` file in `node_modules/`
2. Both npm and yarn have been used in the same project

**Solution**: The project is configured to ignore secondary lockfiles in `.gitignore`:

```gitignore
# Ignore lockfiles in node_modules (dependency lockfiles)
/node_modules/**/yarn.lock
/node_modules/**/package-lock.json
```

### Best Practices

1. **Always use npm** for this project:
   ```bash
   npm install
   npm run dev
   npm test
   ```

2. **Never mix package managers** in the same project:
   - Avoid using `yarn` commands
   - Don't manually create `yarn.lock` files

3. **Clean up if yarn was used accidentally**:
   ```bash
   # Remove yarn lockfile if it exists
   rm yarn.lock

   # Reinstall with npm to ensure consistency
   rm -rf node_modules package-lock.json
   npm install
   ```

## Verification

To verify you have the correct lockfile setup:

```bash
# Should show only package-lock.json in root
ls -la *lock*

# Should show no yarn.lock in root
test ! -f yarn.lock && echo "✓ No yarn.lock in root" || echo "✗ yarn.lock found in root"

# Should show clean git status (ignoring node_modules)
git status --porcelain | grep -v node_modules
```

## Why This Matters

1. **Dependency Resolution**: Ensures all developers and deployments use identical dependency trees
2. **Security**: Prevents dependency confusion attacks
3. **Build Reliability**: Guarantees consistent builds across environments
4. **Version Control**: Avoids unnecessary diffs and conflicts in git

## Troubleshooting

### If you see lockfile conflicts:

1. **Delete all lockfiles**:
   ```bash
   rm package-lock.json
   rm yarn.lock  # if exists
   ```

2. **Clear npm cache**:
   ```bash
   npm cache clean --force
   ```

3. **Reinstall with npm**:
   ```bash
   npm install
   ```

4. **Commit the new package-lock.json**:
   ```bash
   git add package-lock.json
   git commit -m "Regenerate package-lock.json with npm"
   ```

### If you accidentally used yarn:

1. **Remove yarn artifacts**:
   ```bash
   rm yarn.lock
   rm -rf .yarn
   ```

2. **Reinstall with npm**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

## Package Manager Configuration

The project includes npm configuration to avoid conflicts:

```json
{
  "packageManager": "npm@10.0.0"
}
```

This ensures that anyone working on the project uses npm version 10.0.0 or later.

---

**Note**: Some npm packages may include their own lockfiles in `node_modules/`. This is normal and doesn't affect the project's dependency management.