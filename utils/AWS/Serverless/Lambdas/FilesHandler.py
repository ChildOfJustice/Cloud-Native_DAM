import boto3
import json
import uuid
from boto3.dynamodb.conditions import Attr, Key
from botocore.exceptions import ClientError

def handler(event, context):
    table = boto3.resource("dynamodb").Table("CloudNativeDAM_DB")
    index_name = "Data-index"

    requester_cognito_user_id = event.get('requestContext').get('authorizer').get('jwt').get('claims').get('sub')
    
    if(event.get('routeKey').startswith('POST') and json.loads(event.get('body')).get('clusterId') is not None):
        ...
        # #POST add a new file to cluster
        # new_cluster_id = str(uuid.uuid4())
        # try:
        #     db_response = table.put_item(
        #         Item={
        #             'ID': 'CLUSTER#' + new_cluster_id,
        #             'SK': 'CLUSTER#' + new_cluster_id,
        #             'Data': requester_cognito_user_id,
        #             'name': json.loads(event.get('body')).get('name')
        #         }
        #     )
        # except ClientError as e:
        #     print(e)
        #     response_body = {
        #         'message': e.response['Error']['Code']
        #     }
        #     response = {
        #         'statusCode': 500,
        #         'body': json.dumps(response_body),
        #     }
        #     return response
    if(event.get('routeKey').startswith('GET')):
        if(event.get('queryStringParameters') is None):
            response_body = {
                'error': 'no queryparams'
            }

            response = {
                'statusCode': 400,
                'body': json.dumps(response_body),
            }
            return response
            # GET all user's clusters
            # query_params = {
            #     'TableName': 'CloudNativeDAM_DB',
            #     'IndexName': index_name,
            #     'ExpressionAttributeNames': {'#C_ID': 'SK', '#OWN': 'Data'},
            #     'ExpressionAttributeValues': {':Cid': {'S': 'CLUSTER#'},':Uid': {'S': requester_cognito_user_id}},
            #     'KeyConditionExpression': '#OWN = :Uid AND begins_with(#C_ID, :Cid)'
            # }
            
            # try:
            #     items = query(query_params)
            #     response_body = {
            #         'items': items# TODO
            #     }

            #     response = {
            #         'statusCode': 200,
            #         'body': json.dumps(response_body),
            #     }
            #     return response
            # except ClientError as e:
            #     print(e)
            #     response_body = {
            #         'message': e.response['Error']['Code']
            #     }
            #     response = {
            #         'statusCode': 500,
            #         'body': json.dumps(response_body),
            #     }
            #     return response


        else:
            
            try:
                if(event.get('queryStringParameters').get('calcUsedSize') == 'true'):
                    # GET Calc used storage size

                    query_params = {
                        'TableName': 'CloudNativeDAM_DB',
                        'IndexName': index_name,
                        'ProjectionExpression':"fileSize_MB",
                        'ExpressionAttributeNames': {'#U_ID': 'Data', '#SK': 'SK'},
                        'ExpressionAttributeValues': {':Uid': {'S': requester_cognito_user_id},':sk': {'S': 'FILE#'}},
                        'KeyConditionExpression': '#U_ID = :Uid AND begins_with(#SK, :sk)'
                    }
                    user_files = query(query_params)
                    used_storage_size = 0
                    for item in user_files:
                        used_storage_size += float(item['fileSize_MB']['N'])
                    
                    response_body = {
                        'usedStorageSize': used_storage_size
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