// import { expect as expectCDK, haveResource } from '@aws-cdk/assert';
// import * as cdk from '@aws-cdk/core';
// import CdkSample = require('../lib/cdk-sample-stack');

// test('SQS Queue Created', () => {
//     const app = new cdk.App();
//     // WHEN
//     const stack = new CdkSample.CdkSampleStack(app, 'MyTestStack');
//     // THEN
//     expectCDK(stack).to(haveResource("AWS::SQS::Queue",{
//       VisibilityTimeout: 300
//     }));
// });

// test('SNS Topic Created', () => {
//   const app = new cdk.App();
//   // WHEN
//   const stack = new CdkSample.CdkSampleStack(app, 'MyTestStack');
//   // THEN
//   expectCDK(stack).to(haveResource("AWS::SNS::Topic"));
// });
