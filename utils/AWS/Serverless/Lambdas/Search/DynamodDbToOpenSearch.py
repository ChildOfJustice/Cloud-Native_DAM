import boto3
import os
import requests
import json
import urllib
from requests_aws4auth import AWS4Auth

region = 'eu-central-1'
service = 'es'
credentials = boto3.Session().get_credentials()
awsauth = AWS4Auth(credentials.access_key, credentials.secret_key, region, service, session_token=credentials.token)

host = 'https://' + os.environ['openSearchServiceDomain'] # the OpenSearch Service domain, with https://
index = 'lambda-index'
type = '_doc'
url = host + '/' + index + '/' + type + '/'

headers = { "Content-Type": "application/json" }

def handler(event, context):
    count = 0
    print(str(event))
    for record in event['Records']:
        id = record['dynamodb']['Keys']['ID']['S']
        sk = record['dynamodb']['Keys']['SK']['S']
        print("id sk: " + str(id) + " | " + str(sk))

        if(id.startswith('FILE#') and sk.startswith('FILE#')):
            url_encoded_id = urllib.parse.quote(id, safe='')

            print(str(record))

            if record['eventName'] == 'REMOVE':
                r = requests.delete(url + url_encoded_id, auth=awsauth)
                print('Response: ' + str(r.content) + '\n')
                # print(r.raise_for_status())
                count += 1
            else:

                document = record['dynamodb']['NewImage']

                # Lazy-eval the dynamodb attribute (boto3 is dynamic!)
                boto3.resource('dynamodb')

                # To go from low-level format to python
                deserializer = boto3.dynamodb.types.TypeDeserializer()
                python_data = {k: deserializer.deserialize(v) for k,v in document.items()}

                # To go from python to low-level format
                # serializer = boto3.dynamodb.types.TypeSerializer()
                # low_level_copy = {k: serializer.serialize(v) for k,v in python_data.items()}

                print('Adding a new item from NewImage: ' + json.dumps(python_data, default=str) + '\n')


                r = requests.put(url + url_encoded_id, auth=awsauth, data=json.dumps(python_data, default=str), headers=headers)
                print('Response: ' + str(r.content) + '\n')
                # print(r.raise_for_status())
                count += 1

        else:
            print("This is not a file, will not add it to the OpenSearch index")

    print(str(count) + ' records processed.')
    return str(count) + ' records processed.'