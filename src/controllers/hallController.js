const pool = require('../config/db');

const ensureIsActiveColumn = async () => {
    try {
        await pool.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='halls' AND column_name='is_active') THEN 
                    ALTER TABLE halls ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
                END IF;
            END $$;
        `);
    } catch (e) {
        console.error("Error adding is_active:", e);
    }
};

const getActiveHalls = async (req, res) => {
    try {
        await ensureIsActiveColumn();
        const activeHalls = await pool.query('SELECT * FROM halls WHERE is_active = TRUE ORDER BY id ASC');
        res.json(activeHalls.rows);
    } catch (err) {
        res.status(500).json({ error: "Помилка при отриманні активних залів" });
    }
};

const getAllHallsAdmin = async (req, res) => {
    try {
        await ensureIsActiveColumn();

        const allHalls = await pool.query(`
            SELECT h.*, COUNT(s.id) as total_seats
            FROM halls h
            LEFT JOIN seats s ON h.id = s.hall_id
            GROUP BY h.id
            ORDER BY h.id ASC
        `);
        res.json(allHalls.rows);
    } catch (err) {
        res.status(500).json({ error: "Помилка при отриманні всіх залів" });
    }
};

const createHall = async (req, res) => {
    const { name, rows, seats_per_row } = req.body;
    try {
        await ensureIsActiveColumn();
        await pool.query('BEGIN');

        const newHall = await pool.query(
            'INSERT INTO halls (name, is_active) VALUES ($1, TRUE) RETURNING id, name',
            [name]
        );
        const hallId = newHall.rows[0].id;

        const numRows = parseInt(rows);
        const numSeatsPerRow = parseInt(seats_per_row);

        for (let r = 1; r <= numRows; r++) {
            for (let s = 1; s <= numSeatsPerRow; s++) {
                await pool.query(
                    'INSERT INTO seats (hall_id, row_number, seat_number) VALUES ($1, $2, $3)',
                    [hallId, r, s]
                );
            }
        }

        await pool.query('COMMIT');
        res.json({ message: "Зал створено успішно", hall: newHall.rows[0] });
    } catch (err) {
        await pool.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: "Помилка при створенні залу" });
    }
};

const toggleHallStatus = async (req, res) => {
    const { id } = req.params;
    try {
        await ensureIsActiveColumn();
        const hall = await pool.query('SELECT is_active FROM halls WHERE id = $1', [id]);
        if (hall.rows.length === 0) return res.status(404).json({ error: "Зал не знайдено" });

        const newStatus = !hall.rows[0].is_active;
        await pool.query('UPDATE halls SET is_active = $1 WHERE id = $2', [newStatus, id]);

        res.json({ message: `Зал ${newStatus ? 'активовано' : 'деактивовано'}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Помилка при зміні статусу залу" });
    }
};

module.exports = {
    getActiveHalls,
    getAllHallsAdmin,
    createHall,
    toggleHallStatus
};
