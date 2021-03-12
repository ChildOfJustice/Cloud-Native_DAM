#!/bin/bash
aws cloudformation deploy \
 	--template-file api-gateway-v2-CF-template.yml \
 	--stack-name TestStack \
 	--capabilities CAPABILITY_NAMED_IAM \
 	--parameter-overrides \
 	CognitoCallBackUrl=https://dev.dp9ezmtod6myb.amplifyapp.com \
 	CognitoLogOutUrl=https://dev.dp9ezmtod6myb.amplifyapp.com \
 	--region  eu-central-1