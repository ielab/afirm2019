# Hands-on Activity 6: Document Priors and Boosting

This activity explains how to use document priors (e.g. Page Rank scores, spam rank scores, etc) as a boosting factor in Elasticsearch. 

Note that this is not necessarily how we would use document priors in Information Retrieval: often in fact we would use these priors as prior probabilities in a language models. Instead, here we take a simple approach to demonstrate the boosting functionality in Elasticsearch.


For boosting, we shall encode priors as a new field in our documents; an alternative approach (not explored here) may be to add priors as payloads -- then these need to be exploited by custom implemented retrieval functions.

For the simplistic example here, we will consider page rank scores using the following formula:

`FinalScore = BM25score + PageRankWeight`

Where PageRankWeight is a function to determine the weighting of the page rank score.
This formula is based on the paper _"Relevance Weighting for Query Independent Evidence"_ by Nick Craswell, Stephen Robertson, Hugo Zaragoza and Michael Taylor published in SIGIR'05.

In this script, we assume that the selected PageRankWeight value for each document has been precomputed and stored in the `pagerank` field.



## Preparing a Sample Elasticsearch Index
First, lets create an Elasticsearch index to work with. We shall create a small index named `book` with a type `chapter` within the index.
Each document in the `chapter` type will have two text fields (`title` and `summary`) and a `pageRank` field (i.e. the prior is encoded in a field).
The pageRank will be used as example of document prior.

Using `curl` from  command line window, issue the following command:

```console
    curl -XPUT 'localhost:9200/book?pretty' -H 'Content-Type: application/json' -d'
    {
      "mappings": {
        "chapter": {
          "properties": {
            "title": {
              "type": "text"
            },
            "summary": {
              "type": "text"
            }
          }
        }
      }
    }'
```

You can now check that this has been created correctly by viewing the mappings for the index `book`.

    curl -XGET 'localhost:9200/book/_mapping/chapter?pretty'

To which your response should be:

```console
    {
      "book" : {
        "mappings" : {
          "chapter" : {
            "properties" : {
              "summary" : {
                "type" : "text"
              },
              "title" : {
                "type" : "text"
              }
            }
          }
        }
      }
    }
```


At this point, we are ready to populate our index with some data. Insert the following data using `curl`

chapter 1:

```
"title":"Introduction to Elasticsearch",
  "summary": "Basic steps from installing to searching documents using Elasticsearch",
  "pagerank": 0.0003
```


chapter 2:

```
  "title":"Documents Manipulation",
  "summary": "Procedures to add, update and delete documents in Elasticsearch",
  "pagerank": 0.5
```

chapter 3:

```
  "title":"Advance searching",
  "summary": "Configure advance parameters to search documents",
  "pagerank": 0.1
```

For example, for chapter 1, we would issue the following `curl` command:

```console
curl -X POST http://localhost:9200/book/chapter/1 -H 'Content-Type: application/json' -d '{"title":"Introduction to Elasticsearch", "summary": "Basic steps from installing to searching documents using Elasticsearch","pagerank": 0.0003}'
```




Now that we have three documents indexed in Elasticsearch, we can use Elasticsearch to search for documents.
First, let's assume we are interested in searching for book chapters that contain the term "Searching". We formulate the following query:

``` Elasticsearch via Kibana
GET /book/chapter/_search
{
    "query": {
        "query_string": {
            "query": "Searching",
            "fields": ["title","summary"]
        }
    }
}
```

as a `curl` command this becomes:

```console
curl -X GET http://localhost:9200/book/chapter/_search -H 'Content-Type: application/json' -d '{"query": {"query_string":{"query": "Searching", "fields": ["title","summary"]}}}'
```

The expected results would look like these:

```JSON
{
  "took": 3,
  "timed_out": false,
  "_shards": {
    "total": 5,
    "successful": 5,
    "failed": 0
  },
  "hits": {
    "total": 2,
    "max_score": 0.27233246,
    "hits": [
      {
        "_index": "book",
        "_type": "chapter",
        "_id": "1",
        "_score": 0.27233246,
        "_source": {
          "title": "Introduction to Elasticsearch",
          "summary": "Basic steps from installing to searching documents using Elasticsearch",
          "pagerank": 0.0003
        }
      },
      {
        "_index": "book",
        "_type": "chapter",
        "_id": "3",
        "_score": 0.25811607,
        "_source": {
          "title": "Advance searching",
          "summary": "Configure advance parameters to search documents",
          "pagerank": 0.1
        }
      }
    ]
  }
}
```

