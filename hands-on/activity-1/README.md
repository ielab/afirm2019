# Hands-on Activity 1

## Simple indexing and searching

Let us start by understanding the basic concepts and commands for creating an index, inserting a document, and searching for documents in Elasticsearch.

To create an index, we use the `PUT` verb:
```console
curl -X PUT http://localhost:9200/example
```

This command will return the answer: `{"acknowledged":true,"shards_acknowledged":true,"index":"example"}`.
Great, now we have created an index called `example`.

(see https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-create-index.html for documentation for index creation, including limitations, settings, etc)

Next, we can add a simple document to our example index. Type in the console:

```console
curl -X POST http://localhost:9200/example/doc -H 'Content-Type: application/json' -d '{"title": "IR in Practice @AFIRM2019", "body": "Welcome to the IR in Practice session at AFIRM 2019!"}'
```

Again, the system should answer with an acknowledgement stating whether the insertion of this document has been successful (`"successful":1`). Note the id of the document is returned in the field `_id` of the answer (e.g. `"_id":"mHdmO2gB0VUfcQ9aYFHf"`).

Next, put into the index another couple of example documents. In particular, insert the following two documents:

```text
{"title": "Introduction to IR @AFIRM2019", "body": "Welcome to the Introduction to IR session at AFIRM 2019!"}
```

```text
{"title": "Multilingual IR @AFIRM2019", "body": "Welcome to the Multilingual IR session at AFIRM 2019!"}
```

Next, we are ready to do some basic search! We do this with the `GET` verb:
```console
curl -X GET http://localhost:9200/example/_search -H 'Content-Type: application/json' -d '{"query": {"match" : {  "title": "Multilingual"}}}'
```

I am reformatting the query below so as to read it better:

```console
curl -X GET http://localhost:9200/example/_search -H 'Content-Type: application/json' -d '{
  "query": {
          "match" : {  
                    "title": "Multilingual"
                    }
            }
  }'
 ```
 
 The result should show the retrieval of one document. Note you can identify how many documents are retrieved by inspecting the field `total` of the `hit`: in our case: `"hits":{"total":1 ...`.
 
 Note that when executing the previous query, we had to specify a field on which to execute the matching (the `title` field). Teh fields depend on the fields that are available in the document collection. In our example, we only have the fields `title` and `body`. 
 
 Next, attempt the exercises below to learn more about searching with Elasticsearch. We will discuss more on field retrieval in later activities.
 
 ******
 ### Exercise 1.
 
 Retrieve documents for the query `IR` by matching on the field `title`. How many documents are retrieved?
 
 ### Exercise 2.
 
 Now, retrieve documents for the query `welcome` by matching on the field `title`. How many documents are retrieved? And what if you attempt to match on `body`?
 
 
 ******
 
 ### Multifield search
 
 It is possible to search on multiple fields at once. This is achieved through the a `multi_match` query, which builds on the `match` query to allow multi-field queries. Type this query: 
 
 ```console
curl -X GET http://localhost:9200/example/_search -H 'Content-Type: application/json' -d '{
  "query": {
    "multi_match" : {
      "query":    "session", 
      "fields": [ "title", "body" ] 
    }
  }
}
 ```
 
 (if you prefer copy and pasting, the following line is easier: )
 ```console
 curl -X GET http://localhost:9200/example/_search -H 'Content-Type: application/json' -d '{"query": {"multi_match" : {"query":    "session", "fields": [ "title", "body" ]}}}'
 ```


By the way, sometimes we may want to see all the documents in our index. To do this, we use the `match_all` query:

```console
curl -X GET http://localhost:9200/example/_search -H 'Content-Type: application/json' -d '{"query": {"match_all": {}}}'
```

## Indexing a TREC collection

Next, we adventure ourselves into a more complex example: indexing a TREC collection. To this aim, we will consider a modern TREC collection: the ClueWeb12 collection. This collection is used in many of the current TREC and CLEF tasks, including [TREC Web Track 2013-2014](http://www-personal.umich.edu/~kevynct/trec-web-2014/), CLEF eHealth CHS Task 2016 and 2017. 





## Solutions to exercises

#### Exercise 1

Query:
```console
curl -X GET http://localhost:9200/example/_search -H 'Content-Type: application/json' -d '{"query": {"match" : {  "title": "IR"}}}'
```

Three document are retrieved (`"hits":{"total":3 ...`).

#### Exercise 2

Query:
```console
curl -X GET http://localhost:9200/example/_search -H 'Content-Type: application/json' -d '{"query": {"match" : {  "title": "welcome"}}}'
```

Returns no result. This is because the term `welcome` does not appear in the title. If we change the matching to be on the body, we obtain:

Query:
```console
curl -X GET http://localhost:9200/example/_search -H 'Content-Type: application/json' -d '{"query": {"match" : {  "body": "welcome"}}}'
```

This returns 3 results. Note also that Elasticsearch performed lowercasing when doing the indexing: in fact our lowecase query matched documents where the term was capitalised.
