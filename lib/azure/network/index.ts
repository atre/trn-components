import { VirtualNetwork, VirtualNetworkConfig } from '@cdktf/provider-azurerm/lib/virtual-network';
import { Construct } from 'constructs';
import { AzureConstruct, AzureConstructProps } from '../classes';

export interface NetworkProps extends AzureConstructProps {
  virtualNetwork: Omit<VirtualNetworkConfig, 'name' | 'location' | 'resourceGroupName'>;
}

export class Network extends AzureConstruct {
  constructor(scope: Construct, id: string, props: NetworkProps) {
    super(scope, id, props);

    const { env: { name, location, resourceGroupName }, virtualNetwork: { addressSpace } } = props;

    new VirtualNetwork(this, 'virtual_network', {
      addressSpace,
      location,
      name,
      resourceGroupName,
    });
  }
}