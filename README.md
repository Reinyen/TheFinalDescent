# The Final Descent

The main game code lives in the [`the-final-descent/`](the-final-descent/) subfolder. Use that directory for development tasks, including installing dependencies and running scripts.

## Getting started

1. Change into the game workspace:
   ```bash
   cd the-final-descent
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Run tests:
   ```bash
   npm test
   ```

The top-level files (`data.js`, `state.js`, etc.) are legacy artifacts; the actively maintained project is the React + Vite app inside `the-final-descent/`.

## Repository sync status

If you need to verify your GitHub connectivity from this workspace, confirm the remote and branch before pushing. The repo's default branch is `work`:

```bash
git remote -v                 # should show fetch/push URLs
git branch --show-current     # confirm you're on work
git push -u origin work       # or: git push -u origin HEAD if you're on work already
```

If you see `error: src refspec work does not match any`, you are likely on a different branch (e.g., `main`). Switch to `work` first—or create it if your clone is missing the branch—before pushing:

```bash
git fetch origin                 # pull branch info if the remote exists
git checkout work || git checkout -b work
git push -u origin work
```

Run these commands from the repo root (`/workspace/TheFinalDescent`).
