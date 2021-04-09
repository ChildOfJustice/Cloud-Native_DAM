#!/bin/bash
AmplifyAppID="dfa1z5sp5zec"
S3BucketName="sardor-test-code"
S3StorageBucketName="sardor-app-storage"
AwsRegion="eu-central-1"
StackName="TestStack"


#echo "STEP 1 #### Generating CloudFormation deployment script...";
cd utils/AWS/CF/GenerateCfDeploymentScript &&
#sh generateDeployScript.sh $AmplifyAppID &&

echo "STEP 2 #### Packaging CloudFormation template...";
cd ../PackageCfTemplate &&
sh packageTemplate.sh $S3BucketName &&

echo "STEP 3 #### Deploying CloudFormation stack...";
cd .. &&
sh deploy-CF-template.sh $StackName &&

echo "STEP 4 #### generating CloudFormation deployment script...";
rm "../../../src/config.ts" &&
aws cloudformation describe-stacks --stack-name $StackName > "stack_description.json" &&
python3 ./generate_config_script.py $AwsRegion $S3StorageBucketName