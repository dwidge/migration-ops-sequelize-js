import { QueryInterface, Sequelize } from "sequelize";
import { Migration } from "./Migration.js";

export function renameTable(oldTable: string, newTable: string): Migration {
  return {
    async up(queryInterface: QueryInterface, Sequelize: Sequelize) {
      await queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.renameTable(oldTable, newTable, { transaction });
      });
    },
    async down(queryInterface: QueryInterface, Sequelize: Sequelize) {
      await queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.renameTable(newTable, oldTable, { transaction });
      });
    },
  };
}

interface ColumnAttributes {
  type: any;
  allowNull?: boolean;
  primaryKey?: boolean;
  unique?: boolean | string;
  defaultValue?: any;
  comment?: string;
  autoIncrement?: boolean;
}

type ForeignKeyAttributes = {
  name: string;
  table: string;
  model?: string;
  key: string;
  onUpdate: ForeignKeyAction;
  onDelete: ForeignKeyAction;
};

type ForeignKeyAction = "CASCADE" | "SET NULL" | "RESTRICT" | "NO ACTION";

export interface AddTableOptions {
  timestamps?: boolean;
  createdAt?: string | boolean;
  updatedAt?: string | boolean;
  deletedAt?: string | boolean;
  paranoid?: boolean;
  underscored?: boolean;
  freezeTableName?: boolean;
  tableName?: string;
  schema?: string;
  comment?: string;
  initialAutoIncrement?: string;
  engine?: string;
  charset?: string;
  collate?: string;
  rowFormat?: string;
  indexes?: any[];
  uniqueKeys?: Record<string, { fields: string[] }>;
  [key: string]: any; // Allow other custom options
}

export function addTable(
  tableName: string,
  columns: Record<
    string,
    ColumnAttributes & { references?: ForeignKeyAttributes }
  > = {},
  options: AddTableOptions = {},
): Migration {
  const columnAttributes: Record<string, ColumnAttributes> = {};
  const foreignKeyConstraints: Array<{
    column: string;
    options: ForeignKeyAttributes;
  }> = [];

  for (const columnName in columns) {
    const { references, ...attributes } = columns[columnName];
    columnAttributes[columnName] = attributes;
    if (references)
      foreignKeyConstraints.push({
        column: columnName,
        options: references,
      });
  }

  return {
    async up(queryInterface: QueryInterface, Sequelize: Sequelize) {
      await queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.createTable(tableName, columnAttributes, {
          transaction,
          ...options,
        });

        for (const constraint of foreignKeyConstraints) {
          await queryInterface.addConstraint(tableName, {
            type: "foreign key",
            fields: [constraint.column],
            name: constraint.options.name,
            references: {
              table: constraint.options.table,
              field: constraint.options.key,
            },
            onUpdate: constraint.options.onUpdate,
            onDelete: constraint.options.onDelete,
            transaction,
          });
        }
      });
    },
    async down(queryInterface: QueryInterface, Sequelize: Sequelize) {
      await queryInterface.sequelize.transaction(async (transaction) => {
        // Remove foreign key constraints in reverse order to avoid dependency issues
        for (let i = foreignKeyConstraints.length - 1; i >= 0; i--) {
          await queryInterface.removeConstraint(
            tableName,
            foreignKeyConstraints[i].options.name,
            {
              transaction,
            },
          );
        }

        await queryInterface.dropTable(tableName, { transaction, ...options });
      });
    },
  };
}

export function dropTable(
  tableName: string,
  attributes: Record<string, ColumnAttributes> = {},
  options: AddTableOptions = {},
): Migration {
  const { up, down } = addTable(tableName, attributes, options);
  return { up: down, down: up };
}
