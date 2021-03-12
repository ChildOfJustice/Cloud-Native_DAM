#!/bin/bash
rm "../deploy-CF-template.sh"
cat "./AmplifyAppID.info" | xargs -I {} aws amplify get-app --app-id {} > "./app_description.json" ; python3 ./generate_cf_deploy_script.py
