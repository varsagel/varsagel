const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'data/prod.db');
console.log('Checking database at:', dbPath);

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
});

db.all("PRAGMA table_info(Category);", [], (err, rows) => {
  if (err) {
    console.error('Error querying schema:', err.message);
    process.exit(1);
  }
  
  console.log('Columns in Category table:');
  rows.forEach((row) => {
    console.log(`- ${row.name} (${row.type})`);
  });

  const hasIcon = rows.some(r => r.name === 'icon');
  console.log('\nHas icon column?', hasIcon);
  
  db.close();
});
