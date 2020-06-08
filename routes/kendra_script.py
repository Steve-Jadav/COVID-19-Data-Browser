import sys
import json
import boto3
from botocore.exceptions import ClientError

def query_index(index_id, query):

    """
    - Returns the query response.
    This function is used from the Node.js application.
    The user inputs a question which becomes the query for
    this function.
    - Supports who, what, when, or where type of questions. """

    response = kendra.query(
        QueryText = query,
        IndexId = index_id)

    result = {
        "ANSWER": [],
        "DOCUMENT": []
    }

    for query_result in response['ResultItems']:

        if query_result['Type']=='ANSWER':
            answer_text = query_result['DocumentExcerpt']['Text']
            result["ANSWER"].append(answer_text)

        if query_result['Type']=='DOCUMENT':
            document_text = query_result['DocumentExcerpt']['Text']
            result["DOCUMENT"].append(document_text)

    return json.dumps(result)

if __name__ == "__main__":
    kendra = boto3.client("kendra")
    index_id = "ab8b6d39-d153-4c76-b613-d0ca08481f1e"
    query = sys.argv[1]
    result = query_index(index_id, query)
    print (result)
