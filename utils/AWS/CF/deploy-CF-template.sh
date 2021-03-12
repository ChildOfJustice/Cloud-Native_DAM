#!/bin/bash
aws cloudformation deploy \
 	--template-file api-gateway-v2-CF-template.yml \
 	--stack-name TestStack \
 	--capabilities CAPABILITY_NAMED_IAM \
 	--parameter-overrides \
 	CognitoCallBackUrl=https://dev.dp83nzni84jnn.amplifyapp.com/ \
 	CognitoLogOutUrl=https://dev.dp83nzni84jnn.amplifyapp.com/ \
 	--region  eu-central-1