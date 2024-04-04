import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';

import { getProvider } from './provider';
import { getTags } from './tags';

const ecsConfig = new pulumi.Config('ecs');

export function CreateEcsCluster(): aws.ecs.Cluster {
  const provider = getProvider();
  const tags = getTags();
  const clusterName = ecsConfig.require('clusterName');

  const cluster = new aws.ecs.Cluster(
    'ecsCluster',
    {
      name: clusterName,
      settings: [
        {
          name: 'containerInsights',
          value: 'enabled',
        },
      ],
      tags,
    },
    { provider },
  );

  new aws.ecs.ClusterCapacityProviders(
    'ecsClusterCapacityProviders',
    {
      clusterName: cluster.name,
      capacityProviders: ['FARGATE'],
      defaultCapacityProviderStrategies: [
        {
          base: 1,
          weight: 100,
          capacityProvider: 'FARGATE',
        },
      ],
    },
    { provider },
  );

  return cluster;
}
