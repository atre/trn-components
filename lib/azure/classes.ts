import { AzurermProvider } from '@cdktf/provider-azurerm/lib/provider';
import { AzurermBackend } from 'cdktf/lib/backends/azurerm-backend';
import { Construct } from 'constructs';
import { EnvProps } from './interfaces';

export interface AzureConstructProps {
  isLocalBackend?: boolean;
  env: EnvProps;
  tags?: Record<string, string>;
}

export class AzureConstruct extends Construct {
  public readonly name: string;
  public readonly tags: Record<string, string>;

  constructor(scope: Construct, id: string, props: AzureConstructProps) {
    super(scope, id);

    const { isLocalBackend = false, env: { name, env, location, resourceGroupName }, tags = {} } = props;

    this.tags = { name, env, id, location, ...tags };
    this.name = `${name}-${env}`;

    new AzurermProvider(this, 'azure_provider', {
      skipProviderRegistration: true,
      features: {},
    });

    if (!isLocalBackend) {
      new AzurermBackend(this, {
        resourceGroupName,
        containerName: name,
        key: `${name}.${env}.${id}.terraform.tfstate`,
        storageAccountName: name,
      });
    }
  }
}
