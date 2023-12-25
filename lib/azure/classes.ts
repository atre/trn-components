import { AzurermProvider } from '@cdktf/provider-azurerm/lib/provider';
import { AzurermBackend } from 'cdktf/lib/backends/azurerm-backend';
import { Construct } from 'constructs';
import { EnvProps } from './interfaces';

export interface AzureConstructProps {
  isLocalBackend?: boolean;
  env: EnvProps;
}

export class AzureConstruct extends Construct {
  constructor(scope: Construct, id: string, props: AzureConstructProps) {
    super(scope, id);

    const { isLocalBackend = false, env: { name, resourceGroupName } } = props;

    new AzurermProvider(this, 'azure_provider', {
      skipProviderRegistration: true,
      features: {},
    });

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
