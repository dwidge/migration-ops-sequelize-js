"use strict";

const { UnknownConstraintError, Sequelize } = require("sequelize");
const ignoreUnknownConstraintError = (e) => {
  if (!(e instanceof UnknownConstraintError)) throw e;
};
exports.ignoreUnknownConstraintError = ignoreUnknownConstraintError;

const ignoreDupKeyError = (e) => {
  if (!(e instanceof DatabaseError && e.parent.code === "ER_DUP_KEY")) throw e;
};
exports.ignoreDupKeyError = ignoreDupKeyError;
