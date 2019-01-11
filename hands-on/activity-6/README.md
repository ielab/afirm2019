# Using Document Priors via Boosting
This tutorial explains how to use document priors (e.g. Page rank, spam rank, etc) as a boosting factor in Elasticsearch. Note that this is not how we usually would use document priors in Information Retrieval (e.g. as a prior probability in a language model). At this stage, it is yet unclear how the performance of document boosting and the proper use of such priors differ.
For boosting, we shall encode priors as a new field in our documents; an alternative approach (not explored) may be to add  priors as payloads.

Page rank score will be considered using the following formula
FinalScore = BM25score + PageRankWeight

Where PageRankWeight is a function to determine weighting of the page rank score.
This formula is based on paper titled "Relevance Weighting for Query Independent Evidence"
by Nick Craswell, Stephen Robertson, Hugo Zaragoza and Michael Taylor
published in SIGIR'05.

In this script, we assume that the selected PageRankWeight value for each document has been precomputed and stored in the "pagerank" field.


## Pre-requisites
* Elasticsearch 5.x.x
* Kibana (optional)


## Preparing a Sample Elasticsearch Index
First, lets create an Elasticsearch index to work with. We shall create an index named "book" with a type "chapter" within the index.
Each document in the "chapter" type will have two text fields (`title` and `summary`) and a `pageRank` field (i.e. the prior is encoded in a field).
The pageRank will be used as example of document prior.

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
        },
        "pagerank":
        {
          "type": "float"
        }
      }
    }
  }
}
```

To verify that new index structure is as expected, type:

``` Elasticsearch via Kibana
GET /book/_mapping/chapter
```

Expected results:
``` Output
{
  "book": {
    "mappings": {
      "chapter": {
        "properties": {
          "pagerank": {
            "type": "float"
          },
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
``` Elasticsearch via Kibana
PUT /book/chapter/1
{
  "title":"Introduction to Elasticsearch",
  "summary": "Basic steps from installing to searching documents using Elasticsearch",
  "pagerank": 0.0003
}

PUT /book/chapter/2
{
  "title":"Documents Manipulation",
  "summary": "Procedures to add, update and delete documents in Elasticsearch",
  "pagerank": 0.5
}

PUT /book/chapter/3
{
  "title":"Advance searching",
  "summary": "Configure advance parameters to search documents",
  "pagerank": 0.1
}
```

Now that we have three documents indexed in Elasticsearch, we can use Elasticsearch to search for documents.
First, let's assume we are interested in searching for book chapters that contain the term "Searching"

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

Expected results:
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

Note that document id 1 is ranked on the top of the result list.

Next, let us consider the pageRank prior to boost documents with higher pageRank scores.

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

Expected results:
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
 * the scores of the documents are the sum product of score from the initial query and the document's pagerank value.
 * since the document with id 3 has a much higher pagerank value compared to other documents, the score for document id 3 is boosted way higher than the other documents and it is ranked at the top of the result list.
