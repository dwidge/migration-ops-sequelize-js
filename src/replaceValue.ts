import { Migration } from "./Migration.js";

/**
 * Updates a specific value in a database table.
 *
 * @param {string} tableName - The name of the table to update.
 * @param {string} columnName - The name of the column to update.
 * @param {string} oldValueSql - The SQL representation of the old value to replace.
 * @param {string} newValueSql - The SQL representation of the new value to set.
 * @returns {Migration} A migration object containing the 'up' and 'down' methods.
 *
 * The 'up' method updates the specified column in the given table, replacing occurrences of the old value with the new value.
 * The 'down' method reverts this change, replacing the new value back to the old value.
 */
export function replaceValue(
  tableName: string,
  columnName: string,
  oldValueSql: string,
  newValueSql: string,
): Migration {
  return {
    async up(queryInterface) {
      await queryInterface.sequelize.query(
        `UPDATE \`${tableName}\` SET \`${columnName}\` = ${newValueSql} WHERE \`${columnName}\` = ${oldValueSql}`,
      );
    },
    async down(queryInterface) {
      await queryInterface.sequelize.query(
        `UPDATE \`${tableName}\` SET \`${columnName}\` = ${oldValueSql} WHERE \`${columnName}\` = ${newValueSql}`,
      );
    },
  };
}
