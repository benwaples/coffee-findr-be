require('dotenv').config();
const { execSync } = require('child_process');
const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');


describe('routes', () => {
  let token;
  const newFavorite = {
    id: 2,
    biz_id: 'hjksdflhjkdsfsdfhjkl',
    title: 'Joels Coffee',
    img: 'a pic of coffee',
    address: 'somewhere down town, we dont know we just see his background',
    is_closed: true,
    rating: '4.0',
    yelp_url: 'jfjfjfjf',
    notes: 'add notes here',
    lat: 'string',
    lon: 'string',
    city_lat: 'string',
    city_lon: 'string',
    owner_id: 2
  };

  beforeAll(async done => {
    execSync('npm run setup-db');
    client.connect();
    const signInData = await fakeRequest(app)
      .post('/auth/signup')
      .send({
        email: 'jon@user.com',
        password: '1234'
      });
    token = signInData.body.token;
    return done();
  });
  afterAll(done => {
    return client.end(done);
  });

  test('add a favorites', async(done) => {
    const data = await fakeRequest(app)
      .post('/api/favorites')
      .send(newFavorite)
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200);
    expect(data.body).toEqual(newFavorite);
    done();
  });

  test('return all favorites for a user', async(done) => {
    const data = await fakeRequest(app)
      .get('/api/favorites')
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200);
    expect(data.body).toEqual([newFavorite]);
    done();
  });

  test('returns detailed info on a single favorite of a users list of favs', async(done) => {
    
    const data = await fakeRequest(app)
      .get('/api/favorites/2')
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200);
    expect(data.body).toEqual(newFavorite);
    done();
  });

  test('updates a single favorite for the user when hitting PUT /favorites/:id', async(done) => {
  
    const newNote = {
      notes: 'take a duece'
    };

    const expectedUpdate = {
      id: 2,
      biz_id: 'hjksdflhjkdsfsdfhjkl',
      title: 'Joels Coffee',
      img: 'a pic of coffee',
      address: 'somewhere down town, we dont know we just see his background',
      is_closed: true,
      rating: '4.0',
      yelp_url: 'jfjfjfjf',
      notes: 'take a duece',
      lat: 'string',
      lon: 'string',
      city_lat: 'string',
      city_lon: 'string',
      owner_id: 2
    };

    const data = await fakeRequest(app)
      .put('/api/favorites/2')
      .send(newNote)
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200);

    const allFavorites = await fakeRequest(app)
      .get('/api/favorites/2')
      .send(newNote)
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200);
    expect(data.body).toEqual(expectedUpdate);
    expect(allFavorites.body).toEqual(expectedUpdate);
    done();
  });

  test('delete a single favorites for the user when hitting DELETE /favorites/:id', async(done) => {
    await fakeRequest(app)
      .delete('/api/favorites/2')
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200);
    const data = await fakeRequest(app)
      .get('/api/favorites/')
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200);
    expect(data.body).toEqual([]);
    done();
  });
});

