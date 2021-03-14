#!/bin/bash
aws cloudformation deploy \
 	--template-file api-gateway-v2-CF-template.yml \
 	--stack-name TestStack \
 	--capabilities CAPABILITY_NAMED_IAM \
 	--parameter-overrides \
 	CognitoCallBackUrl=https://dev.delg3o2ub8ccr.amplifyapp.com \
 	CognitoLogOutUrl=https://dev.delg3o2ub8ccr.amplifyapp.com \
 	--region  eu-central-1