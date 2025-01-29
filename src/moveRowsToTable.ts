import { QueryInterface, QueryTypes, Sequelize, Transaction } from "sequelize";
import { Migration } from "./Migration.js";

type DbValue = number | string | boolean | null;

/**
 * Represents the possible filter values.
 */
type FilterValue<T extends DbValue> = T | { $not: T };

/**
 * Represents the filter object.
 */
type Filter<T extends Record<string, DbValue>> = {
  [K in keyof T]?: FilterValue<T[K]>;
};

/**
 * Builds a comma-separated list of quoted column names.
 * @param columns An array of column names.
 * @returns A string of quoted column names.
 */
const buildQuotedColumnList = <Schema extends Record<string, DbValue>>(
  columns: (keyof Schema)[],
): string => {
  return columns.map((column) => `\`${column as string}\``).join(", ");
};

/**
 * Builds the WHERE clause conditions and replacements based on a single filter entry.
 * @param key The column name.
 * @param filterValue The filter value.
 * @returns An object containing the condition string and the replacement value.
 */
const buildWhereCondition = <T extends DbValue>(
  key: string,
  filterValue: FilterValue<T>,
): { condition: string; replacement?: any } => {
  if (filterValue === null) {
    return { condition: `\`${key}\` IS NULL` };
  } else if (
    filterValue &&
    typeof filterValue === "object" &&
    "$not" in filterValue
  ) {
    const notValue = filterValue.$not;
    if (notValue === null) {
      return { condition: `\`${key}\` IS NOT NULL` };
    } else {
      return { condition: `\`${key}\` != ?`, replacement: notValue };
    }
  } else if (filterValue !== undefined) {
    return { condition: `\`${key}\` = ?`, replacement: filterValue };
  }
  return { condition: "" }; // Should not happen, but satisfies TS
};

/**
 * Builds the WHERE clause and its replacements based on the filter object.
 *
 * @param filter The filter object.
 * @returns An object containing the WHERE clause string and the replacements array.
 */
