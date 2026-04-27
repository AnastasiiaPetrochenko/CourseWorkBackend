const pool = require('../config/db');

const createTicket = async (req, res) => {
    try {
        const { session_id, seat_id, final_price, client_id, employee_id, status } = req.body;
        const ticketStatus = status || 'Paid';

        const newTicket = await pool.query(
            "INSERT INTO tickets (session_id, seat_id, client_id, employee_id, status, final_price) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            [session_id, seat_id, client_id || null, employee_id || null, ticketStatus, final_price]
        );
        res.json({ message: "Успішно!", ticket: newTicket.rows[0] });
    } catch (err) {
        res.status(500).json({ error: "Помилка продажу (можливо, місце вже зайняте)" });
    }
};

const getClientTickets = async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT t.id, m.title AS movie_title, h.name AS hall, s.start_time, t.final_price AS price, 
                   se.row_number AS row, se.seat_number AS seat,
                   CASE WHEN s.start_time > NOW() THEN 'upcoming' ELSE 'past' END AS status
            FROM tickets t
            JOIN sessions s ON t.session_id = s.id
            JOIN movies m ON s.movie_id = m.id
            JOIN seats se ON t.seat_id = se.id
            JOIN halls h ON s.hall_id = h.id
            WHERE t.client_id = $1 ORDER BY s.start_time DESC;
        `;
        const tickets = await pool.query(query, [id]);
        res.json(tickets.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Помилка при отриманні квитків клієнта" });
    }
};

module.exports = {
    createTicket,
    getClientTickets
};
