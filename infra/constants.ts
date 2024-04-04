import * as pulumi from '@pulumi/pulumi';
import { Parameters } from '../src/helpers/parameters';
import { VersionApi } from '../src/helpers/constants';

export default class Constants {
  private static config: { [key: string]: pulumi.Config } = {};

  private static getConfig(configName: string): pulumi.Config {
    if (!this.config[configName]) {
      this.config[configName] = new pulumi.Config(configName);
    }

    return this.config[configName];
  }

  static get project() {
    return pulumi.getProject();
  }

  static get appTitle() {
    return this.getConfig('app').require('appTitle');
  }

  static get appVersion() {
    return this.getConfig('app').require('appVersion');
  }

  static get appDescription() {
    return this.getConfig('app').require('appDescription');
  }

  static get appPrefix() {
    return this.getConfig('app').require('appPrefix');
  }

  static get appSwagger() {
    return this.getConfig('app').require('appSwagger');
  }

  static get apiGatewayUseLambdaAuthorizer() {
    return this.getConfig('apigwt').requireBoolean('useLambdaAuthorizer');
  }

  static get apiGatewayLambdaAuthorizerUri() {
    return this.getConfig('apigwt').require('lambdaAuthorizerUri');
  }

  static get lambdaAuthorizer() {
    return {
      name: `${this.project}-api-gtw-authorizer`,
      type: 'REQUEST',
      resultTtlInSeconds: 0,
      identitySource: [
        '$request.header.aws-x-source',
        '$request.header.aws-x-authorization',
      ],
      uri: this.apiGatewayLambdaAuthorizerUri,
      authorizationType: {
        CUSTOM: 'CUSTOM',
        NONE: 'NONE',
      },
      authorizerPayloadFormatVersion: '1.0',
    };
  }

  static get apiGatewayMethods() {
    return [
      {
        routeName: 'apiUserPOST',
        routeKey: `POST /${Parameters.appPrefix}/${VersionApi.v1}/user`,
        useAuthorizer: true,
      },
      {
        routeName: 'apiUserPUT',
        routeKey: `PUT /${Parameters.appPrefix}/${VersionApi.v1}/user`,
        useAuthorizer: true,
      },
      {
        routeName: 'apiUserPATCH',
        routeKey: `PATCH /${Parameters.appPrefix}/${VersionApi.v1}/user/{proxy+}`,
        useAuthorizer: true,
      },
      {
        routeName: 'apiUserDELETE',
        routeKey: `DELETE /${Parameters.appPrefix}/${VersionApi.v1}/user/{proxy+}`,
        useAuthorizer: true,
      },
      {
        routeName: 'apiUserListGET',
        routeKey: `GET /${Parameters.appPrefix}/${VersionApi.v1}/user/list`,
        useAuthorizer: true,
      },
      {
        routeName: 'apiUserGET',
        routeKey: `GET /${Parameters.appPrefix}/${VersionApi.v1}/user/{proxy+}`,
        useAuthorizer: true,
      },
      {
        routeName: 'apiUserOPTIONS',
        routeKey: `OPTIONS /${Parameters.appPrefix}/${VersionApi.v1}/user`,
        useAuthorizer: false,
      },
      {
        routeName: 'apiUserOPTIONS',
        routeKey: `OPTIONS /${Parameters.appPrefix}/${VersionApi.v1}/user/{proxy+}`,
        useAuthorizer: false,
      },
      {
        routeName: 'apiUserOPTIONS',
        routeKey: `OPTIONS /${Parameters.appPrefix}/${VersionApi.v1}/user/list`,
        useAuthorizer: false,
      },
      {
        routeName: 'apiRouteHealthCheck',
        routeKey: `GET /${Parameters.appPrefix}/healthcheck`,
        useAuthorizer: false,
      },
      {
        routeName: 'apiRouteSwagger',
        routeKey: `GET /${Parameters.appPrefix}/docs/{proxy+}`,
        useAuthorizer: false,
      },
    ];
  }
}
