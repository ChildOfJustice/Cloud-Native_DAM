#!/bin/bash
aws cloudformation deploy \
 	--template-file PackagedCloudFormationTemplate.yml \
 	--stack-name TestStack \
 	--capabilities CAPABILITY_NAMED_IAM \
 	--parameter-overrides \
 	CognitoOriginUrl=https://dev.d1lq9z4c84o76a.amplifyapp.com \
 	CognitoCallBackUrl=https://dev.d1lq9z4c84o76a.amplifyapp.com/private/area \
 	CognitoLogOutUrl=https://dev.d1lq9z4c84o76a.amplifyapp.com \
 	--region  eu-central-1