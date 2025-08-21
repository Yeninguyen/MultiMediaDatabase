const db = require('../dbConfig');

// Helper for rolling back and sending error
function handleDbError(res, db, message, error) {
    db.rollback(function () {
        console.error(message, error);
        res.status(500).send(message);
    });
}

/**
    * Inserts a new user and their review into the database.
    * The function starts a transaction to ensure atomicity.
    * It first checks for the maximum userID to assign a new one,
    * then inserts the user into the `users` table.
    * After that, it retrieves the maximum userReviewID to assign a new one,
    * and inserts the review into the `user_reviews` table.
    * Finally, it calculates the average score for the media
    * and commits the transaction.
    * @param {Object} req - The request object containing user and review data.
    * @param {Object} res - The response object used to send the result or error.
    * @returns {void} - Sends a JSON response with the average score or an error message.
    * @throws {Error} - If any database operation fails, it rolls back the transaction and sends an error response.
*/
const insertReview = (req, res) => {
    console.log(req.body); // For debugging purposes
    // Input validation
    const requiredFields = [
        'name', 'password', 'email', 'profileImage', 'description', 'mediaID', 'review', 'score'
    ];
    for (const field of requiredFields) {
        if (!req.body[field] && field !== 'profileImage' && field !== 'description') {
            return res.status(400).send(`Missing required field: ${field}`);
        }
    }

    db.beginTransaction(function (err) {
        if (err) {
            return handleDbError(res, db, 'Transaction start failed', err);
        }

        db.query(`SELECT MAX(\`userID\`) AS maxID FROM \`users\`\;`, function (error, results, fields) {
            if (error) {
                return handleDbError(res, db, 'Failed to get next userID', error);
            }

            const newUserID = (results[0].maxID || 0) + 1;
            const userQuery = `INSERT INTO \`users\` (\`userID\`, \`name\`, \`password\`, \`email\`, \`profileImage\`, \`description\`) VALUES (?, ?, ?, ?, ?, ?);`

            db.query(userQuery, [newUserID, req.body.name, req.body.password, req.body.email, req.body.profileImage, req.body.description], function (errorUser, resultsUser, fieldsUser) {
                if (errorUser) {
                    return handleDbError(res, db, 'User insert failed', errorUser);
                }

                db.query(`SELECT MAX(\`userReviewID\`) AS maxID FROM \`user_reviews\`\;`, function (errorMaxReview, resultsMaxReview, fieldsMaxReview) {
                    if (errorMaxReview) {
                        return handleDbError(res, db, 'Failed to get next userReviewID', errorMaxReview);
                    }

                    const newReviewID = (resultsMaxReview[0].maxID || 0) + 1;
                    const newReviewQuery = `INSERT INTO user_reviews 
                                    (userReviewID, mediaID, userID, review, score) 
                                    VALUES (?, ?, ?, ?, ?)`

                    db.query(newReviewQuery, [newReviewID, req.body.mediaID, newUserID, req.body.review, req.body.score], function (errorReview, resultsReview, fieldsReview) {
                        if (errorReview) {
                            return handleDbError(res, db, 'Review insert failed', errorReview);
                        }

                        // Get avg score, the new review, and the user name
                        const finalQuery = `
                            SELECT
                                u.name AS user_name, 
                                ur.review AS new_review,
                                m.mediaTitle,
                                (SELECT AVG(score) FROM user_reviews WHERE mediaID = ?) AS avg_score
                            FROM user_reviews ur
                            INNER JOIN users AS u ON ur.userID = u.userID
                            INNER JOIN media AS m ON ur.mediaID = m.mediaID
                            WHERE ur.userReviewID = ?
                            LIMIT 1;
                        `;

                        db.query(finalQuery, [req.body.mediaID, newReviewID], function (finalError, finalResults) {
                            if (finalError) {
                                return handleDbError(res, db, 'Final data retrieval failed', finalError);
                            }
                            db.commit(function (commitError) {
                                if (commitError) {
                                    return handleDbError(res, db, 'Commit failed', commitError);
                                }
                                console.log('Review insert success.')
                                return res.json(finalResults[0]); // Send the final result as JSON
                            });
                        });
                    });
                });
            });
        });
    });
}

/**
   * Retrieves all media titles from the database.
   * The function constructs a SQL query to select mediaID and mediaTitle
   * from the `media` table, ordering the results by mediaTitle in ascending order.
   * It executes the query and sends the results as a JSON response.
   * @throws {Error} If there is an error executing the SQL query, it logs the error and sends a 500 status response.
   * @param {Object} req - The request object containing the HTTP request data.
   * @param {Object} res - The response object used to send the result or error.
   * @returns {void} - Sends a JSON response with the list of media titles or an error message.
 */
const getAllMediaTitles = (req, res) => {
    // Construct SQL Query
    const query = `
        SELECT mediaID, mediaTitle FROM media ORDER BY mediaTitle ASC;
    `;

    // Execute the Query
    db.query(query, (err, results) => {
        if (err) {
            // Handle Errors
            console.error('Error fetching media titles:', err);
            res.status(500).send('Error fetching media list');
        } else {
            // Send Results
            res.json(results); // Send the writer list as a JSON response
        }
    });
};

module.exports = { insertReview, getAllMediaTitles };