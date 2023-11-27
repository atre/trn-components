import {
  Repository,
  RepositoryConfig,
} from "@cdktf/provider-github/lib/repository";

import { Construct } from "constructs";

export class GithubRepository extends Construct {
  constructor(scope: Construct, id: string, props: RepositoryConfig) {
    super(scope, id);

    new Repository(this, "init-repo", props);
  }
}
