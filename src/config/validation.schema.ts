import * as Joi from 'joi';

export const validationSchema = Joi.object({
  ENV: Joi.string().valid('local', 'dev', 'qa', 'prod').default('local'),
  APP_PORT: Joi.number().default(3000),
  DB_TYPE: Joi.string().required(),
  BD_PENDIG_USER_TRASVERSAL: Joi.string().required(),
  BD_PENDIG_PASS_TRASVERSAL: Joi.string().required(),
  PENDIG_MONGODB_HOST: Joi.string().required(),
  PENDIG_MONGODB_DB_TRANSVERSALES: Joi.string().required(),
  EVENT_HUB_CONNECTION_S: Joi.string().required(),
  EVENT_HUB_QUEUE: Joi.string().required(),
});
