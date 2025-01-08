import { QueryInterface, QueryTypes, Sequelize } from "sequelize";

const MAX_INT_32 = 2147483647;

/**
 * Generates a random integer between 0 (inclusive) and max (exclusive).
 *
 * @param {number} max The exclusive upper bound.
 * @returns {number} A random integer.
 */
const generateRandomInt = (max: number): number => {
  return Math.floor(Math.random() * max);
};

/**
 * Attempts to update a row with a random value, retrying if a unique constraint error occurs.
 *
 * @param {QueryInterface} queryInterface The Sequelize query interface.
 * @param {string} tableName The name of the table.
 * @param {string} columnName The name of the integer column.
 * @param {number} rowId The ID of the row to update.
 * @param {number} maxValue The maximum value for the random integer (exclusive).
 * @param {number} maxRetries The maximum number of retry attempts.
 * @returns {Promise<void>}
 */
const updateRowWithRetry = async (
  queryInterface: QueryInterface,
  tableName: string,
  columnName: string,
  rowId: number,
  maxValue: number,
  maxRetries = 10,
): Promise<void> => {
  let attempts = 0;
  while (attempts < maxRetries) {
    attempts++;
    const randomValue = generateRandomInt(maxValue);
    try {
      await queryInterface.sequelize.query(
        `UPDATE \`${tableName}\` SET \`${columnName}\` = ? WHERE id = ?`,
        {
          replacements: [randomValue, rowId],
        },
      );
      return; // Success, exit the loop
    } catch (error) {
      // Check if the error is a unique constraint violation (specific to your database)
      if (
        error instanceof Error &&
        error.name === "SequelizeUniqueConstraintError"
      ) {
        console.warn(
          `Attempt ${attempts}: Unique constraint error encountered for row ${rowId}. Retrying with a new random value.`,
        );
      } else {
        // If it's a different error, re-throw it
        throw error;
      }
    }
  }
  throw new Error(
    `updateRowWithRetryE1: ${tableName} ${columnName} ${rowId}: Failed to update row after ${maxRetries} attempts due to unique constraint errors.`,
  );
};

/**
 * Finds rows where a column exceeds the maximum signed 32-bit integer
 * and sets them to random values within the valid 0 to MAX_INT_32 - 1 range,
 * retrying if unique constraint errors occur.
 *
 * @param {string} tableName The name of the table.
 * @param {string} columnName The name of the integer column.
 * @returns {object} Migration object.
 */
const randomizeIntToBigInt = (tableName: string, columnName: string) => {
  return {
    async up(queryInterface: QueryInterface, Sequelize: Sequelize) {
      // Up migration is a no-op, as Int can fit in BigInt.
    },

    async down(queryInterface: QueryInterface, Sequelize: Sequelize) {
      const rowsToUpdate: { id: any }[] = await queryInterface.sequelize.query(
        `SELECT id FROM \`${tableName}\` WHERE \`${columnName}\` > ${MAX_INT_32}`,
        { type: QueryTypes.SELECT },
      );

      for (const row of rowsToUpdate) {
        await updateRowWithRetry(
          queryInterface,
          tableName,
          columnName,
          row.id,
          MAX_INT_32,
        );
      }
    },
  };
};

export { randomizeIntToBigInt };
