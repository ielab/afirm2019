# Hands-on Activity 1: Basic Indexing and Search in Elasticsearch


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

Next, we adventure ourselves into a more complex example: indexing a TREC collection. To this aim, we will consider a modern TREC collection: the ClueWeb12 collection. This collection is used in many of the current TREC and CLEF tasks, including [TREC Web Track 2013-2014](http://www-personal.umich.edu/~kevynct/trec-web-2014/), [CLEF eHealth CHS Task 2016 and 2017](https://sites.google.com/site/clefehealth2017/task-3). 


The index we will build will have two fields: `title` and `body`. Other fields are possible with this data -- but we consider these two only for simplicity. Each field will have its own custom similarity function to enable similarity tuning -- more details on this later.

We shall apply pre-processing to both fields, including:

- lowercasing
- removing stop words based on the [Terrier](www.terrier.org) stopwords list
- steeming using [Porter stemmer](https://lucene.apache.org/core/4_1_0/analyzers-common/org/tartarus/snowball/ext/PorterStemmer.html)

#### Pre-requisities

To do this, we will use Python. This activity requires some pre-requisites:
* Elasticsearch Python API, which can be found [here](https://elasticsearch-py.readthedocs.io/en/master/)
* The Clueweb12 corpus. We cannot distribute this (you can find it at [the Lemur Project website](https://lemurproject.org/clueweb12/)), but we have made available a couple of archives from that corpus (from part B).
* The Terrier stopword list. We have included this file in the folder `activity-1` of this tutorial.

#### Preliminaries

1. Place the Terrier stopword list (`terrier-stop.txt`) in the `/config/stopwords` folder within your ElasticSearch installation. (Note: you need to create the `stopwords` folder; do this using the `mkdir` command.)
2. Download the example Clueweb12 data we have packaged for you [here](https://www.dropbox.com/s/xg4761gl793v5pv/Clueweb12B_sample.zip?dl=0). Download the zip file (`wget https://www.dropbox.com/s/xg4761gl793v5pv/Clueweb12B_sample.zip?dl=0`), decompress the archive (using something like `unzip Clueweb12B_sample.zip`), and place the content into a the folder `~\Clueweb12B_sample\`.
3. Install the following Python libraries using `pip3`:
	* `pip3 install warc3-wet`
	* `pip3 install elasticsearch`
	* `pip3 install lxml`

#### Indexing: examine the Python notebook

We have prepared for you a Python notebook with the code to index the sample ClueWeb12 using Elasticsearch. The notebook is contained in the file `indexing_clueweb12B.ipynb` in this activity folder. If you know how to run Jupyter notebooks, go ahead and run the notebook. Alternatively, follow the instructions below to run the notebook.


##### Running Jupyter for visualising Python notebooks

1. Open a terminal
2. Type `jupyter notebook`
3. Open your browser and direct it to the address `http://localhost:8888`. 
4. This will display the content of your home folder. Now navigate to the directory containing the notebook `indexing_clueweb12B.ipynb`. Open the notebook by clicking on it.
5. Now you can interact with the notebook. You can edit the text and the code. You can run a notebook by pressing the play button. To read more on how to use a Python notebook, you can look at [this resouce](https://www.datacamp.com/community/tutorials/tutorial-jupyter-notebook), or [this brief introduction](https://jupyter-notebook-beginner-guide.readthedocs.io/en/latest/).

**************

**************

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

