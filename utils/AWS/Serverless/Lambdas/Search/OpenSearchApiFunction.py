import boto3
import os
import json
import requests
from requests_aws4auth import AWS4Auth

region = 'eu-central-1'
service = 'es'
credentials = boto3.Session().get_credentials()
awsauth = AWS4Auth(credentials.access_key, credentials.secret_key, region, service, session_token=credentials.token)

host = 'https://' + os.environ['openSearchServiceDomain'] # the OpenSearch Service domain, with https://
index = 'lambda-index'
type = '_search'
search_url = host + '/' + index + '/' + type + '/'

headers = { "Content-Type": "application/json" }

def handler(event, context):
    body_object = json.loads(event.get('body'))
    requester_cognito_user_id = event.get('requestContext').get('authorizer').get('jwt').get('claims').get('sub')

    print("request body: " + event.get('body'))
    response = requests.post(search_url, auth=awsauth, data=json.dumps(body_object), headers=headers)
    print('Response: ' + str(response.json()) + '\n')

    response_object = response.json()
    try:
        if "hits" in response_object.keys() and "hits" in response_object.get("hits").keys():
            found_data = response_object.get("hits").get("hits") # "hits" array
            print("DATA:")
            print(str(found_data))
            filtered_data = [x for x in found_data if thisUserIsOwner(x, requester_cognito_user_id)]
            print("filter:")
            print(str(filtered_data))

            response = {
                'statusCode': 200,
                'body': json.dumps(filtered_data),
            }
            return response
        else:
            response = {
                'statusCode': 200,
                'body': json.dumps([]),
            }
            return response
    except Exception as e:
        response_body = {
            'message': str(e)
        }
        response = {
            'statusCode': 400,
            'body': json.dumps(response_body),
        }
        return response

def thisUserIsOwner(item, requester_cognito_user_id):
    print("data attr: " + str(item.get("_source").get("Data")))
    print("cog: " + requester_cognito_user_id)
    return item.get("_source").get("Data") == requester_cognito_user_id
# TEST event:
# {
#   "body": {
#     "opensearchQuery": {
#       "query": {
#           "bool": {
#               "must": [{"match":{
#                   "tag" : {
#                     "S" : "Tag2Value"
#                   }
#               }}]
#           }
        
#       }
#     }
#   }
# }