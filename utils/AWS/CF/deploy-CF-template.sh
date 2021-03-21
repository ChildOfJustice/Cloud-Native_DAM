#!/bin/bash
aws cloudformation deploy \
 	--template-file PackagedCloudFormationTemplate.yml \
 	--stack-name TestStack \
 	--capabilities CAPABILITY_NAMED_IAM \
 	--parameter-overrides \
 	CognitoOriginUrl=https://dev.d1jwt4evy9a3hc.amplifyapp.com \
 	CognitoCallBackUrl=https://dev.d1jwt4evy9a3hc.amplifyapp.com/private/area \
 	CognitoLogOutUrl=https://dev.d1jwt4evy9a3hc.amplifyapp.com \
 	--region  eu-central-1