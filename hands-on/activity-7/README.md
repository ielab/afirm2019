# Field Retrieval & Field Boosting
This tutorial shows how to perform field retrieval and field boosting in Elasticsearch using the Python-based API.

## Pre-requisites
* Elasticsearch 5.x.x
* Kibana (optional)
* Python 3
* Elasticsearch Python API. This be found [here](https://elasticsearch-py.readthedocs.io/en/master/)


## Preparing a Sample Elasticsearch Index
First, let's create an Elasticsearch index to play with. We want to create an index named "book" and a type "chapter" within the index.
Each document of "chapter" type will have two text fields: `title` and `summary`.

Do the following in Kibana:

``` Elasticsearch via Kibana
PUT book
{
  "mappings":
  {
    "chapter":
    {
      "properties":
      {
        "title":
        {
          "type": "text"
        },
        "summary":
        {
          "type": "text"
        }
      }
    }
  }
}
```

To verify that the new index structure is as expected:

``` Elasticsearch via Kibana
GET /book/_mapping/chapter
```

Expected result:
``` Output
{
  "book": {
    "mappings": {
      "chapter": {
        "properties": {
          "summary": {
            "type": "text"
          },
          "title": {
            "type": "text"
          }
        }
      }
    }
  }
}
```

At this point, we are ready to populate our index with some data:
```
PUT /book/chapter/1
{
  "title":"Introduction to Elasticsearch",
  "summary": "Basic steps from installing to searching documents using Elasticsearch"
}

PUT /book/chapter/2
{
  "title":"Documents Manipulation",
  "summary": "Procedures to add, update and delete documents in Elasticsearch"
}

PUT /book/chapter/3
{
  "title":"Advance searching",
  "summary": "Configure advance parameters to search documents"
}
```

Now we have three documents indexed in Elasticsearch. Next, we will search for these documents using the Python API

## Basic Search
Let's move from Kibana to Python. First, we need to import the necessary API
```python
from elasticsearch import Elasticsearch
```

then, establish a connection to Elasticsearch
```python
es = Elasticsearch(urls='localhost', port=9200)
```

Next, we need to build a query string:
```python
query_string = {
    'query': {
        'query_string': {
            'query': 'Searching',
            'fields': ['title','summary']
        }
    }
}
```

In the above script, the parameter `query` specifies the terms to search and the parameter `fields` specifies the fields to search within.
In this example, we would like to search for the term `Searching` within the fields `title` and `summary`:

Lastly, we submit the query string to Elasticsearch:
```python
res = es.search(index='book', doc_type='chapter', body=query_string)
```

The `res` variable should contain the following results:
```JSON
{
    "hits": {
        "hits": [
            {
                "_type": "chapter",
                "_score": 0.27233246,
                "_index": "book",
                "_id": "1",
                "_source": {
                    "summary": "Basic steps from installing to searching documents using Elasticsearch",
                    "title": "Introduction to Elasticsearch"
                }
            },
            {
                "_type": "chapter",
                "_score": 0.25811607,
                "_index": "book",
                "_id": "3",
                "_source": {
                    "summary": "Configure advance parameters to search documents",
                    "title": "Advance searching"
                }
            }
        ],
        "max_score": 0.27233246,
        "total": 2
    },
    "took": 2,
    "timed_out": false,
    "_shards": {
        "failed": 0,
        "successful": 5,
        "total": 5
    }
}
```

The above results shows that there are two documents with `title` and `summary` fields that match the query term "Searching".
In this example, we consider both title and summary fields as equal.

What if we believe that a match in one field shoudl be treated as being more important than a match in another field?
Next, we will apply a boosting factor to specify each field importance.

## Boosting fields
For practical purposes, let's say that the title field is more important than the summary field. (You could have a look at our research that has explored whether this is true across a number of data types and search tasks: [Boosting Titles does not Generally Improve Retrieval Effectiveness](http://dl.acm.org/citation.cfm?id=3015028)).
For example, let us assume a match in the title field should be weighted double than a match in the summary field.

To specify field weight / boosting levels, we need to add a caret symbol and field weight following each field name in the query string
```python
query_string = {
    'query': {
        'query_string': {
            'query': 'Searching',
            'fields': ['title^2','summary^1']
        }
    }
}
```

The above query string will produce the following results:
```JSON
{
    "_shards": {
        "failed": 0,
        "total": 5,
        "successful": 5
    },
    "took": 9,
    "timed_out": false,
    "hits": {
        "total": 2,
        "max_score": 0.51623213,
        "hits": [
            {
                "_type": "chapter",
                "_score": 0.51623213,
                "_index": "book",
                "_source": {
                    "title": "Advance searching",
                    "summary": "Configure advance parameters to search documents"
                },
                "_id": "3"
            },
            {
                "_type": "chapter",
                "_score": 0.27233246,
                "_index": "book",
                "_source": {
                    "title": "Introduction to Elasticsearch",
                    "summary": "Basic steps from installing to searching documents using Elasticsearch"
                },
                "_id": "1"
            }
        ]
    }
}
```
Document id: 3 only contains one mention of term "searching" in its title field.
In the last result, document id: 3 is placed at the first place as it contains the term "searching" in the title field.
