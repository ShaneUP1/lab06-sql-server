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
          'drive_to_top': true,
          'range_name': 'Front Range'
        },
        {
          'id': 2,
          'name': 'Quandary Peak',
          'elevation': 14265,
          'drive_to_top': false,
          'range_name': 'Tenmile Range'
        },
        {
          'id': 3,
          'name': 'Mt. Massive',
          'elevation': 14421,
          'drive_to_top': false,
          'range_name': 'Sawatch Range'
        },
        {
          'id': 4,
          'name': 'Maroon Peak',
          'elevation': 14156,
          'drive_to_top': false,
          'range_name': 'Elk Range'
        },
        {
          'id': 5,
          'name': 'Mt. Wilson',
          'elevation': 14246,
          'drive_to_top': false,
          'range_name': 'San Juan Range'
        },
        {
          'id': 6,
          'name': 'Blanca Peak',
          'elevation': 14345,
          'drive_to_top': false,
          'range_name': 'Sangres Range'
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
        'mtn_range_id': 1,
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
        'mtn_range_id': 3,
        'drive_to_top': false,
        'owner_id': 1,
      };
      const data = await fakeRequest(app)
        .post('/fourteeners/')
        .send({
          name: 'Mt. Elbert',
          elevation: 14433,
          mtn_range_id: 3,
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

    test('modifies an existing fourteener and returns it', async () => {

      const expectation =
      {
        'id': 1,
        'name': 'Mt. Harvard',
        'elevation': 14420,
        'mtn_range_id': 2,
        'drive_to_top': false,
        'owner_id': 1,
      };
      const data = await fakeRequest(app)
        .put('/fourteeners/1')
        .send({
          name: 'Mt. Harvard',
          elevation: 14420,
          mtn_range_id: 2,
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

    test('deletes one fourteener from the list', async () => {

      const expectation =
      {
        id: 1,
        name: 'Mt. Harvard',
        elevation: 14420,
        mtn_range_id: 2,
        drive_to_top: false,
        owner_id: 1,
      };

      const data = await fakeRequest(app)
        .delete('/fourteeners/1')
        .expect('Content-Type', /json/)
        .expect(200);

      const allFourteeners = await fakeRequest(app)
        .get('/fourteeners')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
      expect(allFourteeners.body.length).toEqual(6);
    });

    test.only('returns mountain ranges', async () => {

      const expectation = [
        {
          id: 1,
          name: 'Front Range',
        },
        {
          id: 2,
          name: 'Tenmile Range',
        },
        {
          id: 3,
          name: 'Sawatch Range',
        },
        {
          id: 4,
          name: 'Elk Range',
        },
        {
          id: 5,
          name: 'San Juan Range',
        },
        {
          id: 6,
          name: 'Sangres Range',
        }
      ];

      const data = await fakeRequest(app)
        .get('/mtn_ranges')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

  });
});
