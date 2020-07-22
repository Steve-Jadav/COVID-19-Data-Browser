""" Elasticsearch installation:
- brew install elasticsearch
- elasticsearch (to start the service) It runs on port 9200.
- pip3 install elasticsearch """


import json, os
import elasticsearch
from datetime import datetime
from pprint import pprint

class ElasticSearchClient:

    """ High level wrapper around elasticsearch python client.
    Can be used to perform efficient full-text search through a massive number of documents. """

    def __init__(self):
        self.es = elasticsearch.Elasticsearch()
        self.idx = 0


    def find_index(self, index_name: str = "*"):
        """ If index_name equals '*', return all the available indices """

        return self.es.indices.get(index_name)


    def insert_document(self, index_name: str, doc: dict, idx = "auto"):
        """ Creates an index with "index_name" if it does not exist. """

        if idx == "auto":
            self.idx += 1
            return self.es.index(index = index_name, id = idx, body = doc)
        return self.es.index(index = index_name, id = idx, body = doc)


    def get_document(self, index_name: str, idx):
        """ Fetch a specific document from the index 'index_name' """

        return self.es.get(index = index_name, id = idx)


    def search(self, index_name: str, search_terms: str, search_field: str, no_of_results: int = 10):
        """ Performs a full-text search on the index 'index_name'. If search_terms is an empty string,
        returns all the documents in that index. """

        if search_terms == "":
            res = self.es.search(index = index_name, body = { "query": { "match_all": {}}}, size = no_of_results)
        else:
            res = self.es.search(index = index_name, body = { "query": { "match": { search_field: search_terms}}}, size = no_of_results)

        print ("Got {0} hits".format(res["hits"]["total"]["value"]))
        return res


    def delete_index(self, index_name: str):
        """ Returns True if the deletion was successful, False otherwise. """

        try:
            es.indices.delete(index = index_name)
            return True
        except elasticsearch.exceptions.NotFoundError:
            print ("Index not found.")
            return False


if __name__ == "__main__":

    es = ElasticSearchClient()

    path = "../COVID-19 Data Browser/myapp/public/data/biorxiv_medrxiv/biorxiv_medrxiv/"
    files = os.listdir(path)

    print ("Creating index...")
    print ("Inserting documents to the index.")

    for f in files:
        data = json.load(open(path + "/" + f, "r"))
        text = ""
        for i in range(0, len(data['body_text'])):
            text += data['body_text'][i]['text']
        filename = f.split(".")[0] + ".txt"
        paper_title = data["metadata"]["title"].strip()

        doc = {
            "title": paper_title,
            "text": text
        }

        es.insert_document(index_name = "medical-records", doc = doc, idx = filename)

    print ("Index created.")


    res = es.search(index_name = "medical-records", search_terms = "coronavirus SARS", search_field = "text")
    for h in res['hits']['hits']:
        print (h['_id'])
