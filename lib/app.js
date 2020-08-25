const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const request = require('superagent');
const app = express();
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');

const {
  YELP_API_KEY,
  LOCATION_KEY
} = process.env;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

app.get('/api/favorites', async(req, res) => {
  try {
    const data = await client.query(`SELECT * from favorites WHERE favorites.owner_id = ${req.userId}`);
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/favorites/:id', async(req, res) => {
  try {
    const favoritesId = req.params.id;

    const data = await client.query('SELECT * FROM favorites WHERE favorites.id=$1;', [favoritesId]);

    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/coffeeList', async(req, res) => {
  try {
    const location = req.query.location;

    const data = await request
      .get(`https://api.yelp.com/v3/businesses/search?location=${location}&categories=coffeeroasteries&sort_by=rating&limit=50`)
      .set('Authorization', YELP_API_KEY);

    const shops = data.body.businesses;

    const locationData = await request.get(`https://us1.locationiq.com/v1/search.php?key=${LOCATION_KEY}&q=${location}&format=json`);

    const city = locationData.body[0];

    res.json(shops.map(shop => {
      return {
        biz_id: shop.id,
        title: shop.name,
        img: shop.image_url,
        address: `${shop.location.address1}, ${shop.location.city}, ${shop.location.state}. ${shop.location.zip_code}`,
        is_closed: shop.is_closed,
        rating: shop.rating,
        yelp_url: shop.url,
        lat: shop.coordinates.latitude,
        lon: shop.coordinates.longitude,
        cityLat: city.lat,
        cityLon: city.lon
      };
    }));
    
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/favorites', async(req, res) => {
  try {
    const userId = req.userId;

    const favoriteList = {
      biz_id: req.body.biz_id,
      title: req.body.title,
      img: req.body.img,
      address: req.body.address,
      is_closed: req.body.is_closed,
      rating: req.body.rating,
      yelp_url: req.body.yelp_url,
      notes: 'add notes here',
      lat: toString(req.body.lat),
      lon: toString(req.body.lon),
      cityLat: req.body.cityLat,
      cityLon: req.body.cityLon
    };

    const data = await client.query(`
        INSERT INTO favorites(biz_id, title, img, address, is_closed, rating, yelp_url, notes, owner_id, lat, lon)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING * 
      `, [favoriteList.biz_id, favoriteList.title, favoriteList.img, favoriteList.address, favoriteList.is_closed, favoriteList.rating, favoriteList.yelp_url, favoriteList.notes, userId, favoriteList.lat, favoriteList.lon]);

    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/favorites/:id', async(req, res) => {
  try {
    const favoritesId = req.params.id;

    const data = await client.query(`
      UPDATE favorites 
        SET notes=$1
        WHERE favorites.owner_id=$2
        AND favorites.id=$3 
        RETURNING * 
    `, [req.body.notes, req.userId, favoritesId]);

    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/favorites/:id', async(req, res) => {
  try {
    const favoritesId = req.params.id;

    const data = await client.query('DELETE FROM favorites WHERE favorites.id=$1;', [favoritesId]);

    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.use(require('./middleware/error'));

module.exports = app;
