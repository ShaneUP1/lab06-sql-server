const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});


app.get('/fourteeners', async (req, res) => {
  try {
    const data = await client.query(`
    SELECT fourteeners.id, fourteeners.name, fourteeners.elevation, fourteeners.drive_to_top, mtn_ranges.name AS range_name 
FROM fourteeners
	JOIN mtn_ranges
	ON mtn_ranges.id = fourteeners.mtn_range_id
    `);

    res.json(data.rows);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});


app.get('/mtn_ranges', async (req, res) => {
  try {
    const data = await client.query('select * from mtn_ranges');

    res.json(data.rows);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});


app.get('/fourteeners/:id', async (req, res) => {
  try {
    const mtn_name = req.params.id;

    const data = await client.query(`
      SELECT * FROM fourteeners 
      WHERE fourteeners.id=$1
      `, [mtn_name]);

    res.json(data.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


app.post('/fourteeners/', async (req, res) => {
  try {

    const newName = req.body.name;
    const newElevation = req.body.elevation;
    const newMtnRangeId = req.body.mtn_range_id;
    const newDriveToTop = req.body.drive_to_top;
    const newOwnerId = req.body.owner_id;

    const data = await client.query(`
    INSERT INTO fourteeners (name, elevation, mtn_range_id, drive_to_top, owner_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
    `,
      [newName, newElevation, newMtnRangeId, newDriveToTop, newOwnerId]);

    res.json(data.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


app.put('/fourteeners/:id', async (req, res) => {
  try {

    const newName = req.body.name;
    const newElevation = req.body.elevation;
    const newMtnRange = req.body.mtn_range_id;
    const newDriveToTop = req.body.drive_to_top;
    const newOwnerId = req.body.owner_id;

    const data = await client.query(`
    UPDATE fourteeners 
    SET name = $1, 
    elevation = $2, 
    mtn_range_id = $3,
    drive_to_top = $4, 
    owner_id = $5 
    WHERE fourteeners.id = $6 
    RETURNING *
    `,
      [newName, newElevation, newMtnRange, newDriveToTop, newOwnerId, req.params.id]);

    res.json(data.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


app.delete('/fourteeners/:id', async (req, res) => {
  try {
    const fourteenerId = req.params.id;

    const data = await client.query(`
      DELETE from fourteeners 
      WHERE fourteeners.id=$1
      RETURNING *
    `,
      [fourteenerId]);

    res.json(data.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.use(require('./middleware/error'));

module.exports = app;
