require('dotenv').config();
const { execSync } = require('child_process');
const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');


describe('routes', () => {
  let token;
  const newFavorite = {
    biz_id: 'hjksdflhjkdsfsdfhjkl',
    title: 'Joels Coffee',
    img: 'a pic of coffee',
    address: 'somewhere down town, we dont know we just see his background',
    is_closed: true,
    rating: 4.0,
    yelp_url: 'jfjfjfjf',
    notes: 'add notes here',
    lat: 'string',
    lon: 'string',
    cityLat: 'string',
    cityLon: 'string'
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
      .expect(500);
    expect(data.body).toEqual(newFavorite);
    done();
  });

  // skip('return all favorites for a user', async(done) => {
  //   const expected = [
  //     {
  //       brand_name: 'Taylor',
  //       color: 'red',
  //       id: 4,
  //       owner_id: 2,
  //       strings: 4,
  //     },
  //   ];
  //   const data = await fakeRequest(app)
  //     .get('/api/guitars')
  //     .set('Authorization', token)
  //     .expect('Content-Type', /json/)
  //     .expect(200);
  //   expect(data.body).toEqual(expected);
  //   done();
  // });

  // skip('returns detailed info on a single favorite of a users list of favs', async(done) => {
  //   const expected = {
  //     brand_name: 'Taylor',
  //     color: 'red',
  //     id: 4,
  //     owner_id: 2,
  //     strings: 4,
  //   };
  //   const data = await fakeRequest(app)
  //     .get('/api/guitars/4')
  //     .set('Authorization', token)
  //     .expect('Content-Type', /json/)
  //     .expect(200);
  //   expect(data.body).toEqual(expected);
  //   done();
  // });

  // skip('updates a single favorite for the user when hitting PUT /favorites/:id', async(done) => {
  //   const newFavorite = {
  //     brand_id: 1,
  //     color: 'cool red',
  //     id: 4,
  //     owner_id: 2,
  //     strings: 6,
  //   };
  //   const expectedAllGuitars = [{
  //     brand_name: 'Gibson',      
  //     color: 'cool red',
  //     id: 4,
  //     owner_id: 2,
  //     strings: 6,
  //   }];
  //   const data = await fakeRequest(app)
  //     .put('/api/guitars/4')
  //     .send(newFavorite)
  //     .set('Authorization', token)
  //     .expect('Content-Type', /json/)
  //     .expect(200);
  //   const allGuitars = await fakeRequest(app)
  //     .get('/api/guitars')
  //     .send(newFavorite)
  //     .set('Authorization', token)
  //     .expect('Content-Type', /json/)
  //     .expect(200);
  //   expect(data.body).toEqual(newFavorite);
  //   expect(allGuitars.body).toEqual(expectedAllGuitars);
  //   done();
  // });

  // skip('delete a single favorites for the user when hitting DELETE /favorites/:id', async(done) => {
  //   await fakeRequest(app)
  //     .delete('/api/favorites/4')
  //     .set('Authorization', token)
  //     .expect('Content-Type', /json/)
  //     .expect(200);
  //   const data = await fakeRequest(app)
  //     .get('/api/favorites/')
  //     .set('Authorization', token)
  //     .expect('Content-Type', /json/)
  //     .expect(200);
  //   expect(data.body).toEqual([]);
  //   done();
  // });
});

