export interface SecurityGroupConfig {
  name: string;
  vpcId: string;
  tags?: { [key: string]: string };
}