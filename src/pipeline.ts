import { QueryInterface, Sequelize } from "sequelize";
import { Migration } from "./Migration.js";

/**
 * Creates a pipeline to apply migration helpers in order.
 * @param {Migration[]} migrations An array of migration helper functions.
 * @returns {object} An object containing the up and down functions.
 */
const pipeline = (migrations: Migration[]) => {
  return {
    async up(queryInterface: QueryInterface, Sequelize: Sequelize) {
      const results: Migration[] = [];
      try {
        for (const migration of migrations) {
          await migration.up(queryInterface, Sequelize);
          results.push(migration);
        }
      } catch (error) {
        // Rollback if any migration fails
        for (const migration of results.reverse()) {
          try {
            await migration.down(queryInterface, Sequelize);
          } catch (rollbackError) {
            console.error("Rollback failed for migration:", rollbackError);
          }
        }
        throw error;
      }
    },

    async down(queryInterface: QueryInterface, Sequelize: Sequelize) {
      const results: Migration[] = [];
      try {
        for (const migration of migrations.reverse()) {
          await migration.down(queryInterface, Sequelize);
          results.push(migration);
        }
      } catch (error) {
        // Rollback if any migration fails
        for (const migration of results.reverse()) {
          try {
            await migration.up(queryInterface, Sequelize);
          } catch (rollbackError) {
            console.error("Rollback failed for migration:", rollbackError);
          }
        }
        throw error;
      }
    },
  };
};

export { pipeline };
