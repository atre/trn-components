import { EksClusterConfig } from '@cdktf/provider-aws/lib/eks-cluster';

export interface EksConstructConfig extends EksClusterConfig {
  vpcId: string;
  subnetIds: string[];
}