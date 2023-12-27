import { Helm, Include } from 'cdk8s';
import { Construct } from 'constructs/lib/construct';

export class Traefik extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new Include(this, 'traefik-crd', {
      url: 'https://raw.githubusercontent.com/traefik/traefik/v2.10/docs/content/reference/dynamic-configuration/kubernetes-crd-definition-v1.yml',
    });

    new Include(this, 'traefik-rbac-crd', {
      url: 'https://raw.githubusercontent.com/traefik/traefik/v2.10/docs/content/reference/dynamic-configuration/kubernetes-crd-rbac.yml',
    });

    new Helm(this, id, {
      chart: 'traefik/traefik',
    });
  }
}