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

    new SecurityGroupRule(this, 'eks-cluster-sg-rule-ingress', {
      securityGroupId: clusterSG.id,
      description: 'Node groups to cluster API',
      fromPort: 443,
      toPort: 443,
      protocol: 'tcp',
      type: 'ingress',
      cidrBlocks,
    });

    new SecurityGroupRule(this, 'eks-cluster-sg-rule-ingress2', {
      securityGroupId: clusterSG.id,
      description: 'Node groups to cluster API',
      fromPort: 80,
      toPort: 80,
      protocol: 'tcp',
      type: 'ingress',
      cidrBlocks,
    });

    new SecurityGroupRule(this, 'eks-cluster-sg-ssh-rule-ingress', {
      securityGroupId: clusterSG.id,
      description: 'ssh connect to cluster API',
      fromPort: 22,
      toPort: 22,
      protocol: 'tcp',
      type: 'ingress',
      cidrBlocks: ['0.0.0.0/0'],
    });

    new SecurityGroupRule(this, 'eks-cluster-sg-ssh-rule-egress', {
      securityGroupId: clusterSG.id,
      description: 'ssh connect to cluster API',
      fromPort: 0,
      toPort: 0,
      protocol: '-1',
      type: 'egress',
      cidrBlocks: ['0.0.0.0/0'],
    });

    this.id = clusterSG.id;
  }

  getSecurityGroupName() {
    return `${this.opts.name}-sg` ?? 'eks-cluster-sg';
  }
}