import { Construct } from "constructs";
import { App, TerraformStack } from "cdktf";
import { AwsProvider } from "./.gen/providers/aws";
import { DataAwsVpc } from "./.gen/providers/aws/data-aws-vpc";

class MyStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new AwsProvider(this, "aws", {
      region: "us-east-1",
    });

    const vpc = new DataAwsVpc(this, "ExistingVpc", {
      filter: [
        {
          name: "tag:Name", // Replace this with the tag or property you want to use
          values: ["my-existing-vpc-name"], // Replace with the actual tag value
        },
      ],
    });

  }
}

const app = new App();
new MyStack(app, "project");
app.synth();
