# 💸 Bills 4 Thrills

**Swipe right. Pay their bill.** A playful, Tinder-style demo where donors swipe through people with overdue bills (single moms, broke college students, etc.). Swipe right to "pay" and get an *It's a Match!* moment with confetti. Swipe left to pass.

> **Demo only. No real money changes hands.** All profiles are fictional. Everything is stored in your browser's `localStorage`.

## What's inside

| File | What it does |
| --- | --- |
| `index.html` | Landing page: hero, pitch, two CTAs |
| `swipe.html` | Swipeable card deck, running "You've paid $X" counter, match modal with confetti |
| `post.html` | Form to post your own bill (photo upload/URL, story, bill type, amount, due date) |
| `matches.html` | List of bills you've paid |
| `data.js` | The 8 example profiles. Edit them here |
| `app.js` | All the logic: swiping, storage, confetti, form |
| `styles.css` | Shared styles (Open Sans, big type, lots of white space) |

No build step, no dependencies. Just static HTML, CSS, and vanilla JS.

### Controls
- **Drag** a card left/right with mouse or touch
- **Tap** ❌ (pass) or 💚 heart (pay)
- **Keyboard:** `←` pass, `→` pay, `Esc` closes the match modal

## Run locally

```bash
cd bills4thrills
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy to GitHub Pages

1. Create a new repo on GitHub (e.g. `bills4thrills`) and push these files to the root of the `main` branch:
   ```bash
   cd bills4thrills
   git init && git add . && git commit -m "Bills 4 Thrills demo"
   git branch -M main
   git remote add origin https://github.com/<you>/bills4thrills.git
   git push -u origin main
   ```
   Or, with the GitHub CLI: `gh repo create bills4thrills --public --source=. --push`
2. On GitHub, go to **Settings → Pages**.
3. Under **Build and deployment**, pick **Source: Deploy from a branch**, branch **`main`**, folder **`/ (root)`**, then **Save**.
4. After a minute your site is live at `https://<you>.github.io/bills4thrills/`.

The `.nojekyll` file tells Pages to serve the files as-is. The `screenshots/` folder is optional and can be deleted.

## Customize
- **Accent color:** change `--accent` at the top of `styles.css`.
- **Profiles:** edit `data.js`. Photos come from [pravatar.cc](https://pravatar.cc) placeholder portraits (600px, so they stay sharp on big cards); if an image fails, a gradient avatar with the person's initial shows instead.
- **Reset your data:** use "Reset my matches" on the matches page, or clear site data in your browser.
