import os
import sys
import json
import subprocess

# CONFIGURATION:
project_name = sys.argv[1]

#


stack_description_json_file = open('stack_description.json',mode='r')
stack_description_json = stack_description_json_file.read()
stack_description_json_file.close()
os.remove('./stack_description.json')


stack_description_dictionary = json.loads(stack_description_json)

result_file = open("amplifyInit.sh", 'w')


output_string = """#!/bin/bash
set -e
IFS='|'

AMPLIFY="{\\
\\"projectName\\":\\"%s\\",\\
\\"envName\\":\\"dev\\",\\
\\"defaultEditor\\":\\"code\\",\\
\\"appId\\":\\"%s\\"\\
}"

cd ../../../

amplify init \\
--amplify $AMPLIFY \\
--yes""" % (project_name, stack_description_dictionary['Stacks'][0]['Outputs'][1]['OutputValue'])

result_file.write(output_string)

result_file.close()