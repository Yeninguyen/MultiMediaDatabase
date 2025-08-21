const express = require('express');
const db = require('./dbConfig');
// controllers under this point
const query1Controller = require('./controllers/query1');

const query2Controller = require('./controllers/query2');

const query3Controller = require('./controllers/query3');

const query4Controller = require('./controllers/query4');

const query5Controller = require('./controllers/query5');

const query6Controller = require('./controllers/query6');






// controllers end by this point
const app = express();
app.use(express.json());
app.use(express.static('frontend/public'));
app.use('/assets', express.static('frontend/assets'));

// app.get starts here
app.get('/query1/series', query1Controller.getSeriesList);
app.get('/query1/mediaEntries', query1Controller.getMediaEntries);

app.get('/query2/reviewPatterns', query2Controller.getSpecificReviewPatterns);
app.get('/query2/mediaTitles', query2Controller.getAllMediaTitles);

app.get('/query3/mediaTypes', query3Controller.getAllMediaTypes);
app.get('/query3/genreCountOfType', query3Controller.getGenreCountOfType);

app.get('/query4/writers', query4Controller.getAllWriters);
app.get('/query4/writerDetails', query4Controller.getWriterDetails);

app.get('/query5/mediaTitles', query5Controller.getAllMedias);
app.get('/query5/mediaDetails', query5Controller.getMediaDetails);

app.post('/query6/insertReview', query6Controller.insertReview);
app.get('/query6/mediaTitles', query6Controller.getAllMediaTitles);








// app.get end by this point
const PORT = process.env.PORT || 5002;
app.listen(PORT, '0.0.0.0', () => {
console.log(`Server running on port http://localhost:${PORT}`);
});
