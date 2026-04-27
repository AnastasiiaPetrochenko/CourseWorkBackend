const pool = require('../config/db');

const getSessionsByMovie = async (req, res) => {
    try {
        const { id } = req.params;
        if (isNaN(id)) return res.status(400).json({ error: "Невірний ID фільму" });

        const query = `
            SELECT s.id, h.name AS hall_name, s.start_time, s.base_price 
            FROM sessions s
            JOIN halls h ON s.hall_id = h.id
            WHERE s.movie_id = $1
            ORDER BY s.start_time ASC
        `;
        const sessions = await pool.query(query, [id]);
        res.json(sessions.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Помилка при отриманні сеансів фільму" });
    }
};

const deleteSession = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM sessions WHERE id = $1', [id]);
        res.json({ message: "Сеанс успішно видалено" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Не вдалося видалити сеанс. Можливо, на нього вже є продані квитки!" });
    }
};

const getAllSessions = async (req, res) => {
    try {
        const query = `
            SELECT s.id, m.title AS movie_title, h.name AS hall_name, s.start_time, s.base_price 
            FROM sessions s
            JOIN movies m ON s.movie_id = m.id
            JOIN halls h ON s.hall_id = h.id
            ORDER BY s.start_time ASC
        `;
        const allSessions = await pool.query(query);
        res.json(allSessions.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Помилка при отриманні сеансів" });
    }
};

const createSession = async (req, res) => {
    try {
        const { movie_id, hall_id, start_time, base_price } = req.body;
        const newSession = await pool.query(
            'INSERT INTO sessions (movie_id, hall_id, start_time, base_price) VALUES ($1, $2, $3, $4) RETURNING *',
            [movie_id, hall_id, start_time, base_price]
        );
        res.json(newSession.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Помилка при створенні сеансу" });
    }
};

const getSessionSeats = async (req, res) => {
    try {
        const seats = await pool.query(`
            SELECT s.id AS seat_id, s.row_number, s.seat_number, t.id AS ticket_id, t.status AS ticket_status 
            FROM seats s 
            LEFT JOIN tickets t ON s.id = t.seat_id AND t.session_id = $1 
            WHERE s.hall_id = (SELECT hall_id FROM sessions WHERE id = $1) 
            ORDER BY s.row_number, s.seat_number
        `, [req.params.id]);

        res.json(seats.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Помилка при отриманні місць" });
    }
};

module.exports = {
    getSessionsByMovie,
    deleteSession,
    getAllSessions,
    createSession,
    getSessionSeats
};
