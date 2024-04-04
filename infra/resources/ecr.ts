import * as aws from '@pulumi/aws';
import * as awsx from '@pulumi/awsx';
import * as pulumi from '@pulumi/pulumi';
import { Output } from '@pulumi/pulumi';

import { getProvider } from './provider';
import { getTags } from './tags';

const stack = pulumi.getStack();
const project = pulumi.getProject();

export function CreateEcr(): Output<string> {
  const repositoryName = `app-${project}-ecr-${stack}`;
  const prod_retention_count = 10;
  const image_retention_days = 30;
  const provider = getProvider();
  const tags = getTags();

  const rules: awsx.types.input.ecr.LifecyclePolicyRuleArgs[] = [];

  if (stack === 'prd')
    rules.push({
      description: `Keep ${prod_retention_count} ${stack} images`,
      tagStatus: 'any',
      maximumNumberOfImages: prod_retention_count,
    });
  else
    rules.push({
      description: `Expire images older than ${image_retention_days} days`,
      tagStatus: 'any',
      maximumAgeLimit: image_retention_days,
    });

  const repository = new awsx.ecr.Repository(
    'ecrRepository',
    {
      name: repositoryName,
      forceDelete: true,
      imageScanningConfiguration: {
        scanOnPush: true,
      },
      tags,
      lifecyclePolicy: {
        rules,
      },
    },
    {
      provider,
    },
  );

  new aws.ecr.RepositoryPolicy(
    'ecrPolicy',
    {
      repository: repositoryName,
      policy: `{
            "Version": "2008-10-17",
            "Statement": [
                {
                  "Sid": "AllowCrossAccountPush",
                  "Effect": "Allow",
                  "Principal": {
                      "AWS": "arn:aws:iam::587279634644:root"
                  },
                  "Action": [
                      "ecr:BatchCheckLayerAvailability",
                      "ecr:CompleteLayerUpload",
                      "ecr:InitiateLayerUpload",
                      "ecr:PutImage",
                      "ecr:UploadLayerPart"
                  ]
              }
            ]
        }
        `,
    },
    {
      provider,
      dependsOn: [repository],
    },
  );

  const repositoryUrl = repository.repository.repositoryUrl;

  return repositoryUrl;
}
