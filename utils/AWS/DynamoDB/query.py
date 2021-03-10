#!/usr/bin/env python3

import time

import boto3
from boto3.dynamodb.conditions import Attr, Key

table = boto3.resource("dynamodb").Table("CloudNativeDAM_DB")
index_name = "Data-index"

# When adding a GSI to an existing table, you can't query the index until it
# has been backfilled. This portion of the script waits until the index is in
# the "ACTIVE" status, indicating it is ready to be queried.

while True:
    if (
        not table.global_secondary_indexes
        or table.global_secondary_indexes[0]["IndexStatus"] != "ACTIVE"
    ):
        print("Waiting for index to backfill...")
        time.sleep(5)
        table.reload()
    else:
        break

def query(params):
    dynamodb = boto3.client('dynamodb')
    return dynamodb.query(**params)['Items']

queries = {
#C - Cluster
#F - File
#U - User
        'ID': {
            'TableName': 'CloudNativeDAM_DB',
#             'IndexName': 'Data-index',
            'ExpressionAttributeNames': {'#I': 'ID'},
            'ExpressionAttributeValues': {':id': {'S': 'USER#1'}},
            'KeyConditionExpression': '#I = :id'
        },
        'AllCoUsersForThisCluster': {
            'TableName': 'CloudNativeDAM_DB',
            'ExpressionAttributeNames': {'#C_ID': 'ID', '#SK': 'SK'},
            'ExpressionAttributeValues': {':id': {'S': 'CLUSTER#1'}, ':sk': {'S': 'PERMISSION#'}},
            'KeyConditionExpression': '#C_ID = :id AND begins_with(#SK, :sk)'
        },
#         'PhoneArea': {
#             'TableName': 'CloudNativeDAM_DB',
#             'IndexName': 'Phone-index',
#             'ExpressionAttributeNames': {'#LOC': 'X.locale', '#PHONE': 'PhoneNumber'},
#             'ExpressionAttributeValues': {':locale': {'S': 'en-US'}, ':area': {'S': '(206)'}},
#             'KeyConditionExpression': '#LOC = :locale AND begins_with(#PHONE, :area)'
#         },
#         'StarbucksCVS': {
#             'TableName': 'CloudNativeDAM_DB',
#             'IndexName': 'Starbucks-CVS-index',
#             'ExpressionAttributeNames': {'#STAR': 'Starbucks', '#CVS': 'CVS'},
#             'ExpressionAttributeValues': {':star': {'S': '1'}, ':cvs': {'S': '1'}},
#             'KeyConditionExpression': '#STAR = :star AND #CVS = :cvs'
#         },
#         'State': {
#             'TableName': 'CloudNativeDAM_DB',
#             'ExpressionAttributeNames': {'#STATE': 'Address.Subdivision'},
#             'ExpressionAttributeValues': {':state': {'S': 'WA'}},
#             'KeyConditionExpression': '#STATE = :state'
#         },
#         'StateCity': {
#             'TableName': 'CloudNativeDAM_DB',
#             'IndexName': 'City-Zip-index',
#             'ExpressionAttributeNames': {'#STATE': 'Address.Subdivision', '#CITYZIP': 'CityZip'},
#             'ExpressionAttributeValues': {':state': {'S': 'WA'}, ':city': {'S': 'Seattle'}},
#             'KeyConditionExpression': '#STATE = :state AND begins_with(#CITYZIP, :city)'
#         },
#         'StateCityZip': {
#             'TableName': 'CloudNativeDAM_DB',
#             'IndexName': 'City-Zip-index',
#             'ExpressionAttributeNames': {'#STATE': 'Address.Subdivision', '#CITYZIP': 'CityZip'},
#             'ExpressionAttributeValues': {':state': {'S': 'WA'}, ':cityzip': {'S': 'Seattle#98125'}},
#             'KeyConditionExpression': '#STATE = :state AND begins_with(#CITYZIP, :cityzip)'
#         }
    }

for k, q in queries.items():
    attribPer = []
    print(f'\nRunning query {k}')
    items = query(q)
    print(f'Returned Items:\n{items}')
    #itemCount = len(items)
    #for i in items:
    #    attribPer.append(len(i))
    #avgAttribs = sum(attribPer) // itemCount
    #print(f'Query {k} returned {itemCount} items with an average of {avgAttribs} attributes')








# When making a Query call, you use the KeyConditionExpression parameter to
# specify the partition key on which you want to query. If you want to use a
# specific index, you also need to pass the IndexName in your API call.

# Query our access patterns:
# - Find all orders for a user within the last 30 days.
# - For a given warehouse, which parts are on backorder?

# print(">>> Find all orders for a user within the last 30 days.\n")
# resp = table.query(
#     IndexName=index_name,
#     KeyConditionExpression=Key("SK").eq("USER#1234"),
#     FilterExpression=Attr("ID").begins_with("ORDER#")
#     & Attr("OrderDate").gt("2019-12-01"),
# )
# for item in resp["Items"]:
#     print(item)
#
# print("\n>>> For a given warehouse, which parts are on backorder?\n")
# resp = table.query(
#     IndexName=index_name,
#     KeyConditionExpression=Key("SK").eq("WH#63") & Key("Data").eq("Backordered"),
# )
# for item in resp["Items"]:
#     print(item)