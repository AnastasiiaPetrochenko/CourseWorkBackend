const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

const getStatistics = async (req, res) => {
    try {
        const totalStats = await pool.query(`
            SELECT 
                COUNT(id) as total_tickets,
                COALESCE(SUM(final_price), 0) as total_revenue
            FROM tickets
            WHERE status = 'Paid'
        `);

        const movieStats = await pool.query(`
            SELECT 
                m.title,
                COUNT(t.id) as tickets_sold,
                COALESCE(SUM(t.final_price), 0) as revenue
            FROM movies m
            JOIN sessions s ON m.id = s.movie_id
            LEFT JOIN tickets t ON s.id = t.session_id AND t.status = 'Paid'
            GROUP BY m.id, m.title
            ORDER BY revenue DESC
            LIMIT 5
        `);

        const hallStats = await pool.query(`
            SELECT 
                h.name as hall_name,
                COUNT(DISTINCT s.id) as total_sessions,
                COUNT(t.id) as tickets_sold
            FROM halls h
            LEFT JOIN sessions s ON h.id = s.hall_id
            LEFT JOIN tickets t ON s.id = t.session_id AND t.status = 'Paid'
            GROUP BY h.id, h.name
        `);

        res.json({
            overview: {
                tickets: parseInt(totalStats.rows[0].total_tickets),
                revenue: parseFloat(totalStats.rows[0].total_revenue)
            },
            topMovies: movieStats.rows,
            halls: hallStats.rows
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Помилка при зборі статистики" });
    }
};

const getLogs = async (req, res) => {
    try {
        const logs = await pool.query('SELECT * FROM audit_log ORDER BY id DESC LIMIT 100');
        res.json(logs.rows);
    } catch (err) {
        console.error("ПОМИЛКА ЖУРНАЛУ:", err.message);
        res.status(500).json({ error: "Помилка при отриманні журналу" });
    }
};

const importMovies = async (req, res) => {
    try {
        const filePath = path.join(__dirname, '../../movies_data.json');
        const fileData = fs.readFileSync(filePath, 'utf8');
        const moviesToImport = JSON.parse(fileData);

        for (let movie of moviesToImport) {
            await pool.query(
                'INSERT INTO movies (title, duration_minutes, age_rating, description, image_url) VALUES ($1, $2, $3, $4, $5)',
                [movie.title, movie.duration_minutes, movie.age_rating, movie.description, movie.image_url]
            );
        }

        res.json({ message: `Успіх! Завантажено ${moviesToImport.length} фільмів з файлу.` });
    } catch (err) {
        console.error("Помилка імпорту:", err.message);
        res.status(500).json({ error: "Помилка при читанні або записі файлу" });
    }
};

module.exports = {
    getStatistics,
    getLogs,
    importMovies
};
