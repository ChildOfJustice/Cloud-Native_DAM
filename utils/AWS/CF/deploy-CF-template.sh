#!/bin/bash
aws cloudformation deploy \
 	--template-file PackagedCloudFormationTemplate.yml \
 	--stack-name TestStack \
 	--capabilities CAPABILITY_NAMED_IAM \
 	--parameter-overrides \
 	CognitoOriginUrl=https://dev.d2pka7bdh3k0xr.amplifyapp.com \
 	CognitoCallBackUrl=https://dev.d2pka7bdh3k0xr.amplifyapp.com/private/area \
 	CognitoLogOutUrl=https://dev.d2pka7bdh3k0xr.amplifyapp.com \
 	--region  eu-central-1