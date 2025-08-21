// Based of Phase II Query 7
const db = require('../dbConfig');

/**
 * Gets all genres with their count of media items of each type in the db.
 * This function returns all media types and their genre counts.
 * It is used to populate a dropdown or list of media types and their genre counts.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns Json of all media types and their genre counts.
 * @example const response = await fetch(`/query3/genreCount`)
 * @throws {Error} - If there is an error executing the query.
 */
const getAllMediaTypes = (req, res) => {
    // Query modified to return all media types.
    const query = `
        SELECT * FROM media_types AS mt ORDER BY mt.name;
    `
    // Execute the Query
    db.query(query, (err, results) => {
        if (err) { // Handle Errors
            console.error('Error fetching media type:', err);
            res.status(500).send('Error fetching media type');
        } else { // Send Results as JSON
            res.json(results);
        }
    });
}

/**
 * Gets genres with the count of media items of specified type in the genre.
 * This function returns all genres with the number of media items in each genre that are of the specified type.
 * If no type is specified, it returns all genres with the number of media items in each genre.
 * @param {Object} req - The request object containing query parameters.
 * @param {Object} res - The response object.
 * @param {string} req.query.TypeName - The name of the media type to filter by.
 * If TypeName is not provided, it returns all genres with the number of media items in each genre.
 * @returns Json of all genres with the number of media items in each genre that are of the parameter type in the req.
 * @example const response = await fetch(`/query3/genreCountType?TypeName=${TypeName}`);
 * @throws {Error} - If there is an error executing the query.
 */
const getGenreCountOfType = (req, res) => {
    // Extract Parameters
    const { TypeName } = req.query;
    if (!TypeName) {
        // If no TypeName, return all genres with with the number of media items in each genre
        const query = `
            SELECT
                g.genreName,
                COUNT(m.mediaID) AS mediacount
            FROM genres AS g
            LEFT JOIN media AS m ON g.genreName = m.genreName
            GROUP BY g.genreName;
        `;

        db.query(query, (err, results) => {
            if (err) { // Handle Errors
                console.error('Error fetching genre count:', err);
                res.status(500).send('Error fetching genre count');
            } else { // Send Results as JSON
                res.json(results);
            }
        })
        return;
    }
    // If TypeName is provided, return genres with the number of media items in each genre that are of the specified type.
    const query = `
        SELECT
            g.genreName,
            COUNT(m.mediaID) AS mediacount
        FROM genres AS g
        INNER JOIN media AS m ON g.genreName = m.genreName
        WHERE
            m.mediaTypeID = ALL(
                SELECT mt.mediaTypeID
                FROM media_types AS mt
                WHERE mt.name = ?
            )
        GROUP BY g.genreName;
    `;

    // Execute the Query
    db.query(query, [TypeName], (err, results) => {
        if (err) { // Handle Errors
            console.error(`Error fetching media type count for ${TypeName}:`, err);
            res.status(500).send(`Error fetching media type count for ${TypeName}`);
        } else { // Send Results as JSON
            res.json(results);
        }
    });
}


module.exports = {
    getAllMediaTypes,
    getGenreCountOfType,
};