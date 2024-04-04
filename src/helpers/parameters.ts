export class Parameters {
  static get appTitle() {
    return process.env.APP_TITLE || 'template-ms';
  }

  static get appVersion() {
    return process.env.APP_VERSION || '1.0.0';
  }

  static get appDescription() {
    return process.env.APP_DESCRIPTION || 'Auna microservices template project';
  }

  static get appPrefix() {
    return process.env.APP_PREFIX || 'template-ms';
  }

  static get appSwagger() {
    return process.env.APP_SWAGGER || 'docs';
  }

  static get awsRegion() {
    return process.env.AWS_REGION || 'us-east-1';
  }

  static get environment() {
    return process.env.ENVIRONMENT || 'local';
  }

  static get port() {
    return process.env.PORT || '3000';
  }
}
