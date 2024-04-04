import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';

import { getProvider } from './provider';

const awsConfig = new pulumi.Config('aws');

const vpcId = awsConfig.require('vpcId');
const vpcName = awsConfig.require('vpcName');

let vpc: aws.ec2.Vpc;

export function getVpc(): aws.ec2.Vpc {
  if (vpc) return vpc;

  const provider = getProvider();

  vpc = aws.ec2.Vpc.get(vpcName, vpcId, undefined, { provider });

  return vpc;
}
