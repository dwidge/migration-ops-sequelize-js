import { DataTypes } from "sequelize";
import { addColumn } from "./addColumn.js";
import { copyStringToDate } from "./copyStringToDate.js";
import { dropColumn } from "./dropColumn.js";
import { Migration } from "./Migration.js";
import { pipeline } from "./pipeline.js";
import { renameColumn } from "./renameColumn.js";

export const convertStringToDate = (
  tableName: string,
  columnName: string,
  format = "%Y-%m-%d %H:%i:%s",
  tmpColumnName = columnName + "Tmp",
): Migration =>
  pipeline([
    addColumn(tableName, tmpColumnName, DataTypes.DATE, null),
    copyStringToDate(tableName, columnName, tmpColumnName, format),
    dropColumn(tableName, columnName, DataTypes.STRING, null),
    renameColumn(tableName, tmpColumnName, columnName),
  ]);
