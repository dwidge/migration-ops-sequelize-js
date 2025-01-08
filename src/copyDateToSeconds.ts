import { convertValues } from "./convertValues.js";
import { Migration } from "./Migration.js";

export const copyDateToSeconds = (
  tableName: string,
  srcColumn: string,
  dstColumn: string,
): Migration =>
  convertValues(
    tableName,
    srcColumn,
    dstColumn,
    `UNIX_TIMESTAMP(${srcColumn})`,
    `FROM_UNIXTIME(${dstColumn})`,
  );
