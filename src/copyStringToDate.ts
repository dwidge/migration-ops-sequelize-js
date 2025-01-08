import { convertValues } from "./convertValues.js";
import { Migration } from "./Migration.js";

export const copyStringToDate = (
  tableName: string,
  srcColumn: string,
  dstColumn: string,
  format = "%Y-%m-%d %H:%i:%s",
): Migration =>
  convertValues(
    tableName,
    srcColumn,
    dstColumn,
    `STR_TO_DATE(${srcColumn}, '${format}')`,
    `DATE_FORMAT(${dstColumn}, '${format}')`,
  );
