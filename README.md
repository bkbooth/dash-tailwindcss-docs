# dash-tailwindcss-docs

Generate docset for Kapeli's [Dash][1] Mac app from the [Tailwind CSS][2] docs.

## Usage

API docs are scraped from [tailwindcss.com/docs][2] using [Wget][5] then moved to the `Tailwind_CSS.docset/Contents/Resources/Documents` folder. Do not directly modify any of the files under `Tailwind_CSS.docset`, they will be overwritten by the scripts.

```bash
git clone https://github.com/bkbooth/dash-tailwindcss-docs.git
cd dash-tailwindcss-docs
yarn
yarn build
```

This will scrape the [Tailwind CSS][2] docs into a local folder, copy and transform all of the HTML files, then parse the HTML files' navigation menu to get a list of entries to populate the docset database.

The scraper will download the latest version of the API docs.

Prepare the docset for [Dash][1] by archiving after generating with this command:

```bash
tar --exclude='.DS_Store' -cvzf Tailwind_CSS.tgz Tailwind_CSS.docset
```

## Prequisites

- [Node.js][3] >= v8.0.0
- [Yarn][4] (preferred, can use `npm`)
- [httrack][5]

[1]: https://kapeli.com/dash
[2]: https://tailwindcss.com/docs/
[3]: https://nodejs.org/
[4]: https://yarnpkg.com/
[5]: https://www.gnu.org/software/wget/
