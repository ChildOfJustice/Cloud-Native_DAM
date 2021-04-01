import boto3
import json
import uuid
from boto3.dynamodb.conditions import Attr, Key
from botocore.exceptions import ClientError

def handler(event, context):
    table = boto3.resource("dynamodb").Table("CloudNativeDAM_DB")
    index_name = "Data-index"

    requester_cognito_user_id = event.get('requestContext').get('authorizer').get('jwt').get('claims').get('sub')
    
    if(event.get('routeKey').startswith('POST')):
        #POST create a co-user
        new_permission_id = str(uuid.uuid4())
        try:
            db_response = table.put_item(
                Item={
                    'ID': json.loads(event.get('body')).get('clusterId'),
                    'SK': 'PERMISSION#' + new_permission_id,
                    'Data': json.loads(event.get('body')).get('principalUserId'),
                    'GiverUserId': requester_cognito_user_id,
                    'Permissions': json.loads(event.get('body')).get('permissions'),
                    'ClusterOwnerUserName': event.get('requestContext').get('authorizer').get('jwt').get('claims').get('username'),
                    'ClusterName': json.loads(event.get('body')).get('clusterName')
                }
            )
            response_body = {
                'message': 'Permission created successfully'
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
    if(event.get('routeKey').startswith('GET')):
        action = event.get('queryStringParameters').get('action')
        cluster_id = None
        # try:
        cluster_id = event.get('queryStringParameters').get('clusterId')
            # if(cluster_id == '' or (cluster_id is None)):
            #     raise ValueError('Cluster id cannot be empty')
        # except ValueError as e:
        #     print(e)
        #     response_body = {
        #         'message': str(e)
        #     }
        #     response = {
        #         'statusCode': 400,
        #         'body': json.dumps(response_body),
        #     }
        #     return response
        
        if(action == 'getUserPermissions'):
            if(cluster_id == '' or (cluster_id is None)):
                #Get all permissions for the user
                query_params = {
                    'TableName': 'CloudNativeDAM_DB',
                    'IndexName': index_name,
                    'ExpressionAttributeNames': {'#P_ID': 'SK', '#U_ID': 'Data'},
                    'ExpressionAttributeValues': {':Pid': {'S': 'PERMISSION#'},':Uid': {'S': requester_cognito_user_id}},
                    'KeyConditionExpression': '#U_ID = :Uid AND begins_with(#P_ID, :Pid)'
                }
                try:
                    items = query(query_params)                    
                    response_body = {
                        'items': items
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
                # GET the cluster permissions for this user

                query_params = {
                    'TableName': 'CloudNativeDAM_DB',
                    'IndexName': index_name,
                    'ExpressionAttributeNames': {'#P_ID': 'SK', '#U_ID': 'Data', '#C_ID': 'ID'},
                    'ExpressionAttributeValues': {':Pid': {'S': 'PERMISSION#'},':Uid': {'S': requester_cognito_user_id},':Cid': {'S': cluster_id}},
                    'KeyConditionExpression': '#U_ID = :Uid AND begins_with(#P_ID, :Pid)',
                    'FilterExpression': '#C_ID = :Cid'
                }
                
                try:
                    items = query(query_params)
                    if(len(items) != 0):
                        response_body = {
                            'permissions': items[0]['Permissions']['S']
                        }
                    else:
                        response_body = {
                            'permissions': "0000"
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


        elif(action == 'getAllCoUsers'):
            # GET all permissions for the cluster
            try:
                
                query_params = {
                    'TableName': 'CloudNativeDAM_DB',
                    'ExpressionAttributeNames': {'#C_ID': 'ID', '#SK': 'SK'},
                    'ExpressionAttributeValues': {':Cid': {'S': cluster_id},':sk': {'S': 'PERMISSION#'}},
                    'KeyConditionExpression': '#C_ID = :Cid AND begins_with(#SK, :sk)'
                }
                items = query(query_params)
                response_body = {
                    'items': items
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
    if(event.get('routeKey').startswith('DELETE')):
        permission_id = None
        try:
            permission_id = json.loads(event.get('body')).get('permissionId')
            if(permission_id == '' or (permission_id is None)):
                raise ValueError('permission id cannot be empty')
        except ValueError as e:
            print(e)
            response_body = {
                'message': str(e)
            }
            response = {
                'statusCode': 400,
                'body': json.dumps(response_body),
            }
            return response

        table.delete_item(
            Key={
                'ID': json.loads(event.get('body')).get('clusterId'),
                'SK': permission_id
            }
        )
        response_body = {
            'message': 'Permission deleted successfully'
        }
        response = {
            'statusCode': 200,
            'body': json.dumps(response_body),
        }
        return response

    response_body = {
        'message': 'no such operation available'
    }
    response = {
        'statusCode': 400,
        'body': json.dumps(response_body),
    }
    return response

def query(params):
    dynamodb = boto3.client('dynamodb')
    return dynamodb.query(**params)['Items']