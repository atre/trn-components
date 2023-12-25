export interface IEksNodeGroupConfig {
  name: string;
  clusterName: string;
  privateSubnetIds: string[];
  tags?: Record<string, any>;
}