'use strict';

const { badRequest } = require('../utils/response');

/**
 * Validates req.body against a Joi schema.
 * Usage: validate(joiSchema)
 */
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    const errors = error.details.map((d) => d.message);
    return badRequest(res, 'Validasi gagal', errors);
  }
  next();
};

module.exports = { validate };
