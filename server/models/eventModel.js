const pool = require('../db/pool');

const VALID_TYPES = ['conference', 'workshop', 'social', 'networking', 'concert', 'sports', 'fundraiser', 'other'];

const list = async () => {
  const { rows } = await pool.query(`
    SELECT
      e.*,
      u.username,
      COUNT(r.rsvp_id) AS rsvp_count
    FROM events e
    JOIN users u ON e.user_id = u.user_id
    LEFT JOIN rsvps r ON e.event_id = r.event_id
    GROUP BY e.event_id, u.username
    ORDER BY e.date ASC
  `);
  return rows;
};

const listByUser = async (user_id) => {
  const { rows } = await pool.query(`
    SELECT
      e.*,
      COUNT(r.rsvp_id) AS rsvp_count
    FROM events e
    LEFT JOIN rsvps r ON e.event_id = r.event_id
    WHERE e.user_id = $1
    GROUP BY e.event_id
    ORDER BY e.date ASC
  `, [user_id]);
  return rows;
};

const findById = async (event_id) => {
  const { rows } = await pool.query(
    `SELECT * FROM events WHERE event_id = $1`,
    [event_id]
  );
  return rows[0] || null;
};

const create = async ({ title, description, date, location, event_type, max_capacity }, user_id) => {
  const { rows } = await pool.query(`
    INSERT INTO events (title, description, date, location, event_type, max_capacity, user_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `, [title, description || null, date, location, event_type, max_capacity, user_id]);
  return rows[0];
};

const update = async (event_id, fields) => {
  const allowed = ['title', 'description', 'date', 'location', 'event_type', 'max_capacity'];
  const updates = [];
  const values = [];
  let idx = 1;

  for (const key of allowed) {
    if (fields[key] !== undefined) {
      updates.push(`${key} = $${idx++}`);
      values.push(fields[key]);
    }
  }

  if (!updates.length) return findById(event_id);

  values.push(event_id);
  const { rows } = await pool.query(
    `UPDATE events SET ${updates.join(', ')} WHERE event_id = $${idx} RETURNING *`,
    values
  );
  return rows[0] || null;
};

const deleteEvent = async (event_id) => {
  const { rows } = await pool.query(
    `DELETE FROM events WHERE event_id = $1 RETURNING *`,
    [event_id]
  );
  return rows[0] || null;
};

module.exports = { list, listByUser, findById, create, update, deleteEvent, VALID_TYPES };