# import required modules
from pprint import pprint
from elasticsearch import Elasticsearch

# establish connection to Elasticsearch instance
es = Elasticsearch(urls='localhost', port=9200)

# build query string
query_string = {
    'query': {
        'query_string': {
            'query': 'Searching',
            'fields': ['title^2','summary^1']
        }
    }
}

# submit the query string to Elasticsearch
res = es.search(index='book', doc_type='chapter', body=query_string)

# display results
pprint(res)

