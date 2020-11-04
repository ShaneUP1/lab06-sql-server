require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;

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

    test('returns fourteeners', async () => {

      const expectation = [
        {
          'id': 1,
          'name': 'Mt. Evans',
          'elevation': 14264,
          'mtn_range': 'Front Range',
          'drive_to_top': true,
          'owner_id': 1,
        },
        {
          'id': 2,
          'name': 'Quandary Peak',
          'elevation': 14265,
          'mtn_range': 'Tenmile Range',
          'drive_to_top': false,
          'owner_id': 1,
        },
        {
          'id': 3,
          'name': 'Mt. Massive',
          'elevation': 14421,
          'mtn_range': 'Sawatch Range',
          'drive_to_top': false,
          'owner_id': 1,
        },
        {
          'id': 4,
          'name': 'Maroon Peak',
          'elevation': 14156,
          'mtn_range': 'Elk Range',
          'drive_to_top': false,
          'owner_id': 1,
        },
        {
          'id': 5,
          'name': 'Mt. Wilson',
          'elevation': 14246,
          'mtn_range': 'San Juan Range',
          'drive_to_top': false,
          'owner_id': 1,
        },
        {
          'id': 6,
          'name': 'Blanca Peak',
          'elevation': 14345,
          'mtn_range': 'Sangres Range',
          'drive_to_top': false,
          'owner_id': 1,
        }
      ];

      const data = await fakeRequest(app)
        .get('/fourteeners')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('returns a single fourteener', async () => {

      const expectation =
      {
        'id': 1,
        'name': 'Mt. Evans',
        'elevation': 14264,
        'mtn_range': 'Front Range',
        'drive_to_top': true,
        'owner_id': 1,
      };
      const data = await fakeRequest(app)
        .get('/fourteeners/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('adds a fourteener to the database and returns it', async () => {

      const expectation =
      {
        'id': 7,
        'name': 'Mt. Elbert',
        'elevation': 14433,
        'mtn_range': 'Sawatch Range',
        'drive_to_top': false,
        'owner_id': 1,
      };
      const data = await fakeRequest(app)
        .post('/fourteeners/')
        .send({
          name: 'Mt. Elbert',
          elevation: 14433,
          mtn_range: 'Sawatch Range',
          drive_to_top: false,
          owner_id: 1
        })
        .expect('Content-Type', /json/)
        .expect(200);

      const allFourteeners = await fakeRequest(app)
        .get('/fourteeners')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
      expect(allFourteeners.body.length).toEqual(7);
    });
  });
});
