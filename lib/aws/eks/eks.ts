// import { EksCluster } from '@cdktf/provider-aws/lib/eks-cluster';
import { DataAwsIamPolicyDocument } from '@cdktf/provider-aws/lib/data-aws-iam-policy-document';
import { EksClusterConfig } from '@cdktf/provider-aws/lib/eks-cluster';
import { SecurityGroupConfig } from '@cdktf/provider-aws/lib/security-group';
import { TerraformOutput } from 'cdktf';
import { Construct } from 'constructs';
import { ClusterSecurityGroupConstruct } from './cluster-sg';
import { eksServiceIdentifier } from './iam-role/constant';
import { IamRoleConstruct } from './iam-role/iam-role';

export class EksConstruct extends Construct {
  constructor(scope: Construct, id: string, private opts: EksClusterConfig & SecurityGroupConfig & { subnets: string[] }) {
    super(scope, id);

    const { tags, vpcId } = this.opts;

    const assumeRolePolicy = new DataAwsIamPolicyDocument(this, 'assume-role-policy', {
      statement: [
        {
          actions: ['sts:AssumeRole'],
          effect: 'Allow',
          principals: [
            {
              type: 'Service',
              identifiers: [eksServiceIdentifier],
            },
          ],
        },
      ],
    });

    const controlPlaneRole = new IamRoleConstruct(this, 'iam-role', {
      name: 'control-plane-role',
      assumeRolePolicy: assumeRolePolicy.json,
      tags,
    });

    new ClusterSecurityGroupConstruct(this, 'cluster-sg', {
      name: 'cluster-sg',
      vpcId,
      tags,
    });


    // new EksCluster(this, 'eks-cluster', {
    //   name: 'eks-cluster',
    //   roleArn: controlPlaneRole.arn,
    //   version: '1.21',
    //   vpcConfig: {
    //     // TODO add security group from options
    //     securityGroupIds: [clusterSg.id],
    //     subnetIds: Fn.tolist(this.opts.subnets),
    //   },
    // });

    // Outputs
    new TerraformOutput(this, 'iam_role_name', {
      value: controlPlaneRole.name,
    });

  }
}