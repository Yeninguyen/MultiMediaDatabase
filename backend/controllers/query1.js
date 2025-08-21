// controllers/query1.js
// Based off Phase II Query 1
const db = require('../dbConfig');

/**
 * Fetches a list of series with their IDs and titles.
 * The results are ordered by series title.
 * This function is used to populate a dropdown or list of series.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {void} - Sends a JSON response with the series list or an error message.
 */
const getSeriesList = (req, res) => {
    const query = `
        SELECT seriesID, seriesTitle
        FROM series
        ORDER BY seriesTitle;
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching series list:', err);
            res.status(500).send('Error fetching series list');
        } else {
            res.json(results);
        }
    });
};

/**
 * Fetches media entries based on the provided series ID.
 * If no series ID is provided, it retrieves all media entries.
 * The results include media title, genre name, media type name, release date,
 * and author full name.
 * The results are ordered by media title.
 * @param {Object} req - The request object containing query parameters.
 * @param {Object} res - The response object.
 * @returns {void} - Sends a JSON response with the media entries or an error message.
 */
const getMediaEntries = (req, res) => {
    const { seriesID } = req.query; 

    let query = `
        SELECT
            m.mediaTitle,
            g.genreName,
            mt.name AS mediaTypeName,
            m.releaseDate,
            CONCAT(w.nameFirst,
                   IF(w.nameInitial IS NOT NULL, CONCAT(' ', w.nameInitial, '.'), ''),
                   ' ', w.nameLast) AS authorFullName
        FROM media m
        LEFT JOIN genres g ON m.genreName = g.genreName
        LEFT JOIN media_types mt ON m.mediaTypeID = mt.mediaTypeID
        LEFT JOIN writers w ON m.author = w.writerID
    `;
    const queryParams = [];

    // handle series filter
    if (seriesID) { 
        query += ` WHERE m.seriesID = ?`;
        // if null do all series
        queryParams.push(seriesID === '' ? null : seriesID);
    }
    query += ` ORDER BY m.mediaTitle;`;

    db.query(query, queryParams, (err, results) => {
        if (err) {
            console.error('Error fetching media entries:', err);
            res.status(500).send('Error retrieving media entries');
        } else {
            res.json(results);
        }
    });
};

// Export the Controller Functions
module.exports = {
    getSeriesList,
    getMediaEntries,
};