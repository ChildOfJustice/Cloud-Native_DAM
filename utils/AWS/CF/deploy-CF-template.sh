#!/bin/bash
aws cloudformation deploy \
 	--template-file PackagedCloudFormationTemplate.yml \
 	--stack-name TestStack \
 	--capabilities CAPABILITY_NAMED_IAM \
 	--parameter-overrides \
 	CognitoOriginUrl=https://dev.d37us7kkhoylha.amplifyapp.com \
 	CognitoCallBackUrl=https://dev.d37us7kkhoylha.amplifyapp.com/private/area \
 	CognitoLogOutUrl=https://dev.d37us7kkhoylha.amplifyapp.com \
 	--region  eu-central-1