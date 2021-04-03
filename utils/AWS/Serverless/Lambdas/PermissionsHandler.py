import boto3
import json
import uuid
from boto3.dynamodb.conditions import Attr, Key
from botocore.exceptions import ClientError

def handler(event, context):
    table = boto3.resource("dynamodb").Table("CloudNativeDAM_DB")
    index_name = "Data-index"

    requester_cognito_user_id = event.get('requestContext').get('authorizer').get('jwt').get('claims').get('sub')
    requester_cognito_user_name = event.get('requestContext').get('authorizer').get('jwt').get('claims').get('username')

    if(event.get('routeKey').startswith('POST')):
        #POST create a co-user
        new_permission_id = str(uuid.uuid4())
        try:
            #Check whether if the permission already exists
            cluster_id = json.loads(event.get('body')).get('clusterId')
            query_params = {
                'TableName': 'CloudNativeDAM_DB',
                'IndexName': index_name,
                'ExpressionAttributeNames': {'#P_ID': 'SK', '#U_NAME': 'Data', '#C_ID': 'ID'},
                'ExpressionAttributeValues': {':Pid': {'S': 'PERMISSION#'},':Uname': {'S': json.loads(event.get('body')).get('principalUserName')},':Cid': {'S': cluster_id}},
                'KeyConditionExpression': '#U_NAME = :Uname AND begins_with(#P_ID, :Pid)',
                'FilterExpression': '#C_ID = :Cid'
            }

            items = query(query_params)
            if(len(items) != 0):
                permission = items[0]
                if(permission['Permissions']['S'] != json.loads(event.get('body')).get('permissions')):
                    #permission already exists, need to update it
                    table.update_item(
                        Key={
                            'ID': permission['ID']['S'],
                            'SK': permission['SK']['S']
                        },
                        UpdateExpression="set #P=:p",
                        ExpressionAttributeNames={
                            '#P': "Permissions"
                        },
                        ExpressionAttributeValues={
                            ':p': json.loads(event.get('body')).get('permissions')
                        }
                    )
                    response_body = {
                        'message': 'Permission updated successfully'
                    }
                    response = {
                        'statusCode': 200,
                        'body': json.dumps(response_body),
                    }
                    return response
                else:
                    response_body = {
                        'message': 'Such permission already exists'
                    }
                    response = {
                        'statusCode': 200,
                        'body': json.dumps(response_body),
                    }
                    return response
            else:
                db_response = table.put_item(
                    Item={
                        'ID': json.loads(event.get('body')).get('clusterId'),
                        'SK': 'PERMISSION#' + new_permission_id,
                        'Data': json.loads(event.get('body')).get('principalUserName'),
                        'GiverUserId': requester_cognito_user_id,
                        'GiverUserName': requester_cognito_user_name,
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
        cluster_id = event.get('queryStringParameters').get('clusterId')
        if(action == 'getUserPermissions'):
            if(cluster_id == '' or (cluster_id is None)):
                #Get all permissions for the user
                query_params = {
                    'TableName': 'CloudNativeDAM_DB',
                    'IndexName': index_name,
                    'ExpressionAttributeNames': {'#P_ID': 'SK', '#U_NAME': 'Data'},
                    'ExpressionAttributeValues': {':Pid': {'S': 'PERMISSION#'},':Uname': {'S': requester_cognito_user_name}},
                    'KeyConditionExpression': '#U_NAME = :Uname AND begins_with(#P_ID, :Pid)'
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
                    'ExpressionAttributeValues': {':Pid': {'S': 'PERMISSION#'},':Uid': {'S': requester_cognito_user_name},':Cid': {'S': cluster_id}},
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