Run the following steps to commit the current changes:

1. Run `git status` and `git diff` to understand what changed.
2. Stage the relevant files with `git add` — prefer specific file paths over `git add -A`. Do not stage unrelated files.
3. Write a commit message following Conventional Commits format:
   - `feat:` — new feature
   - `fix:` — bug fix
   - `chore:` — tooling, config, dependencies
   - `docs:` — documentation only
   - `test:` — adding or updating tests
   - `refactor:` — code change with no behavior change
   - Keep the subject line under 72 characters
   - Add a body if the "why" is not obvious
4. Create the commit. **Do not include any Co-Authored-By lines, AI attribution, or any mention of Claude or AI tools in the commit message.**
5. Run `git status` to confirm the commit succeeded.
