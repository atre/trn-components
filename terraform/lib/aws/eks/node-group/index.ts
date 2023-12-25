import { DataAwsIamPolicyDocument } from '@cdktf/provider-aws/lib/data-aws-iam-policy-document';
import { EksAddon } from '@cdktf/provider-aws/lib/eks-addon';
import { EksNodeGroup } from '@cdktf/provider-aws/lib/eks-node-group';
import { IamRole } from '@cdktf/provider-aws/lib/iam-role';
import { IamRolePolicyAttachment } from '@cdktf/provider-aws/lib/iam-role-policy-attachment';
import { Construct } from 'constructs';
import { IEksNodeGroupConfig } from './interface';
import { iamRolePolicyPrefix } from '../constant';

export class EksNodeGroupConstruct extends Construct {
  constructor(scope: Construct, id: string, private opts: IEksNodeGroupConfig) {
    super(scope, id);

    const { tags, clusterName, privateSubnetIds } = this.opts;

    const assumeRolePolicy = new DataAwsIamPolicyDocument(this, 'assume-role-policy', {
      statement: [
        {
          actions: ['sts:AssumeRole'],
          effect: 'Allow',
          principals: [
            {
              type: 'Service',
              identifiers: ['ec2.amazonaws.com'],
            },
          ],
        },
      ],
    });

    const nodeGroupRole = new IamRole(this, 'eks-role', {
      name: this.getNodeGroupRoleName(),
      assumeRolePolicy: assumeRolePolicy.json,
      description: 'Used by node groups to interact with AWS services',
      forceDetachPolicies: true,
      tags: {
        ...tags,
        Name: this.getNodeGroupRoleName(),
      },
    });

    const policyAttachments: IamRolePolicyAttachment[] = [];

    ['AmazonEKSWorkerNodePolicy', 'AmazonEC2ContainerRegistryReadOnly', 'AmazonEKS_CNI_Policy'].forEach((policyName, index) => {
      const policy = `${iamRolePolicyPrefix}${policyName}`;

      const policyAttachment = new IamRolePolicyAttachment(this, `eks-role-policy-${index}`, {
        policyArn: policy,
        role: nodeGroupRole.name,
      });

      policyAttachments.push(policyAttachment);
    });

    const nodeGroup = new EksNodeGroup(this, 'eks-node-group', {
      clusterName: clusterName,
      nodeGroupName: this.getNodeGroupName(),
      nodeRoleArn: nodeGroupRole.arn,
      subnetIds: privateSubnetIds,
      scalingConfig: {
        desiredSize: 3,
        maxSize: 3,
        minSize: 1,
      },
      updateConfig: {
        maxUnavailable: 1,
      },
      instanceTypes: ['t3.micro'],
      capacityType: 'ON_DEMAND',
      diskSize: 20,
      tags: {
        ...tags,
        [`kubernetes.io/cluster/${clusterName}`]: 'owned',
        Name: this.getNodeGroupName(),
      },
      dependsOn: [nodeGroupRole, ...policyAttachments],
    });

    [
      { name: 'vpc-cni', version: 'v1.15.4-eksbuild.1' },
      { name: 'coredns', version: 'v1.10.1-eksbuild.6' },
      { name: 'kube-proxy', version: undefined },
    ].forEach((addon, index) => {
      new EksAddon(this, `eks-addon-${index}`, {
        clusterName,
        addonName: addon.name,
        addonVersion: addon.version,

        resolveConflictsOnCreate: 'OVERWRITE',
        dependsOn: [nodeGroup],
      });
    });

  }

  getNodeGroupRoleName() {
    return `${this.opts.name}-role` ?? 'eks-node-group-role';
  }

  getNodeGroupName() {
    return this.opts.name ?? 'eks-node-group';
  }
}