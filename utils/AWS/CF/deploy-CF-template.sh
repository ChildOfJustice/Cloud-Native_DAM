#!/bin/bash
aws cloudformation deploy \
	--template-file api-gateway-v2-CF-template.yml \
	--stack-name TestStack \
	--capabilities CAPABILITY_NAMED_IAM \
	--parameter-overrides \
	CognitoCallBackUrl=https://dev1400.dr0pm97gwkd.amplifyapp.com/ \
	CognitoLogOutUrl=https://dev1400.dr0pm97gwkd.amplifyapp.com/ \
	--region eu-central-1