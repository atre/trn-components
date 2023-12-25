import { Helm, Include } from "cdk8s";
import { Construct } from "constructs/lib/construct";

export class Traefik extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id)
    
    new Include(this, 'traefik_crd_def', {
      url: "https://raw.githubusercontent.com/traefik/traefik/v2.10/docs/content/reference/dynamic-configuration/kubernetes-crd-definition-v1.yml"
    })

    new Include(this, 'traefik_crd_rbac', {
      url: "https://raw.githubusercontent.com/traefik/traefik/v2.10/docs/content/reference/dynamic-configuration/kubernetes-crd-rbac.yml"
    })

    new Helm(this, 'traefik', {
      chart: 'traefik/traefik'
    })
  }
}