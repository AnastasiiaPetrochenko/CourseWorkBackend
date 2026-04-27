const requireCanEdit = (req, res, next) => {
    const role = req.headers['x-user-role'];
    if (!['admin', 'manager'].includes(role)) {
        return res.status(403).json({ error: "Недостатньо прав для цієї дії" });
    }
    next();
};

const requireAdmin = (req, res, next) => {
    const role = req.headers['x-user-role'];
    if (role !== 'admin') {
        return res.status(403).json({ error: "Доступ тільки для адміністратора" });
    }
    next();
};

module.exports = { requireCanEdit, requireAdmin };
