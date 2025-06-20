"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdminLogin = requireAdminLogin;
exports.addAdminUserToViews = addAdminUserToViews;
function requireAdminLogin(req, res, next) {
    if (req.session && req.session.adminUser) {
        return next();
    }
    res.redirect('/admin/auth/login');
}
function addAdminUserToViews(req, res, next) {
    if (req.session && req.session.adminUser) {
        const adminUser = req.session.adminUser;
        res.locals.currentUser = adminUser;
    }
    else {
        res.locals.currentUser = null;
    }
    next();
}
