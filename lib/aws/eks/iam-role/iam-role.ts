import { DataAwsIamPolicyDocument } from '@cdktf/provider-aws/lib/data-aws-iam-policy-document';
import { IamRole, IamRoleConfig } from '@cdktf/provider-aws/lib/iam-role';
import { IamRolePolicyAttachment } from '@cdktf/provider-aws/lib/iam-role-policy-attachment';
import { Construct } from 'constructs';
import { eksRolePolicyArns, eksServiceIdentifier } from './constant';

export class IamRoleConstruct extends Construct {
  public readonly name: string;
  public readonly arn: string;

  constructor(scope: Construct, id: string, private opts: Partial<IamRoleConfig>) {
    super(scope, id);

    const { name, tags } = this.opts;

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

    const controlPlaneRole = new IamRole(this, 'eks-role', {
      name,
      assumeRolePolicy: assumeRolePolicy.json,
      description: 'Used by control plane to interact with AWS services',
      forceDetachPolicies: true,
      tags: {
        ...tags,
        Name: this.getControlPLaneRoleName(),
      },
    });

    eksRolePolicyArns.forEach((policyArn, index) => {
      new IamRolePolicyAttachment(this, `eks-role-policy-${index}`, {
        policyArn,
        role: controlPlaneRole.name,
      });
    });


    this.name = controlPlaneRole.name;
    this.arn = controlPlaneRole.arn;
  }


  getControlPLaneRoleName() {
    return this.name ?? 'control-plane-role';
  }
}