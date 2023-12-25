import { EksCluster } from '@cdktf/provider-aws/lib/eks-cluster';
import { Fn } from 'cdktf';
import { Construct } from 'constructs';
import { IamRoleConstruct } from './iam-role';
import { EksConstructConfig } from './interface';

export class EksConstruct extends Construct {
  constructor(scope: Construct, id: string, private opts: Partial<EksConstructConfig>) {
    super(scope, id);

    const { name, tags, securityGroupIds } = this.opts;

    const controlPlaneRole = new IamRoleConstruct(this, 'iam-role', {
      name,
      tags,
    });

    new EksCluster(this, 'eks-cluster', {
      name: this.getEksClusterName(),
      roleArn: controlPlaneRole.arn,

      version: '1.28',
      vpcConfig: {
        endpointPrivateAccess: true,
        endpointPublicAccess: true,
        securityGroupIds,
        subnetIds: Fn.tolist(this.opts.subnetIds),
      },
      tags: {
        ...tags,
        Name: this.getEksClusterName(),
      },
    });


  }

  getEksClusterName() {
    return this.opts.name ?? 'eks-cluster';
  }
}