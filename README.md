# Roy's Learning Journey

A personal learning timeline website for Roy, hosted on GitHub Pages.

## Setup

### 1. Enable GitHub Pages

1. Go to **Settings → Pages**
2. Under "Branch", select `main` and `/ (root)`, click Save
3. Wait 1-2 minutes for the site to deploy at `https://sojuallen.github.io/roy_website`

### 2. Replace Profile Photo

Replace `images/profile.jpg` with a real photo of Roy (square, at least 300x300px).

### 3. Set Up Admin Panel (Decap CMS)

To enable Roy to edit his timeline entries from any device:

1. Go to GitHub → **Settings → Developer settings → OAuth Apps**
2. Click **New OAuth App** and fill in:
   - **Application name**: "Roy's Learning Journey"
   - **Homepage URL**: `https://sojuallen.github.io/roy_website`
   - **Authorization callback URL**: `https://api.netlify.com/auth/done`
3. Click **Register application**
4. Click **Generate a new client secret** and copy both the Client ID and secret
5. Go to `admin/config.yml`, add under `backend`:
   ```yaml
   auth_endpoint: auth
   ```
   No additional config needed on the site side — Decap CMS uses Netlify's free auth gateway.

6. Roy can now visit `https://sojuallen.github.io/roy_website/admin` and log in with his GitHub account to add/edit books and events.

### 4. Editing Timeline Directly

Entries are stored in `data/entries.json`. You can also edit this file directly on GitHub.

Each entry has:
```json
{
  "type": "book | event",
  "date": "YYYY-MM-DD",
  "title": "Entry title",
  "coverImage": "path/to/image.jpg",
  "icon": "path/to/icon.png",
  "details": "Description in plain text or markdown"
}
```

### 5. Adding Images

- Upload book covers and event icons via the admin panel (they go to `images/uploads/`)
- Or place them manually in the `images/uploads/` directory

## Local Development

Just open `index.html` in a browser. No build tools needed.
