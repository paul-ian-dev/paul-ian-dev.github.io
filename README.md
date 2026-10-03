# paul-ian-dev.github.io

Personal site of Paul Ian Lim, built with Astro and edited through Sveltia CMS.

## Editing content (no code needed)

1. Go to https://paul-ian-dev.github.io/admin/
2. Choose **Sign In Using Access Token**. Create a fine-grained GitHub token for this repository only, with **Contents: Read and write**. Keep the token private; the CMS stores it in your browser.
3. Edit Profile, Experience, Projects, Credentials or Notes, then **Save**.
4. Each save is a commit to `master`. GitHub Actions rebuilds and publishes the site in about a minute (see the Actions tab).

Tips:
- Experience **Category** decides the tab: Engineering or Other work.
- A project with an empty case study shows as a card only. Add text to get a `/work/<name>/` page.
- New notes start as **Draft**. Untick Draft to publish.
- Upload your CV in Profile → CV. The Download CV button appears once it's set.
- Screenshots: export at about 1600px wide as WebP or compressed PNG before uploading.
- Anything in `[square brackets]` is a placeholder. The build log lists any that remain.

## Deployment

Every push to `master` runs `.github/workflows/deploy.yml`, which builds the site and publishes it to GitHub Pages (Settings → Pages → Source: **GitHub Actions**). A failed build leaves the previous version live; the error is in the Actions tab.

## Local development

    npm install
    npm run dev          # http://localhost:4321, live reload
    npm run build        # production build into dist/
    npm run preview      # serve dist/ at http://localhost:4321
