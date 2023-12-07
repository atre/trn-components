import { Eip } from '@cdktf/provider-aws/lib/eip';
import { InternetGateway } from '@cdktf/provider-aws/lib/internet-gateway';
import { MainRouteTableAssociation } from '@cdktf/provider-aws/lib/main-route-table-association';
import { NatGateway } from '@cdktf/provider-aws/lib/nat-gateway';
import { RouteTable } from '@cdktf/provider-aws/lib/route-table';
import { RouteTableAssociation } from '@cdktf/provider-aws/lib/route-table-association';
import { Subnet } from '@cdktf/provider-aws/lib/subnet';
import { Vpc } from '@cdktf/provider-aws/lib/vpc';
import { Fn, TerraformOutput } from 'cdktf';
import { Construct } from 'constructs';
import { DEFAULT_CIDR } from './constant';
import { SubnetOptions, SubnetType, VpcOptions } from './interface';

export class VpcConstruct extends Construct {
  public readonly vpcId: string;
  public readonly privateSubnets: string[];

  constructor(scope: Construct, id: string, private opts: VpcOptions) {
    super(scope, id);

    const { name = '', cidr = DEFAULT_CIDR, azs, tags, publicSubnetTags, privateSubnetTags } = opts;

    const vpc = new Vpc(this, 'vpc', {
      tags: { Name: name },
      cidrBlock: cidr,
    });

    const publicSubnets = this.createSubnets(SubnetType.Public, opts?.publicSubnets ?? [], {
      vpcId: vpc.id,
      availabilityZones: azs,
      subnetTags: publicSubnetTags,
    });

    const privateSubnets = this.createSubnets(SubnetType.Private, opts?.privateSubnets ?? [], {
      vpcId: vpc.id,
      availabilityZones: azs,
      subnetTags: privateSubnetTags,
    });

    const internetGateway = new InternetGateway(this, 'internet-gateway', {
      vpcId: vpc.id,
      tags: {
        Name: `${this.opts.name}`,
        ...tags,
      },
    });

    const publicRouteTable = new RouteTable(this, 'route-table-public', {
      vpcId: vpc.id,
      route: [
        {
          cidrBlock: '0.0.0.0/0',
          gatewayId: internetGateway.id,
        },
      ],
      tags: { Name: `${this.opts.name}-public`, ...tags },
    });

    // TODO Add possibility to create shared nat gateway according to singleNatGateway: true option
    const natGateways = privateSubnets.map((subnet, index) => {
      const eip = new Eip(this, `eip-${index}`, {
        vpc: true,
      });

      return new NatGateway(this, `nat-gateway-${index}`, {
        allocationId: eip.id,
        subnetId: subnet.id,
        tags: {
          Name: `${this.opts.name}-${subnet.availabilityZone}`,
          ...tags,
        },
        dependsOn: [internetGateway],
      });
    });

    const privateRouteTables = privateSubnets.map((subnet, index) => {
      return new RouteTable(this, `route-table-private-${index}`, {
        vpcId: vpc.id,
        route: [
          {
            cidrBlock: '0.0.0.0/0',
            natGatewayId: natGateways[index].id,
          },
        ],
        tags: {
          Name: `${this.opts.name}-private-${subnet.availabilityZone}`,
          ...tags,
        },
      });
    });

    const defaultRouteTable = new RouteTable(this, 'route-table-default', {
      vpcId: vpc.id,
      tags: { Name: `${this.opts.name}-default`, ...tags },
    });

    new MainRouteTableAssociation(this, 'route-table-default-main-association', {
      routeTableId: defaultRouteTable.id,
      vpcId: vpc.id,
    });

    publicSubnets.map((subnet, index) => {
      new RouteTableAssociation(this, `route-table-public-association-${index}`, {
        routeTableId: publicRouteTable.id,
        subnetId: subnet.id,
      });
    });

    privateRouteTables.map((privateRouteTable, index) => {
      return new RouteTableAssociation(this, `route-table-private-association-${index}`, {
        routeTableId: privateRouteTable.id,
        subnetId: privateSubnets[index].id,
      });
    });

    this.privateSubnets = privateSubnets.map((subnet) => subnet.id);
    this.vpcId = vpc.id;

    new TerraformOutput(this, 'privateSubnets', {
      value: privateSubnets.map((subnet) => subnet.id),
    });

    new TerraformOutput(this, 'vpcId', {
      value: vpc.id,
    });
  }

  private createSubnets( subnetType: SubnetType, subnetCidrs: string[], subnetOpts: SubnetOptions ) {
    const { availabilityZones = [], vpcId, subnetTags } = subnetOpts;
    const numberOfAzs = Fn.lengthOf(availabilityZones);

    return subnetCidrs.map((cidr, index) => {
      const availabilityZone = Fn.element(availabilityZones, index % numberOfAzs);
      const subnetName = `${this.opts?.name}-${subnetType}-${availabilityZone}`;
      const subnetId = `${this.opts?.name}-${subnetType}-${index + 1}`;

      return new Subnet(this, subnetId, {
        vpcId,
        cidrBlock: cidr,
        availabilityZone,
        mapPublicIpOnLaunch: subnetType === SubnetType.Public,
        tags: {
          Name: subnetName,
          ...subnetTags,
        },
      });
    });
  };
}
