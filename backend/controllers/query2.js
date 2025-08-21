// controllers/query2.js
// Lightly based on Phase II Query 5
const db = require('../dbConfig');

/**
 * Fetches all media titles and their IDs.
 * The results are ordered by media title.
 * This function is used to populate a dropdown or list of media titles.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {void} - Sends a JSON response with the media titles or an error message.
 * @throws {Error} - If there is an error executing the query.
 */
const getAllMediaTitles = (req, res) => {
    const query = `
        SELECT mediaID, mediaTitle
        FROM media
        ORDER BY mediaTitle;
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching all media titles:', err);
            res.status(500).send('Error fetching media titles');
        } else {
            res.json(results);
        }
    });
};

/**
 * Fetches user reviews with a score above a specified minimum score.
 * Optionally filters by media ID if provided.
 * The results include user name, media title, review text, and score.
 * The results are primarily sorted by score in descending order, then by user name and media title.
 * @param {Object} req - The request object containing query parameters.
 * @param {Object} res - The response object.
 * @returns {void} - Sends a JSON response with the user reviews or an error message.
 * @throws {Error} - If the minimum score is outside the bounds of 1 to 10.
 */
const getSpecificReviewPatterns = (req, res) => {
    const { minScore, mediaID } = req.query; // for dynamic parameters

    const minScoreValue = parseInt(minScore, 10);
    if (minScoreValue < 1 || minScoreValue > 10) {
        return res.status(400).send('Error. Score outside bounds.');
    }

    let query = `
        SELECT
            u.name AS userName,
            m.mediaTitle,
            ur.review,
            ur.score
        FROM user_reviews AS ur
        JOIN users AS u ON ur.userID = u.userID
        JOIN media AS m ON ur.mediaID = m.mediaID
        WHERE ur.score >= ?
    `;

    const queryParams = [minScoreValue];

    if (mediaID) {
        query += ` AND ur.mediaID = ?`;
        queryParams.push(mediaID);
    }

    // Primarily sort by score 
    query += ` ORDER BY ur.score DESC, u.name, m.mediaTitle;`;

    db.query(query, queryParams, (err, results) => {
        if (err) {
            console.error('Error executing query 2:', err);
            res.status(500).send('Error retrieving specific review patterns');
        } else {
            res.json(results);
        }
    });
};

// Export the Controller Functions
module.exports = {
    getSpecificReviewPatterns,
    getAllMediaTitles,
};