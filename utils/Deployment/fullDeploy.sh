#!/bin/bash
S3BucketName="sardor-test-code"
S3StorageBucketName="sardor-app-storage"
AwsRegion="eu-central-1"
StackName="TestStack"
ProjectName="amplifytestapp"

echo "STEP 1 #### Packaging CloudFormation template...";
cd utils/AWS/CF/PackageCfTemplate &&
sh packageTemplate.sh $S3BucketName &&


echo "STEP 2 #### Deploying CloudFormation stack...";
cd .. &&
sh deploy-CF-template.sh $StackName $AwsRegion &&


echo "STEP 3 #### Generating config file...";
aws cloudformation describe-stacks --stack-name $StackName > "stack_description.json" &&

rm "../../../src/config.ts"
python3 ./generate_config_script.py $AwsRegion $S3StorageBucketName &&

rm "amplifyInit.sh"
python3 ./generate_amplify_deployment_script.py $ProjectName &&

echo "STEP 4 #### Initializing amplify app...";
sh amplifyInit.sh &&

echo "STEP 5 #### Adding hosting to amplify app...";
./amplifyAddHostingHeadless.sh &&

echo "STEP 6 #### Publishing amplify app...";
sh amplifyPublishHeadless.sh