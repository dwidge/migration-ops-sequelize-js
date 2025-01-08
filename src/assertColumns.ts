import assert from "assert";
import { DataTypes, QueryInterface, Sequelize } from "sequelize";

/**
 * Asserts columns exist in a table with specific types, default values, and optional foreign key constraints.
 *
 * @param {string} tableName The name of the table.
 * @param {Record<string, {
 *   type: DataTypes.AbstractDataType;
 *   allowNull?: boolean;
 *   primaryKey?: boolean;
 *   defaultValue?: any;
 *   references?: {
 *     name: string;
 *     table: string;
 *     model: string;
 *     key: string;
 *     onUpdate?: string;
 *     onDelete?: string;
 *   };
 * }>} columnDefinitions An object where keys are column names and values are column definition objects.
 *   - type: The expected Sequelize data type (e.g., DataTypes.INTEGER, DataTypes.STRING).
 *   - allowNull: The expected allowNull value.
 *   - primaryKey: The expected primaryKey value.
 *   - defaultValue: The expected default value of the column.
 *     Use `null` for an explicit NULL default.
 *     Use `undefined` or omit if no default value is expected.
 *   - references: Optional object defining foreign key constraints.
 *     - name: The name of the foreign key constraint.
 *     - table: The name of the referenced table.
 *     - model: The name of the referenced model.
 *     - key: The name of the referenced column.
 *     - onUpdate: The expected ON UPDATE rule (e.g., 'CASCADE', 'SET NULL', 'RESTRICT').
 *     - onDelete: The expected ON DELETE rule (e.g., 'CASCADE', 'SET NULL', 'RESTRICT').
 * @returns {object} Migration object.
 */
