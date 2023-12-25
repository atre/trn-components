import { AzureadProvider } from '@cdktf/provider-azuread/lib/provider';
import { AzurermProvider } from '@cdktf/provider-azurerm/lib/provider';
import { AzurermBackend } from 'cdktf/lib/backends/azurerm-backend';
import { Construct } from 'constructs';
import { EnvProps } from './interfaces';

export enum AzureProviders {
  AZURE = 'azure_provider',
  AZUREAD = 'azure_ad_provider'

}

export interface AzureConstructProps {
  isLocalBackend?: boolean;
  provider?: AzureProviders;
  env: EnvProps;
}

export class AzureConstruct extends Construct {
  constructor(scope: Construct, id: string, props: AzureConstructProps) {
    super(scope, id);

    const { isLocalBackend = false, provider = AzureProviders.AZURE, env: { name, resourceGroupName } } = props;

    switch (provider) {
      case AzureProviders.AZURE:
        new AzurermProvider(this, 'azure_provider', {
          skipProviderRegistration: true,
          features: {},
        });
        break;

      case AzureProviders.AZUREAD:
        new AzureadProvider(this, 'azure_ad_provider', {});
        break;
    }


    if (!isLocalBackend) {
      new AzurermBackend(this, {
        resourceGroupName,
        containerName: name,
        key: `${name}.${id}.terraform.tfstate`,
        storageAccountName: name,
      });
    }
  }
}
