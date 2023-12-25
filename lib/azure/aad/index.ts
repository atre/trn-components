import { Application, ApplicationConfig } from '@cdktf/provider-azuread/lib/application';
import { Construct } from 'constructs/lib/construct';
import { AzureConstruct, AzureConstructProps, AzureProviders } from '../classes';

export interface AzureADProps extends AzureConstructProps {
  testApp: ApplicationConfig;
}

export class AzureAD extends AzureConstruct {
  constructor(scope: Construct, id: string, props: AzureADProps) {
    super(scope, id, { ...props, provider: AzureProviders.AZUREAD });

    const { testApp } = props;

    new Application(this, 'test_app', { ...testApp, displayName: '' });
  }
}