import {
  pipeline,
  addConstraint,
  dropConstraint,
  ConstraintProps,
  changeColumn,
} from ".";

export const changeKeyColumn = (
  tableName: string,
  columnName: string,
  foreignKeys: ConstraintProps[],
  oldOptions: object,
  newOptions: object,
) =>
  pipeline([
    ...foreignKeys.map((fk) => dropConstraint(...fk)),
    changeColumn(tableName, columnName, oldOptions, newOptions),
    ...foreignKeys.map((fk) => addConstraint(...fk)),
  ]);
