export interface VpcOptions {
  name?: string;
  cidr?: string;
  azs?: string[];
  publicSubnets?: string[];
  privateSubnets?: string[];
  enableNatGateway?: boolean;
  singleNatGateway?: boolean;
  enableDnsHostnames?: boolean;
  tags?: { [key: string]: string };
  publicSubnetTags?: { [key: string]: string };
  privateSubnetTags?: { [key: string]: string };
}

export interface SubnetOptions {
  vpcId: string;
  availabilityZones?: string[];
  subnetTags?: { [key: string]: string };
}

export enum SubnetType {
  Public = 'public',
  Private = 'private',
}