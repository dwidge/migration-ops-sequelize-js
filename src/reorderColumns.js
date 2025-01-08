"use strict";

/**
 * Reorders columns in a table.
 *
 * @param {string} tableName The name of the table.
 * @param {string[]} columnOrder An array of column names in the desired order. Columns not in this array will retain their existing relative order.
 * @returns {object} Migration object.
 */
function reorderColumns(tableName, columnOrder) {
  return {
    async up(queryInterface, Sequelize) {
      const tableDescription = await queryInterface.describeTable(tableName);
      const existingColumns = Object.keys(tableDescription);

      // Validate that all specified columns exist
      for (const col of columnOrder) {
        if (!existingColumns.includes(col)) {
          throw new Error(
            `Column '${col}' does not exist in table '${tableName}'.`,
          );
        }
      }

      await queryInterface.sequelize.transaction(async (transaction) => {
        let previousColumn = null;

        for (const column of columnOrder) {
          await queryInterface.changeColumn(
            tableName,
            column,
            tableDescription[column],
            { after: previousColumn, transaction },
          );
          previousColumn = column;
        }
      });
    },

    async down(queryInterface, Sequelize) {},
  };
}

module.exports = { reorderColumns };
