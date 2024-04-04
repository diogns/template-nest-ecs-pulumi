# template-ms

## Prerequisites
Project needs following technologies installed on your PC:

NodeJS: https://nodejs.org/es
NestJS: https://nestjs.com/
Yarn: https://yarnpkg.com/

## Project startup
To install project dependencies run command:

```sh
yarn install
```

To launch project with nestjs run command:

```sh
yarn start:dev
```
url: http://localhost:3000/template-ms

To launch project tests run command:
```sh
yarn test #unit test without coverage
yarn test:cov #unit test with coverage
yarn test:e2e #end to end test without coverage
yarn test:e2ecov #end to end test with coverage
```

## Additional support technologies

### Swagger
Documentation: https://docs.nestjs.com/openapi/introduction
Url: http://localhost:3000/template-ms/docs

### Husky
Documentation: https://github.com/typicode/husky

#### Rule description:
type[ambit]: description

type: mandatory. feat, fix, doc, build
ambit: optional. In mono repositories indicate package name affected. ex: @auna\vds-core, @auna\vds-angular.
description: mandatory. imperative text that briefly explain code changes. ex: add unit tests. delete innecesaries files.

#### Example:
```sh
git add .
git commit -m 'feat: Modify readme'
git push
```

### Code artifact
documentation: https://aunadigital.atlassian.net/wiki/spaces/podccp/pages/206438401/Code+Artifact

1. Set up credentials of AWS with access key, secret key and token of auna-devops account (id: 587279634644)
2. To authenticate with Code Arifact run command:
```sh
bash ci/codeartifact.sh npm-all
```

### Healthcheck
documentation: https://docs.nestjs.com/recipes/terminus
url: http://localhost:3000/template-ms/healthcheck

### Pulumi
To execute pulumi in localhost with sandox account, run commands:
```sh
pulumi login s3://corecomponentpulumistack/{folder-project} #especify a new folder for pulumi files inside existing bucket S3
pulumi stack select ${environment-name} --cwd infra --non-interactive --create #Select a stack (environment) if not exists it creates a new one, also creates a custom password to authorize any action with pulumi
pulumi refresh #optional, for retrieve changes updated from AWS
pulumi preview --cwd infra --diff #to run IAC to check errors, not deploy yet
pulumi up --yes --cwd infra #to run and deploy IAC in AWS
pulumi destroy --yes --cwd infra #to delete resources from AWS
pulumi stack rm --yes --cwd infra # to delete stack
```

#### Pulumi yaml example
```sh
encryptionsalt: v1:Y5ESfTpA9NM=:v1:mzffuWnIIUKrol8p:196iz/cnHw5+xPFHGPdWR0KBpsaGLA==
config:
  aws:region: us-east-1
  aws:vpcId: vpc-0294da7e1df28dd7a
  aws:vpcName: project-vpc
  aws:assumeRole: arn:aws:iam::000000000:role/iac
  aws:sessionName: sandbox
  aws:publicSubnets: subnet-008a54d85faf51393,subnet-02e2e3e1fbcf2504e,subnet-0c4250d49d79fe834
  aws:privateSubnets: subnet-01d2647bb3e85aa4b,subnet-061085e4712637206,subnet-0f9d4e8e083fe1712
  aws:providerName: PrivilegedArqDigital
  aws:projectName: template-ms
  aws:projectRepository: https://git.auna.pe/omnichannel/template-ms
  aws:projectArea: AunaDigital
  aws:projectTeam: 'PODARQ'
  aws:costCenter: 5010211032
  ecs:containerPort: 80
  ecs:healthCheck: /templaes-ms/healthcheck
  ecs:cpu: 512
  ecs:memory: 1024
  ecs:openTelemetryConfig: "extensions:\n  health_check:\n\nreceivers:\n  otlp:\n    protocols:\n      grpc:\n        endpoint: 0.0.0.0:4317\n      http:\n        endpoint: 0.0.0.0:4318\n\nprocessors:\n  batch:\n    timeout: 60s\n  batch/traces:\n    timeout: 1s\n    send_batch_size: 50\n  resourcedetection:\n    detectors:\n      - env\n      - system\n      - ecs\n      - ec2\n\nexporters:\n  awsxray:\n  awsemf:\n    dimension_rollup_option: 1\n    resource_to_telemetry_conversion:\n        enabled: true\n\nservice:\n  extensions:\n    - health_check  \n\n  pipelines:\n    traces:\n      receivers:\n        - otlp\n      processors:\n        - resourcedetection\n        - batch/traces\n      exporters:\n        - awsxray\n\n    metrics:\n      receivers: \n        - otlp\n      processors: \n        - batch\n      exporters: \n        - awsemf\n        \n  telemetry:\n    logs:\n      level: debug"
  ecs:clusterName: template-ms-ecs-cluster
  api:audience: 
  api:issuerUrl: 
```