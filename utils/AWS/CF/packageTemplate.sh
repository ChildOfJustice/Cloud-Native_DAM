#!/bin/bash
PackagedCFTemplatePath="../../Deployment/PackagedCloudFormationTemplate.yml"
S3BucketName=$1
rm $PackagedCFTemplatePath
aws cloudformation package --template InitialCloudFormationTemplate.yml --s3-bucket $S3BucketName --output-template-file $PackagedCFTemplatePath
