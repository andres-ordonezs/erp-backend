"use strict";

/* Routes for apps */
const express = require("express");
const jsonschema = require("jsonschema");
const { ensureSuperAdmin, ensureDatabaseUser } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const App = require("../models/app");
const appUpdateSchema = require("../schemas/appUdpate.json");

const router = express.Router();


/** GET / => { apps: [app, ...] }
 *
 * Returns list of all apps belonging to a specific database.
 *
 * Authorization required: User must be a database user
 **/
router.get("/", ensureDatabaseUser, async function (req, res, next) {
  try {
    const databaseId = req.headers["database-id"]; // Get from headers
    const apps = await App.getByDatabaseId(databaseId);
    return res.json({ apps });
  } catch (err) {
    return next(err);
  }
});

/** GET /apps => { apps: [app, ...] }
 *
 * Returns list of all apps.
 *
 * Authorization required: superAdmin
 **/
router.get("/all", ensureSuperAdmin, async function (req, res, next) {
  const apps = await App.getAll();
  return res.json({ apps });
});


/** GET /[appId] => { app }
 *
 * Returns details of a specific app by ID.
 *
 * Authorization required: none
 **/
router.get("/:id", async function (req, res, next) {
  const app = await App.get(req.params.id);
  return res.json({ app });
});

/** POST / { app } => { app }
 *
 * Create a new app.
 *
 * Required fields: { name, icon, url, category, description }
 *
 * Authorization required: SuperAdmin
 **/
router.post("/", ensureSuperAdmin, async function (req, res, next) {
  const validator = jsonschema.validate(req.body, appUpdateSchema);
  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
  }

  const app = await App.create(req.body);
  return res.status(201).json({ app });
});

/** PATCH /[id] { app } => { app }
 *
 * Update app details.
 *
 * Authorization required: SuperAdmin
 **/
router.patch("/:id", ensureSuperAdmin, async function (req, res, next) {
  const validator = jsonschema.validate(req.body, appUpdateSchema);
  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
  }

  const app = await App.update(req.params.id, req.body);
  return res.json({ app });
});

/** DELETE /[id] => { deleted: id }
 *
 * Delete an app by ID.
 *
 * Authorization required: SuperAdmin
 **/
router.delete("/:id", ensureSuperAdmin, async function (req, res, next) {
  await App.remove(req.params.id);
  return res.json({ deleted: req.params.id });
});

module.exports = router;
