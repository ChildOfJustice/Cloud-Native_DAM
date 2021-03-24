import boto3
import json
from boto3.dynamodb.conditions import Attr, Key

def handler(event, context):
    index_name = "Data-index"
    table_name = "CloudNativeDAM_DB"
    table = boto3.resource("dynamodb").Table(table_name)

    #TODO: add check whether the user is admin
    query_params = None
    try:
        query_params = json.loads(event.get('body')).get('query')
    except ValueError as e:
        print(e)
        response_body = {
            'message': 'cannot execute empty query'
        }
        response = {
            'statusCode': 400,
            'body': json.dumps(response_body),
        }
        return response
    if(query_params is not None):
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