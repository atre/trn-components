import { DynamodbTable, DynamodbTableConfig } from '@cdktf/provider-aws/lib/dynamodb-table';
import { S3Bucket, S3BucketConfig } from '@cdktf/provider-aws/lib/s3-bucket';
import { S3BucketVersioningA } from '@cdktf/provider-aws/lib/s3-bucket-versioning';
import { Construct } from 'constructs';

export class RemoteBackendConstruct extends Construct {
  constructor(
    protected scope: Construct,
    protected id: string,
    protected opts: S3BucketConfig & DynamodbTableConfig,
  ) {
    super(scope, id);

    const bucket = new S3Bucket(this, 'backend', {
      ...opts,
      bucket: this.getBucketName(),
      versioning: {
        enabled: true,
      },
    });

    new S3BucketVersioningA(this, 'backend-versioning', {
      bucket: bucket.bucket,
      versioningConfiguration: {
        status: 'Enabled',
      },
    });

    // DynamoDB Table for State Locking
    new DynamodbTable(this, 'terraformStateLock', {
      name: this.getDynamoDbTableName(),
      hashKey: 'LockID',
      billingMode: 'PAY_PER_REQUEST',
      attribute: [{ name: 'LockID', type: 'S' }],
    });
  }

  public getBucketName() {
    return this.opts.bucket || `${this.id}-bucket`;
  }

  public getDynamoDbTableName() {
    return this.opts.name || `${this.id}-cdktf-state-lock`;
  }
}