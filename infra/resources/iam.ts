import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';

import { getProvider } from './provider';
import { getTags } from './tags';

const project = pulumi.getProject();
const tags = getTags();

export function CreateFargateRole(): [aws.iam.Role, aws.iam.Role] {
  const provider = getProvider();

  const executionRole = new aws.iam.Role(
    'taskExecutionRole',
    {
      name: `app-${project}-task-execution-role`,
      assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal(
        aws.iam.Principals.EcsTasksPrincipal,
      ),
      tags,
    },
    { provider },
  );

  new aws.iam.RolePolicyAttachment(
    'taskExecutionRoleAttachment',
    {
      role: executionRole,
      policyArn: aws.iam.ManagedPolicy.AmazonECSTaskExecutionRolePolicy,
    },
    { provider },
  );

  const taskRole = new aws.iam.Role(
    'taskRole',
    {
      name: `app-${project}-task-role`,
      assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal(
        aws.iam.Principals.EcsTasksPrincipal,
      ),
      tags,
    },
    { provider },
  );

  new aws.iam.RolePolicy(
    'taskRolePolicy',
    {
      role: taskRole.id,
      policy: {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Action: [
              'logs:CreateLogStream',
              'logs:CreateLogGroup',
              'logs:DescribeLogStreams',
              'logs:PutLogEvents',
            ],
            Resource: '*',
          },
          {
            Effect: 'Allow',
            Action: [
              'xray:PutTraceSegments',
              'xray:PutTelemetryRecords',
              'xray:GetSamplingRules',
              'xray:GetSamplingTargets',
              'xray:GetSamplingStatisticSummaries',
              'cloudwatch:PutMetricData',
              'ec2:DescribeVolumes',
              'ec2:DescribeTags',
              'ssm:GetParameters',
            ],
            Resource: '*',
          },
        ],
      },
    },
    { provider },
  );

  return [executionRole, taskRole];
}
