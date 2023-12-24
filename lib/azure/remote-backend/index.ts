import { StorageAccount, StorageAccountConfig } from '@cdktf/provider-azurerm/lib/storage-account';
import { StorageContainer, StorageContainerConfig } from '@cdktf/provider-azurerm/lib/storage-container';
import { Construct } from 'constructs';
import { AzureConstruct } from '../classes';
import { EnvProps } from '../interfaces';

export interface AzureRemoteBackendProps {
  isLocalBackend?: boolean;
  env: EnvProps;
  storageAccount: Omit<StorageAccountConfig, 'name' | 'resourceGroupName'>;
  storageContainer?: Omit<StorageContainerConfig, 'name' | 'storageAccountName'>;
}

export class AzureRemoteBackend extends AzureConstruct {
  constructor(scope: Construct, id: string, props: AzureRemoteBackendProps) {
    super(scope, id, props);

    const { env: { name, resourceGroupName }, storageAccount, storageContainer } = props;

    new StorageAccount(this, 'storage_account', { ...storageAccount, name, resourceGroupName });

    new StorageContainer(this, 'state_container', {
      ...storageContainer,
      name,
      storageAccountName: name,
    });
  }
}