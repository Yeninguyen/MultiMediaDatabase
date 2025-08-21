// Import the database configuration to interact with the MySQL database.
// Based off Phase II Query 10
const db = require('../dbConfig');

/**
 * Fetches a list of all writers with their IDs and names.
 * This function is used to populate a dropdown or list of writers.
 * The results are ordered by the writer's last name.
 * 
 * @example const response = await fetch('/query4/writers');
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {void} - Sends a JSON response with the writer list or an error message.
 * @throws {Error} - If there is an error executing the query.
 */
const getAllWriters = (req, res) => {
    // Construct SQL Query
    const query = `
        SELECT writerID, nameFirst, nameLast FROM writers;
    `;

    // Execute the Query
    db.query(query, (err, results) => {
        if (err) {
            // Handle Errors
            console.error('Error fetching writers:', err);
            res.status(500).send('Error fetching writer list');
        } else {
            // Send Results
            res.json(results); // Send the writer list as a JSON response
        }
    });
};

/**
 * Fetches details of a specific writer or all writers if no writerID is provided.
 * If a writerID is provided, it returns the media titles, author last names,
 * media types, user reviews, and scores for that writer.
 * If no writerID is provided, it returns the same details for all writers,
 * ordered by the highest score in user reviews.
 * @example const response = await fetch('/query4/writerDetails?writerID=1');
 * @param {Object} req - The request object containing query parameters.
 * @param {Object} res - The response object.
 * @returns {void} - Sends a JSON response with the writer details or an error message.
 * @throws {Error} - If there is an error executing the query.
 * @throws {Error} - If the writerID is not provided and no writers are found.
 */
const getWriterDetails = (req, res) => {
    // Extract Parameters
    const { writerID } = req.query;
    if (!writerID) {
        // If no writerID, return details for all writers
        const query = `
        WITH top_scores AS (
            SELECT
                m2.author,
                MAX(u2.score) AS max_score
            FROM user_reviews AS u2
            INNER JOIN media AS m2 ON u2.mediaid = m2.mediaid
            WHERE u2.score IS NOT NULL
            GROUP BY m2.author
        )
        SELECT
            m.mediaTitle,
            w.namelast AS author_lastname,
            t.name AS media_type,
            u.review,
            u.score
        FROM user_reviews AS u
        INNER JOIN media AS m ON u.mediaid = m.mediaid
        INNER JOIN media_types AS t ON m.mediatypeid = t.mediatypeid
        INNER JOIN writers AS w ON m.author = w.writerid
        INNER JOIN top_scores
            ON
                w.writerid = top_scores.author
                AND u.score = top_scores.max_score
        WHERE u.score IS NOT NULL
        ORDER BY u.score DESC;
    `;

        db.query(query, (err, results) => {
            if (err) {
                console.error('Error fetching all writer details:', err);
                return res.status(500).send('Error retrieving writer details');
            }
            res.json(results);
        });
        return;
    }

    // Construct SQL Query
    const query = `
        WITH top_scores AS (
            SELECT
                m2.author,
                MAX(u2.score) AS max_score
            FROM user_reviews AS u2
            INNER JOIN media AS m2 ON u2.mediaid = m2.mediaid
            WHERE u2.score IS NOT NULL
            GROUP BY m2.author
        )

        SELECT
            m.mediaTitle,
            w.namelast AS author_lastname,
            t.name AS media_type,
            u.review,
            u.score
        FROM user_reviews AS u
        INNER JOIN media AS m ON u.mediaid = m.mediaid
        INNER JOIN media_types AS t ON m.mediatypeid = t.mediatypeid
        INNER JOIN writers AS w ON m.author = w.writerid
        INNER JOIN top_scores
            ON
                w.writerid = top_scores.author
                AND u.score = top_scores.max_score
        WHERE w.writerid = ? AND u.score IS NOT NULL
        ORDER BY u.score DESC;
    `;

    // Execute the Query
    db.query(query, [writerID], (err, results) => {
        if (err) {
            // Handle Errors
            console.error('Error fetching writer details:', err);
            res.status(500).send('Error retrieving writer details');
        } else {
            // Send Results
            res.json(results); // Send writer details as JSON
        }
    });
};

// Export the Controller Functions
// Export the functions so they can be used in server.js or other parts of the application.
module.exports = {
    getAllWriters,
    getWriterDetails,
};
