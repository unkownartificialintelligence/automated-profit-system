import sqlite3 from 'sqlite3';
import fs from 'fs';

const db = new sqlite3.Database('./database.db');

const schema = fs.readFileSync('./database/multi_tenant_schema.sql', 'utf8');

db.serialize(() => {
  // Execute schema
  db.exec(schema, (err) => {
    if (err) {
      console.error('Error creating multi-tenant tables:', err);
    } else {
      console.log('✅ Multi-tenant database initialized');
    }
    db.close();
  });
});
