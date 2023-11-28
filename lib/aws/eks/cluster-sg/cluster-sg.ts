import { SecurityGroup, SecurityGroupConfig } from '@cdktf/provider-aws/lib/security-group';
import { SecurityGroupRule, SecurityGroupRuleConfig } from '@cdktf/provider-aws/lib/security-group-rule';
import { Construct } from 'constructs';

export class ClusterSecurityGroupConstruct extends Construct {
  public readonly id: string;

  constructor(scope: Construct, id: string, private opts: Partial<SecurityGroupConfig & SecurityGroupRuleConfig>) {
    super(scope, id);

    const { vpcId, cidrBlocks, tags } = this.opts;

    const clusterSG = new SecurityGroup(this, 'eks-cluster-sg', {
      vpcId,
      lifecycle: {
        createBeforeDestroy: true,
      },
      description: 'Cluster security group',
      tags: {
        Name: this.getSecurityGroupName(),
        ...tags,
      },
    });

    new SecurityGroupRule(this, 'eks-cluster-sg-rule', {
      securityGroupId: clusterSG.id,
      description: 'Node groups to cluster API',
      fromPort: 443,
      toPort: 443,
      protocol: 'tcp',
      type: 'ingress',
      cidrBlocks,
    });

    this.id = clusterSG.id;
  }

  getSecurityGroupName() {
    return this.opts.name ?? 'eks-cluster-sg';
  }
}