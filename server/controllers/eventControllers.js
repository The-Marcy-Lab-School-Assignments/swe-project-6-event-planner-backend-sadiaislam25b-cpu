const eventModel = require('../models/eventModel');

const list = async (req, res, next) => {
  try {
    const events = await eventModel.list();
    res.json(events);
  } catch (err) {
    next(err);
  }
};

const listByUser = async (req, res, next) => {
  try {
    const events = await eventModel.listByUser(req.params.user_id);
    res.json(events);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { title, description, date, location, event_type, max_capacity } = req.body;

    if (!title || !date || !location || !event_type || !max_capacity) {
      return res.status(400).json({ error: 'title, date, location, event_type, and max_capacity are required.' });
    }

    if (!eventModel.VALID_TYPES.includes(event_type)) {
      return res.status(400).json({ error: `event_type must be one of: ${eventModel.VALID_TYPES.join(', ')}` });
    }

    const event = await eventModel.create(
      { title, description, date, location, event_type, max_capacity },
      req.session.userId
    );
    res.status(201).json(event);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const event = await eventModel.findById(req.params.event_id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }
    if (event.user_id !== req.session.userId) {
      return res.status(403).json({ error: 'You can only edit your own events.' });
    }

    if (req.body.event_type && !eventModel.VALID_TYPES.includes(req.body.event_type)) {
      return res.status(400).json({ error: `event_type must be one of: ${eventModel.VALID_TYPES.join(', ')}` });
    }

    const updated = await eventModel.update(req.params.event_id, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

const deleteEvent = async (req, res, next) => {
  try {
    const event = await eventModel.findById(req.params.event_id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }
    if (event.user_id !== req.session.userId) {
      return res.status(403).json({ error: 'You can only delete your own events.' });
    }

    const deleted = await eventModel.deleteEvent(req.params.event_id);
    res.json(deleted);
  } catch (err) {
    next(err);
  }
};

module.exports = { list, listByUser, create, update, deleteEvent };