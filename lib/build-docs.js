const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const cheerio = require('cheerio');
const config = require('../config');

const DOCS_FILES_DIR = path.join(config.scrapeDir, 'tailwindcss.com/docs');

// Load index file to get current version and list of pages
const $i = cheerio.load(fs.readFileSync(path.join(DOCS_FILES_DIR, 'index.html')));
const navbarText = $i('body > div:first-child').text();
const {
  groups: { version },
} = /\s+v(?<version>[0-9.]+)\s+/m.exec(navbarText);

console.log(`Processing Tailwind CSS docs v${version}`);

mkdirp.sync(path.join(config.docsDir, 'assets'));
copyDocsCss(config);
copyStaticFiles(config);
transformDocsHtml(config);

// Find, process and copy all docs HTML into docset
function transformDocsHtml(config) {
  const docsPages = $i('#nav a')
    .toArray()
    .map($i)
    .map(link => ({
      name: link.text().trim(),
      file: link.attr('href'),
    }));

  docsPages.forEach(docsPage => {
    if (docsPage.file.includes('http')) {
      return;
    }

    console.log(`Processing ${docsPage.name} (${docsPage.file})...`);

    const fileData = fs.readFileSync(path.join(DOCS_FILES_DIR, docsPage.file));
    const $ = cheerio.load(fileData);

    // Remove unwanted elements
    config.selectorsToRemove.forEach(selectorToRemove => $(selectorToRemove).remove());

    const assetUrlPrefix = docsPage.file.includes('/') ? '../' : '';

    // Replace head block
    $('head').html(`
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1.0">
      <title>${docsPage.name}</title>
      <link rel="stylesheet" href="${assetUrlPrefix}assets/${config.tailwindCssFilename}">
      <link rel="stylesheet" href="${assetUrlPrefix}assets/styles-dash.css">
    `);

    // Add script to generate anchors
    $('body').append(`
      <script src="${assetUrlPrefix}assets/anchor.min.js"></script>
      <script>
        anchors.options.class = 'text-grey-dark';
        anchors.add();
      </script>
    `);

    // Write the transformed file
    const outputFile = path.join(config.docsDir, docsPage.file);
    mkdirp(path.dirname(outputFile));
    fs.writeFileSync(outputFile, $.html());
  });
}

// Find and copy the Tailwind CSS docs CSS into docset
function copyDocsCss(config) {
  const docsCssRegex = /^main\.css@id=[0-9a-z]+\.css$/;
  const docsAssetsDir = path.join(config.scrapeDir, 'tailwindcss.com/assets/build/css');
  const docsAssetsFiles = fs.readdirSync(docsAssetsDir);
  const docsCssFile = docsAssetsFiles.find(docsAssetsFile => docsCssRegex.test(docsAssetsFile));
  if (!docsCssFile) {
    console.error('Failed finding Tailwind CSS docs CSS to copy into docset');
    process.exit(1);
  }

  console.log(
    `Copying Tailwind CSS docs CSS file '${docsCssFile}' to '${config.tailwindCssFilename}'...`
  );

  const readStream = fs.createReadStream(path.join(docsAssetsDir, docsCssFile));
  const writeStream = fs.createWriteStream(
    path.join(config.docsDir, 'assets', config.tailwindCssFilename)
  );
  readStream.once('error', handleFailedCssCopy);
  writeStream.once('error', handleFailedCssCopy);
  readStream.pipe(writeStream);

  function handleFailedCssCopy(err) {
    console.error('Failed copying Tailwind CSS docs CSS file.', err.message);
    process.exit(1);
  }
}

// Copy static files in place
function copyStaticFiles(config) {
  config.staticFiles.forEach(staticFile => {
    console.log(`Copying file '${staticFile.name}' into docset...`);

    const readStream = fs.createReadStream(path.join('assets', staticFile.name));
    const writeStream = fs.createWriteStream(staticFile.dest);
    readStream.once('error', handleFailedFileCopy);
    writeStream.once('error', handleFailedFileCopy);
    readStream.pipe(writeStream);
  });

  function handleFailedFileCopy(err) {
    console.error('Failed copying file.', err.message);
    process.exit(1);
  }
}
