import type { Topic } from './types'

export const git: Topic = {
  id: 'git',
  title: 'Git & Workflow',
  group: 'Foundations',
  summary: 'Branching, merge vs rebase, fixing mistakes with reflog, and the habits that make pull requests easy to review.',
  questions: [
    {
      q: 'What is the difference between merge and rebase?',
      level: 'basic',
      diagram: `
gitGraph
  commit id: "A"
  commit id: "B"
  branch feature
  commit id: "F1"
  commit id: "F2"
  checkout main
  commit id: "C"
  merge feature id: "merge commit"
`,
      a: "Both bring changes from one branch into another.\n\n- `merge` creates a merge commit joining the two histories. Nothing is rewritten, but history can get noisy.\n- `rebase` replays your commits on top of the other branch, giving a straight line. It rewrites your commits (new hashes).\n\nRule: rebase your own local or feature branch to update it; never rebase commits others have already pulled.",
      code: `
git checkout feature
git rebase main          # replay feature commits on top of main
git push --force-with-lease
`,
    },
    {
      q: 'What is interactive rebase used for?',
      level: 'mid',
      a: "`git rebase -i` lets you edit recent commits before sharing them: squash small 'fix typo' commits together, reword messages, reorder or drop commits. It turns messy work-in-progress into a clean, reviewable history.",
      code: `
git rebase -i HEAD~4
# pick   a1b2 Add invoice model
# squash c3d4 fix typo
# reword e5f6 Add invoice API
`,
    },
    {
      q: 'What is the difference between reset, revert and restore?',
      level: 'mid',
      a: "- `git revert <commit>`: makes a new commit that undoes an old one. Safe for shared branches.\n- `git reset`: moves the branch pointer back. `--soft` keeps changes staged, `--mixed` (default) keeps them unstaged, `--hard` throws them away. Only for local, unpushed work.\n- `git restore <file>`: discards changes to a file in your working directory.",
    },
    {
      q: 'How do you recover something you thought you lost?',
      level: 'mid',
      a: "`git reflog` lists everywhere `HEAD` has pointed recently, including commits removed by a bad reset or rebase. Find the hash and reset or branch from it. Reflog entries stay around for about 90 days by default.",
      code: `
git reflog
# 3f9a2c1 HEAD@{2}: commit: Add payment webhook
git reset --hard 3f9a2c1   # or: git branch rescue 3f9a2c1
`,
    },
    {
      q: 'How do you resolve a merge conflict?',
      level: 'basic',
      a: "Git marks the conflicting sections with `<<<<<<<`, `=======` and `>>>>>>>`. Open each file, decide the correct combined result (often a mix of both sides), remove the markers, run the tests, then `git add` the file and continue (`git merge --continue` or `git rebase --continue`). If it goes wrong, `--abort` returns to where you started.",
    },
    {
      q: 'What is git stash?',
      level: 'basic',
      a: "It temporarily saves uncommitted changes and gives you a clean working directory, for example to switch branches for a quick fix. `git stash pop` brings the changes back. `git stash -u` also includes untracked files.",
    },
    {
      q: 'What is cherry-pick?',
      level: 'basic',
      a: "`git cherry-pick <hash>` copies one specific commit onto your current branch. Useful for bringing a bug fix from `main` to a release branch without merging everything else.",
    },
    {
      q: 'What are conventional commits?',
      level: 'basic',
      a: "A commit message format like `feat: add CSV export`, `fix(auth): refresh token expiry`, `chore: bump deps`. It makes history easy to scan, and tools can generate changelogs and version bumps from it.",
    },
    {
      q: 'What makes a good pull request?',
      level: 'basic',
      a: "- Small and focused on one change.\n- A description covering what changed, why, and how to test it, with screenshots for UI.\n- Self-reviewed first: read your own diff, remove debug code, check naming.\n- Tests updated and CI passing.\n- Linked to the ticket.",
    },
    {
      q: 'What is semantic versioning?',
      level: 'basic',
      a: "Versions look like MAJOR.MINOR.PATCH. Bump MAJOR for breaking changes, MINOR for new backwards-compatible features, PATCH for bug fixes. In `package.json`, `^1.4.2` allows any 1.x.x at or above 1.4.2; `~1.4.2` allows only 1.4.x.",
    },
    {
      q: 'What are git hooks and Husky?',
      level: 'mid',
      a: "Git hooks are scripts that run on events like commit or push. Husky makes them easy to share with a team through the repo. A common setup runs lint-staged (lint and format only the changed files) on `pre-commit`, and tests on `pre-push`.",
    },
    {
      q: 'What branching strategy have you used?',
      level: 'mid',
      a: "Common options:\n\n- Trunk-based: short-lived feature branches merged into `main` quickly, often behind feature flags. Works well with CI/CD.\n- GitFlow: `develop`, `release` and `hotfix` branches. Heavier; suits scheduled releases.\n\nIn an interview, describe what your team actually does and why it fits.",
    },
  ],
}
