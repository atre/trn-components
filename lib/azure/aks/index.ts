import { KubernetesCluster, KubernetesClusterConfig } from '@cdktf/provider-azurerm/lib/kubernetes-cluster';
import { Construct } from 'constructs';
import { AzureConstruct, AzureConstructProps } from '../classes';

export interface AksProps extends AzureConstructProps {
  kubernetesCluster: Omit<KubernetesClusterConfig, 'name' | 'location' | 'resourceGroupName' | 'dnsPrefix'>;
}

export class Aks extends AzureConstruct {
  constructor(scope: Construct, id: string, props: AksProps) {
    super(scope, id, props);

    const { env, tags, kubernetesCluster } = props;

    new KubernetesCluster(this, 'kubernetes_cluster', { ...kubernetesCluster, ...env, name: this.name, dnsPrefix: this.name, tags });
  }
}