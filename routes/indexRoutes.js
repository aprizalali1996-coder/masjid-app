const express = require('express');
const router = express.Router();
const db = require('../database/db');

router.get('/', (req, res) => {
    // 1. Ambil data pengumuman
    db.all(`SELECT * FROM pengumuman WHERE status = 'Aktif' ORDER BY id DESC`, [], (err, pengumuman) => {
        // 2. Ambil data kajian
        db.all(`SELECT * FROM kajian ORDER BY tanggal ASC`, [], (err, kajian) => {
            // 3. Ambil data khatib
            db.all(`SELECT * FROM khatib ORDER BY tanggal ASC`, [], (err, khatib) => {
                // 4. Ambil data keuangan untuk menghitung laporan kas
                db.all(`SELECT jenis, nominal FROM keuangan`, [], (err, keuangan) => {
                    
                    let totalPemasukan = 0;
                    let totalPengeluaran = 0;

                    if (keuangan) {
                        keuangan.forEach(row => {
                            if (row.jenis === 'pemasukan') {
                                totalPemasukan += row.nominal;
                            } else {
                                totalPengeluaran += row.nominal;
                            }
                        });
                    }

                    // 5. Kirim SEMUA variabel ke index.ejs
                    res.render('public/index', { 
                        pengumuman: pengumuman || [], 
                        kajian: kajian || [], 
                        khatib: khatib || [],
                        totalPemasukan: totalPemasukan,
                        totalPengeluaran: totalPengeluaran
                    });
                });
            });
        });
    });
});

// Route untuk halaman donasi QRIS
router.get('/donasi', (req, res) => {
    res.render('public/donasi', { title: 'Donasi QRIS' });
});

module.exports = router;