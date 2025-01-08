"use strict";

const catchError =
  (code = "catchErrorE1") =>
  (e) => {
    console.log(code, e);
    throw e;
  };
exports.catchError = catchError;
