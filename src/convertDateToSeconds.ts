import { DataTypes } from "sequelize";
import { addColumn } from "./addColumn.js";
import { copyDateToSeconds } from "./copyDateToSeconds.js";
import { dropColumn } from "./dropColumn.js";
import { Migration } from "./Migration.js";
import { pipeline } from "./pipeline.js";
import { renameColumn } from "./renameColumn.js";

export const convertDateToSeconds = (
  tableName: string,
  columnName: string,
  tmpColumnName = columnName + "Tmp",
): Migration =>
  pipeline([
    addColumn(tableName, tmpColumnName, DataTypes.INTEGER, null),
    copyDateToSeconds(tableName, columnName, tmpColumnName),
    dropColumn(tableName, columnName, DataTypes.DATE, null),
    renameColumn(tableName, tmpColumnName, columnName),
  ]);
