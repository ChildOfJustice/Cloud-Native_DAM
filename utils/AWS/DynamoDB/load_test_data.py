#!/usr/bin/env python3

import boto3
from botocore.exceptions import ClientError

table = boto3.resource("dynamodb").Table("CloudNativeDAM_DB")

try:
    with table.batch_writer() as batch:
        batch.put_item(Item={"ID": "USER#1", "SK": "role#1"}),
        batch.put_item(
            Item={
                "ID": "CLUSTER#1",
                "SK": "CLUSTER#1",
                "Data": "USER#1",
                "DateCreated": "2020-01-04",
            }
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
                "ID": "FILE#1",
                "SK": "FILE#1",
                "Data": "USER#1",
                "DateAdded": "2020-01-04",
                "Size_MB": 2,
            }
        ),
        batch.put_item(
            Item={
                "ID": "CLUSTER#1",
                "SK": "PERMISSION#1",
                "Data": "USER#1",
                "GiverUserID": "USER#2",
                "Permissions": "0100",
            }
        )
except ClientError as e:
    print(e)