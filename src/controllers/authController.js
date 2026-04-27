const pool = require('../config/db');

const loginEmployee = async (req, res) => {
    try {
        const { login, password } = req.body;

        const user = await pool.query(
            'SELECT * FROM employees WHERE login = $1 AND password_hash = $2',
            [login, password]
        );

        if (user.rows.length === 0) {
            return res.status(401).json({ error: "Невірний логін або пароль" });
        }

        res.json({
            id: user.rows[0].id,
            full_name: user.rows[0].full_name,
            role: user.rows[0].role
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

        const newClient = await pool.query(
            'INSERT INTO clients (full_name, phone, password_hash) VALUES ($1, $2, $3) RETURNING *',
            [full_name, phone, password]
        );
        res.json({ message: "Реєстрація успішна", client_id: newClient.rows[0].id, full_name: newClient.rows[0].full_name });
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

        if (!client.password_hash) {
            await pool.query('UPDATE clients SET password_hash = $1 WHERE id = $2', [password, client.id]);
        }
        else if (client.password_hash !== password) {
            return res.status(401).json({ error: "Невірний номер телефону або пароль!" });
        }

        res.json({ message: "Вхід успішний", client_id: client.id, full_name: client.full_name });
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
