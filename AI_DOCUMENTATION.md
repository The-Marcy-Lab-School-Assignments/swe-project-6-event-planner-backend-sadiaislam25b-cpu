**1. What did you ask the AI to help you with, and why did you choose to use AI for that specific task?**

For the EventPlanner project, I was working on implementing the RSVP feature, specifically the requirement that duplicate RSVPs should not cause a server error (ON CONFLICT DO NOTHING). I understood from the API contract that users can RSVP to events and also un-RSVP, but I was confused about how the database was supposed to handle repeated RSVP requests without crashing or creating duplicate rows.

I also noticed in the case study (bookmark_likes) that a similar pattern was used, but I didn’t fully understand how the SQL constraint and the query worked together in practice.

I asked AI:

“In my EventPlanner backend, I have a rsvps table with a UNIQUE constraint on (user_id, event_id). The API says duplicate RSVPs should not cause an error using ON CONFLICT DO NOTHING. Can you explain how this works and how I should implement it in my model function?”

I chose to use AI because I already had the schema, API contract, and case study reference, but I needed help connecting all three. The documentation showed the structure, but I wanted a clearer explanation of how the database constraint, SQL query, and model function work together in an actual MVC backend flow.


**2. How did you evaluate whether the AI's output was correct or useful before using it?**

The AI explained that the UNIQUE (user_id, event_id) constraint in the rsvps table prevents duplicate RSVPs at the database level, and that ON CONFLICT DO NOTHING tells Postgres to ignore insert attempts that violate that constraint instead of throwing an error.

It also explained that this makes the RSVP endpoint idempotent, meaning multiple identical requests will not change the result after the first successful insert. This matched the expected behavior in the API contract, where duplicate RSVPs should succeed silently.

To verify this, I checked my seed.js schema and confirmed that the rsvps table includes:

a foreign key to users
a foreign key to events
a UNIQUE (user_id, event_id) constraint

I then tested the endpoint using curl and my model function. I saw that:

the first RSVP insert returned a row
repeated requests returned no new row but also no error

This confirmed the AI explanation matched both the schema and the actual runtime behavior of my Express + Postgres setup.

**3. How did what the AI produced differ from what you ultimately used, and what does that tell you about your own understanding of the problem?**

INSERT INTO rsvps (user_id, event_id)
VALUES (42, 101)
ON CONFLICT DO NOTHING;

However, my actual implementation had to follow the EventPlanner architecture, meaning:

I had to use parameterized queries ($1, $2)
I had to integrate it inside a model function (rsvpModel.js)
I also needed RETURNING * so the controller could decide whether to return 201 or 200

So my final implementation became:

pool.query(
  'INSERT INTO rsvps (user_id, event_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *;',
  [user_id, event_id]
);

This shows that I understood the concept, but I still had to adapt it to:

the MVC structure (model layer responsibility)
the API contract response requirements
the case study pattern for consistency

It also shows that I rely on combining AI explanations with existing project patterns (like bookmark_likes) to correctly implement features in a structured backend system.

**4. What did you learn from using AI in this way?**

I learned that the RSVP feature is not just about inserting data, but about designing behavior at the database level using constraints and conflict handling. The combination of UNIQUE (user_id, event_id) and ON CONFLICT DO NOTHING ensures data integrity while keeping the API clean and predictable.

I also learned how important it is to align three layers of the backend:

Database schema (constraints)
Model layer (SQL queries)
API contract (expected responses)

Using AI helped me understand the “why” behind idempotent behavior and how Postgres handles conflicts internally. However, I still needed the case study and spec to correctly implement it within the MVC structure of the EventPlanner project.

Overall, I learned how to use AI as a support tool for connecting concepts, not replacing the process of reading specs, studying reference apps, and building the system step-by-step.
