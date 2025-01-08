"use strict";

function makeNonNullable(tableName, columnName, type, defaultValue) {
  return {
    async up(queryInterface, Sequelize) {
      await queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.sequelize.query(
          `UPDATE ${tableName} SET ${columnName} = ${defaultValue} WHERE ${columnName} IS NULL`,
          { transaction },
        );
        await queryInterface.changeColumn(
          tableName,
          columnName,
          {
            type,
            allowNull: false,
            defaultValue,
          },
          { transaction },
        );
      });
    },
    async down(queryInterface, Sequelize) {
      await queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.changeColumn(
          tableName,
          columnName,
          {
            type,
            allowNull: true,
            defaultValue: null,
          },
          { transaction },
        );
      });
    },
  };
}

module.exports = { makeNonNullable };
