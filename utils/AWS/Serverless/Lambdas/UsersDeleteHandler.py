import boto3
import json
from boto3.dynamodb.conditions import Attr, Key

def handler(event, context):
    index_name = "Data-index"
    table_name = "CloudNativeDAM_DB"
    table = boto3.resource("dynamodb").Table(table_name)


    requester_cognito_user_id = event.get('requestContext').get('authorizer').get('jwt').get('claims').get('sub')

    if(event.get('routeKey').startswith('DELETE')):
        #DELETE delete the user
        try:
            # Delete all Permissions given to the user
            query_params = {
                'TableName': table_name,
                'IndexName': index_name,
                'ExpressionAttributeNames': {'#U_ID': 'Data', '#P_ID': 'SK'},
                'ExpressionAttributeValues': {':Uid': {'S': requester_cognito_user_id},':Pid': {'S': 'PERMISSION#'}},
                'KeyConditionExpression': '#U_ID = :Uid AND begins_with(#P_ID, :Pid)'
            }
            user_permissions = query(query_params)
            with table.batch_writer() as batch:
                for item in user_permissions['Items']:
                    batch.delete_item(Key={'PK': item['PK'], 'SK': item['SK']})

            #Delete the user
            db_response = table.delete_item(
                Key={
                    'ID': requester_cognito_user_id
                }
            )
            response_body = {
                'message': 'User deleted successfully'
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