function assertColumns(
  tableName: string,
  columnDefinitions: Record<
    string,
    {
      type: DataTypes.AbstractDataType;
      allowNull?: boolean;
      primaryKey?: boolean;
      defaultValue?: any;
      references?: {
        name: string;
        table: string;
        model: string;
        key: string;
        onUpdate?: string;
        onDelete?: string;
      };
    }
  >,
): {
  up: (queryInterface: QueryInterface, Sequelize: Sequelize) => Promise<void>;
  down: (queryInterface: QueryInterface, Sequelize: Sequelize) => Promise<void>;
} {
  const check = async (queryInterface: QueryInterface) => {
    const tableDescription = await queryInterface.describeTable(tableName);
    const foreignKeyReferences: {
      constraintName: string;
      columnName: string;
      referencedTableName: string;
      referencedColumnName: string;
      onUpdate?: string;
      onDelete?: string;
    }[] = (await queryInterface.getForeignKeyReferencesForTable(
      tableName,
    )) as [];
    assert(Array.isArray(foreignKeyReferences));

    for (const columnName in columnDefinitions) {
      if (!columnDefinitions.hasOwnProperty(columnName)) {
        continue;
      }
      const columnDefinition = columnDefinitions[columnName];
      const {
        type: expectedType,
        defaultValue: expectedDefaultValue,
        references,
        allowNull: expectedAllowNull,
        primaryKey: expectedPrimaryKey,
      } = columnDefinition;

      if (!tableDescription.hasOwnProperty(columnName)) {
        throw new Error(
          `assertColumnsE1: Column '${columnName}' does not exist in table '${tableName}'.`,
        );
      }

      const columnInfo = tableDescription[columnName];

      // Type check
      const actualTypeKey = columnInfo.type
        .match(/^([^(]+)/)?.[1]
        .toUpperCase();
      const expectedTypeKey = expectedType.key.toUpperCase();

      if (actualTypeKey !== expectedTypeKey) {
        if (
          !(
            (expectedTypeKey === "INTEGER" && actualTypeKey === "INT") ||
            (expectedTypeKey === "STRING" && actualTypeKey === "VARCHAR") ||
            (expectedTypeKey === "TEXT" && actualTypeKey === "MEDIUMTEXT") ||
            (expectedTypeKey === "BOOLEAN" && actualTypeKey === "TINYINT")
          )
        ) {
          throw new Error(
            `assertColumnsE2: Column '${columnName}' in table '${tableName}' has type '${actualTypeKey}', expected '${expectedTypeKey}'.`,
          );
        }
      }

      // Allow Null check
      if (
        expectedAllowNull !== undefined &&
        columnInfo.allowNull !== expectedAllowNull
      ) {
        throw new Error(
          `assertColumnsE12: Column '${columnName}' in table '${tableName}' has allowNull '${columnInfo.allowNull}', expected '${expectedAllowNull}'.`,
        );
      }

      // Primary Key check
      if (
        expectedPrimaryKey !== undefined &&
        columnInfo.primaryKey !== expectedPrimaryKey
      ) {
        throw new Error(
          `assertColumnsE13: Column '${columnName}' in table '${tableName}' has primaryKey '${columnInfo.primaryKey}', expected '${expectedPrimaryKey}'.`,
        );
      }

      // Default value check, handling the Sequelize/DB quirk
      const actualDefaultValue = columnInfo.defaultValue;
      const actualAllowNull = columnInfo.allowNull;

      if (expectedDefaultValue === undefined) {
        // Expecting no default value
        if (actualDefaultValue != null) {
          throw new Error(
            `assertColumnsE3: Column '${columnName}' in table '${tableName}' should have no default value, but has default '${actualDefaultValue}'.`,
          );
        }
      } else if (expectedDefaultValue === null) {
        // Expecting an explicit NULL default
        if (actualDefaultValue !== null) {
          throw new Error(
            `assertColumnsE4: Column '${columnName}' in table '${tableName}' has default value '${actualDefaultValue}', expected 'null'.`,
          );
        }
        if (actualAllowNull !== true) {
          throw new Error(
            `assertColumnsE5: Column '${columnName}' in table '${tableName}' with default 'null' should have allowNull: true.`,
          );
        }
      } else {
        // Expecting a specific non-null default value
        if (actualDefaultValue !== expectedDefaultValue) {
          throw new Error(
            `assertColumnsE6: Column '${columnName}' in table '${tableName}' has default value '${actualDefaultValue}', expected '${expectedDefaultValue}'.`,
          );
        }
        if (actualAllowNull === true && expectedDefaultValue !== null) {
          console.warn(
            `assertColumnsW1: Column '${columnName}' in table '${tableName}' is allowNull and has a non-null default value. Consider if this is intentional.`,
          );
        }
      }

      // Foreign key check
      if (references) {
        const {
          name: fkName,
          table: refTable,
          key: refColumn,
          onUpdate,
          onDelete,
        } = references;
        const foundForeignKey = foreignKeyReferences.find(
          (fk) => fk.constraintName === fkName,
        );

        if (!foundForeignKey) {
          throw new Error(
            `assertColumnsE7: Foreign key constraint '${fkName}' does not exist on table '${tableName}'.`,
          );
        }

        if (foundForeignKey.referencedTableName !== refTable) {
          throw new Error(
            `assertColumnsE8: Foreign key constraint '${fkName}' on table '${tableName}' references table '${foundForeignKey.referencedTableName}', expected '${refTable}'.`,
          );
        }

        if (foundForeignKey.referencedColumnName !== refColumn) {
          throw new Error(
            `assertColumnsE9: Foreign key constraint '${fkName}' on table '${tableName}' references column '${foundForeignKey.referencedColumnName}' in table '${refTable}', expected '${refColumn}'.`,
          );
        }

        if (
          onUpdate !== undefined &&
          foundForeignKey.onUpdate !== undefined &&
          foundForeignKey.onUpdate !== onUpdate.replace("_", " ")
        ) {
          throw new Error(
            `assertColumnsE10: Foreign key constraint '${fkName}' on table '${tableName}' has onUpdate rule '${foundForeignKey.onUpdate}', expected '${onUpdate}'.`,
          );
        }

        if (
          onDelete !== undefined &&
          foundForeignKey.onDelete !== undefined &&
          foundForeignKey.onDelete !== onDelete.replace("_", " ")
        ) {
          throw new Error(
            `assertColumnsE11: Foreign key constraint '${fkName}' on table '${tableName}' has onDelete rule '${foundForeignKey.onDelete}', expected '${onDelete}'.`,
          );
        }
      }
    }
  };

  return {
    up: check,
    down: check,
  };
}

export { assertColumns };
