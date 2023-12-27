import { Include, Helm } from 'cdk8s';
import { Construct } from 'constructs/lib/construct';

export class CertManager extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new Include(this, 'cert-manager-crds', {
      url: 'https://github.com/cert-manager/cert-manager/releases/download/v1.13.3/cert-manager.crds.yaml',
    });

    new Helm(this, id, {
      chart: 'jetstack/cert-manager',
    });
  }
}