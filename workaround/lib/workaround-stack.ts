import * as cdk from '@aws-cdk/core';
import * as route53 from '@aws-cdk/aws-route53';
import * as acm from '@aws-cdk/aws-certificatemanager';


export class CertStack extends cdk.Stack {

  public readonly certArn: cdk.CfnOutput;
  public readonly cert: acm.Certificate;
  public readonly hzMap: { [key: string]: route53.IHostedZone } = {};

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const domains: string[] = this.node.tryGetContext('domains').split(",");
    const hZones: string[]  = this.node.tryGetContext('hzones').split(",");

    if (domains.length < 2 || domains.length != hZones.length) throw Error("bad domain and hosted zone inputs")

    // Test that region is us-east-1

    // Map Domains to their Hosted Zones
    for (let i = 0; i < hZones.length; i++) {
      const hostedZoneDomain = hZones[i];
      const domain = domains[i];
      this.hzMap[domain] = route53.HostedZone.fromLookup(this, 'hz-'+hostedZoneDomain, { domainName: hostedZoneDomain });
    }

    // Create a Certificate using multizone DNS
    const mainSite: string = domains.shift() as string;
    this.cert = new acm.Certificate(this, "cert", {
      domainName: mainSite,
      subjectAlternativeNames: domains,
      validation: acm.CertificateValidation.fromDnsMultiZone(this.hzMap),
    });

    // Output the ARN for tracking purposes. Other public vars used directly.
    this.certArn = new cdk.CfnOutput(this, 'CertArn', { value: this.cert.certificateArn, });

  }
}

export interface WaStackProps extends cdk.StackProps {
  //cert: acm.Certificate,
  //cs: CertStack,
}

export class WorkaroundStack extends cdk.Stack {

  // public readonly certArn: cdk.CfnOutput;

  constructor(scope: cdk.Construct, id: string, props?: WaStackProps) {
    super(scope, id, props);

    //this.node.requireContext('certArn')

    const certArn: string = this.node.tryGetContext('certArn');

    if (!certArn) throw Error("certArn must be supplied")

    const certificate = acm.Certificate.fromCertificateArn(this, 'Certificate', certArn) as acm.Certificate;



    //certificate.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);


    //this.certArn = new cdk.CfnOutput(this, 'CertArnReference', { value: props?.cert?.certificateArn || "Undefined", });
  }
}
