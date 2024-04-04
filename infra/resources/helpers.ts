import { Output } from '@pulumi/pulumi';

export function GetImageName(repositoryUrl: Output<string>): Output<string> {
  return repositoryUrl.apply((_value) => `${_value}:latest`);
}
