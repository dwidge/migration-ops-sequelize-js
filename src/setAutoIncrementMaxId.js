"use strict";

const setAutoIncrementMaxId = async (
  queryInterface,
  transaction,
  tableName,
) => {
  // Get the current maximum ID in the table
  const maxIdResult = await queryInterface.sequelize.query(
    `SELECT MAX(id) as maxId FROM ${tableName}`,
  );
  const maxId = maxIdResult[0][0].maxId;

  // Set the AUTO_INCREMENT start value
  await queryInterface.sequelize.query(
    `ALTER TABLE ${tableName} AUTO_INCREMENT = ${maxId + 1}`,
  );
};
exports.setAutoIncrementMaxId = setAutoIncrementMaxId;
