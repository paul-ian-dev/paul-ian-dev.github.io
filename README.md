# paul-ian-dev.github.io

Source for [paul-ian.com](https://paul-ian.com), the personal site of Paul Ian Lim, a software and data engineer on the Gold Coast, Australia.

## Built with

- [Astro](https://astro.build) for a fully static site, with a little TypeScript for the theme toggle, scroll-aware navigation and canvas animation
- [Sveltia CMS](https://github.com/sveltia/sveltia-cms) for editing content in the browser; content lives in `src/content/` as YAML and Markdown
- GitHub Actions and GitHub Pages for deployment on every push to `master`

## Run it locally

Requires Node.js 22.12 or later.

    npm install
    npm run dev       # http://localhost:4321
    npm run build     # type-check and build into dist/
    npm run preview   # serve the built site

## Layout

    src/content/      profile, experience, projects, credentials and notes
    src/components/   page sections
    src/pages/        home, project case studies, notes and 404
    public/admin/     CMS configuration
