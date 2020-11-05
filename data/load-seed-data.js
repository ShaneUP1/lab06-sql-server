const client = require('../lib/client');
// import our seed data:
const fourteeners = require('./fourteeners.js');
const usersData = require('./users.js');
const mtn_ranges = require('./mtn_ranges.js');
const { getEmoji } = require('../lib/emoji.js');

run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
          [user.email, user.hash]);
      })
    );

    const user = users[0].rows[0];

    await Promise.all(
      mtn_ranges.map(mtn_range => {
        return client.query(`
                    INSERT INTO mtn_ranges (name)
                    VALUES ($1);
                `,
          [mtn_range.name]);
      })
    );


    await Promise.all(
      fourteeners.map(fourteener => {
        return client.query(`
                    INSERT INTO fourteeners (name, elevation, mtn_range_id, drive_to_top, owner_id)
                    VALUES ($1, $2, $3, $4, $5);
                `,
          [fourteener.name, fourteener.elevation, fourteener.mtn_range_id, fourteener.drive_to_top, user.id]);
      })
    );



    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch (err) {
    console.log(err);
  }
  finally {
    client.end();
  }

}
