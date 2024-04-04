import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';

import { CreateFargateRole } from './iam';
import { getProvider } from './provider';
import { CreateFargateSecurityGroup } from './security-groups';
import { getTags } from './tags';
import { CreateEcsCluster } from './ecs';
import Constants from '../constants';

const awsConfig = new pulumi.Config('aws');
const ecsConfig = new pulumi.Config('ecs');

const region = awsConfig.require('region');
const privateSubnets = awsConfig.require('privateSubnets');

const numberNodes = ecsConfig.getNumber('numberNodes');
const containerPort = ecsConfig.requireNumber('containerPort');
const cpu = ecsConfig.require('cpu');
const memory = ecsConfig.require('memory');
const openTelemetryConfig = ecsConfig.require('openTelemetryConfig');

const stack = pulumi.getStack();
const project = pulumi.getProject();
const tags = getTags();

function CreateAutoScaling(
  cluster: aws.ecs.Cluster,
  service: aws.ecs.Service,
  provider: aws.Provider,
): void {
  const ecsTarget = new aws.appautoscaling.Target(
    'ecsTarget',
    {
      serviceNamespace: 'ecs',
      scalableDimension: 'ecs:service:DesiredCount',
      resourceId: pulumi.interpolate`service/${cluster.name}/${service.name}`,
      minCapacity: 1,
      maxCapacity: 5,
    },
    { provider },
  );

  new aws.appautoscaling.Policy(
    'ecsPolicyMemory',
    {
      name: `app-${project}-ecs-policy-memory`,
      policyType: 'TargetTrackingScaling',
      resourceId: ecsTarget.resourceId,
      scalableDimension: ecsTarget.scalableDimension,
      serviceNamespace: ecsTarget.serviceNamespace,
      targetTrackingScalingPolicyConfiguration: {
        predefinedMetricSpecification: {
          predefinedMetricType: 'ECSServiceAverageMemoryUtilization',
        },
        targetValue: 70,
      },
    },
    {
      provider,
    },
  );

  new aws.appautoscaling.Policy(
    'ecsPolicyCpu',
    {
      name: `app-${project}-ecs-policy-cpu`,
      policyType: 'TargetTrackingScaling',
      resourceId: ecsTarget.resourceId,
      scalableDimension: ecsTarget.scalableDimension,
      serviceNamespace: ecsTarget.serviceNamespace,
      targetTrackingScalingPolicyConfiguration: {
        predefinedMetricSpecification: {
          predefinedMetricType: 'ECSServiceAverageCPUUtilization',
        },
        targetValue: 70,
      },
    },
    {
      provider,
    },
  );
}

export function CreateFargate(
  targetGroup: aws.lb.TargetGroup,
  imageUri: pulumi.Output<string>,
): [aws.ecs.Cluster, pulumi.Output<aws.ecs.TaskDefinition>, aws.ecs.Service] {
  const provider = getProvider();
  const securityGroup = CreateFargateSecurityGroup();
  const [executionRole, taskRole] = CreateFargateRole();

  const logGroup = new aws.cloudwatch.LogGroup(
    'logGroup',
    {
      name: `/ecs/td-${project}`,
      retentionInDays: 30,
      tags,
    },
    { provider },
  );

  const cluster = CreateEcsCluster();

  const taskDefinition = pulumi.all([imageUri, logGroup.name, region]).apply(
    ([image, logGroupName, awsRegion]) =>
      new aws.ecs.TaskDefinition(
        `td-${project}`,
        {
          family: `td-${project}`,
          requiresCompatibilities: ['FARGATE'],
          taskRoleArn: taskRole.arn,
          executionRoleArn: executionRole.arn,
          networkMode: 'awsvpc',
          cpu,
          memory,
          containerDefinitions: JSON.stringify([
            {
              name: `${project}`,
              image,
              essential: true,
              portMappings: [
                {
                  containerPort,
                  hostPort: containerPort,
                },
              ],
              environment: [
                { name: 'ENVIRONMENT', value: stack.toUpperCase() },
                {
                  name: 'NODE_ENV',
                  value:
                    stack.toUpperCase() == 'PRD' ? 'production' : 'development',
                },
                { name: 'PORT', value: `${containerPort}` },
                { name: 'AWS_REGION', value: awsRegion },
                {
                  name: 'APP_TITLE',
                  value: Constants.appTitle,
                },
                {
                  name: 'APP_VERSION',
                  value: Constants.appVersion,
                },
                {
                  name: 'APP_DESCRIPTION',
                  value: Constants.appDescription,
                },
                {
                  name: 'APP_PREFIX',
                  value: Constants.appPrefix,
                },
                {
                  name: 'APP_SWAGGER',
                  value: Constants.appSwagger,
                },
              ],
              logConfiguration: {
                logDriver: 'awslogs',
                options: {
                  'awslogs-group': logGroupName,
                  'awslogs-region': region,
                  'awslogs-stream-prefix': 'ecs',
                },
              },
            },
            {
              name: 'aws-otel-collector',
              image: 'amazon/aws-otel-collector',
              essential: true,
              command: ['--config=/etc/ecs/ecs-default-config.yaml'],
              environment: [
                {
                  name: 'AOT_CONFIG_CONTENT',
                  value: openTelemetryConfig,
                },
              ],
              logConfiguration: {
                logDriver: 'awslogs',
                options: {
                  'awslogs-group': logGroupName,
                  'awslogs-region': region,
                  'awslogs-stream-prefix': 'ecs',
                },
              },
              healthCheck: {
                command: ['/healthcheck'],
                interval: 5,
                timeout: 6,
                retries: 5,
                startPeriod: 1,
              },
            },
          ]),
          tags,
        },
        { provider },
      ),
  );

  const service = new aws.ecs.Service(
    `service-${project}`,
    {
      name: `app-${project}-ecs-service`,
      launchType: 'FARGATE',
      taskDefinition: taskDefinition.arn,
      cluster: cluster.arn,
      desiredCount: numberNodes,
      forceNewDeployment: true,
      healthCheckGracePeriodSeconds: 480,
      networkConfiguration: {
        securityGroups: [securityGroup.id],
        subnets: privateSubnets.split(','),
        assignPublicIp: false,
      },
      loadBalancers: [
        {
          targetGroupArn: targetGroup.arn,
          containerName: `${project}`,
          containerPort: containerPort,
        },
      ],
      propagateTags: 'SERVICE',
      tags,
    },
    { provider, dependsOn: [targetGroup] },
  );

  CreateAutoScaling(cluster, service, provider);

  return [cluster, taskDefinition, service];
}