const buildWhereClause = <T extends Record<string, DbValue>>(
  filter: Filter<T>,
): { whereClause: string; replacements: any[] } => {
  const conditions: string[] = [];
  const replacements: any[] = [];

  for (const [key, filterValue] of Object.entries(filter)) {
    const { condition, replacement } = buildWhereCondition(key, filterValue);
    if (condition) {
      conditions.push(condition);
      if (replacement !== undefined) {
        replacements.push(replacement);
      }
    }
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  return { whereClause, replacements };
};

/**
 * Executes a SELECT query.
 *
 * @param queryInterface The Sequelize QueryInterface.
 * @param query The SQL query string.
 * @param replacements The replacements for the query.
 * @param transaction The database transaction.
 * @returns An array of selected rows.
 */
const executeSelectQuery = async <Schema extends Record<string, DbValue>>(
  queryInterface: QueryInterface,
  query: string,
  replacements: any[],
  transaction: Transaction,
): Promise<Schema[]> => {
  const rows = await queryInterface.sequelize.query(query, {
    replacements,
    type: QueryTypes.SELECT,
    transaction,
  });
  return rows as Schema[];
};

/**
 * Selects rows from a table based on the provided columns and WHERE clause.
 *
 * @param queryInterface The Sequelize QueryInterface.
 * @param tableName The name of the table to select from.
 * @param columns An array of column names to select.
 * @param whereClause The WHERE clause string.
 * @param replacements The replacements for the WHERE clause.
 * @param transaction The database transaction.
 * @returns An array of selected rows.
 */
const selectRows = async <Schema extends Record<string, DbValue>>(
  queryInterface: QueryInterface,
  tableName: string,
  columns: (keyof Schema)[],
  whereClause: string,
  replacements: any[],
  transaction: Transaction,
): Promise<Schema[]> => {
  const columnNames = buildQuotedColumnList(columns);
  const query = `SELECT ${columnNames} FROM \`${tableName}\` ${whereClause}`;
  return executeSelectQuery<Schema>(
    queryInterface,
    query,
    replacements,
    transaction,
  );
};

/**
 * Builds the values string for an INSERT query.
 * @param values An array of values to insert.
 * @returns a string of question mark placeholders.
 */
const buildValuePlaceholders = (values: any[]): string => {
  return values.map(() => "?").join(", ");
};

/**
 * Executes an INSERT query for a single row.
 *
 * @param queryInterface The Sequelize QueryInterface.
 * @param query The SQL query string.
 * @param replacements The replacements for the query.
 * @param transaction The database transaction.
 */
const executeInsertQuery = async (
  queryInterface: QueryInterface,
  query: string,
  replacements: any[],
  transaction: Transaction,
): Promise<void> => {
  await queryInterface.sequelize.query(query, {
    replacements,
    transaction,
  });
};

/**
 * Inserts rows into a table.
 *
 * @param queryInterface The Sequelize QueryInterface.
 * @param tableName The name of the table to insert into.
 * @param columns An array of column names to insert into.
 * @param values An array of arrays of values to insert.
 * @param transaction The database transaction.
 */
const insertRows = async <Schema extends Record<string, DbValue>>(
  queryInterface: QueryInterface,
  tableName: string,
  columns: (keyof Schema)[],
  values: any[][],
  transaction: Transaction,
): Promise<void> => {
  if (values.length === 0) {
    return;
  }
  const columnNames = buildQuotedColumnList(columns);
  const valuePlaceholders = buildValuePlaceholders(values[0]);
  const query = `INSERT INTO \`${tableName}\` (${columnNames}) VALUES (${valuePlaceholders})`;

  for (const rowValues of values) {
    await executeInsertQuery(queryInterface, query, rowValues, transaction);
  }
};

/**
 * Executes a DELETE query.
 *
 * @param queryInterface The Sequelize QueryInterface.
 * @param query The SQL query string.
 * @param replacements The replacements for the query.
 * @param transaction The database transaction.
 */
const executeDeleteQuery = async (
  queryInterface: QueryInterface,
  query: string,
  replacements: any[],
  transaction: Transaction,
): Promise<void> => {
  await queryInterface.sequelize.query(query, {
    replacements,
    transaction,
  });
};

/**
 * Deletes rows from a table based on the provided WHERE clause.
 *
 * @param queryInterface The Sequelize QueryInterface.
 * @param tableName The name of the table to delete from.
 * @param whereClause The WHERE clause string.
 * @param replacements The replacements for the WHERE clause.
 * @param transaction The database transaction.
 */
const deleteRows = async (
  queryInterface: QueryInterface,
  tableName: string,
  whereClause: string,
  replacements: any[],
  transaction: Transaction,
): Promise<void> => {
  if (whereClause) {
    const query = `DELETE FROM \`${tableName}\` ${whereClause}`;
    await executeDeleteQuery(queryInterface, query, replacements, transaction);
  }
};

/**
 * Extracts values from rows based on specified columns.
 * @param rows An array of row objects.
 * @param columns An array of column names to extract.
 * @returns An array of arrays, where each inner array contains the extracted values for a row.
 */
const extractValuesFromRows = <
  SrcSchema extends Record<string, DbValue>,
  DstSchema extends Record<string, DbValue>,
>(
  rows: SrcSchema[],
  columnMapping: { [K in keyof SrcSchema]?: keyof DstSchema },
): any[][] => {
  const dstColumns = Object.values(columnMapping).filter(
    Boolean,
  ) as (keyof DstSchema)[];
  return rows.map((row) =>
    dstColumns.map(
      (col) => row[columnMapping[col as keyof SrcSchema] as keyof SrcSchema],
    ),
  );
};

/**
 * Map keys of an object.
 * @param obj The source object.
 * @param mapping The mapping object where keys are source keys and values are destination keys.
 * @returns A new object with keys mapped according to the mapping.
 */
const mapKeys = <
  Src extends Record<string, any>,
  Dst extends Record<string, any>,
  Mapping extends { [K in keyof Src]?: keyof Dst },
>(
  obj: Partial<Src>,
  mapping: Mapping,
): Partial<Dst> => {
  const mappedObject: Partial<Dst> = {};
  for (const srcKey in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, srcKey)) {
      const dstKey = mapping[srcKey];
      if (dstKey) {
        mappedObject[dstKey as keyof Dst] = obj[srcKey];
      }
    }
  }
  return mappedObject;
};

