#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { WorkaroundStack, WaStackProps, CertStack } from '../lib/workaround-stack';


const app = new cdk.App();

const ws = new WorkaroundStack(app, 'WorkaroundStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
  //certArn: cs.cert,
});


const cs = new CertStack(app, 'CertStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: 'us-east-1' },
});



// Creates error inter-region, this won't help us
// ws.addDependency(cs);
