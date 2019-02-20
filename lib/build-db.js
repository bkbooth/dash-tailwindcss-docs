const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const sqlite3 = require('sqlite3');
const config = require('../config');

const db = new sqlite3.Database(config.dbFile, err => {
  if (err) {
    console.error(`Error opening database ${config.dbFile}`, err.message);
    process.exit(1);
  }
  console.log(`Opened database ${config.dbFile}`);
});

const docItems = loadDocItems(config);

db.serialize(() => {
  // Initialize the database
  db.run('DROP TABLE IF EXISTS searchIndex');
  db.run('CREATE TABLE searchIndex(id INTEGER PRIMARY KEY, name TEXT, type TEXT, path TEXT)');
  db.run('CREATE UNIQUE INDEX anchor ON searchIndex(name, type, path)');

  console.log(`Adding ${docItems.length} entries to the database.`);

  // Create and insert the entries
  const insertStmt = db.prepare(
    'INSERT INTO searchIndex(name, type, path) VALUES ($name, $type, $path)'
  );
  docItems.forEach(docItem =>
    insertStmt.run({
      $name: docItem.name,
      $type: docItem.type,
      $path: docItem.path,
    })
  );
  insertStmt.finalize();
});

// Close the database connection
db.close();

// Search through docs sidebar for database entries
function loadDocItems(config) {
  const $ = cheerio.load(
    fs.readFileSync(path.join(config.scrapeDir, 'tailwindcss.com/docs/index.html'))
  );

  return $('#nav > div') // All menu sections
    .toArray()
    .map($)
    .reduce((items, section) => {
      const sectionTitle = section
        .find('> p')
        .text()
        .trim();

      if (sectionTitle === 'Introduction') return items;

      return [
        ...items,
        ...section
          .find('> ul a') // All menu section links
          .toArray()
          .map($)
          .map(link => ({
            name: link.text().trim(),
            path: link.attr('href'),
            type: getItemType(sectionTitle),
          })),
      ];
    }, []);

  function getItemType(title) {
    switch (title) {
      case 'Getting Started':
        return 'Guide';
      case 'Component Examples':
        return 'Sample';
      default:
        return 'Section';
    }
  }
}
