// Ignore the deep import warnings on the AJSF library
module.exports = {
  packages: {
    "@ajsf/core": {
      ignorableDeepImportMatchers: [/lodash\//, /json-schema-draft-06.json$/],
    },
    "@ajsf/material": {
      ignorableDeepImportMatchers: [/lodash\//],
    },
  },
};
