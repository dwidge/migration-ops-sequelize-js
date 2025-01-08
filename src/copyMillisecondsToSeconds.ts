import { convertValues } from "./convertValues.js";
import { Migration } from "./Migration.js";

export const copyMillisecondsToSeconds = (
  tableName: string,
  srcColumn: string,
  dstColumn: string,
): Migration =>
  convertValues(
    tableName,
    srcColumn,
    dstColumn,
    `FLOOR(${srcColumn}/1000)`,
    `(${dstColumn}*1000)`,
  );
