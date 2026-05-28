const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

const dbPath = path.resolve(__dirname, 'masjid.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('Error opening database', err);
    else console.log('Database SQLite terkoneksi.');
});

db.serialize(async () => {
    // Tambahkan kolom 'role' pada tabel users
    db.run(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT, nama TEXT, role TEXT DEFAULT 'Super Admin')`);
    db.run(`CREATE TABLE IF NOT EXISTS keuangan (id INTEGER PRIMARY KEY AUTOINCREMENT, jenis TEXT, nominal INTEGER, keterangan TEXT, tanggal DATE DEFAULT CURRENT_DATE)`);
    db.run(`CREATE TABLE IF NOT EXISTS kajian (id INTEGER PRIMARY KEY AUTOINCREMENT, judul TEXT, ustadz TEXT, tanggal DATE, jam TEXT, tema TEXT, lokasi TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS pengumuman (id INTEGER PRIMARY KEY AUTOINCREMENT, judul TEXT, isi TEXT, tanggal DATE DEFAULT CURRENT_DATE, status TEXT DEFAULT 'Aktif')`);
    db.run(`CREATE TABLE IF NOT EXISTS khatib (id INTEGER PRIMARY KEY AUTOINCREMENT, nama TEXT, tema TEXT, tanggal DATE)`);

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash('admin123', salt);

    // Akun bawaan (Super Admin)
    db.get("SELECT * FROM users WHERE username = 'admin'", (err, row) => {
        if (!row) {
            db.run(`INSERT INTO users (username, password, nama, role) VALUES (?, ?, ?, ?)`, 
            ['admin', hashPassword, 'Super Administrator', 'Super Admin']);
        }
    });
});

module.exports = db;