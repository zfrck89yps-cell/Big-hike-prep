# Big Hike app

Expo React Native app built to your exact 13-week structure.

## What is included
- Weeks 1-12 with the exact two-week strength cycle:
  - Week pattern 1: A Sunday, B Wednesday, C Friday
  - Week pattern 2: D Sunday, E Wednesday, F Friday
- Week 13 left intentionally unscheduled for strength so you can complete one round of A-F without the app inventing a schedule you did not specify
- Daily yoga pages with 10 poses per day using your available pose filenames where possible
- Run days on Tuesday / Thursday / Saturday with completion-only tracking
- Strength logging with weight + reps per exercise and a session complete toggle
- Multiple profiles so friends can keep separate logs on the same install

## App icon
Use this filename for the homepage icon:
- `assets/icons/icon.png`

Already included in this folder from the image you attached.
For Expo, the same image is also duplicated as:
- `assets/icons/splash.png`
- `assets/icons/adaptive-icon.png`

## Yoga images
1. Drop pose PNGs into `assets/yoga/`
2. Keep filenames aligned with `docs/yoga-image-file-list.txt`
3. Run:

```bash
npm install
npm run generate:pose-map
npm start
```

If a pose image is missing, the app will show the pose name instead.

## GitHub-ready structure
This folder can be pushed straight to GitHub.

## Notes
- Styling is based on the attached icon: deep navy, sunrise yellow, trail green, and boot orange.
- Bundle/package identifiers are placeholders and can be changed later in `app.json`.

## Deploy to GitHub Pages

This project can be deployed as a static web site using GitHub Pages (the `gh-pages` branch).

1. Make sure your repo is pushed to GitHub (e.g. `git push origin main`).
2. From `big-hike-app/` run:

```bash
npm install
npm run deploy
```

3. In your GitHub repository settings, under **Pages**, select the **gh-pages** branch and **/ (root)** folder as the source.
4. Visit the published URL: `https://<your-github-username>.github.io/<your-repo-name>/`.

✅ `npm run deploy` will build the web output, adjust the asset paths for a subpath (required for GitHub Pages), and push the `dist` output to the `gh-pages` branch.
