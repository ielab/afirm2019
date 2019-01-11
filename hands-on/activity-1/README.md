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

```
curl -X GET http://localhost:9200/example/_search -H 'Content-Type: application/json' -d '{
  "query": {
          "match" : {  
                    "title": "Multilingual"
                    }
            }
  }'
 ```

## Indexing a TREC collection
