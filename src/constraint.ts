import { QueryInterface, Sequelize } from "sequelize";
import { ignoreUnknownConstraintError } from "./ignoreUnknownConstraintError";
import { Migration } from "./Migration";

export interface ConstraintOptions {
  onUpdate?: "CASCADE" | "SET NULL" | "RESTRICT";
  onDelete?: "CASCADE" | "SET NULL" | "RESTRICT";
}

export type ConstraintProps = [
  tableName: string,
  columnName: string,
  constraintNames: string | string[],
  referenceTable: string,
  options: ConstraintOptions,
];

function addConstraint(
  tableName: string,
  columnName: string,
  constraintNames: string | string[],
  referenceTable: string,
  { onUpdate = "CASCADE", onDelete = "SET NULL" }: ConstraintOptions = {},
): Migration {
  if (!Array.isArray(constraintNames)) constraintNames = [constraintNames];
  return {
    async up(queryInterface: QueryInterface, Sequelize: Sequelize) {
      await queryInterface.sequelize.transaction(async (transaction) => {
        // Add the constraint
        await queryInterface
          .addConstraint(tableName, {
            fields: [columnName],
            type: "foreign key",
            name: constraintNames[0], // First is canonical
            references: {
              table: referenceTable,
              field: "id",
            },
            onUpdate,
            onDelete,
            transaction,
          })
          .catch((e) => {
            console.log(e);

            console.log("Possible reasons:");
            if (onDelete === "SET NULL")
              console.log(
                "Target column is not nullable, but onDelete === 'SET NULL'",
              );
            console.log(
              "The target column has values not found in reference column",
            );
            console.log(
              "The target and reference columns have different data types or collation",
            );

            throw e;
          });
      });
    },
    async down(queryInterface: QueryInterface, Sequelize: Sequelize) {
      await queryInterface.sequelize.transaction(async (transaction) => {
        // Remove the constraint(s) name variants
        let success = false;
        const errors: Error[] = [];
        for (const constraintName of constraintNames) {
          try {
            await queryInterface.removeConstraint(tableName, constraintName, {
              transaction,
            });
            // console.log(`Removed constraint ${constraintName}.`);
            success = true; // Mark success if at least one expected constraint is removed
          } catch (error) {
            await ignoreUnknownConstraintError(error);
            if (error instanceof Error) errors.push(error);
          }
        }
        if (!success) {
          const allConstraints: string[] = (
            await queryInterface.getForeignKeysForTables([tableName])
          )[tableName];
          throw new Error(
            `Failed to remove any constraints [${constraintNames.join(", ")}] from table (${tableName}). Existing constraints: [${allConstraints.join(", ")}]. Errors: [${errors.join("; ")}]`,
          );
        }
      });
    },
  };
}

function dropConstraint(
  tableName: string,
  columnName: string,
  constraintNames: string | string[],
  referenceTable: string,
  options: ConstraintOptions = {},
): Migration {
  const { up, down } = addConstraint(
    tableName,
    columnName,
    constraintNames,
    referenceTable,
    options,
  );
  return {
    up: down,
    down: up,
  };
}

function dropAllConstraints(tableName: string): Migration {
  return {
    async up(queryInterface: QueryInterface, Sequelize: Sequelize) {
      const constraints = await queryInterface.getForeignKeysForTables([
        tableName,
      ]);
      const constraintNames = constraints[tableName];

      await queryInterface.sequelize.transaction(async (transaction) => {
        for (const constraintName of constraintNames) {
          await queryInterface.removeConstraint(tableName, constraintName, {
            transaction,
          });
        }
      });
    },
    async down(queryInterface: QueryInterface, Sequelize: Sequelize) {},
  };
}

export { addConstraint, dropConstraint, dropAllConstraints };
