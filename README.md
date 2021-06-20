# CDK DNS Cert Create Bug

### Rolls back stack during cert creation

`> npx cdk deploy -c domains=www.example.com,www.example.net -c hzones=example.com,example.net -c option=1`

````
Bug (fromDnsMultiZone & DnsValidatedCertificate):

BugStack: creating CloudFormation changeset...
5:33:16 PM | CREATE_FAILED        | AWS::CloudFormation::CustomResource | certCertificateRequestorResourceBEEAD61F
Received response status [FAILED] from custom resource. Message returned: [RRSet with DNS name _43c31ec2e27af40dde78c6fe95c887b8.www.example.net. is not permitted in zone example.com.] (RequestId: 7813e3ca-534a-4ad7-9dc5-4d186e3c1794)
````

### Succeeds, but in us-west-1 (or local region)

`> npx cdk deploy -c domains=www.example.com,www.example.net -c hzones=example.com,example.net -c option=2`

````
BugStack: deploying...
BugStack: creating CloudFormation changeset...

 ✅  BugStack

Outputs:
BugStack.CertArn = arn:aws:acm:us-west-1:############:certificate/328e24dd-caf4-47c5-988b-eca86bf2fcb9

Stack ARN:
arn:aws:cloudformation:us-west-1:############:stack/BugStack/9146a0f0-cfd9-11eb-bf59-020e17c35eb9
````

### Create a multizone Cert from the command line

`> aws acm request-certificate --domain-name <domain> --validation-method DNS --subject-alternative-names [alt1 [alt2 ...]]`
