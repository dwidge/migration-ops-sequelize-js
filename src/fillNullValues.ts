import { Migration } from "./Migration.js";

/**
 * Fills null values in a column.
 *
 * @param {string} tableName The name of the table.
 * @param {string} columnName The name of the column.
 * @param {string} fillValueSql The SQL expression to use to fill null values.
 * @param {*} [defaultValue] Optional default value. If provided, values equal to this will be set back to NULL in the down migration.
 * @returns {object} Migration object.
 */
function fillNullValues(
  tableName: string,
  columnName: string,
  fillValueSql: string,
  defaultValue?: any,
): Migration {
  return {
    async up(queryInterface) {
      await queryInterface.sequelize.query(
        `UPDATE \`${tableName}\` SET \`${columnName}\` = ${fillValueSql} WHERE \`${columnName}\` IS NULL`,
      );
    },
    async down(queryInterface) {
      if (defaultValue !== undefined) {
        await queryInterface.sequelize.query(
          `UPDATE \`${tableName}\` SET \`${columnName}\` = NULL WHERE \`${columnName}\` = ${defaultValue}`,
        );
      }
    },
  };
}

/**
 * Adds null values in a column.
 *
 * @param {string} tableName The name of the table.
 * @param {string} columnName The name of the column.
 * @param {string} fillValueSql The SQL expression to use to fill null values.
 * @param {*} [defaultValue] Optional default value. If provided, values equal to this will be set back to NULL in the down migration.
 * @returns {object} Migration object.
 */
function addNullValues(
  tableName: string,
  columnName: string,
  fillValueSql: string,
  defaultValue?: any,
): Migration {
  const { up, down } = fillNullValues(
    tableName,
    columnName,
    fillValueSql,
    defaultValue,
  );
  return { up: down, down: up };
}

export { fillNullValues, addNullValues };
