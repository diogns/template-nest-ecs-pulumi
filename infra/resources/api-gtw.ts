import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';

import { getProvider } from './provider';
import { getTags } from './tags';
import { CreateVpcLinkSecurityGroup } from './security-groups';
import Constants from '../constants';

const project = pulumi.getProject();
const stack = pulumi.getStack();

const awsConfig = new pulumi.Config('aws');

const privateSubnets = awsConfig.require('privateSubnets');

const provider = getProvider();
const tags = getTags();

export function CreateApiGateway(
  listenerArn: pulumi.Output<string>,
): aws.apigatewayv2.Api {
  const apiGateway = new aws.apigatewayv2.Api(
    'httpApiGateway',
    {
      name: `app-${project}-api-gateway-http`,
      protocolType: 'HTTP',
      corsConfiguration: {
        allowHeaders: ['*'],
        allowMethods: ['*'],
        allowOrigins: ['*'],
      },
      tags,
    },
    { provider },
  );

  const securityGroup = CreateVpcLinkSecurityGroup();

  const vpcLink = new aws.apigatewayv2.VpcLink(
    'vpcLink',
    {
      name: `app-${project}-vpc-link`,
      securityGroupIds: [securityGroup.id],
      subnetIds: privateSubnets.split(','),
      tags,
    },
    { provider },
  );

  if (Constants.apiGatewayUseLambdaAuthorizer)
    addMethods(apiGateway, listenerArn, vpcLink);
  else addMethodAny(apiGateway, listenerArn, vpcLink);

  const logGroup = new aws.cloudwatch.LogGroup(
    'apiGatewayLogGroup',
    {
      name: `app-${project}-api-gateway-log-${stack}`,
      retentionInDays: 14,
      tags,
    },
    { provider },
  );

  const accessLogFormat = JSON.stringify({
    requestId: '$context.requestId',
    ip: '$context.identity.sourceIp',
    caller: '$context.identity.caller',
    user: '$context.identity.user',
    requestTime: '$context.requestTime',
    httpMethod: '$context.httpMethod',
    resourcePath: '$context.resourcePath',
    status: '$context.status',
    protocol: '$context.protocol',
    responseLength: '$context.responseLength',
  });

  new aws.apigatewayv2.Stage(
    'apiStage',
    {
      apiId: apiGateway.id,
      name: '$default',
      autoDeploy: true,
      defaultRouteSettings: {
        detailedMetricsEnabled: true,
        throttlingBurstLimit: 5000,
        throttlingRateLimit: 10000,
      },
      accessLogSettings: {
        destinationArn: logGroup.arn,
        format: accessLogFormat,
      },
    },
    { provider, dependsOn: [apiGateway] },
  );

  return apiGateway;
}

const addMethodAny = (
  apiGateway: aws.apigatewayv2.Api,
  listenerArn: pulumi.Output<string>,
  vpcLink: aws.apigatewayv2.VpcLink,
) => {
  const apiIntegration = new aws.apigatewayv2.Integration(
    'vpcLinkIntegration',
    {
      apiId: apiGateway.id,
      integrationType: 'HTTP_PROXY',
      integrationUri: listenerArn,
      integrationMethod: 'ANY',
      connectionType: 'VPC_LINK',
      connectionId: vpcLink.id,
    },
    { provider, dependsOn: [vpcLink, apiGateway] },
  );

  const apiRouteArgs = {
    apiId: apiGateway.id,
    routeKey: 'ANY /{proxy+}',
    target: pulumi.interpolate`integrations/${apiIntegration.id}`,
  };

  const apiRouteDepends: any = [apiIntegration, apiGateway];

  new aws.apigatewayv2.Route('apiRoute', apiRouteArgs, {
    provider,
    dependsOn: apiRouteDepends,
  });
};

const addMethods = (
  apiGateway: aws.apigatewayv2.Api,
  listenerArn: pulumi.Output<string>,
  vpcLink: aws.apigatewayv2.VpcLink,
) => {
  const methods = Constants.apiGatewayMethods;

  const apiIntegration = new aws.apigatewayv2.Integration(
    'vpcLinkIntegration',
    {
      apiId: apiGateway.id,
      integrationType: 'HTTP_PROXY',
      integrationUri: listenerArn,
      integrationMethod: 'ANY',
      connectionType: 'VPC_LINK',
      connectionId: vpcLink.id,
    },
    { provider, dependsOn: [vpcLink, apiGateway] },
  );

  const authorizer = new aws.apigatewayv2.Authorizer(
    Constants.lambdaAuthorizer.name,
    {
      apiId: apiGateway.id,
      name: Constants.lambdaAuthorizer.name,
      authorizerType: Constants.lambdaAuthorizer.type,
      authorizerResultTtlInSeconds:
        Constants.lambdaAuthorizer.resultTtlInSeconds,
      identitySources: Constants.lambdaAuthorizer.identitySource,
      authorizerUri: Constants.lambdaAuthorizer.uri,
      authorizerPayloadFormatVersion:
        Constants.lambdaAuthorizer.authorizerPayloadFormatVersion,
    },
    { provider },
  );

  methods.forEach((item) => {
    const apiRouteArgs = {
      apiId: apiGateway.id,
      routeKey: item.routeKey,
      target: pulumi.interpolate`integrations/${apiIntegration.id}`,
      authorizerId: item.useAuthorizer ? authorizer.id : undefined,
      authorizationType: item.useAuthorizer
        ? Constants.lambdaAuthorizer.authorizationType.CUSTOM
        : Constants.lambdaAuthorizer.authorizationType.NONE,
    };

    const apiRouteDepends: any = [apiIntegration, apiGateway, authorizer];

    new aws.apigatewayv2.Route(item.routeName, apiRouteArgs, {
      provider,
      dependsOn: apiRouteDepends,
    });
  });
};
