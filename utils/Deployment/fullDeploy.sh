#!/bin/bash

ServerlessCodeStorageBucketName="sardor-test-code"
S3StorageBucketName="sardor-app-storage"
AwsRegion="eu-central-1"
StackName="TestStack"
ProjectName="amplifytestapp"

echo "STEP 1 #### Packaging CloudFormation template..." &&
cd utils/AWS/CF &&
sh packageTemplate.sh $ServerlessCodeStorageBucketName &&


echo "STEP 2 #### Deploying CloudFormation stack..." &&
cd ../../Deployment &&
sh deploy-CF-template.sh $StackName $AwsRegion &&
aws cloudformation describe-stacks --stack-name $StackName > "stack_description.json" &&


echo "STEP 3 #### Generating config file..." &&
rm -f "../../src/config.ts" &&
python3 ./generate_config_script.py $AwsRegion $S3StorageBucketName &&


echo "STEP 4 #### Generating amplify initialization file..." &&
rm -f "amplifyInit.sh" &&
python3 ./generate_amplify_deployment_script.py $ProjectName &&


echo "STEP 5 #### Initializing amplify app..." &&
rm -rf "../../amplify" &&
sh amplifyInit.sh &&


echo "STEP 6 #### Adding hosting to amplify app..." &&
./amplifyAddHostingHeadless.sh &&


echo "STEP 7 #### Publishing amplify app..." &&
sh amplifyPublishHeadless.sh
