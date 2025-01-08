import { pipeline, addConstraint, dropConstraint, ConstraintOptions } from ".";

export const renameConstraint = (
  tableName: string,
  columnName: string,
  oldConstraintNames: string | string[],
  newConstraintNames: string | string[],
  referenceTable: string,
  options?: ConstraintOptions,
) =>
  pipeline([
    dropConstraint(
      tableName,
      columnName,
      oldConstraintNames,
      referenceTable,
      options,
    ),
    addConstraint(
      tableName,
      columnName,
      newConstraintNames,
      referenceTable,
      options,
    ),
  ]);
