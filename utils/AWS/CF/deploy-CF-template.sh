#!/bin/bash
aws cloudformation deploy \
	--template-file api-gateway-v2-CF-template.yml \
	--stack-name TestStack \
	--capabilities CAPABILITY_NAMED_IAM \
	--parameter-overrides \
	CognitoCallBackUrl=https://dev.d2pa8hauol3a8y.amplifyapp.com \
	CognitoLogOutUrl=https://dev.d2pa8hauol3a8y.amplifyapp.com \
	--region eu-central-1