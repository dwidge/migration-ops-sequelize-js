import { Migration } from "./Migration.js";

/**
 * Converts values in a column using SQL expressions.
 *
 * @param {string} tableName The name of the table.
 * @param {string} oldColumn The name of the source column. Written during down.
 * @param {string} newColumn The name of the destination column. Written during up. Can be same as oldColumn.
 * @param {string} upConvertSql The conversion SQL expression for the up migration.
 * @param {string} downConvertSql The conversion SQL expression for the down migration.
 * @returns {object} Migration object.
 */
export function convertValues(
  tableName: string,
  oldColumn: string,
  newColumn: string,
  upConvertSql: string,
  downConvertSql: string,
): Migration {
  return {
    async up(queryInterface, Sequelize) {
      await queryInterface.sequelize.query(
        `UPDATE \`${tableName}\` SET \`${newColumn}\` = ${upConvertSql}`,
      );
    },
    async down(queryInterface, Sequelize) {
      await queryInterface.sequelize.query(
        `UPDATE \`${tableName}\` SET \`${oldColumn}\` = ${downConvertSql}`,
      );
    },
  };
}
