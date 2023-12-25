import { EcrRepository } from '@cdktf/provider-aws/lib/ecr-repository';
import { Construct } from 'constructs';
import { IECRConfig } from './interface';

export class ECRConstruct extends Construct {
  constructor(scope: Construct, id: string, private opts: IECRConfig) {
    super(scope, id);

    const { tags } = this.opts;

    new EcrRepository(this, 'ecr', {
      name: this.getECRName(),

      tags: {
        ...tags,
        Name: this.getECRName(),
      },
    });
  }

  getECRName() {
    return `${this.opts.name}` ?? 'ecr';
  }
}