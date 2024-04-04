import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';

import { getProvider } from './provider';
import { getTags } from './tags';
import { getVpc } from './vpc';
import { CreateAlbSecurityGroup } from './security-groups';

const project = pulumi.getProject();

const awsConfig = new pulumi.Config('aws');
const ecsConfig = new pulumi.Config('ecs');

const containerPort = ecsConfig.requireNumber('containerPort');
const healthCheck = ecsConfig.require('healthCheck');

const publicSubnets = awsConfig.require('publicSubnets');

const provider = getProvider();
const vpc = getVpc();
const tags = getTags();

export function CreateTargetGroup(): [aws.lb.TargetGroup, aws.lb.Listener] {
  const securityGroup = CreateAlbSecurityGroup();

  const alb = new aws.lb.LoadBalancer(
    'AppLoadBalancer',
    {
      name: `app-${project}-alb`,
      internal: true,
      loadBalancerType: 'application',
      securityGroups: [securityGroup.id],
      subnets: publicSubnets.split(','),
      enableDeletionProtection: false,
      tags,
    },
    { provider },
  );

  const targetGroup = new aws.lb.TargetGroup(
    'targetGroup',
    {
      name: `app-${project}-tg`,
      port: containerPort,
      protocol: 'HTTP',
      vpcId: vpc.id,
      targetType: 'ip',
      healthCheck: {
        healthyThreshold: 3,
        interval: 30,
        protocol: 'HTTP',
        matcher: '200',
        timeout: 5,
        path: healthCheck,
        port: `${containerPort}`,
        unhealthyThreshold: 2,
      },
      tags,
    },
    { provider },
  );

  const albListener = new aws.lb.Listener(
    'listenerHttp',
    {
      loadBalancerArn: alb.arn,
      port: 80,
      protocol: 'HTTP',
      defaultActions: [
        {
          type: 'forward',
          targetGroupArn: targetGroup.arn,
        },
      ],
      tags,
    },
    { provider },
  );

  return [targetGroup, albListener];
}