Note that document 1 is ranked at the top of the result list.

Next, let us consider the pageRank prior to boost documents with higher pageRank scores. This can be formulated as a query with a `function`.

``` Elasticsearch via Kibana
GET /book/chapter/_search
{
  "query":{
    "function_score": {
      "query": {
        "query_string": {
            "query": "searching",
            "fields": ["title","summary"]
        }
      },
      "functions": [
        {
          "field_value_factor": {
            "field": "pagerank"
          }
        }
      ],
      "boost_mode": "sum"
    }
  }
}
```

(Issue this query by transcribing it into a `curl` command).

The expected results would look like these:

``` JSON
{
  "took": 3,
  "timed_out": false,
  "_shards": {
    "total": 5,
    "successful": 5,
    "failed": 0
  },
  "hits": {
    "total": 2,
    "max_score": 0.35811606,
    "hits": [
      {
        "_index": "book",
        "_type": "chapter",
        "_id": "3",
        "_score": 0.35811606,
        "_source": {
          "title": "Advance searching",
          "summary": "Configure advance parameters to search documents",
          "pagerank": 0.1
        }
      },
      {
        "_index": "book",
        "_type": "chapter",
        "_id": "1",
        "_score": 0.27263245,
        "_source": {
          "title": "Introduction to Elasticsearch",
          "summary": "Basic steps from installing to searching documents using Elasticsearch",
          "pagerank": 0.0003
        }
      }
    ]
  }
}
```
There are two things to note from this second output:

 * the scores of the documents are the sum product of the score from matching the query and the document's pagerank value.
 * since the document with id 3 has a much higher pagerank value compared to other documents, the score for document id 3 is boosted way higher than the other documents and it is ranked at the top of the result list.


## Field Retrieval and Field Boosting with Python

So far we have learnt how to do boosting (based on priors encoded in fields of a document) using `curl` to interact with Elasticsearch's REST API. Next, we explore how to perform field retrieval and field boosting in Elasticsearch using the Python-based API.

#### Pre-requisities

To do this, we will use some Python (which you can execute as a Python script, or that you could embed in a a Python notebook). This activity requires some pre-requisites:
* Elasticsearch Python API, which can be found [here](https://elasticsearch-py.readthedocs.io/en/master/)

#### Basic Search and Field Search

Examine the code in the file `searchES-basic.py` within this activity folder. This file implements a simple search over two fields. (after examining the file below, you can run this in Python 3).

First, we need to import the necessary API
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

In the above Python code, the parameter `query` specifies the terms to search and the parameter `fields` specifies the fields to search within. In this example, we would like to search for the term `Searching` within the fields `title` and `summary`.

Lastly, we submit the query string to Elasticsearch:

```python
res = es.search(index='book', doc_type='chapter', body=query_string)
```

The `res` variable should contain the following results (the variable is displayed by the line `pprint(res)`):

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

In this example, we consider both title and summary fields as equal. Remember though that per-field BM25 is used for scoring terms (and this explains the difference in scores and thus the ranking).

However, what if we believe that a match on a specific field should be treated as more important than a match on another field? For example, one may believe that a match on title should be preferred (or weighted higher) than a match on the summary, or other fields. 

(You could have a look at our research that has explored whether this is true across a number of data types and search tasks: [Boosting Titles does not Generally Improve Retrieval Effectiveness](http://dl.acm.org/citation.cfm?id=3015028)).

For practical purposes, let's assume that the title field is more important than the summary field -- and that a match on the title should be weighted double a match on the summary. To achieve this we will apply a boosting factor to specify each field importance.


To specify field weight / boosting levels, we need to add a caret symbol and field weight following each field name in the query string, as for example done below:

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

The Python script `searchES-fielded.py` implements this modification. 


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

Document 3 only contains one mention of term `searching` in its title field.
In the last result list, obtained with field boosting (title boosted twice over the summary), document 3 is placed however at the first place as it contains the term `searching` in the title field.