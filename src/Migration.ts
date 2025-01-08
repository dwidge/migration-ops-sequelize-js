import { QueryInterface, Sequelize } from "sequelize";

export type Migration = {
  up: (queryInterface: QueryInterface, Sequelize: Sequelize) => Promise<void>;
  down: (queryInterface: QueryInterface, Sequelize: Sequelize) => Promise<void>;
};
