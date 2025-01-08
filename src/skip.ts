import { QueryInterface, Sequelize } from "sequelize";

function skip(): {
  up: (queryInterface: QueryInterface, Sequelize: Sequelize) => Promise<void>;
  down: (queryInterface: QueryInterface, Sequelize: Sequelize) => Promise<void>;
} {
  return {
    up: async () => {},
    down: async () => {},
  };
}

export { skip };
