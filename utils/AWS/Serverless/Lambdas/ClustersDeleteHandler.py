import boto3
import json
from boto3.dynamodb.conditions import Attr, Key
from botocore.exceptions import ClientError

def handler(event, context):
    table = boto3.resource("dynamodb").Table("CloudNativeDAM_DB")
    index_name = "Data-index"

    requester_cognito_user_id = event.get('requestContext').get('authorizer').get('jwt').get('claims').get('sub')
    cluster_id = None
    try:
        cluster_id = json.loads(event.get('body')).get('clusterId')
    except ValueError as e:
        response_body = {
            'message': 'cannot delete cluster with id null'
        }
        response = {
            'statusCode': 400,
            'body': json.dumps(response_body),
        }
        return response

    if(event.get('routeKey').startswith('DELETE') and cluster_id is not None):
        #DELETE delete the cluster
        try:
            # Delete all Cluster-File records
            query_params = {
                'TableName': 'CloudNativeDAM_DB',
                'ExpressionAttributeNames': {'#C_ID': 'ID', '#F_ID': 'SK'},
                'ExpressionAttributeValues': {':Cid': {'S': cluster_id},':Fid': {'S': 'FILE#'}},
                'KeyConditionExpression': '#C_ID = :Cid AND begins_with(#F_ID, :Fid)'
            }
            cluster_files = query(query_params)
            with table.batch_writer() as batch:
                for item in cluster_files:
                    batch.delete_item(Key={'ID': item['ID']['S'], 'SK': item['SK']['S']})
            # Delete all Permissions for the cluster
            query_params = {
                'TableName': 'CloudNativeDAM_DB',
                'ExpressionAttributeNames': {'#C_ID': 'ID', '#P_ID': 'SK'},
                'ExpressionAttributeValues': {':Cid': {'S': cluster_id},':Pid': {'S': 'PERMISSION#'}},
                'KeyConditionExpression': '#C_ID = :Cid AND begins_with(#P_ID, :Pid)'
            }
            cluster_permissions = query(query_params)
            with table.batch_writer() as batch:
                for item in cluster_permissions:
                    batch.delete_item(Key={'ID': item['ID']['S'], 'SK': item['SK']['S']})
            #Delete the cluster
            db_response = table.delete_item(
                Key={
                    'ID': cluster_id,
                    'SK': cluster_id
                }
            )
            response_body = {
                'message': 'Cluster deleted successfully'
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