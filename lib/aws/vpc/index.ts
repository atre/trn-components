import * as aws from '@cdktf/provider-aws';
import { Fn } from 'cdktf';
import { Construct } from 'constructs';
import { DEFAULT_CIDR } from './constant';
import { SubnetOptions, SubnetType, VpcOptions } from './interface';

export class VpcConstruct extends Construct {
  constructor(scope: Construct, id: string, private opts: VpcOptions = {}) {
    super(scope, id);

    const vpc = new aws.vpc.Vpc(this, 'vpc',
      {
        tags: { Name: opts?.name ?? '' },
        cidrBlock: opts?.cidr ?? DEFAULT_CIDR,
      });

    const publicSubnets = this.createSubnets(SubnetType.Public, opts?.publicSubnets ?? [], {
      vpcId: vpc.id,
      availabilityZones: opts?.azs,
      subnetTags: opts?.publicSubnetTags,
    });

    const privateSubnets = this.createSubnets(SubnetType.Private, opts?.privateSubnets ?? [], {
      vpcId: vpc.id,
      availabilityZones: opts?.azs,
      subnetTags: opts?.privateSubnetTags,
    });

    const internetGateway = new aws.internetGateway.InternetGateway(this, 'internet-gateway', {
      vpcId: vpc.id,
      tags: {
        Name: `${this.opts.name}`,
        ...opts.tags,
      },
    });

    const publicRouteTable = new aws.routeTable.RouteTable(this, 'route-table-public', {
      vpcId: vpc.id,
      route: [
        {
          cidrBlock: '0.0.0.0/0',
          gatewayId: internetGateway.id,
        },
      ],
      tags: { Name: `${this.opts.name}-public`, ...opts.tags },
    });

    // TODO Add possibility to create shared nat gateway according to singleNatGateway: true option
    const natGateways = privateSubnets.map((subnet, index) => {
      const eip = new aws.eip.Eip(this, `eip-${index}`, {
        vpc: true,
      });

      return new aws.natGateway.NatGateway(this, `nat-gateway-${index}`, {
        allocationId: eip.id,
        subnetId: subnet.id,
        tags: {
          Name: `${this.opts.name}-${subnet.availabilityZone}`,
          ...opts.tags,
        },
        dependsOn: [internetGateway],
      });
    });

    const privateRouteTables = privateSubnets.map((subnet, index) => {
      return new aws.routeTable.RouteTable(this, `route-table-private-${index}`, {
        vpcId: vpc.id,
        route: [
          {
            cidrBlock: '0.0.0.0/0',
            natGatewayId: natGateways[index].id,
          },
        ],
        tags: {
          Name: `${this.opts.name}-private-${subnet.availabilityZone}`,
          ...opts.tags,
        },
      });
    });

    const defaultRouteTable = new aws.routeTable.RouteTable(this, 'route-table-default', {
      vpcId: vpc.id,
      tags: { Name: `${this.opts.name}-default`, ...opts.tags },
    });

    new aws.mainRouteTableAssociation.MainRouteTableAssociation(this, 'route-table-default-main-association', {
      routeTableId: defaultRouteTable.id,
      vpcId: vpc.id,
    });

    publicSubnets.map((subnet, index) => {
      new aws.routeTableAssociation.RouteTableAssociation(this, `route-table-public-association-${index}`, {
        routeTableId: publicRouteTable.id,
        subnetId: subnet.id,
      });
    });

    privateRouteTables.map((privateRouteTable, index) => {
      return new aws.routeTableAssociation.RouteTableAssociation(this, `route-table-private-association-${index}`, {
        routeTableId: privateRouteTable.id,
        subnetId: privateSubnets[index].id,
      });
    });
  }

  private createSubnets( subnetType: SubnetType, subnetCidrs: string[], subnetOpts: SubnetOptions ) {
    const { availabilityZones = [] } = subnetOpts;
    const numberOfAzs = Fn.lengthOf(availabilityZones);

    return subnetCidrs.map((cidr, index) => {
      const availabilityZone = Fn.element(availabilityZones, index % numberOfAzs);
      const subnetName = `${this.opts?.name}-${subnetType}-${availabilityZone}`;
      const subnetId = `${this.opts?.name}-${subnetType}-${index + 1}`;

      return new aws.subnet.Subnet(this, subnetId, {
        vpcId: subnetOpts.vpcId,
        cidrBlock: cidr,
        availabilityZone,
        mapPublicIpOnLaunch: subnetType === SubnetType.Public,
        tags: {
          Name: subnetName,
          ...subnetOpts.subnetTags,
        },
      });
    });
  };
}
