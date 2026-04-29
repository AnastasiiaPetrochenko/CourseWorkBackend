const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.status(401).json({ error: "Токен не надано" });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Недійсний або прострочений токен" });
        req.user = user;
        next();
    });
};

const requireCanEdit = (req, res, next) => {
    authenticateToken(req, res, () => {
        if (!req.user || !['admin', 'manager'].includes(req.user.role)) {
            return res.status(403).json({ error: "Недостатньо прав для цієї дії" });
        }
        next();
    });
};

const requireAdmin = (req, res, next) => {
    authenticateToken(req, res, () => {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ error: "Доступ тільки для адміністратора" });
        }
        next();
    });
};

module.exports = { authenticateToken, requireCanEdit, requireAdmin };
