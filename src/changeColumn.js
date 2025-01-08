"use strict";

/**
 * Changes the column definition.
 *
 * @param {string} tableName The name of the table.
 * @param {string} columnName The name of the column.
 * @param {object} oldOptions The old column definition.
 * @param {object} newOptions The new column definition.
 * @returns {object} Migration object.
 */
function changeColumn(tableName, columnName, oldOptions, newOptions) {
  return {
    async up(queryInterface, Sequelize) {
      await queryInterface.changeColumn(tableName, columnName, newOptions);
    },
    async down(queryInterface, Sequelize) {
      await queryInterface.changeColumn(tableName, columnName, oldOptions);
    },
  };
}

module.exports = { changeColumn };
