

Getting Snippet Text for Query Results
--------------------------------------

A snippet is a short summary extracted from a source file which provides a query-biased summary of the file, often emphasising the query terms found in that source document. For the search example given below, the snippets are provided beneath each blue heading.  Note the boldface font given to the same or similar search terms

![enter image description here](https://lh3.googleusercontent.com/-eVYfNBaaRmw/WYvVgexMTGI/AAAAAAAACFc/62enoP_6a38nUNAOPv6IFL6C4RxMmduuQCLcBGAs/s0/googleSERP.png "googleSERP.png")

## Snippets in Elasticsearch
----------
Elasticsearch provides an easy method for accessing the snippets from returned search results.  The relevant Easticsearch method is called **highlighting**. In this section we will construct a short example to demonstrate highlighting from the Apple console using CURL, followed by some sample Javascript code to show you how to access from a JS client.

## Snippet Example from Console using CURL

### Pre-Requisites
This example assumes you have Elasticsearch 5.x.x installed and running on your computer (tested on Apple Mac). 

### Setup Elasticsearch Index
We will setup the same index as that used in the Field Retrieval and Boosting example, so if you have already done that example, you can use the index you created there.  If not, follow the following steps:

To check Elasticsearch is running, use the following CURL command in the console:

    curl 'http://localhost:9200/?pretty'

You should get something like the following returned:

    {
      "name" : "KVB9haP",
      "cluster_name" : "elasticsearch",
      "cluster_uuid" : "wqbmP7vdSfCbatSDF-siug",
      "version" : {
        "number" : "5.3.2",
        "build_hash" : "3068195",
        "build_date" : "2017-04-24T16:15:59.481Z",
        "build_snapshot" : false,
        "lucene_version" : "6.4.2"
      },
      "tagline" : "You Know, for Search"
    }


#### 1. Create the index
We are going to run the following Elasticsearch command:

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

Which from the console is:

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

You can now check that this has been created correctly by viewing the mappings for the index `book`.

    curl -XGET 'localhost:9200/book/_mapping/chapter?pretty'

To which your response should be:

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

#### 2. Add some data
We are going to run the following Elasticsearch commands:

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

Using CURL this becomes:

    curl -XPUT 'localhost:9200/book/chapter/1?pretty' -H 'Content-Type: application/json' -d'
    {
        "title" : "Introduction to Elasticsearch",
        "summary" : "Basic steps from installing to searching documents using Elasticsearch"
    }'

The response should be:

    {
      "_index" : "book",
      "_type" : "chapter",
      "_id" : "1",
      "_version" : 1,
      "result" : "created",
      "_shards" : {
        "total" : 2,
        "successful" : 1,
        "failed" : 0
      },
      "created" : true
    }

Repeat now for the other 2 document entries:

    curl -XPUT 'localhost:9200/book/chapter/2?pretty' -H 'Content-Type: application/json' -d'
    {
        "title" : "Documents Manipulation",
        "summary" : "Procedures to add, update and delete documents in Elasticsearch"
    }'

and

    curl -XPUT 'localhost:9200/book/chapter/3?pretty' -H 'Content-Type: application/json' -d'
    {
        "title" : "Advance searching",
        "summary" : "Configure advance parameters to search documents"
    }'


#### 3. Search with Snippets
Now we are going to perform the search WITHOUT highlighting so that we can see a standard search response.  In this example we search for chapters which contain the word `configure` in it.

    curl -XGET 'localhost:9200/book/chapter/_search?pretty' -H 'Content-Type: application/json' -d'
    {
        "query" : {
            "match" : { "summary" : "configure" }
        }
    }'

This generates the following result:

    {
      "took" : 2,
      "timed_out" : false,
      "_shards" : {
        "total" : 5,
        "successful" : 5,
        "failed" : 0
      },
      "hits" : {
        "total" : 1,
        "max_score" : 0.26742277,
        "hits" : [
          {
            "_index" : "book",
            "_type" : "chapter",
            "_id" : "3",
            "_score" : 0.26742277,
            "_source" : {
              "title" : "Advance searching",
              "summary" : "Configure advance parameters to search documents"
            }
          }
        ]
      }
    }

This time we will add in the highlighting. Note the extra `highlight` request in the XGET body:

    curl -XGET 'localhost:9200/book/chapter/_search?pretty' -H 'Content-Type: application/json' -d'
    {
        "query" : {
            "match" : { "summary" : "configure" }
        },
        "highlight" : {
            "fields" : {
                "summary" : {}
            }
        }
    }'

And the response now becomes:

    {
      "took" : 2,
      "timed_out" : false,
      "_shards" : {
        "total" : 5,
        "successful" : 5,
        "failed" : 0
      },
      "hits" : {
        "total" : 1,
        "max_score" : 0.26742277,
        "hits" : [
          {
            "_index" : "book",
            "_type" : "chapter",
            "_id" : "3",
            "_score" : 0.26742277,
            "_source" : {
              "title" : "Advance searching",
              "summary" : "Configure advance parameters to search documents"
            },
            "highlight" : {
              "summary" : [
                "<em>Configure</em> advance parameters to search documents"
              ]
            }
          }
        ]
      }
    }

The **highlight** json object contains the snippet, which has been taken from the 'summary' field, as requested.  The snippet is:

<em>Configure</em> advance parameters to search documents

Note that the matching word in the search, configure, has been highlighted with <\em> notation.
