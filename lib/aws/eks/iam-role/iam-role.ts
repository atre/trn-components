import { IamRole, IamRoleConfig } from '@cdktf/provider-aws/lib/iam-role';
import { IamRolePolicyAttachment } from '@cdktf/provider-aws/lib/iam-role-policy-attachment';
import { TerraformOutput } from 'cdktf';
import { Construct } from 'constructs';
import { eksRolePolicyArns } from './constant';

export class IamRoleConstruct extends Construct {
  public readonly name: string;
  public readonly arn: string;

  constructor(scope: Construct, id: string, private opts: IamRoleConfig) {
    super(scope, id);

    const { name, tags, assumeRolePolicy } = this.opts;

    const controlPlaneRole = new IamRole(this, 'eks-role', {
      name,
      assumeRolePolicy: assumeRolePolicy,
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
    new TerraformOutput(this, 'name-output', { value: controlPlaneRole.name });

    this.arn = controlPlaneRole.arn;
    new TerraformOutput(this, 'arn-output', { value: controlPlaneRole.arn });
  }


  getControlPLaneRoleName() {
    return this.name ?? 'control-plane-role';
  }
}