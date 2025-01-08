"use strict";

// defaultValue===undefined means no defaultValue
function addColumn(tableName, columnName, type, defaultValue) {
  return {
    async up(queryInterface, Sequelize) {
      await queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.addColumn(
          tableName,
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
    async down(queryInterface, Sequelize) {
      await queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.removeColumn(tableName, columnName, {
          transaction,
        });
      });
    },
  };
}

module.exports = { addColumn };
