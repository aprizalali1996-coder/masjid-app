module.exports = {
    ensureAuthenticated: function(req, res, next) {
        if (req.session.user) return next();
        req.flash('error_msg', 'Silahkan login terlebih dahulu');
        res.redirect('/admin/login');
    },
    // Fungsi baru untuk mengecek Role
    checkRole: function(...allowedRoles) {
        return function(req, res, next) {
            if (req.session.user && allowedRoles.includes(req.session.user.role)) {
                return next(); // Jika role sesuai, persilakan masuk
            }
            // Jika role tidak sesuai, tolak dan kembalikan ke dashboard
            req.flash('error_msg', 'Akses Ditolak! Anda tidak memiliki hak akses untuk menu tersebut.');
            res.redirect('/admin/dashboard');
        }
    }
};