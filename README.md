# Roy's Learning Journey

A personal learning timeline website for Roy, hosted on GitHub Pages.

## Setup

### 1. Enable GitHub Pages

1. Go to **Settings → Pages**
2. Under "Branch", select `main` and `/ (root)`, click Save
3. Wait 1-2 minutes for the site to deploy at `https://sojuallen.github.io/roy_website`

### 2. Replace Profile Photo

Replace `images/profile.jpg` with a real photo of Roy (square, at least 300x300px).
Until then, the site shows a cute rocket-themed placeholder.

### 3. Editing Entries (Admin)

**Simple way (recommended, works now):**

Visit `https://sojuallen.github.io/roy_website/admin` and click "Edit entries.json on GitHub".
This opens GitHub's built-in JSON editor. Make changes, commit, and the site updates in ~1 minute.

Each entry looks like:
```json
{
  "type": "book | event",
  "date": "YYYY-MM-DD",
  "title": "Entry title",
  "coverImage": "path/to/image.jpg",
  "icon": "path/to/icon.png",
  "details": "Description text"
}
```

**Rich CMS editor (drag-and-drop, image uploads):**

To enable the full Decap CMS editor with a visual form, image uploads, and drag-and-drop:

1. Create a free Netlify account at [netlify.com](https://netlify.com)
2. Create a new site from your GitHub repo
3. Enable Netlify Identity in the site settings
4. Register a GitHub OAuth App at GitHub → Developer settings
5. Update `admin/config.yml` with the OAuth details (see comments in the file)

### 4. Adding Images

Upload images to `images/uploads/` through GitHub's web interface or by pushing to the repo.

## Local Development

```bash
python -m http.server 8080
```
Then open `http://localhost:8080`.
