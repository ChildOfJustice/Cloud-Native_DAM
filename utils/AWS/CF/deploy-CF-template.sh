#!/bin/bash
aws cloudformation deploy \
 	--template-file PackagedCloudFormationTemplate.yml \
 	--stack-name TestStack \
 	--capabilities CAPABILITY_NAMED_IAM \
 	--parameter-overrides \
 	CognitoOriginUrl=https://dev.du4rgzupnbtwy.amplifyapp.com \
 	CognitoCallBackUrl=https://dev.du4rgzupnbtwy.amplifyapp.com/private/area \
 	CognitoLogOutUrl=https://dev.du4rgzupnbtwy.amplifyapp.com \
 	--region  eu-central-1