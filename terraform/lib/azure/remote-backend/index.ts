import { StorageAccount, StorageAccountConfig } from '@cdktf/provider-azurerm/lib/storage-account';
import { StorageContainer, StorageContainerConfig } from '@cdktf/provider-azurerm/lib/storage-container';
import { Construct } from 'constructs';
import { AzureConstruct, AzureConstructProps } from '../classes';

export interface AzureRemoteBackendProps extends AzureConstructProps {
  storageAccount: Omit<StorageAccountConfig, 'name' | 'location' | 'resourceGroupName'>;
  storageContainer?: Omit<StorageContainerConfig, 'name' | 'storageAccountName'>;
}

export class AzureRemoteBackend extends AzureConstruct {
  constructor(scope: Construct, id: string, props: AzureRemoteBackendProps) {
    super(scope, id, props);

    const { env: { name, env, location, resourceGroupName }, storageAccount, storageContainer } = props;

    new StorageAccount(this, 'storage_account', { ...storageAccount, tags: this.tags, name: `${name}${env}`, location, resourceGroupName });

    new StorageContainer(this, 'state_container', {
      ...storageContainer,
      name: this.name,
      storageAccountName: `${name}${env}`,
    });
  }
}