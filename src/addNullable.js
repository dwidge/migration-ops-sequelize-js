"use strict";

const { addColumn } = require("./addColumn");

const addNullable = (tableName, columnName, type) =>
  addColumn(tableName, columnName, type, null);

module.exports = { addNullable };
