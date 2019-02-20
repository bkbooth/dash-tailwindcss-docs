const path = require('path');

const BASE_PATH = path.join('./Tailwind_CSS.docset');

module.exports = {
  // Location of the docset database
  dbFile: path.join(BASE_PATH, 'Contents/Resources/docSet.dsidx'),

  // Location of the docset documents
  docsDir: path.join(BASE_PATH, 'Contents/Resources/Documents'),
  // Location of the scraped documents
  scrapeDir: './scraped',
  // CSS selectors to find and remove from HTML documents
  selectorsToRemove: [
    'script', // All script tags
    'body > div:first-child', // Menu bar
    '#sidebar', // Main navigation sidebar
    '#app > div > div:last-child > div:last-child', // Secondary navigation sidebar
  ],
  // Name of Tailwind CSS stylesheet
  tailwindCssFilename: 'styles-tailwind.css',

  // Static files to be copied into docset
  staticFiles: [
    { name: 'Info.plist', dest: path.join(BASE_PATH, 'Contents/Info.plist') },
    { name: 'icon.png', dest: path.join(BASE_PATH, 'icon.png') },
    {
      name: 'styles-dash.css',
      dest: path.join(BASE_PATH, 'Contents/Resources/Documents/assets/styles-dash.css'),
    },
    {
      name: 'anchor.min.js',
      dest: path.join(BASE_PATH, 'Contents/Resources/Documents/assets/anchor.min.js'),
    },
  ],
};
