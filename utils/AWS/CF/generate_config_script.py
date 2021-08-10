import os
import sys
import json
import subprocess

# CONFIGURATION:
maxUserStorageSize_MB = '2.0'
aws_region = sys.argv[1]
bucket_name = sys.argv[2]
bucket_region = aws_region

#



#stack_description_json = sys.argv[1]

stack_description_json_file = open('stack_description.json',mode='r')
stack_description_json = stack_description_json_file.read()
stack_description_json_file.close()
#os.remove('./stack_description.json')


stack_description_dictionary = json.loads(stack_description_json)

result_file = open("../../../src/config.ts", 'w')

output_string = ("export default {\n"
"    AppConfig: {\n"
"        endpoint: '" + stack_description_dictionary['Stacks'][0]['Outputs'][4]['OutputValue'] + "',\n"
"        loginURL: '" + stack_description_dictionary['Stacks'][0]['Outputs'][0]['OutputValue'] + "',\n"
"        maxUserStorageSize_MB: " + maxUserStorageSize_MB + "\n"
"    },\n"
"\n"
"    AWS: {\n"
"        region: '"+ aws_region +"',\n"
"        S3: {\n"
"            bucketName: '"+ bucket_name +"',\n"
"            bucketRegion: '"+ bucket_region +"',\n"
"            accessKeyId: '"+ stack_description_dictionary['Stacks'][0]['Outputs'][3]['OutputValue'] +"',\n"
"            secretAccessKey: '"+ stack_description_dictionary['Stacks'][0]['Outputs'][2]['OutputValue'] +"'\n"
"        },\n"
"        Cognito: {\n"
"            userPoolRegion: '"+ aws_region +"'\n"
"        }\n"
"    }\n"
"}")
result_file.write(output_string)


# result_file.write(stack_description_dictionary['Stacks'][0]['Outputs'][0]['OutputValue'] + '\n')
# result_file.write(stack_description_dictionary['Stacks'][0]['Outputs'][1]['OutputValue'] + '\n')
# result_file.write(secret_data_dictionary['UserPoolClient']['ClientSecret'] + '\n')
# result_file.write(stack_description_dictionary['Stacks'][0]['Outputs'][2]['OutputValue'] + '\n')
# result_file.write(stack_description_dictionary['Stacks'][0]['Outputs'][3]['OutputValue'] + '\n')
# result_file.write(stack_description_dictionary['Stacks'][0]['Outputs'][4]['OutputValue'] + '\n')
result_file.close()