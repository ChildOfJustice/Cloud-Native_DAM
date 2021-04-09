#!/bin/bash
aws cloudformation deploy \
 	--template-file PackagedCloudFormationTemplate.yml \
 	--stack-name TestStack \
 	--capabilities CAPABILITY_NAMED_IAM \
 	--parameter-overrides \
 	CognitoOriginUrl=https://dev.dfa1z5sp5zec.amplifyapp.com \
 	CognitoCallBackUrl=https://dev.dfa1z5sp5zec.amplifyapp.com/private/area \
 	CognitoLogOutUrl=https://dev.dfa1z5sp5zec.amplifyapp.com \
 	--region  eu-central-1