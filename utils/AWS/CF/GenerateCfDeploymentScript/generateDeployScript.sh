#!/bin/bash
AmplifyAppID=$1
rm "../deploy-CF-template.sh"
aws amplify get-app --app-id $AmplifyAppID > "./app_description.json" ; python3 ./generate_cf_deploy_script.py
