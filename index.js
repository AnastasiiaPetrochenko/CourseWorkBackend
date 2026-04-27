const express = require('express');
const cors = require('cors');
require('dotenv').config();

const movieRoutes = require('./src/routes/movieRoutes');
const sessionRoutes = require('./src/routes/sessionRoutes');
const hallRoutes = require('./src/routes/hallRoutes');
const ticketRoutes = require('./src/routes/ticketRoutes');
const authRoutes = require('./src/routes/authRoutes');
const clientRoutes = require('./src/routes/clientRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const pool = require('./src/config/db');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/test', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({
            message: "Бекенд працює!",
            db_time: result.rows[0].now
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Помилка підключення до бази" });
    }
});

app.use('/api/movies', movieRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/halls', hallRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api', adminRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Сервер успішно запущено на порту ${PORT}`);
});
