const db = require('../database/db');
const bcrypt = require('bcrypt');

// Fungsi Menampilkan Dashboard
exports.dashboard = (req, res) => {
    db.all(`SELECT jenis, nominal FROM keuangan`, [], (err, rowsKeuangan) => {
        let saldo = 0;
        rowsKeuangan.forEach(row => {
            if (row.jenis === 'pemasukan') saldo += row.nominal;
            else saldo -= row.nominal;
        });

        db.all(`SELECT * FROM kajian ORDER BY tanggal ASC`, [], (err, rowsKajian) => {
            let totalKajian = rowsKajian.length;

            db.get(`SELECT COUNT(*) as totalPengumuman FROM pengumuman`, [], (err, rowPengumuman) => {
                let totalPengumuman = rowPengumuman ? rowPengumuman.totalPengumuman : 0;

                // AMBIL DATA KHATIB (BARU)
                db.all(`SELECT * FROM khatib ORDER BY tanggal ASC`, [], (err, rowsKhatib) => {
                    let totalKhatib = rowsKhatib.length;

                    res.render('admin/dashboard', { 
                        title: 'Dashboard', 
                        saldo: saldo,
                        totalKajian: totalKajian,
                        dataKajian: rowsKajian,
                        totalPengumuman: totalPengumuman,
                        totalKhatib: totalKhatib, // Kirim Total
                        dataKhatib: rowsKhatib    // Kirim Data Tabel
                    });
                });
            });
        });
    });
};

// Fungsi Menampilkan Halaman Keuangan (Read)
exports.getKeuangan = (req, res) => {
    db.all(`SELECT * FROM keuangan ORDER BY tanggal DESC, id DESC`, [], (err, rows) => {
        if(err) throw err;
        let saldo = 0, totalPemasukan = 0, totalPengeluaran = 0;

        rows.forEach(row => {
            if(row.jenis === 'pemasukan') {
                saldo += row.nominal;
                totalPemasukan += row.nominal;
            } else {
                saldo -= row.nominal;
                totalPengeluaran += row.nominal;
            }
        });

        res.render('admin/keuangan', { 
            title: 'Keuangan', data: rows, saldo, totalPemasukan, totalPengeluaran 
        });
    });
};

// Fungsi Menambah Data Keuangan (Create)
exports.addKeuangan = (req, res) => {
    const { jenis, nominal, keterangan, tanggal } = req.body;
    db.run(`INSERT INTO keuangan (jenis, nominal, keterangan, tanggal) VALUES (?, ?, ?, ?)`,
        [jenis, nominal, keterangan, tanggal], function(err) {
            if(err) req.flash('error_msg', 'Gagal menyimpan transaksi.');
            else req.flash('success_msg', 'Transaksi berhasil dicatat!');
            res.redirect('/admin/keuangan');
        }
    );
};

// Fungsi Menghapus Data Keuangan (Delete)
exports.deleteKeuangan = (req, res) => {
    const id = req.params.id;
    db.run(`DELETE FROM keuangan WHERE id = ?`, id, function(err) {
        if(err) req.flash('error_msg', 'Gagal menghapus data.');
        else req.flash('success_msg', 'Data transaksi berhasil dihapus.');
        res.redirect('/admin/keuangan');
    });
};

// Fungsi edit Data Keuangan
exports.editKeuangan = (req, res) => {
    const { jenis, nominal, keterangan, tanggal } = req.body;
    const { id } = req.params;
    
    db.run(`UPDATE keuangan SET jenis = ?, nominal = ?, keterangan = ?, tanggal = ? WHERE id = ?`,
    [jenis, nominal, keterangan, tanggal, id], (err) => {
        if(err) req.flash('error_msg', 'Gagal memperbarui transaksi');
        else req.flash('success_msg', 'Transaksi berhasil diperbarui');
        res.redirect('/admin/keuangan');
    });
};


// ==========================================
// CRUD JADWAL KAJIAN
// ==========================================

// Read (Menampilkan Data)
exports.getKajian = (req, res) => {
    db.all(`SELECT * FROM kajian ORDER BY tanggal DESC`, [], (err, rows) => {
        if(err) throw err;
        res.render('admin/kajian', { title: 'Kajian', data: rows });
    });
};

// Create (Menambah Data)
exports.addKajian = (req, res) => {
    const { judul, ustadz, tanggal, jam, tema, lokasi } = req.body;
    db.run(`INSERT INTO kajian (judul, ustadz, tanggal, jam, tema, lokasi) VALUES (?, ?, ?, ?, ?, ?)`,
        [judul, ustadz, tanggal, jam, tema, lokasi], function(err) {
            if(err) req.flash('error_msg', 'Gagal menyimpan kajian.');
            else req.flash('success_msg', 'Jadwal kajian berhasil ditambahkan!');
            res.redirect('/admin/kajian');
        }
    );
};

// Delete (Menghapus Data)
exports.deleteKajian = (req, res) => {
    const id = req.params.id;
    db.run(`DELETE FROM kajian WHERE id = ?`, id, function(err) {
        if(err) req.flash('error_msg', 'Gagal menghapus jadwal kajian.');
        else req.flash('success_msg', 'Jadwal kajian berhasil dihapus.');
        res.redirect('/admin/kajian');
    });
};


// Update (Mengedit Data Kajian)
exports.editKajian = (req, res) => {
    // Menangkap data dari form edit
    const { id, judul, ustadz, tanggal, jam, tema, lokasi } = req.body;
    
    // Menjalankan query UPDATE SQL
    db.run(`UPDATE kajian SET judul = ?, ustadz = ?, tanggal = ?, jam = ?, tema = ?, lokasi = ? WHERE id = ?`,
        [judul, ustadz, tanggal, jam, tema, lokasi, id], function(err) {
            if(err) req.flash('error_msg', 'Gagal mengubah jadwal kajian.');
            else req.flash('success_msg', 'Jadwal kajian berhasil diperbarui!');
            res.redirect('/admin/kajian');
        }
    );
};



