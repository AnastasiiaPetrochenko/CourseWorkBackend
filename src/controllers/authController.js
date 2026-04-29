const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

const loginEmployee = async (req, res) => {
    try {
        const { login, password, role } = req.body;

        const user = await pool.query(
            'SELECT * FROM employees WHERE login = $1',
            [login]
        );

        if (user.rows.length === 0) {
            return res.status(401).json({ error: "Невірний логін або пароль" });
        }

        const employee = user.rows[0];

        if (role && employee.role !== role) {
            return res.status(401).json({ error: "Невірна посада для цього користувача" });
        }

        let isMatch = false;
        if (employee.password_hash === password) {
            const hashedPwd = await bcrypt.hash(password, 10);
            await pool.query('UPDATE employees SET password_hash = $1 WHERE id = $2', [hashedPwd, employee.id]);
            isMatch = true;
        } else {
            isMatch = await bcrypt.compare(password, employee.password_hash);
        }

        if (!isMatch) {
            return res.status(401).json({ error: "Невірний логін або пароль" });
        }

        const token = jwt.sign(
            { id: employee.id, role: employee.role, name: employee.full_name },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            id: employee.id,
            full_name: employee.full_name,
            role: employee.role,
            token
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Помилка сервера при авторизації" });
    }
};

const registerClient = async (req, res) => {
    try {
        const { full_name, phone, password } = req.body;

        if (!password) {
            return res.status(400).json({ error: "Пароль є обов'язковим для реєстрації!" });
        }

        const existingClient = await pool.query('SELECT * FROM clients WHERE phone = $1', [phone]);
        if (existingClient.rows.length > 0) {
            return res.status(400).json({ error: "Користувач з таким номером вже зареєстрований!" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newClient = await pool.query(
            'INSERT INTO clients (full_name, phone, password_hash) VALUES ($1, $2, $3) RETURNING *',
            [full_name, phone, hashedPassword]
        );

        const client = newClient.rows[0];
        const token = jwt.sign(
            { id: client.id, role: 'user', name: client.full_name },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ message: "Реєстрація успішна", client_id: client.id, full_name: client.full_name, token });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Помилка сервера при реєстрації" });
    }
};

const loginClient = async (req, res) => {
    try {
        const { phone, password } = req.body;

        const clientQuery = await pool.query('SELECT * FROM clients WHERE phone = $1', [phone]);

        if (clientQuery.rows.length === 0) {
            return res.status(401).json({ error: "Невірний номер телефону або пароль!" });
        }

        const client = clientQuery.rows[0];

        let isMatch = false;
        if (!client.password_hash) {
            const hashedPwd = await bcrypt.hash(password, 10);
            await pool.query('UPDATE clients SET password_hash = $1 WHERE id = $2', [hashedPwd, client.id]);
            isMatch = true;
        } else if (client.password_hash === password) {
            const hashedPwd = await bcrypt.hash(password, 10);
            await pool.query('UPDATE clients SET password_hash = $1 WHERE id = $2', [hashedPwd, client.id]);
            isMatch = true;
        } else {
            isMatch = await bcrypt.compare(password, client.password_hash);
        }

        if (!isMatch) {
            return res.status(401).json({ error: "Невірний номер телефону або пароль!" });
        }

        const token = jwt.sign(
            { id: client.id, role: 'user', name: client.full_name },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ message: "Вхід успішний", client_id: client.id, full_name: client.full_name, token });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Помилка сервера при вході" });
    }
};

module.exports = {
    loginEmployee,
    registerClient,
    loginClient
};
