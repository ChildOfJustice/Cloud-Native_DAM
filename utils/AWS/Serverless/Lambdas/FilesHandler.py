import boto3
import json
import uuid
from boto3.dynamodb.conditions import Attr, Key
from botocore.exceptions import ClientError
from decimal import Decimal

def handler(event, context):
    table = boto3.resource("dynamodb").Table("CloudNativeDAM_DB")
    client = boto3.client('dynamodb')
    table_name = "CloudNativeDAM_DB"
    index_name = "Data-index"
    index_name2 = "File-Clusters-index"
    

    requester_cognito_user_id = event.get('requestContext').get('authorizer').get('jwt').get('claims').get('sub')
    
    if(event.get('routeKey').startswith('POST')):
        if(json.loads(event.get('body')).get('action') is None):
            #POST add a new file to cluster
            new_file_id = str(uuid.uuid4())
            try:
                cluster_id = json.loads(event.get('body')).get('clusterId')
                if(cluster_id == '' or (cluster_id is None)):
                    raise ValueError('Cluster id cannot be empty')
            except ValueError as e:

                response_body = {
                    'message': str(e)
                }
                response = {
                    'statusCode': 400,
                    'body': json.dumps(response_body),
                }
                return response

            tag_keys_list = json.loads(event.get('body')).get('tagsKeys')
            if(len(tag_keys_list) == 0):
                tag_keys_list.append("")
            tag_values_list = json.loads(event.get('body')).get('tagsValues')
            if(len(tag_values_list) == 0):
                tag_values_list.append("")
            #print(tag_keys_list) WILL BE [""]
            #print(json.loads(event.get('body')).get('tagsKeys').append("")) WILL BE None !!!!!!!!!!! (Python and web are the worst)
            try:
                db_response = client.transact_write_items(
                    TransactItems=[
                        {
                            'Put': {
                                'Item': json.loads(json.dumps({
                                    'ID': { 'S': 'FILE#' + new_file_id },
                                    'SK': { 'S': 'FILE#' + new_file_id },
                                    'Data': { 'S': requester_cognito_user_id },
                                    'Name': { 'S': json.loads(event.get('body')).get('name') },
                                    'S3uniqueName': { 'S': json.loads(event.get('body')).get('S3uniqueName') },
                                    'Cloud': { 'S': json.loads(event.get('body')).get('cloud') },
                                    'OwnedBy': { 'S': json.loads(event.get('body')).get('ownedBy') },
                                    'UploadedBy': { 'S': json.loads(event.get('body')).get('uploadedBy') },
                                    'SizeOfFile_MB': { 'N': str(float(json.loads(event.get('body')).get('sizeOfFile_MB'))) },
                                    'TagsKeys': { 'SS': tag_keys_list },
                                    'TagsValues': { 'SS': tag_values_list }
                                }), parse_float=Decimal),
                                'TableName': table_name
                            }
                        },
                        {
                            'Put': {
                                'Item': {
                                    'ID': { 'S': cluster_id },
                                    'SK': { 'S': 'FILE#' + new_file_id },
                                    'FileName': { 'S': json.loads(event.get('body')).get('name') }
                                },
                                'TableName': table_name
                            }
                        }
                    ]
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

            response_body = {
                'message': 'new file added to cluster successfully'
            }

            response = {
                'statusCode': 200,
                'body': json.dumps(response_body),
            }
            return response
        elif(json.loads(event.get('body')).get('action') == 'addFileToCluster'):
            try:
                db_response = table.put_item(
                    Item={
                        'ID': json.loads(event.get('body')).get('clusterId'),
                        'SK': json.loads(event.get('body')).get('fileId'),
                        'FileName': json.loads(event.get('body')).get('fileName'),
                    }
                )
                response_body = {
                    'message': 'file-cluster sub record created successfully'
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
        if(event.get('queryStringParameters') is None):
            # Return all files for the user
            query_params = {
                'TableName': 'CloudNativeDAM_DB',
                'IndexName': index_name,
                #'ProjectionExpression': "SK",
                'ExpressionAttributeNames': {'#U_ID': 'Data', '#SK': 'SK'},
                'ExpressionAttributeValues': {':Uid': {'S': requester_cognito_user_id},':sk': {'S': 'FILE#'}},
                'KeyConditionExpression': '#U_ID = :Uid AND begins_with(#SK, :sk)'
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

        else:
            try:
                if(event.get('queryStringParameters').get('calcUsedSize') == 'true'):
                    # GET Calc used storage size

                    query_params = {
                        'TableName': 'CloudNativeDAM_DB',
                        'IndexName': index_name,
                        'ProjectionExpression':"SizeOfFile_MB",
                        'ExpressionAttributeNames': {'#U_ID': 'Data', '#SK': 'SK'},
                        'ExpressionAttributeValues': {':Uid': {'S': requester_cognito_user_id},':sk': {'S': 'FILE#'}},
                        'KeyConditionExpression': '#U_ID = :Uid AND begins_with(#SK, :sk)'
                    }
                    user_files = query(query_params)
                    used_storage_size = 0
                    for item in user_files:
                        used_storage_size += float(item['SizeOfFile_MB']['N'])

                    response_body = {
                        'usedStorageSize': used_storage_size
                    }

                    response = {
                        'statusCode': 200,
                        'body': json.dumps(response_body),
                    }
                    return response

                if(event.get('queryStringParameters').get('clusterId') is not None):
                    # Return all files metadata for the files in the cluster
                    files_metadata = []
                    query_params = {
                        'TableName': 'CloudNativeDAM_DB',
                        'ProjectionExpression': "SK",
                        'ExpressionAttributeNames': {'#C_ID': 'ID', '#SK': 'SK'},
                        'ExpressionAttributeValues': {':Cid': {'S': event.get('queryStringParameters').get('clusterId')},':sk': {'S': 'FILE#'}},
                        'KeyConditionExpression': '#C_ID = :Cid AND begins_with(#SK, :sk)'
                    }
                    items = query(query_params)

                    for item in items:
                        query_params = {
                            'TableName': 'CloudNativeDAM_DB',
                            'ExpressionAttributeNames': {'#F_ID': 'ID', '#SK': 'SK'},
                            'ExpressionAttributeValues': {':Fid': {'S': item['SK']['S']},':sk': {'S': item['SK']['S']}},
                            'KeyConditionExpression': '#F_ID = :Fid AND #SK = :sk'
                        }
                        file_metadata = query(query_params)[0]
                        files_metadata.append(file_metadata)

                    response_body = {
                        'items': files_metadata
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
    if(event.get('routeKey').startswith('DELETE')):
        print(json.loads(event.get('body')))
        file_id = json.loads(event.get('body')).get('fileId')
        cluster_id = json.loads(event.get('body')).get('clusterId')
        if(cluster_id is None):
            #DELETE the file
            try:
                # Delete all Cluster-File records
                query_params = {
                    'TableName': 'CloudNativeDAM_DB',
                    'IndexName': index_name2,
                    'ExpressionAttributeNames': {'#C_ID': 'ID', '#F_ID': 'SK'},
                    'ExpressionAttributeValues': {':Cid': {'S': 'CLUSTER#'},':Fid': {'S': file_id}},
                    'KeyConditionExpression': '#F_ID = :Fid AND begins_with(#C_ID, :Cid)'
                }
                file_clusters = query(query_params)
                with table.batch_writer() as batch:
                    for item in file_clusters:
                        batch.delete_item(Key={'ID': item['ID']['S'], 'SK': item['SK']['S']})

                #Delete the file
                db_response = table.delete_item(
                    Key={
                        'ID': file_id,
                        'SK': file_id
                    }
                )
                response_body = {
                    'message': 'File deleted successfully'
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
            try:
                db_response = table.delete_item(
                    Key={
                        'ID': cluster_id,
                        'SK': file_id
                    }
                )
                response_body = {
                    'message': 'File removed from the cluster successfully'
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