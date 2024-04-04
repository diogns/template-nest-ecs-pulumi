import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';

import { getProvider } from './provider';
import { getTags } from './tags';
import { getVpc } from './vpc';

const stack = pulumi.getStack();
const project = pulumi.getProject();

const ecsConfig = new pulumi.Config('ecs');
const containerPort = ecsConfig.requireNumber('containerPort');

const provider = getProvider();
const vpc = getVpc();
const tags = getTags();

export function CreateFargateSecurityGroup() {
  const fargateSecurityGroup = new aws.ec2.SecurityGroup(
    'fargateSecurityGroup',
    {
      name: `app-${project}-container.sg`,
      description: `${stack.toUpperCase()} - Container Security Group`,
      vpcId: vpc.id,
      ingress: [
        {
          fromPort: containerPort,
          toPort: containerPort,
          protocol: 'tcp',
          cidrBlocks: [vpc.cidrBlock],
        },
      ],
      egress: [
        {
          fromPort: 0,
          toPort: 0,
          protocol: '-1',
          cidrBlocks: ['0.0.0.0/0'],
          ipv6CidrBlocks: ['::/0'],
        },
      ],
      tags,
    },
    { provider },
  );
  return fargateSecurityGroup;
}

export function CreateAlbSecurityGroup() {
  const albSecurityGroup = new aws.ec2.SecurityGroup(
    'albSecurityGroup',
    {
      name: `app-${project}-alb.sg`,
      description: `${stack.toUpperCase()} - ALB Security Group`,
      vpcId: vpc.id,
      ingress: [
        {
          fromPort: 80,
          toPort: 80,
          protocol: 'tcp',
          cidrBlocks: ['0.0.0.0/0'],
        },
      ],
      egress: [
        {
          fromPort: 0,
          toPort: 0,
          protocol: '-1',
          cidrBlocks: ['0.0.0.0/0'],
        },
      ],
      tags,
    },
    { provider },
  );

  return albSecurityGroup;
}

export function CreateVpcLinkSecurityGroup() {
  const albSecurityGroup = new aws.ec2.SecurityGroup(
    'vpcLinkSecurityGroup',
    {
      name: `app-${project}-vpc-link.sg`,
      description: `${stack.toUpperCase()} - VpcLink Security Group`,
      vpcId: vpc.id,
      ingress: [
        {
          fromPort: 80,
          toPort: 80,
          protocol: 'tcp',
          cidrBlocks: ['0.0.0.0/0'],
        },
      ],
      egress: [
        {
          fromPort: 0,
          toPort: 0,
          protocol: '-1',
          cidrBlocks: ['0.0.0.0/0'],
        },
      ],
      tags,
    },
    { provider },
  );

  return albSecurityGroup;
}
