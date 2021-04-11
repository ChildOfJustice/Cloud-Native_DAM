#!/bin/bash
aws cloudformation deploy \
 	--template-file PackagedCloudFormationTemplate.yml \
 	--stack-name TestStack \
 	--capabilities CAPABILITY_NAMED_IAM \
 	--parameter-overrides \
 	CognitoOriginUrl=https://dev.d6a3mupxfhzpx.amplifyapp.com \
 	CognitoCallBackUrl=https://dev.d6a3mupxfhzpx.amplifyapp.com/private/area \
 	CognitoLogOutUrl=https://dev.d6a3mupxfhzpx.amplifyapp.com \
 	--region  eu-central-1