// ==========================================
// CRUD PENGUMUMAN MASJID
// ==========================================

// Read
exports.getPengumuman = (req, res) => {
    db.all(`SELECT * FROM pengumuman ORDER BY id DESC`, [], (err, rows) => {
        if(err) throw err;
        res.render('admin/pengumuman', { title: 'Pengumuman', data: rows });
    });
};

// Create
exports.addPengumuman = (req, res) => {
    const { judul, isi, status } = req.body;
    db.run(`INSERT INTO pengumuman (judul, isi, status) VALUES (?, ?, ?)`,
        [judul, isi, status], function(err) {
            if(err) req.flash('error_msg', 'Gagal menyimpan pengumuman.');
            else req.flash('success_msg', 'Pengumuman berhasil ditambahkan!');
            res.redirect('/admin/pengumuman');
        }
    );
};

// Update
exports.editPengumuman = (req, res) => {
    const { id, judul, isi, status } = req.body;
    db.run(`UPDATE pengumuman SET judul = ?, isi = ?, status = ? WHERE id = ?`,
        [judul, isi, status, id], function(err) {
            if(err) req.flash('error_msg', 'Gagal mengubah pengumuman.');
            else req.flash('success_msg', 'Pengumuman berhasil diperbarui!');
            res.redirect('/admin/pengumuman');
        }
    );
};

// Delete
exports.deletePengumuman = (req, res) => {
    const id = req.params.id;
    db.run(`DELETE FROM pengumuman WHERE id = ?`, id, function(err) {
        if(err) req.flash('error_msg', 'Gagal menghapus pengumuman.');
        else req.flash('success_msg', 'Pengumuman berhasil dihapus.');
        res.redirect('/admin/pengumuman');
    });
};



// ==========================================
// CRUD JADWAL KHATIB JUMAT
// ==========================================
exports.getKhatib = (req, res) => {
    db.all(`SELECT * FROM khatib ORDER BY tanggal DESC`, [], (err, rows) => {
        if(err) throw err;
        res.render('admin/khatib', { title: 'Khatib', data: rows });
    });
};

exports.addKhatib = (req, res) => {
    const { nama, tema, tanggal } = req.body;
    db.run(`INSERT INTO khatib (nama, tema, tanggal) VALUES (?, ?, ?)`,
        [nama, tema, tanggal], function(err) {
            if(err) req.flash('error_msg', 'Gagal menyimpan jadwal khatib.');
            else req.flash('success_msg', 'Jadwal khatib berhasil ditambahkan!');
            res.redirect('/admin/khatib');
        }
    );
};

exports.editKhatib = (req, res) => {
    const { id, nama, tema, tanggal } = req.body;
    db.run(`UPDATE khatib SET nama = ?, tema = ?, tanggal = ? WHERE id = ?`,
        [nama, tema, tanggal, id], function(err) {
            if(err) req.flash('error_msg', 'Gagal mengubah jadwal khatib.');
            else req.flash('success_msg', 'Jadwal khatib berhasil diperbarui!');
            res.redirect('/admin/khatib');
        }
    );
};

exports.deleteKhatib = (req, res) => {
    const id = req.params.id;
    db.run(`DELETE FROM khatib WHERE id = ?`, id, function(err) {
        if(err) req.flash('error_msg', 'Gagal menghapus jadwal khatib.');
        else req.flash('success_msg', 'Jadwal khatib dihapus.');
        res.redirect('/admin/khatib');
    });
};



// ==========================================
// PENGATURAN USER / ADMIN
// ==========================================

// CRUD Users Admin (Dengan Logika Role)
exports.getUsers = (req, res) => { 
    db.all(`SELECT id, username, nama, role FROM users ORDER BY id ASC`, [], (err, rows) => { 
        res.render('admin/users', { title: 'Pengaturan Admin', data: rows }); 
    }); 
};

exports.addUser = async (req, res) => {
    const salt = await bcrypt.genSalt(10); 
    const hashPassword = await bcrypt.hash(req.body.password, salt);
    db.run(`INSERT INTO users (username, password, nama, role) VALUES (?, ?, ?, ?)`, 
    [req.body.username, hashPassword, req.body.nama, req.body.role], (err) => { 
        if(err) req.flash('error_msg', 'Gagal menambah user (Username mungkin sudah dipakai)');
        else req.flash('success_msg', 'Berhasil menambahkan pengurus baru');
        res.redirect('/admin/users'); 
    });
};

exports.deleteUser = (req, res) => { 
    if (req.params.id == req.session.user.id) {
        req.flash('error_msg', 'Anda tidak bisa menghapus akun Anda sendiri');
        return res.redirect('/admin/users'); 
    }
    
    // Cek dulu apakah yang dihapus ini Super Admin
    db.get(`SELECT role FROM users WHERE id = ?`, [req.params.id], (err, row) => {
        if(row && row.role === 'Super Admin') {
            req.flash('error_msg', 'Akses Ditolak! Akun dengan hak akses Super Admin tidak boleh dihapus.');
            return res.redirect('/admin/users');
        }
        
        db.run(`DELETE FROM users WHERE id = ?`, req.params.id, (err) => { 
            req.flash('success_msg', 'Berhasil menghapus akun');
            res.redirect('/admin/users'); 
        });
    });
};