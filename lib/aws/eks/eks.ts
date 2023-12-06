import { EksCluster } from '@cdktf/provider-aws/lib/eks-cluster';
import { Fn } from 'cdktf';
import { Construct } from 'constructs';
import { ClusterSecurityGroupConstruct } from './cluster-sg';
import { IamRoleConstruct } from './iam-role/iam-role';
import { EksConstructConfig } from './interface';

export class EksConstruct extends Construct {
  constructor(scope: Construct, id: string, private opts: Partial<EksConstructConfig>) {
    super(scope, id);

    const { tags, vpcId } = this.opts;

    const controlPlaneRole = new IamRoleConstruct(this, 'iam-role', {
      name: 'control-plane-role',
      tags,
    });

    const clusterSg = new ClusterSecurityGroupConstruct(this, 'cluster-sg', {
      name: 'cluster-sg',
      vpcId,
      tags,
    });

    new EksCluster(this, 'eks-cluster', {
      name: this.getEksClusterName(),
      roleArn: controlPlaneRole.arn,
      version: '1.28',
      vpcConfig: {
        securityGroupIds: [clusterSg.id],
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