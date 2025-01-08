import { DataTypes } from "sequelize";
import { addColumn } from "./addColumn.js";
import { copyMillisecondsToSeconds } from "./copyMillisecondsToSeconds.js";
import { dropColumn } from "./dropColumn.js";
import { Migration } from "./Migration.js";
import { pipeline } from "./pipeline.js";
import { renameColumn } from "./renameColumn.js";

export const convertMillisecondsToSeconds = (
  tableName: string,
  columnName: string,
  tmpColumnName = columnName + "Tmp",
): Migration =>
  pipeline([
    addColumn(tableName, tmpColumnName, DataTypes.INTEGER, null),
    copyMillisecondsToSeconds(tableName, columnName, tmpColumnName),
    dropColumn(tableName, columnName, DataTypes.INTEGER, null),
    renameColumn(tableName, tmpColumnName, columnName),
  ]);
