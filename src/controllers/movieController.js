const pool = require('../config/db');

const getAllMovies = async (req, res) => {
    try {
        const query = `
            SELECT m.*, 
                   COALESCE(array_agg(g.name) FILTER (WHERE g.name IS NOT NULL), ARRAY[]::VARCHAR[]) AS genres
            FROM movies m
            LEFT JOIN movie_genres mg ON m.id = mg.movie_id
            LEFT JOIN genres g ON mg.genre_id = g.id
            GROUP BY m.id
            ORDER BY m.id ASC
        `;
        const allMovies = await pool.query(query);
        res.json(allMovies.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Помилка при отриманні фільмів" });
    }
};

const getMovieById = async (req, res) => {
    try {
        const { id } = req.params;
        if (isNaN(id)) return res.status(400).json({ error: "Невірний ID фільму" });

        const query = `
            SELECT m.*, 
                   COALESCE(array_agg(g.name) FILTER (WHERE g.name IS NOT NULL), ARRAY[]::VARCHAR[]) AS genres
            FROM movies m
            LEFT JOIN movie_genres mg ON m.id = mg.movie_id
            LEFT JOIN genres g ON mg.genre_id = g.id
            WHERE m.id = $1
            GROUP BY m.id
        `;
        const movie = await pool.query(query, [id]);

        if (movie.rows.length === 0) return res.status(404).json({ error: "Фільм не знайдено" });
        res.json(movie.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Помилка при отриманні фільму" });
    }
};

const createMovie = async (req, res) => {
    try {
        const { title, duration_minutes, age_rating, description, image_url, genres } = req.body;

        const newMovie = await pool.query(
            'INSERT INTO movies (title, duration_minutes, age_rating, description, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [title, duration_minutes, age_rating, description, image_url]
        );

        const movieId = newMovie.rows[0].id;
        newMovie.rows[0].genres = [];

        if (genres && Array.isArray(genres) && genres.length > 0) {
            for (let genreName of genres) {
                let genreRes = await pool.query('SELECT id FROM genres WHERE name = $1', [genreName]);
                let genreId;

                if (genreRes.rows.length > 0) {
                    genreId = genreRes.rows[0].id;
                } else {
                    const newGenre = await pool.query('INSERT INTO genres (name) VALUES ($1) RETURNING id', [genreName]);
                    genreId = newGenre.rows[0].id;
                }

                await pool.query('INSERT INTO movie_genres (movie_id, genre_id) VALUES ($1, $2)', [movieId, genreId]);
            }
            newMovie.rows[0].genres = genres;
        }

        res.json(newMovie.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Помилка при додаванні фільму" });
    }
};

const updateMovie = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, duration_minutes, age_rating, description, image_url, genres } = req.body;

        const updatedMovie = await pool.query(`
            UPDATE movies 
            SET title = $1, duration_minutes = $2, age_rating = $3, description = $4, image_url = $5
            WHERE id = $6 RETURNING *
        `, [title, duration_minutes, age_rating, description, image_url, id]);

        updatedMovie.rows[0].genres = [];

        if (genres && Array.isArray(genres)) {
            await pool.query('DELETE FROM movie_genres WHERE movie_id = $1', [id]);

            if (genres.length > 0) {
                for (let genreName of genres) {
                    let genreRes = await pool.query('SELECT id FROM genres WHERE name = $1', [genreName]);
                    let genreId;

                    if (genreRes.rows.length > 0) {
                        genreId = genreRes.rows[0].id;
                    } else {
                        const newGenre = await pool.query('INSERT INTO genres (name) VALUES ($1) RETURNING id', [genreName]);
                        genreId = newGenre.rows[0].id;
                    }

                    await pool.query('INSERT INTO movie_genres (movie_id, genre_id) VALUES ($1, $2)', [id, genreId]);
                }
            }
            updatedMovie.rows[0].genres = genres;
        }

        res.json(updatedMovie.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Помилка при оновленні фільму" });
    }
};

const deleteMovie = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM movies WHERE id = $1', [id]);
        res.json({ message: "Фільм успішно видалено" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Помилка при видаленні фільму" });
    }
};

module.exports = {
    getAllMovies,
    getMovieById,
    createMovie,
    updateMovie,
    deleteMovie
};
