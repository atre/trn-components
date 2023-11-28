import {
  Repository,
  RepositoryConfig,
} from '@cdktf/provider-github/lib/repository';
import { RepositoryCollaborator } from '@cdktf/provider-github/lib/repository-collaborator';

import { Construct } from 'constructs';

export interface GithubRepositoryProps {
  collaborator: {
    username: string;
    permission: string;
  };
}

export class GithubRepository extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props: RepositoryConfig & GithubRepositoryProps,
  ) {
    super(scope, id);

    const { collaborator } = props;

    const repo = new Repository(this, 'init-repo', props);

    new RepositoryCollaborator(this, 'colab', {
      ...collaborator,
      repository: repo.name,
    });
  }
}
