const rsvpModel = require('../models/rsvpModel');

const createRsvp = async (req, res, next) => {
  try {
    const rsvp = await rsvpModel.create(req.session.userId, req.params.event_id);
    res.status(201).json(rsvp);
  } catch (err) {
    next(err);
  }
};

const deleteRsvp = async (req, res, next) => {
  try {
    const rsvp = await rsvpModel.deleteRsvp(req.session.userId, req.params.event_id);
    res.json(rsvp);
  } catch (err) {
    next(err);
  }
};

const listRsvpsByUser = async (req, res, next) => {
  try {
    const events = await rsvpModel.listEventsByUser(req.params.user_id);
    res.json(events);
  } catch (err) {
    next(err);
  }
};

module.exports = { createRsvp, deleteRsvp, listRsvpsByUser };