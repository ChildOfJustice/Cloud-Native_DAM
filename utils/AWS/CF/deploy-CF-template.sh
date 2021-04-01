#!/bin/bash
aws cloudformation deploy \
 	--template-file PackagedCloudFormationTemplate.yml \
 	--stack-name TestStack \
 	--capabilities CAPABILITY_NAMED_IAM \
 	--parameter-overrides \
 	CognitoOriginUrl=https://dev.dkt477xxqzbkt.amplifyapp.com \
 	CognitoCallBackUrl=https://dev.dkt477xxqzbkt.amplifyapp.com/private/area \
 	CognitoLogOutUrl=https://dev.dkt477xxqzbkt.amplifyapp.com \
 	--region  eu-central-1