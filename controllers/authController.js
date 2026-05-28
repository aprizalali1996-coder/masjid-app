const db = require('../database/db');
const bcrypt = require('bcrypt');

exports.login = (req, res) => {
    const { username, password } = req.body;

    db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
        if (err) throw err;
        if (!user) {
            req.flash('error_msg', 'Username tidak terdaftar');
            return res.redirect('/admin/login');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            req.session.user = user;
            res.redirect('/admin/dashboard');
        } else {
            req.flash('error_msg', 'Password salah');
            res.redirect('/admin/login');
        }
    });
};

exports.logout = (req, res) => {
    req.session.destroy();
    res.redirect('/admin/login');
};