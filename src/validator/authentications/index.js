const InvariantError = require('../../exceptions/InvariantError');
const {
  PostAuthenticationPayloadSchema,
  PutAuthenticationPayloadSchema,
  DeleteAuthenticationPayloadSchema,
} = require('./schema');

const AuthenticationValidator = {
  validatePostAuthenticationsPayload: (payload) => {
    const { error } = PostAuthenticationPayloadSchema.validate(payload);

    if (error) {
      throw new InvariantError(error.message);
    }
  },
  validatePutAuthenticationsPayload: (payload) => {
    const { error } = PutAuthenticationPayloadSchema.validate(payload);

    if (error) {
      throw new InvariantError(error.message);
    }
  },
  validateDeleteAuthenticationsPayload: (payload) => {
    const { error } = DeleteAuthenticationPayloadSchema.validate(payload);

    if (error) {
      throw new InvariantError(error.message);
    }
  },
};

module.exports = AuthenticationValidator;
