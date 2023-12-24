import { KubernetesCluster, KubernetesClusterConfig } from '@cdktf/provider-azurerm/lib/kubernetes-cluster';
import { Construct } from 'constructs';
import { AzureConstruct, AzureConstructProps } from '../classes';

interface AksClusterProps extends AzureConstructProps {
  kubernetesCluster: KubernetesClusterConfig;
}

export class AksCluster extends AzureConstruct {
  constructor(scope: Construct, id: string, props: AksClusterProps) {
    super(scope, id, props);

    const { kubernetesCluster } = props;

    new KubernetesCluster(this, 'kubernetes_cluster', kubernetesCluster);
  }
}