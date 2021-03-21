#!/bin/bash
PackagedCFTemplatePath="../PackagedCloudFormationTemplate.yml"
S3BucketName="sardor-test-code"
rm $PackagedCFTemplatePath
aws cloudformation package --template InitialCloudFormationTemplate.yml --s3-bucket $S3BucketName --output-template-file $PackagedCFTemplatePath
