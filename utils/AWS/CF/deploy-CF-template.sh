#!/bin/bash
aws cloudformation deploy \
 	--template-file PackagedCloudFormationTemplate.yml \
 	--stack-name $1 \
 	--capabilities CAPABILITY_NAMED_IAM \
 	--region $2