require('dotenv').config();
const pool = require('./pool');
const bcrypt = require('bcrypt');

const seed = async () => {
  try {
    console.log('Dropping existing tables...');
    await pool.query(`DROP TABLE IF EXISTS rsvps CASCADE`);
    await pool.query(`DROP TABLE IF EXISTS events CASCADE`);
    await pool.query(`DROP TABLE IF EXISTS users CASCADE`);

    console.log('Creating tables...');

    await pool.query(`
      CREATE TABLE users (
        user_id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL
      )
    `);

    await pool.query(`
      CREATE TABLE events (
        event_id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        date TEXT NOT NULL,
        location TEXT NOT NULL,
        event_type TEXT NOT NULL,
        max_capacity INTEGER NOT NULL,
        user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE
      )
    `);

    await pool.query(`
      CREATE TABLE rsvps (
        rsvp_id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
        event_id INTEGER REFERENCES events(event_id) ON DELETE CASCADE,
        UNIQUE (user_id, event_id)
      )
    `);

    console.log('Seeding users...');
    const passwordHash = await bcrypt.hash('password123', 10);

    const { rows: users } = await pool.query(`
      INSERT INTO users (username, password_hash) VALUES
        ('alice', $1),
        ('bob', $1),
        ('carol', $1)
      RETURNING user_id, username
    `, [passwordHash]);

    const [alice, bob, carol] = users;
    console.log('Users seeded:', users.map(u => u.username));

    console.log('Seeding events...');
    const { rows: events } = await pool.query(`
      INSERT INTO events (title, description, date, location, event_type, max_capacity, user_id) VALUES
        ('React & Node Workshop', 'A hands-on workshop covering full-stack JavaScript development with React and Node.js.', '2025-06-01', 'New York, NY', 'workshop', 30, $1),
        ('Tech Networking Mixer', 'Connect with fellow engineers, designers, and startup founders in a relaxed setting.', '2025-06-15', 'Brooklyn, NY', 'networking', 80, $1),
        ('Summer Code Conference', 'Three days of talks, panels, and workshops on the latest in software engineering.', '2025-07-10', 'Manhattan, NY', 'conference', 500, $2),
        ('Central Park Yoga', 'A relaxing group yoga session for all skill levels. Bring your own mat!', '2025-07-20', 'Central Park, NY', 'social', 40, $2),
        ('Jazz & Blues Night', 'An evening of live jazz and blues featuring local artists.', '2025-08-05', 'Harlem, NY', 'concert', 200, $3),
        ('Charity 5K Run', 'Join us for a 5K run to raise money for local food banks.', '2025-08-12', 'Prospect Park, Brooklyn', 'fundraiser', 150, $3),
        ('Sports Analytics Workshop', 'Learn how data science is changing professional sports.', '2025-09-01', 'Columbia University, NY', 'workshop', 60, $1),
        ('Community Hackathon', 'A 24-hour hackathon open to all skill levels. Food and prizes provided!', '2025-09-20', 'NYC Tech Hub, Manhattan', 'other', 100, $2)
      RETURNING event_id, title
    `, [alice.user_id, bob.user_id, carol.user_id]);

    console.log('Events seeded:', events.map(e => e.title));

    console.log('Seeding RSVPs...');
    await pool.query(`
      INSERT INTO rsvps (user_id, event_id) VALUES
        ($1, $4),
        ($1, $5),
        ($2, $3),
        ($2, $6),
        ($2, $7),
        ($3, $3),
        ($3, $4),
        ($3, $8)
      ON CONFLICT DO NOTHING
    `, [alice.user_id, bob.user_id, carol.user_id, events[2].event_id, events[4].event_id, events[0].event_id, events[1].event_id, events[6].event_id]);

    console.log('Seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seed();