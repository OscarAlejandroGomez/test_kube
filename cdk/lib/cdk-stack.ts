import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Vpc, Instance, InstanceType, MachineImage, SecurityGroup, Peer, Port, UserData } from 'aws-cdk-lib/aws-ec2';
import { Role, ServicePrincipal, ManagedPolicy } from 'aws-cdk-lib/aws-iam';
import { Cluster, KubernetesVersion, AuthenticationMode, DefaultCapacityType, EndpointAccess } from 'aws-cdk-lib/aws-eks';
import { KubectlLayer } from 'aws-cdk-lib/lambda-layer-kubectl';

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const existingVpc = Vpc.fromVpcAttributes(this, 'ExistingVpc', {
      vpcId: 'vpc-08633210cf67f0c1b',
      availabilityZones: ['us-east-1b', 'us-east-1a'],
      publicSubnetIds: ['subnet-0cf5307b565df7694', 'subnet-0c48ea7dba7e5976d'],
      privateSubnetIds: ['subnet-000ac67e16449dc3f', 'subnet-022d7b068c82d3b6f'],
    });

    const ec2Role = new Role(this, 'EC2Role', {
      assumedBy: new ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
      ],
      roleName: 'JenkinsRole',
    });

    const ec2SecurityGroup = new SecurityGroup(this, 'EC2SecurityGroup', {
      vpc: existingVpc,
      allowAllOutbound: true,
      securityGroupName: 'JenkinsSecurityGroup'
    });

    ec2SecurityGroup.addIngressRule(
      Peer.ipv4('203.0.113.0/24'),
      Port.tcp(8080),
      'Allow Jenkins traffic'
    );

    const userDataScript_installJenkins = `
      #!/bin/bash
      sudo apt-get update -y
      sudo apt-get upgrade -y
      sudo apt-get install -y openjdk-17-jdk
      curl -fsSL https://pkg.jenkins.io/debian/jenkins.io-2023.key | sudo tee /usr/share/keyrings/jenkins-keyring.asc > /dev/null
      echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian binary/ | sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null
      sudo apt-get update -y
      sudo apt-get install -y jenkins
      sudo systemctl enable jenkins
      sudo systemctl start jenkins

      sudo apt-get install -y unzip

      sudo apt-get install -y apt-transport-https ca-certificates curl gnupg
      curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.31/deb/Release.key | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
      sudo chmod 644 /etc/apt/keyrings/kubernetes-apt-keyring.gpg
      echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.31/deb/ /' | sudo tee /etc/apt/sources.list.d/kubernetes.list
      sudo chmod 644 /etc/apt/sources.list.d/kubernetes.list
      sudo apt-get update
      sudo apt-get install -y kubectl
    `;

    const userData = UserData.forLinux();
    userData.addCommands(userDataScript_installJenkins);

    const ec2Instace_jenkins = new Instance(this, 'EC2InstanceJenkins', {
      vpc: existingVpc,
      instanceType: new InstanceType('t2.medium'),
      machineImage: MachineImage.genericLinux({
        'us-east-1': 'ami-0866a3c8686eaeeba',
      }),

      instanceName: 'Jenkins Master Machine',
      availabilityZone: 'us-east-1a',
      allowAllOutbound: true,
      role: ec2Role,
      securityGroup: ec2SecurityGroup,
      vpcSubnets: {
        subnets: existingVpc.publicSubnets,
      },
      userData: userData,
    });

    const k8_role = new Role(this, 'K8Role', {
      assumedBy: new ServicePrincipal('eks.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName('AmazonEKSClusterPolicy'),
        ManagedPolicy.fromAwsManagedPolicyName('AmazonEKSServicePolicy'),
      ],
      roleName: 'K8Role',
    });

    const k8_securityGroup = new SecurityGroup(this, 'K8SecurityGroup', {
      vpc: existingVpc,
      allowAllOutbound: true,
      securityGroupName: 'K8SecurityGroup'
    });

    k8_securityGroup.addIngressRule(
      Peer.ipv4('203.0.113.0/24'),
      Port.tcp(8080),
      'Allow Jenkins traffic'
    );

    // Create kubernetes cluster
    const k8_cluster = new Cluster(this, 'K8Cluster', {
      vpc: existingVpc,
      defaultCapacity: 1,
      version: KubernetesVersion.V1_30,
      clusterName: 'testDeployK8Cluster',
      authenticationMode: AuthenticationMode.API_AND_CONFIG_MAP,
      defaultCapacityType: DefaultCapacityType.EC2,
      defaultCapacityInstance: new InstanceType('t2.small'),
      endpointAccess: EndpointAccess.PUBLIC_AND_PRIVATE,
      role: k8_role,
      securityGroup: k8_securityGroup
    });


  }
}
