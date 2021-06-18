import * as cdk from '@aws-cdk/core';
import * as route53 from '@aws-cdk/aws-route53';
import * as acm from '@aws-cdk/aws-certificatemanager';


export class BugStack extends cdk.Stack {

  public readonly certArn: cdk.CfnOutput;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const domains: string[] = this.node.tryGetContext('domains').split(",");
    const hZones: string[]  = this.node.tryGetContext('hzones').split(",");
    const mode: number      = Number.parseInt(this.node.tryGetContext('option'))||1;

    if (domains.length < 2 || domains.length != hZones.length) throw Error("bad domain and hosted zone inputs")


    // FETCH HOSTED ZONES to create zone map for DNS Validation
    // Map the domain to its hosted zone (represented in hZones)
    const hzMap: { [key: string]: route53.IHostedZone } = {};

    for (let i = 0; i < hZones.length; i++) {
      const hostedZoneDomain = hZones[i];
      const domain = domains[i];
      hzMap[domain] = route53.HostedZone.fromLookup(this, 'hz-'+hostedZoneDomain, { domainName: hostedZoneDomain });
    }

    let cert;
    const mainSite: string = domains.shift() as string;

    switch (mode) {
      case 1: {
        // Create Certificate with a domain and its alternates using
        // DNS Validation and the hzMap
        // This fails when alternates are in different apex domains
        cert = new acm.DnsValidatedCertificate(this, "cert", {
          domainName: mainSite,
          hostedZone: hzMap[mainSite],
          validation: acm.CertificateValidation.fromDnsMultiZone(hzMap),
          region: 'us-east-1',                       // Required for CloudFront
          subjectAlternativeNames: domains,
        });
        break;
      }

      case 2:
      default: {
        // This succeeds, but won't be created in correct region: us-east-1
        cert = new acm.Certificate(this, "cert", {
          domainName: mainSite,
          subjectAlternativeNames: domains,
          validation: acm.CertificateValidation.fromDnsMultiZone(hzMap),
          //region: 'us-east-1',               // Uncomment and fail to compile
        });
        break;
      }
    }

    this.certArn = new cdk.CfnOutput(this, 'CertArn', { value: cert.certificateArn, });

  }
}
