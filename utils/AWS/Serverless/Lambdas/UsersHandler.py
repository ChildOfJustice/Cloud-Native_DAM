import boto3
import json
from boto3.dynamodb.conditions import Attr, Key

def handler(event, context):
    table = boto3.resource("dynamodb").Table("CloudNativeDAM_DB")
    index_name = "Data-index"

    # while True:
    #     if (
    #         not table.global_secondary_indexes
    #         or table.global_secondary_indexes[0]["IndexStatus"] != "ACTIVE"
    #     ):
    #         print("Waiting for index to backfill...")
    #         time.sleep(5)
    #         table.reload()
    #     else:
    #         break

    requester_cognito_user_id = event.get('requestContext').get('authorizer').get('jwt').get('claims').get('sub')
    # print(requester_cognito_user_id)
    queries = {
    #C - Cluster
    #F - File
    #U - User
        # 'ID': {
        #     'TableName': 'CloudNativeDAM_DB',
        #     #             'IndexName': 'Data-index',
        #     'ExpressionAttributeNames': {'#I': 'ID'},
        #     'ExpressionAttributeValues': {':id': {'S': 'USER#1'}},
        #     'KeyConditionExpression': '#I = :id'
        # },
        #     'AllCoUsersForThisCluster': {
        #     'TableName': 'CloudNativeDAM_DB',
        #     'ExpressionAttributeNames': {'#C_ID': 'ID', '#SK': 'SK'},
        #     'ExpressionAttributeValues': {':id': {'S': 'CLUSTER#1'}, ':sk': {'S': 'PERMISSION#'}},
        #     'KeyConditionExpression': '#C_ID = :id AND begins_with(#SK, :sk)'
        # },
            'userRole': {
            'TableName': 'CloudNativeDAM_DB',
            #'ProjectionExpression': 'role',
            # I CANNOT do the query without PK or with beginsWith condition on PK!!!
            'ExpressionAttributeNames': {'#ID': 'ID'},
            'ExpressionAttributeValues': {':id': {'S': requester_cognito_user_id}},
            'KeyConditionExpression': '#ID = :id'
        },
    }


    items = query(queries.get('userRole'))
    # print(f'Returned Items:\n{items}')

    if(len(items) == 0):
        try:
            create_new_user(table, event.get('requestContext').get('authorizer').get('jwt').get('claims'))
            # items = query(queries.get('userRole'))
            # print(f'Returned Items 2! :\n{items}')
            response_body = {
                'role': 'ORDINARY_USER'
            }

            response = {
                'statusCode': 200,
                'body': json.dumps(response_body),
            }
            return response
        except ClientError as e:
            print(e)
            response_body = {
                'message': e
            }
            response = {
                'statusCode': 500,
                'body': json.dumps(response_body),
            }
            return response

    response_body = {
        'role': items[0].get('role').get('S')
    }

    response = {
        'statusCode': 200,
        'body': json.dumps(response_body),
    }
    return response

def query(params):
    dynamodb = boto3.client('dynamodb')
    return dynamodb.query(**params)['Items']

def create_new_user(table, jwt_claims):
    db_response = table.put_item(
        Item={
            'ID': jwt_claims.get('sub'),
            'SK': jwt_claims.get('username'),
            'role': 'ORDINARY_USER'
        }
    )
    return db_response