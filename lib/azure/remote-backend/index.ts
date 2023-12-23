import { AzurermProvider } from '@cdktf/provider-azurerm/lib/provider';
import { StorageAccount, StorageAccountConfig } from '@cdktf/provider-azurerm/lib/storage-account';
import { StorageContainer, StorageContainerConfig } from '@cdktf/provider-azurerm/lib/storage-container';
import { AzurermBackend } from 'cdktf/lib/backends/azurerm-backend';
import { Construct } from 'constructs';
import { EnvProps } from '../interfaces';

export interface AzureRemoteBackendProps {
  env: EnvProps;
  resourceGroupName: string;
  storageAccount: Omit<StorageAccountConfig, 'name' | 'resourceGroupName'>;
  storageContainer?: Omit<StorageContainerConfig, 'name' | 'storageAccountName'>;
}

export class AzureRemoteBackend extends Construct {
  constructor(scope: Construct, id: string, props: AzureRemoteBackendProps) {
    super(scope, id);

    const { env: { name }, resourceGroupName, storageAccount, storageContainer } = props;

    new AzurermProvider(this, 'azure_provider', {
      skipProviderRegistration: true,
      features: {},
    });

    new StorageAccount(this, 'storage_account', { ...storageAccount, name, resourceGroupName });

    new StorageContainer(this, 'state_container', {
      ...storageContainer,
      name,
      storageAccountName: name,
    });

    new AzurermBackend(this, {
      resourceGroupName,
      containerName: name,
      key: 'trndev.terraform.tfstate',
      storageAccountName: name,
    });
  }
}