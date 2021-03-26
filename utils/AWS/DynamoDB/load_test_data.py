#!/usr/bin/env python3
import json
import boto3
from decimal import Decimal
from botocore.exceptions import ClientError

table = boto3.resource("dynamodb").Table("CloudNativeDAM_DB")

try:
    with table.batch_writer() as batch:
        batch.put_item(Item={"ID": "a8e048ba-b9c8-4d9c-a51f-0953438a7ef1", "SK": "USER", "Data": "email@gmail.com"}),
        batch.put_item(Item={"ID": "111111-b9c8-4d9c-a51f-0953438a7ef1", "SK": "USER", "Data": "email2@gmail.com"}),
        batch.put_item(
            Item={
                "ID": "CLUSTER#1",
                "SK": "CLUSTER#1",
                "Data": "a8e048ba-b9c8-4d9c-a51f-0953438a7ef1",
                "DateCreated": "2020-01-04",
            }
        ),
        batch.put_item(
            Item={
                "ID": "CLUSTER#2",
                "SK": "CLUSTER#2",
                "Data": "111111-b9c8-4d9c-a51f-0953438a7ef1",
                "DateCreated": "2020-01-04",
            }
        ),
        batch.put_item(Item=json.loads(json.dumps({
            "ID": "FILE#1",
            "SK": "FILE#1",
            "Data": "a8e048ba-b9c8-4d9c-a51f-0953438a7ef1",
            "DateAdded": "2020-01-04",
            "Size_MB": 1.9,
            }), parse_float=Decimal)
        ),
        batch.put_item(Item=json.loads(json.dumps({
            "ID": "FILE#2",
            "SK": "FILE#2",
            "Data": "a8e048ba-b9c8-4d9c-a51f-0953438a7ef1",
            "DateAdded": "2020-01-04",
            "Size_MB": 2.9,
            }), parse_float=Decimal)
        ),
        batch.put_item(Item=json.loads(json.dumps({
            "ID": "FILE#3",
            "SK": "FILE#3",
            "Data": "111111-b9c8-4d9c-a51f-0953438a7ef1",
            "DateAdded": "2020-01-04",
            "Size_MB": 3.9,
            }), parse_float=Decimal)
        ),

        batch.put_item(
            Item={
                "ID": "CLUSTER#1",
                "SK": "FILE#1",
                "Data": "2020-01-04",
            }
        ),
        batch.put_item(
            Item={
                "ID": "CLUSTER#1",
                "SK": "FILE#2",
                "Data": "2020-01-04",
            }
        ),
        batch.put_item(
            Item={
                "ID": "CLUSTER#2",
                "SK": "FILE#3",
                "Data": "2020-01-04",
            }
        ),


        batch.put_item(
            Item={
                "ID": "CLUSTER#1",
                "SK": "PERMISSION#1",
                "Data": "111111-b9c8-4d9c-a51f-0953438a7ef1",
                "GiverUserId": "a8e048ba-b9c8-4d9c-a51f-0953438a7ef1",
                "Permissions": "0100",
            }
        )
        batch.put_item(
            Item={
                "ID": "CLUSTER#3",
                "SK": "PERMISSION#2",
                "Data": "a8e048ba-b9c8-4d9c-a51f-0953438a7ef1",
                "GiverUserId": "111111-b9c8-4d9c-a51f-0953438a7ef1",
                "Permissions": "1101",
            }
        )
except ClientError as e:
    print(e)