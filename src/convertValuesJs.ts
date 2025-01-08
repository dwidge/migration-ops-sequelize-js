import { QueryInterface, QueryTypes, Sequelize } from "sequelize";

/**
 * Converts values in a column using JavaScript converter functions.
 *
 * @param {string} tableName The name of the table.
 * @param {string} oldColumn The name of the source column.
 * @param {string} newColumn The name of the destination column. Can be same as srcColumn.
 * @param {(value: any) => any} upConvertFunc A JavaScript function to convert the source value for the up migration.
 * @param {(value: any) => any} downConvertFunc A JavaScript function to convert the destination value for the down migration.
 * @returns {object} Migration object.
 */
const convertValuesJs = (
  tableName: string,
  oldColumn: string,
  newColumn: string,
  upConvertFunc: (value: any) => any,
  downConvertFunc: (value: any) => any,
) => {
  return {
    async up(queryInterface: QueryInterface, Sequelize: Sequelize) {
      const transaction = await queryInterface.sequelize.transaction();
      try {
        const rows: { id: any }[] = await queryInterface.sequelize.query(
          `SELECT id, \`${oldColumn}\` FROM \`${tableName}\``,
          { type: QueryTypes.SELECT },
        );

        for (const row of rows) {
          const convertedValue = upConvertFunc(row[oldColumn]);
          await queryInterface.sequelize.query(
            `UPDATE \`${tableName}\` SET \`${newColumn}\` = ? WHERE id = ?`,
            {
              replacements: [convertedValue, row.id],
              transaction,
            },
          );
        }

        await transaction.commit();
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    },

    async down(queryInterface: QueryInterface, Sequelize: Sequelize) {
      const transaction = await queryInterface.sequelize.transaction();
      try {
        const rows: { id: any }[] = await queryInterface.sequelize.query(
          `SELECT id, \`${newColumn}\` FROM \`${tableName}\``,
          { type: QueryTypes.SELECT },
        );

        for (const row of rows) {
          const convertedValue = downConvertFunc(row[newColumn]);
          await queryInterface.sequelize.query(
            `UPDATE \`${tableName}\` SET \`${oldColumn}\` = ? WHERE id = ?`,
            {
              replacements: [convertedValue, row.id],
              transaction,
            },
          );
        }

        await transaction.commit();
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    },
  };
};

export { convertValuesJs };
