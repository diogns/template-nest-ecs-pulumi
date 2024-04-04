import * as pulumi from '@pulumi/pulumi';

const awsConfig = new pulumi.Config('aws');
const projectArea = awsConfig.require('projectArea');
const costCenter = awsConfig.require('costCenter');
const projectName = awsConfig.require('projectName');
const projectRepository = awsConfig.require('projectRepository');
const projectTeam = awsConfig.require('projectTeam');
const stack = pulumi.getStack();

export function getTags(): { [key: string]: string } {
  return {
    CostCenter: costCenter,
    Project: projectName,
    Area: projectArea,
    Team: projectTeam,
    Environment: stack.charAt(0).toUpperCase() + stack.slice(1),
    Source: projectRepository,
  };
}
