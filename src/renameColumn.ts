import { QueryInterface, Sequelize } from "sequelize";
import { Migration } from "./Migration.js";

/**
 * Safely renames a column in a given table. If the old column does not exist
 * and the new column already exists, a warning is logged.
 *
 * @param queryInterface - The Sequelize QueryInterface instance.
 * @param table - The name of the table containing the column to rename.
 * @param oldColumn - The name of the current column to rename.
 * @param newColumn - The name to apply to the column being renamed.
 */
async function safeRenameColumn(
  queryInterface: QueryInterface,
  table: string,
  oldColumn: string,
  newColumn: string,
) {
  const tableDesc = await queryInterface.describeTable(table);

  if (!(oldColumn in tableDesc) && newColumn in tableDesc) {
    console.warn(
      `Column '${oldColumn}' is already renamed to '${newColumn}' in table '${table}'.`,
    );
    return;
  }

  await queryInterface.renameColumn(table, oldColumn, newColumn);
}

/**
 * Creates a migration to rename a column in the specified table.
 *
 * @param table - The name of the table containing the column to rename.
 * @param oldColumn - The name of the current column to rename.
 * @param newColumn - The name to apply to the column being renamed.
 * @returns A Migration object with up and down methods for the migration.
 */
function renameColumn(
  table: string,
  oldColumn: string,
  newColumn: string,
): Migration {
  return {
    async up(queryInterface: QueryInterface, Sequelize: Sequelize) {
      await safeRenameColumn(queryInterface, table, oldColumn, newColumn);
    },
    async down(queryInterface: QueryInterface, Sequelize: Sequelize) {
      await safeRenameColumn(queryInterface, table, newColumn, oldColumn);
    },
  };
}

export { renameColumn };
