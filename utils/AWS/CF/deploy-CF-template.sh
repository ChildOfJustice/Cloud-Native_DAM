#!/bin/bash
aws cloudformation deploy \
 	--template-file PackagedCloudFormationTemplate.yml \
 	--stack-name TestStack \
 	--capabilities CAPABILITY_NAMED_IAM \
 	--parameter-overrides \
 	CognitoOriginUrl=https://dev.d1frmmh88u0l5c.amplifyapp.com \
 	CognitoCallBackUrl=https://dev.d1frmmh88u0l5c.amplifyapp.com/private/area \
 	CognitoLogOutUrl=https://dev.d1frmmh88u0l5c.amplifyapp.com \
 	--region  eu-central-1