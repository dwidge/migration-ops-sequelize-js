"use strict";

const { changeColumn } = require("./changeColumn");

/**
 * Changes the default value of a column.
 *
 * @param {string} tableName The name of the table.
 * @param {string} columnName The name of the column.
 * @param {string} type The Sequelize data type of the column.
 * @param {*} oldDefault The old default value. If null, allowNull will be set to true. Otherwise, false.
 * @param {*} newDefault The new default value. If null, allowNull will be set to true. Otherwise, false.
 * @returns {object} Migration object.
 */
const changeDefaultValue = (
  tableName,
  columnName,
  type,
  oldDefault,
  newDefault,
) =>
  changeColumn(
    tableName,
    columnName,
    { type, allowNull: oldDefault === null, defaultValue: oldDefault },
    { type, allowNull: newDefault === null, defaultValue: newDefault },
  );

module.exports = { changeDefaultValue };
