"use strict";

const db = require("../db");
const {
  NotFoundError,
  BadRequestError
} = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

class App {

  /** Create a new app.
   *
   * data should be { name, icon, description }
   *
   * Returns { id, name, icon, description }
   *
   * Throws BadRequestError on duplicates.
   **/
  static async create({ name, icon, description }) {
    const duplicateCheck = await db.query(
      `SELECT name
       FROM apps
       WHERE name = $1`,
      [name]
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate app: ${name}`);
    }

    const result = await db.query(
      `INSERT INTO apps (name, icon, description)
       VALUES ($1, $2, $3)
       RETURNING id, name, icon, description`,
      [name, icon, description]
    );

    const app = result.rows[0];
    return app;
  }

  /** Get all apps.
   *
   * Returns [{ id, name, icon, description }, ...]
   **/
  static async getAll() {
    const result = await db.query(
      `SELECT id, name, icon, description
       FROM apps
       ORDER BY name`
    );

    return result.rows;
  }

  /** Get app by ID.
   *
   * Returns { id, name, icon, description }
   *
   * Throws NotFoundError if not found.
   **/
  static async get(id) {
    const result = await db.query(
      `SELECT id, name, icon, description
       FROM apps
       WHERE id = $1`,
      [id]
    );

    const app = result.rows[0];

    if (!app) throw new NotFoundError(`No app with ID: ${id}`);

    return app;
  }

  /** Update app data with `data`.
   *
   * Partial update is allowed.
   *
   * Returns { id, name, icon, description }
   *
   * Throws NotFoundError if not found.
   **/
  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(
      data,
      {}
    );
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `
      UPDATE apps
      SET ${setCols}
      WHERE id = ${idVarIdx}
      RETURNING id, name, icon, description`;

    const result = await db.query(querySql, [...values, id]);
    const app = result.rows[0];

    if (!app) throw new NotFoundError(`No app with ID: ${id}`);

    return app;
  }

  /** Delete app by ID.
   *
   * Returns { id }
   *
   * Throws NotFoundError if not found.
   **/
  static async remove(id) {
    const result = await db.query(
      `DELETE
       FROM apps
       WHERE id = $1
       RETURNING id`,
      [id]
    );

    const app = result.rows[0];

    if (!app) throw new NotFoundError(`No app with ID: ${id}`);

    return app;
  }
}

module.exports = App;
