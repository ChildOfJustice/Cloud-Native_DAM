#!/bin/bash
aws cloudformation deploy \
 	--template-file api-gateway-v2-CF-template.yml \
 	--stack-name TestStack \
 	--capabilities CAPABILITY_NAMED_IAM \
 	--parameter-overrides \
 	CognitoOriginUrl=https://dev.diz6rf38xnxuu.amplifyapp.com \
 	CognitoCallBackUrl=https://dev.diz6rf38xnxuu.amplifyapp.com/private/area \
 	CognitoLogOutUrl=https://dev.diz6rf38xnxuu.amplifyapp.com \
 	--region  eu-central-1