/**
 * Builds a reverse filter for the down migration.
 * @param filter The original filter.
 * @param columnMapping The column mapping.
 * @returns A filter for the destination table.
 */
const buildReverseFilter = <
  SrcSchema extends Record<string, DbValue>,
  DstSchema extends Record<string, DbValue>,
>(
  filter: Filter<Pick<SrcSchema, keyof typeof columnMapping>>,
  columnMapping: { [K in keyof SrcSchema]?: keyof DstSchema },
): Filter<DstSchema> => {
  return mapKeys(filter as any, columnMapping);
};

/**
 * Moves rows from one table to another based on the specified column mapping and filter.
 * Deletes the rows from the source table after moving them.
 * Supports filtering for NULL, NOT NULL, and specific values (including "not equal to").
 *
 * @param srcTable - The name of the source table from which rows will be moved.
 * @param dstTable - The name of the destination table to which rows will be moved.
 * @param columnMapping - An object mapping column names from the source table to the destination table.
 * @param filter - An object with key-value pairs used to filter rows from the source table.
 *                 Values can be:
 *                 - A specific value to filter for equality.
 *                 - `{ $not: value }` to filter for values not equal to `value`.
 * @returns An object with up and down methods for migrating rows.
 */
const moveRowsToTable = <
  SrcSchema extends Record<string, DbValue>,
  DstSchema extends Record<string, DbValue>,
>(
  srcTable: string,
  dstTable: string,
  columnMapping: { [K in keyof SrcSchema]?: keyof DstSchema },
  filter: Filter<Pick<SrcSchema, keyof typeof columnMapping>>,
): Migration => {
  return {
    async up(queryInterface: QueryInterface, Sequelize: Sequelize) {
      const transaction = await queryInterface.sequelize.transaction();
      try {
        const { whereClause, replacements } = buildWhereClause(filter);
        const srcColumns = Object.keys(columnMapping) as (keyof SrcSchema)[];
        const dstColumns = Object.values(columnMapping).filter(
          Boolean,
        ) as (keyof DstSchema)[];

        const rowsToMove = await selectRows<SrcSchema>(
          queryInterface,
          srcTable,
          srcColumns,
          whereClause,
          replacements,
          transaction,
        );

        const valuesToInsert = extractValuesFromRows<SrcSchema, DstSchema>(
          rowsToMove,
          columnMapping,
        );

        await insertRows(
          queryInterface,
          dstTable,
          dstColumns,
          valuesToInsert,
          transaction,
        );
        await deleteRows(
          queryInterface,
          srcTable,
          whereClause,
          replacements,
          transaction,
        );

        await transaction.commit();
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    },

    async down(queryInterface: QueryInterface, Sequelize: Sequelize) {
      const transaction = await queryInterface.sequelize.transaction();
      try {
        const downFilter = buildReverseFilter<SrcSchema, DstSchema>(
          filter,
          columnMapping,
        );

        const { whereClause, replacements } = buildWhereClause(downFilter);
        const srcColumns = Object.keys(columnMapping) as (keyof SrcSchema)[];
        const dstColumns = Object.values(columnMapping).filter(
          Boolean,
        ) as (keyof DstSchema)[];

        const rowsToMoveBack = await selectRows<DstSchema>(
          queryInterface,
          dstTable,
          dstColumns,
          whereClause,
          replacements,
          transaction,
        );

        const valuesToInsert = rowsToMoveBack.map((row) => {
          return srcColumns
            .map((srcCol) => {
              const dstCol = columnMapping[srcCol];
              return dstCol !== undefined ? row[dstCol] : undefined;
            })
            .filter((value) => value !== undefined);
        });

        await insertRows(
          queryInterface,
          srcTable,
          srcColumns,
          valuesToInsert,
          transaction,
        );
        await deleteRows(
          queryInterface,
          dstTable,
          whereClause,
          replacements,
          transaction,
        );

        await transaction.commit();
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    },
  };
};

export { moveRowsToTable };
