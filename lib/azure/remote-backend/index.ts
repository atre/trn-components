import { DataAzurermResourceGroup, DataAzurermResourceGroupConfig } from '@cdktf/provider-azurerm/lib/data-azurerm-resource-group';
import { AzurermProvider } from '@cdktf/provider-azurerm/lib/provider';
import { StorageAccount, StorageAccountConfig } from '@cdktf/provider-azurerm/lib/storage-account';
import { StorageContainer, StorageContainerConfig } from '@cdktf/provider-azurerm/lib/storage-container';
import { AzurermBackend, AzurermBackendConfig } from 'cdktf';
import { Construct } from 'constructs';
import { EnvProps } from '../interfaces';

export interface AzureRemoteBackendProps{
  env: EnvProps;
  dataResourceGroup: DataAzurermResourceGroupConfig;
  storageAccountProps: Omit<StorageAccountConfig, 'resourceGroupName' | 'name'>;
  tfstateContainerProps?: Omit<StorageContainerConfig, 'storageAccountName' |'name'>;
  backendProps?: AzurermBackendConfig;
}

export class AzureRemoteBackend extends Construct {
  constructor(scope: Construct, id: string, props: AzureRemoteBackendProps) {
    super(scope, id);

    new AzurermProvider(this, 'azure', {
      skipProviderRegistration: true,
      features: {
        keyVault: {
          purgeSoftDeletedCertificatesOnDestroy: true,
          recoverSoftDeletedCertificates: true,
        },
      },
    });

    const { env, dataResourceGroup, storageAccountProps, tfstateContainerProps } = props;

    const resourceGroup = new DataAzurermResourceGroup(this, 'resource_group', {
      name: dataResourceGroup.name,
    });

    const storageAccount = new StorageAccount(this, 'storage_account', {
      ...storageAccountProps,
      ...{ name: env.name, resourceGroupName: resourceGroup.name },
    });

    new StorageContainer(this, 'state_container', {
      ...tfstateContainerProps,
      name: `${env.name}-tfstate`,
      storageAccountName: storageAccount.name,
    });

    new AzurermBackend(this, {
      resourceGroupName: dataResourceGroup.name,
      storageAccountName: env.name,
      containerName: `${env.name}-tfstate`,
      key: `${env.name}.terraform.tfstate`,
    });
  }
}
