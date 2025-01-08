"use strict";

// defaultValue===undefined means no defaultValue
function dropColumn(table, columnName, type, defaultValue) {
  return {
    async up(queryInterface, Sequelize) {
      await queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.removeColumn(table, columnName, { transaction });
      });
    },
    async down(queryInterface, Sequelize) {
      await queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.addColumn(
          table,
          columnName,
          {
            type,
            allowNull: defaultValue === null,
            defaultValue,
          },
          { transaction },
        );
      });
    },
  };
}

module.exports = { dropColumn };
