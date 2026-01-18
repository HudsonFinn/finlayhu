---
name: commit
description: Creates a git commit with linting, code review, and conventional commit format. Use when you need to commit changes, create a commit message, or review staged changes before committing.
---

# Commit Skill

This skill creates high-quality git commits by running linting, reviewing code for issues, and generating conventional commit messages.

## Workflow

Follow these steps in order:

### Step 1: Run the Linter

Run the project linter to check for any issues:

```bash
bun run lint
```

If linting fails:
- Report the errors to the user
- Ask if they want you to fix them
- If yes, fix the issues and re-run the linter
- If no, stop the commit process

### Step 2: Check Git Status

Get the current state of the repository:

```bash
git status
git diff --staged
git diff
```

If there are no changes to commit, inform the user and stop.

If there are unstaged changes, ask the user which files they want to include in the commit.

### Step 3: Review Code Quality

Carefully review ALL changed code (both staged and to-be-staged) for:

1. **Edge Cases**: Are all edge cases handled? Consider:
   - Null/undefined values
   - Empty arrays/objects
   - Boundary conditions
   - Error states

2. **Code Quality Issues**:
   - Potential bugs or logic errors
   - Missing error handling
   - Incomplete implementations
   - Security concerns (XSS, injection, etc.)

3. **Best Practices**:
   - Consistent naming conventions
   - Proper TypeScript types (no `any` unless justified)
   - React best practices (hooks rules, key props, etc.)

4. **Testing**:
   - Are there tests for new functionality?
   - Do existing tests need updating?

### Step 4: Report Issues (if any)

If you find ANY issues during the code review:

1. List each issue clearly with:
   - File and line number
   - Description of the problem
   - Suggested fix

2. Ask the user: "I found the following issues. Would you like me to fix them before committing?"

3. If yes:
   - Fix all issues
   - Re-run the linter
   - Re-review the changes

4. If no:
   - Proceed to commit (user accepts the issues)

### Step 5: Stage Changes

Stage the appropriate files:

```bash
git add <files>
```

Or if the user wants all changes:

```bash
git add -A
```

### Step 6: Create the Commit

Generate a commit message following the Conventional Commits specification.

#### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Types

| Type | Description |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation only changes |
| `style` | Code style changes (formatting, semicolons, etc.) |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |
| `build` | Changes to build system or dependencies |
| `ci` | Changes to CI configuration |
| `chore` | Other changes that don't modify src or test files |

#### Rules

- **type**: Required. One of the types above.
- **scope**: Optional. The component or area affected (e.g., `button`, `input`, `docs`).
- **subject**: Required. Imperative mood, lowercase, no period at end, max 50 chars.
- **body**: Optional. Explain what and why, not how. Wrap at 72 chars.
- **footer**: Optional. Reference issues with `Closes #123` or `Fixes #456`.

#### Examples

```
feat(button): add loading state with spinner

Add a loading prop to the Button component that displays
a spinner and disables interaction while loading.

Closes #42
```

```
fix(text-input): prevent value loss on rapid typing

The input was dropping characters when typing quickly due to
a state update race condition. Fixed by using a ref to track
the latest value.

Fixes #89
```

```
refactor(card): simplify shadow variants

Consolidate shadow utility classes into a single
shadowVariant prop instead of multiple boolean props.

BREAKING CHANGE: Removed `elevated` and `flat` props.
Use `shadowVariant="elevated"` or `shadowVariant="flat"` instead.
```

### Step 7: Execute the Commit

Create the commit with the generated message:

```bash
git commit -m "$(cat <<'EOF'
<type>(<scope>): <subject>

<body>

<footer>

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

### Step 8: Confirm Success

Run `git status` to confirm the commit was created successfully, and show the user the commit hash and message.

## Important Notes

- NEVER use `--amend` unless explicitly requested by the user
- NEVER push to remote unless explicitly requested
- NEVER skip the linting step
- ALWAYS review the code thoroughly before committing
- ALWAYS ask the user before fixing issues (don't assume)
