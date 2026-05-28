const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const { ensureAuthenticated, checkRole } = require('../middleware/authMiddleware');

router.get('/login', (req, res) => res.render('admin/login', { error_msg: req.flash('error_msg') }));
router.post('/login', authController.login);
router.get('/logout', authController.logout);

// Semua role bisa masuk dashboard
router.get('/dashboard', ensureAuthenticated, adminController.dashboard);

// Hanya Super Admin, Ketua BKM, dan Bendahara
const aksesKeuangan = ['Super Admin', 'Ketua BKM', 'Bendahara'];
router.get('/keuangan', ensureAuthenticated, checkRole(...aksesKeuangan), adminController.getKeuangan);
router.post('/keuangan/add', ensureAuthenticated, checkRole(...aksesKeuangan), adminController.addKeuangan);
router.get('/keuangan/delete/:id', ensureAuthenticated, checkRole(...aksesKeuangan), adminController.deleteKeuangan);
router.post('/keuangan/edit/:id', ensureAuthenticated, checkRole(...aksesKeuangan), adminController.editKeuangan);

// Hanya Super Admin, Ketua BKM, dan Sekretaris
const aksesSekretariat = ['Super Admin', 'Ketua BKM', 'Sekretaris'];
router.get('/kajian', ensureAuthenticated, checkRole(...aksesSekretariat), adminController.getKajian);
router.post('/kajian/add', ensureAuthenticated, checkRole(...aksesSekretariat), adminController.addKajian);
router.get('/kajian/delete/:id', ensureAuthenticated, checkRole(...aksesSekretariat), adminController.deleteKajian);

router.get('/pengumuman', ensureAuthenticated, checkRole(...aksesSekretariat), adminController.getPengumuman);
router.post('/pengumuman/add', ensureAuthenticated, checkRole(...aksesSekretariat), adminController.addPengumuman);
router.get('/pengumuman/delete/:id', ensureAuthenticated, checkRole(...aksesSekretariat), adminController.deletePengumuman);

router.get('/khatib', ensureAuthenticated, checkRole(...aksesSekretariat), adminController.getKhatib);
router.post('/khatib/add', ensureAuthenticated, checkRole(...aksesSekretariat), adminController.addKhatib);
router.get('/khatib/delete/:id', ensureAuthenticated, checkRole(...aksesSekretariat), adminController.deleteKhatib);

// HANYA Super Admin (Ketua BKM bisa melihat, tapi tidak bisa menambah/menghapus)
router.get('/users', ensureAuthenticated, checkRole('Super Admin', 'Ketua BKM'), adminController.getUsers);
router.post('/users/add', ensureAuthenticated, checkRole('Super Admin'), adminController.addUser);
router.get('/users/delete/:id', ensureAuthenticated, checkRole('Super Admin'), adminController.deleteUser);

// Donasi
router.get('/donasi', ensureAuthenticated, checkRole('Super Admin', 'Ketua BKM', 'Bendahara'), (req, res) => {
    res.render('admin/donasi', { title: 'Donasi QRIS' });
});

module.exports = router;