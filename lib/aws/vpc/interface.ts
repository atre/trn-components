export interface VpcOptions {
  name?: string;
  cidr?: string;
  azs?: string[];
  publicSubnets?: string[];
  privateSubnets?: string[];
  enableNatGateway?: boolean;
  singleNatGateway?: boolean;
  enableDnsHostnames?: boolean;
  tags?: Record<string, string>;
  publicSubnetTags?: Record<string, string>;
  privateSubnetTags?: Record<string, string>;
}

export interface SubnetOptions {
  vpcId: string;
  availabilityZones?: string[];
  subnetTags?: Record<string, string>;
}

export enum SubnetType {
  Public = 'public',
  Private = 'private',
}