#!/bin/bash
aws cloudformation deploy \
 	--template-file PackagedCloudFormationTemplate.yml \
 	--stack-name TestStack \
 	--capabilities CAPABILITY_NAMED_IAM \
 	--parameter-overrides \
 	CognitoOriginUrl=https://dev.dmaj9fevu89w9.amplifyapp.com \
 	CognitoCallBackUrl=https://dev.dmaj9fevu89w9.amplifyapp.com/private/area \
 	CognitoLogOutUrl=https://dev.dmaj9fevu89w9.amplifyapp.com \
 	--region  eu-central-1