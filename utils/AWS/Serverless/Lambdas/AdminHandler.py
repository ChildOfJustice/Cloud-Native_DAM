import boto3
import json
from boto3.dynamodb.conditions import Attr, Key
from botocore.exceptions import ClientError

def handler(event, context):
    index_name = "Data-index"
    table_name = "CloudNativeDAM_DB"
    ADMIN_ROLE = "ADMINISTRATOR"
    table = boto3.resource("dynamodb").Table(table_name)

    #TODO: add check whether the user is admin
    # GET user's role
    requester_cognito_user_id = event.get('requestContext').get('authorizer').get('jwt').get('claims').get('sub')
    get_user_role_query = {
        'TableName': 'CloudNativeDAM_DB',
        'ExpressionAttributeNames': {'#ID': 'ID', '#SK': 'SK'},
        'ExpressionAttributeValues': {':id': {'S': requester_cognito_user_id},':sk': {'S': requester_cognito_user_id}},
        'KeyConditionExpression': '#ID = :id AND #SK = :sk'
    }

    get_user_role_res = query(get_user_role_query)
    print("User is: \n")
    print(get_user_role_res)

    if (get_user_role_res[0]['role']['S'] != ADMIN_ROLE):
        response_body = {
            'message': 'Your role does not provide necessary access'
        }
        response = {
            'statusCode': 403,
            'body': json.dumps(response_body),
        }
        return response

    query_code = None
    try:
        query_code = json.loads(event.get('body')).get('query')
    except ValueError as e:
        print(e)
        response_body = {
            'message': 'bad query'
        }
        response = {
            'statusCode': 400,
            'body': json.dumps(response_body),
        }
        return response

    if(query_code is not None):
        try:
            loc = {}
            exec("items = query(" + query_code + ")", globals(), loc)
            response_body = {
                'response': loc['items']
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