import os
import sys
import json
import subprocess

# CONFIGURATION:
aws_region = 'eu-central-1'

#



#stack_description_json = sys.argv[1]

app_description_json_file = open('./app_description.json',mode='r')
app_description_json = app_description_json_file.read()
app_description_json_file.close()
os.remove('./app_description.json')


app_description_dictionary = json.loads(app_description_json)
# print(app_description_dictionary)
result_file = open("../deploy-CF-template.sh", 'w')

output_string = ("""#!/bin/bash
aws cloudformation deploy \\
 	--template-file api-gateway-v2-CF-template.yml \\
 	--stack-name TestStack \\
 	--capabilities CAPABILITY_NAMED_IAM \\
 	--parameter-overrides \\
 	CognitoOriginUrl=https://dev.""" + app_description_dictionary.get('app').get('defaultDomain') + """ \\
 	CognitoCallBackUrl=https://dev.""" + app_description_dictionary.get('app').get('defaultDomain') + """/private/area \\
 	CognitoLogOutUrl=https://dev.""" + app_description_dictionary.get('app').get('defaultDomain') + """ \\
 	--region  """+ aws_region
)
# .replace('\n','\')
result_file.write(output_string)

# result_file.write(stack_description_dictionary['Stacks'][0]['Outputs'][1]['OutputValue'] + '\n')
# result_file.write(stack_description_dictionary['Stacks'][0]['Outputs'][0]['OutputValue'] + '\n')
# result_file.write(secret_data_dictionary['UserPoolClient']['ClientSecret'] + '\n')
# result_file.write(stack_description_dictionary['Stacks'][0]['Outputs'][2]['OutputValue'] + '\n')
# result_file.write(stack_description_dictionary['Stacks'][0]['Outputs'][3]['OutputValue'] + '\n')
result_file.close()