import json

def handler(event, context):
    print(event)

    response_body = {
        'raw path': event.get('rawPath'),
        'rawQueryString': event.get('rawQueryString'),
        'queryStringParameters': event.get('queryStringParameters'),
        'wholeEvent': event
    }

    response = {
        'statusCode': 200,
        'body': json.dumps(response_body),
    }
    return response