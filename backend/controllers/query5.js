// controllers/query5.js
// Based of Phase II Query 9
const db = require('../dbConfig');

/**
 * List all media titles for media released after 2010.
 * This function retrieves all distinct media titles released after January 1, 2010.
 * The results are ordered by media title in ascending order.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object used to send the results back to the client.
 * @returns {void} - Sends a JSON response with the media titles or an error message.
 */
const getAllMedias = (req, res) => {
  const query = `
    SELECT DISTINCT mediaTitle AS title
    FROM media
    WHERE releasedate > '2010-01-01'
    ORDER BY mediaTitle ASC;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('DB query error (media titles):', err);
      return res.status(500).json({ error: 'Error fetching media titles' });
    }
    res.status(200).json(results);
  });
};

/**
 * List all specific media titles released after 2010 by title with user reviews, scores, and ordered by reviewer name
 * This function retrieves media details based on the provided media title.
 * If no media title is provided, it returns all media released after 2010.
 * If a media title is provided, it filters the results to match that title.
 * The results include the media title, release date, reviewer's name, and score.
 * The results are ordered by the reviewer's name in ascending order.
 * @param {Object} req - The request object containing query parameters.
 * @param {Object} res - The response object used to send the results back to the client.
 * @returns {void} - Sends a JSON response with the media details or an error message.  
 */
const getMediaDetails = (req, res) => {
  const mediaTitle = req.query.mediaTitle || '';
  //If no media title selected, return all results after 2010
  if (!mediaTitle) {
    const query = `
    SELECT
      u.name AS reviewer,
      m.mediaTitle,
      m.releasedate,
      ur.score
    FROM media AS m
    INNER JOIN user_reviews AS ur ON m.mediaid = ur.mediaid
    INNER JOIN users AS u ON ur.userid = u.userid
    WHERE
      m.releasedate IS NOT NULL
      AND m.releasedate > '2010-01-01'
      AND ur.score IS NOT NULL
    ORDER BY reviewer ASC;
  `;

    db.query(query, (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching media data' });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: 'No media found with that name' });
      }
      res.json(results);
    });
    return;
  }

  // Construct SQL Query
  const query = `
    SELECT
      u.name AS reviewer,
      m.mediaTitle,
      m.releasedate,
      ur.score
    FROM media AS m
    INNER JOIN user_reviews AS ur ON m.mediaid = ur.mediaid
    INNER JOIN users AS u ON ur.userid = u.userid
    WHERE
      m.releasedate IS NOT NULL
      AND m.releasedate > '2010-01-01'
      AND ur.score IS NOT NULL
      AND m.mediaTitle = ?
    ORDER BY reviewer ASC;
  `;


  /* Create a callback function that handles the response from the db.query method.
  * It checks for errors and returns an appropriate response based on the query results.
  * If an error occurs, it sends a 500 status code with an error message.
  * If no media is found, it sends a 404 status code with a message.
  * Otherwise, it sends a 200 status code with the media details.
  */
  db.query(query, [`${mediaTitle}`], (err, results) => {
    if (err) {
      console.error('DB query error:', err);
      return res.status(500).json({ error: 'Error fetching media data' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'No media found with that name' });
    }
    res.json(results);
  });
};

module.exports = {
  getAllMedias,
  getMediaDetails,
};
