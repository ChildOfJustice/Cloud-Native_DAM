#!/bin/bash
aws cloudformation deploy \
 	--template-file PackagedCloudFormationTemplate.yml \
 	--stack-name TestStack \
 	--capabilities CAPABILITY_NAMED_IAM \
 	--parameter-overrides \
 	CognitoOriginUrl=https://dev.dwjpj9eq1xgsr.amplifyapp.com \
 	CognitoCallBackUrl=https://dev.dwjpj9eq1xgsr.amplifyapp.com/private/area \
 	CognitoLogOutUrl=https://dev.dwjpj9eq1xgsr.amplifyapp.com \
 	--region  eu-central-1