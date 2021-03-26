import boto3
import json
import uuid
from boto3.dynamodb.conditions import Attr, Key
from botocore.exceptions import ClientError

def handler(event, context):
    table = boto3.resource("dynamodb").Table("CloudNativeDAM_DB")
    index_name = "Data-index"

    requester_cognito_user_id = event.get('requestContext').get('authorizer').get('jwt').get('claims').get('sub')
    
    if(event.get('routeKey').startswith('POST') and json.loads(event.get('body')).get('clusterId') is None):
        #POST CREATE A NEW CLUSTER
        new_cluster_id = str(uuid.uuid4())
        try:
            db_response = table.put_item(
                Item={
                    'ID': 'CLUSTER#' + new_cluster_id,
                    'SK': 'CLUSTER#' + new_cluster_id,
                    'Data': requester_cognito_user_id,
                    'name': json.loads(event.get('body')).get('name')
                }
            )
        except ClientError as e:
            print(e)
            response_body = {
                'message': e.response['Error']['Code']
            }
            response = {
                'statusCode': 500,
                'body': json.dumps(response_body),
            }
            return response
    if(event.get('routeKey').startswith('GET')):
        if(event.get('queryStringParameters') is None):
            # GET all user's clusters
            query_params = {
                'TableName': 'CloudNativeDAM_DB',
                'IndexName': index_name,
                'ExpressionAttributeNames': {'#C_ID': 'SK', '#OWN': 'Data'},
                'ExpressionAttributeValues': {':Cid': {'S': 'CLUSTER#'},':Uid': {'S': requester_cognito_user_id}},
                'KeyConditionExpression': '#OWN = :Uid AND begins_with(#C_ID, :Cid)'
            }
            
            try:
                items = query(query_params)
                response_body = {
                    'items': items# TODO
                }

                response = {
                    'statusCode': 200,
                    'body': json.dumps(response_body),
                }
                return response
            except ClientError as e:
                print(e)
                response_body = {
                    'message': e.response['Error']['Code']
                }
                response = {
                    'statusCode': 500,
                    'body': json.dumps(response_body),
                }
                return response


        else:
            # GET the one cluster by its ID
            try:
                cluster_id = event.get('queryStringParameters').get('clusterId')
                if(cluster_id == '' or (cluster_id is None)):
                    raise ValueError('Cluster id cannot be empty')

                query_params = {
                    'TableName': 'CloudNativeDAM_DB',
                    # 'IndexName': 'Data-index',
                    'ExpressionAttributeNames': {'#ID': 'PK', '#SK': 'SK'},
                    'ExpressionAttributeValues': {':id': {'S': cluster_id},':sk': {'S': cluster_id}},
                    'KeyConditionExpression': '#ID = :id AND #SK = :sk'
                }
                items = query(query_params)
                response_body = {
                    'cluster': items,  # TODO
                    'youAreTheOwner': (items[0]['Data']['S'] == requester_cognito_user_id)
                }

                response = {
                    'statusCode': 200,
                    'body': json.dumps(response_body),
                }
                return response
                
            except (ClientError, ValueError) as e:
                print(e)
                err_msg = ''
                if(e is ClientError):
                    err_msg = e.response['Error']['Code']
                else:
                    err_msg = str(e)
                response_body = {
                    'message': err_msg
                }
                response = {
                    'statusCode': 500,
                    'body': json.dumps(response_body),
                }
                return response


def query(params):
    dynamodb = boto3.client('dynamodb')
    return dynamodb.query(**params)['Items']