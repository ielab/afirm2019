

# Hands-on Activity 7: Getting Snippet Text for Query Results
--------------------------------------

A snippet is a short summary extracted from a source file which provides a query-biased summary of the file, often emphasising the query terms found in that source document. For the search example given below, the snippets are provided beneath each blue heading.  Note the boldface font given to the same or similar search terms

![enter image description here](https://lh3.googleusercontent.com/-eVYfNBaaRmw/WYvVgexMTGI/AAAAAAAACFc/62enoP_6a38nUNAOPv6IFL6C4RxMmduuQCLcBGAs/s0/googleSERP.png "googleSERP.png")

## Snippets in Elasticsearch
----------
Elasticsearch provides an easy method for accessing the snippets from returned search results.  The relevant Easticsearch method is called **highlighting**. In this activity we will construct a short example to demonstrate highlighting from the terminal/console using `curl`, followed by some sample Javascript code to show you how to access this functionality from a JS client.

## Snippet Example from Console using `curl`
 

### Setup Elasticsearch Index
We will setup the same index as that used in activity 6. If you have already done that example, you can use the index you created there and skip the setup.  If not, follow the following steps to get that index created.



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


### Search with Snippets 

We are now ready to search and produce snippets. 
Let us first perform the search WITHOUT highlighting so that we can see a standard search response.  In this example we search for chapters which contain the word `configure` in it.

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

`<em>Configure</em> advance parameters to search documents`

Note that the matching word in the search, "configure", has been highlighted with `<\em>` notation.




## Angular Service for Elasticsearch search with snippets

The file `search-handler.service.js` within the folder for this activity contains an Angular service, written in Javascript. The following text provides a background commentary to that file, which you could use if you choose to implement the service or you just want to understand how it works. 
(Note, in the hands-on session we will not have the time to setup and try the Angular service).


#### Purpose of the Code file
An Angular Service file can be called from anywhere on an Angular Website and it will hold its own set of data, in this case Elasticsearch search results.  The purpose of this service is to:
1. Perform the Elasticsearch search, given a query, i.e. one or more search terms
2. Read the search results from Elasticsearch and transfer the data to a holding object called *searchdata.hitdata*
3. Provide convenience functions for calling modules to check  if more pages of data are present, where a page of search results is set as *searchdata.snippetsPerPage_CONST = 10* (i.e. a page holds 10 hits/search results).
4. Return a specific source document, given the document ID
5. Keep track of the current page number within the search results

#### Performing an Elasticsearch search
A calling module can make a call to the service using:

     function searchWithQuery(query,pageNumber){

The query should be in the form of "term1 term2 ...termN"
The pageNumber is required, where a Search Engine Results Page has the facility to move forwards and backwards to new/old pages of search results.  The first search performed will be page 1 and then a *MoveNext* action by the user would require a call using the same query, but to page 2 of the search results.

The search request body is constructed using the query:

       var searchBody = {
          query:{
            match:{
              abstract: query
            }  
          },
          highlight:{
            fields:{
              abstract:{}
            }
          }
        };

You could replace your searchBody with whatever search you require. In this instance we are searching using 'match' within the 'abstract' field of each document using the 'query' terms.  

In addition, snippets have been requested using the 'highlight' object.  They are also to be derived from the abstract field.

A separate Elasticsearch service is called which performs the actual URL call.  The function call is asynchronous and it waits for the search results.  The call is:

     .factory('ESSearch', function($http,RESOURCE_ELASTICSEARCH_ADDRESS) {
    
          var searchResponse = function(searchBody, wantARange,numberOfHits,fromHitNum){
            var sizeURLText = '?pretty';
            if (wantARange==true)
              sizeURLText = '?size=' + numberOfHits + '&from=' + fromHitNum;
    
            return $http.post(RESOURCE_ELASTICSEARCH_ADDRESS+'_search' + sizeURLText,searchBody).success(function(data, status) {
              console.log('status is:' + angular.toJson(status));
              console.log('we have search data OK');
                return data;
             })
            .error(function(data, status) {
                console.log("Error getting ES data with status:" + angular.toJson(status) + ' and data: ' + angular.toJson(data) );
                return null;
            })
    
          };
          return { searchResponse: searchResponse };
      });

Note the calling parameters:
1. The `elasticsearch` URL address (stored in a constants file)
2. The `_search` command
3. The number of search items (hits) required and from which search result item do you want the results to start, i.e. from 10 onwards
4. The search body, which contains the specified search and highlight


#### Handling the Elasticsearch search results
The search results are returned to the searchWithQuery() function in the following code:

    var log = [];
                var hits =[];
                var hitSources = [];
                var allHits;
                var hitcount = 0;
                
     
                angular.forEach(result.data, function(value, key) {
                  this.push(key + ': ' + value);
                  if (key=="hits"){
                    allHits = value;
    
                    if (pageNumber==1) // get the total hits for the first page, after that we get ranges
                      searchData.totalHits = allHits.total;
                    console.log('total hits are:' + searchData.totalHits);
    
                    angular.forEach(allHits,function(value2,key2){
                      if (key2=="hits"){
                        angular.forEach(value2,function(hit){
                            hitcount++;
                            hits.push(hit);
                            //this is where the type fields are selected from ES
                            //USE BODY-> hitSources.push(getHitData(hit._id,hit._source["journal-title"],hit._source["pub-date"],hit._source["article-title"],hit.highlight,hit._source["HTML_BODY"],hitcount,hit._source["abstract"]));
                            hitSources.push(getHitData(hit._id,hit._source["journal-title"],hit._source["pub-date"],hit._source["article-title"],hit.highlight,hit._source["HTML_ALL"],hitcount,hit._source["abstract"]));
                        });
                      }
    
                    })
                  }

It's important to note that the final hit results, i.e. the search results, are found within 3 levels of nesting within the returned object.  At that point, each field of the document can be extracted, in our case this was the journal title, date, article title, abstract and entire source document.

For each hit (search result), the snippet data can also be identified.  This is performed firstly in the getHitData(..) function and then the getHighlightData(..) function.

     function getHitData(id,jTitle,jPubDate,aTitle,aSnippet,htmlDoc,snippetNum, abstractText){
           var aHit = {
              articleTitle:aTitle,
              journalTitle:jTitle,
              abstract: abstractText,
              pubDate: jPubDate,
              docId:id,
              snippet:getHighlightData(aSnippet.abstract),
              snippetNumber:snippetNum, //the order in which the snippet was retrieved
              snippetID:null,  //to be set later when we make a snippet record
              htmlDocument: htmlDoc
            }
            
            //console.log('TEMP: snippetNumber in HitData is:' + aHit.snippetNumber);
            console.log('TEMP: snippet data is' + angular.toJson(aSnippet));
            return aHit;
      };


     function getHighlightData(anAbstractSnippet){
          var snippetText = '';
          angular.forEach(anAbstractSnippet,function(aSubSnippet){
            snippetText = snippetText + aSubSnippet + "...";
          });
          snippetText = snippetText.split("<em>").join("<kbd>");
          snippetText = snippetText.split("</em>").join("</kbd>");
          return snippetText;
      }


The highlight (snippet) data is called *hit.highlight*. In this service, the snippet text is highlighted using kbd notation to replace the em notation, so that the matching terms are very visible.  This step is performed in the getHightlightData(..) function.
