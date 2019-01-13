# Hands-on Activity 5: Implementation of a new Retrieval Model in Elasticsearch

Next, we describe how to implement a custom similarity function for Elasticsearch (in Lucene/Elasticsearch lingo, this is called a custom similarity plugin). As a case study, we shall implement the Kulback-Lieber (KL) Divergence between language models.

Follow the steps below to create the new similarity plugin and install it into Elasticsearch.


- define an `ES_PATH` environment variable using your terminal/command prompt. For example:

```bash
export ES_PATH=~/elasticsearch-6.5.4/
```

- use IntelliJ Idea or another IDE to import the project as a Gradle project

- specify the Elasticsearch version used by modifying the build.gradle:

```java
group 'com.github.jimmyoentung'

dependencies {
    compile group: 'org.elasticsearch', name: 'elasticsearch', version: '5.1.1'

    testCompile group: 'junit', name: 'junit', version: '4.11'
}

def esPluginPath = Paths.get(esPath, "/modules/${rootProject.name}")
```

- modify the settings.gradle:

```java
rootProject.name = 'lm-kldivergence'
```

- rename the project package into your GitHub repository. This example uses the `com.github.jimmyoentung.eskldivergencesimilarity` repository

- modify the plugin-descriptor.properties:


```java
description=ES KL Divergence Similarity Plugin
version=1.0
name=ES KL Divergence Similarity Plugin
classname=com.github.jimmyoentung.eskldivergencesimilarity.KLDivergenceSimilarityPlugin
java.version=1.8
elasticsearch.version=5.1.1
```

- implement the custom similarity in KLDivergenceSimilarity.java


```java
public class KLDivergenceSimilarity extends LMSimilarity {
    /** The &mu; parameter. */
    private final float mu;

    /** The alphaD parameter. */
    private final float ad;

    /** Instantiates the similarity with the provided &mu; and alphaD parameter. */
    public KLDivergenceSimilarity(CollectionModel collectionModel, float mu, float ad) {
        super(collectionModel);
        this.mu = mu;
        this.ad = ad;
    }

    /** Instantiates the similarity with the provided &mu; parameter. */
    public KLDivergenceSimilarity(float mu, float ad) {
        this.mu = mu;
        this.ad = ad;
    }

    /** Instantiates the similarity with the default &mu; value of 2000.
     * alphaD default value is 700 based on the average of ClueWeb12b body field length*/
    public KLDivergenceSimilarity(CollectionModel collectionModel) {
        this(collectionModel, 2000, 700);

    }

    /** Instantiates the similarity with the default &mu; value of 2000.
     *  alphaD default value is 700 based on the average of ClueWeb12b body field length*/
    public KLDivergenceSimilarity() {
        this(2000, 700);
    }

    @Override
    protected float score(BasicStats stats, float freq, float docLen) {

        float score = stats.getBoost() *
                (float)(Math.log(((freq + mu * ((LMStats)stats).getCollectionProbability()) / (mu + docLen)) /
                (ad * ((LMStats)stats).getCollectionProbability())) +
                Math.log(ad));

        return score > 0.0f ? score : 0.0f;
    }

    @Override
    protected void explain(List<Explanation> subs, BasicStats stats, int doc,
                           float freq, float docLen) {
        if (stats.getBoost() != 1.0f) {
            subs.add(Explanation.match(stats.getBoost(), "boost"));
        }

        subs.add(Explanation.match(mu, "mu"));
        Explanation weightExpl = Explanation.match(
                (float)Math.log(1 + freq /
                        (mu * ((LMStats)stats).getCollectionProbability())),
                "term weight");
        subs.add(weightExpl);
        subs.add(Explanation.match(
                (float)Math.log(mu / (docLen + mu)), "document norm"));
        super.explain(subs, stats, doc, freq, docLen);
    }

    /** Returns the &mu; parameter. */
    public float getMu() {
        return mu;
    }

    @Override
    public String getName() {
        return String.format(Locale.ROOT, "KL Divergence(%f)", getMu());
    }
}
```

Note that in the above script we have two parameters: `mu` and `ad` - these are the language models/KL Divergence parameters.
In our code, we may want to be able to set these two parameters. To this aim, modify the class `KLDivergenceSimilarityProvider.java` to register the two parameters and their default value

```java
package com.github.jimmyoentung.eskldivergencesimilarity;

import org.apache.lucene.search.similarities.Similarity;
import org.elasticsearch.common.settings.Settings;
import org.elasticsearch.index.similarity.AbstractSimilarityProvider;

public class KLDivergenceSimilarityProvider extends AbstractSimilarityProvider {

    private final KLDivergenceSimilarity similarity;

    public KLDivergenceSimilarityProvider(String name, Settings settings) {
        super(name);
        float mu = settings.getAsFloat("mu", 2000f);
        float ad = settings.getAsFloat("ad", 700f);

        this.similarity = new KLDivergenceSimilarity(mu, ad);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Similarity get() {
        return similarity;
    }
}
```

Lastly, we need to register our new similarity plugin `KLDivergence` using the `KLDivergenceSimilarityPlugin.java`

```java
package com.github.jimmyoentung.eskldivergencesimilarity;

import org.elasticsearch.index.IndexModule;
import org.elasticsearch.plugins.Plugin;

public class KLDivergenceSimilarityPlugin extends Plugin {

    private static final String SIMILARITY_NAME = "KLDivergence";

    @Override
    public void onIndexModule(IndexModule indexModule) {
        super.onIndexModule(indexModule);
        indexModule.addSimilarity(SIMILARITY_NAME, KLDivergenceSimilarityProvider::new);
    }
}
```

At this stage, you should be set to install the plugin into Elasticsearch. A `gradle` task is provided
to do this. It will build and copy the files according to the`ES_PATH`. To run this `gradle` task, in
the same directory as this README file, run on your command line:

```bash
./gradlew installPlugin
```

For Elasticsearch to register the plugin as installed, you need to **restart** Elasticsearch (i.e. kill the Elasticsearch instance and start it up again).

If a new plugin is loaded successfully, you will see the following message within the Elasticsearch log

```console
[2017-07-27T13:51:33,444][INFO ][o.e.p.PluginsService     ] [J-8Q2RU] loaded module [ES KL Divergence Similarity]
```


## Using the custom similarity module

Now that we have loaded the KL Divergence similarity module, we can use it for retrieval. Let us do this by using the Clueweb12 sample data. 

**********
#### Exercise 1
Create an index of the Clueweb12 sample data setting as similarity function the KLDivergence plugin. Call the index `clueweb12_sample_kl `. Do this for both the title and the body fields. You can use Python, curl or any other method.

Solutions for this exercise are provided at the end of this README.

**********

Once you have created the new index, execute some queries: consider the next exercise (from exercise 2 of activity 3):


#### Exercise 2

Create code to produce TREC formatted runs for the queries below. Run these queries on the ClueWeb12_sample collection with KLDivergence as similarity function (i.e. index `clueweb12_sample_kl ` from Exercise 1 in this activity). Set the maximum number of retrieved documents to 20.

* query 100:
* query 101:


Now, you can compare the results obtained for these example queries by the default Elasticsearch retrieval model (BM25) and the implemented KL-divergence. At this stage you may be able to compare just by checking which documents were retrieved, and in which rank. In the Evaluation session at AFIRM 2019 you will learn how to evaluate retrieval runs and how to compare the retrieval runs with respect to evaluation measures (i.e. the effectiveness of the runs).



*********

### Exercise Solutions

#### Exercise 1

Solutions provided in Python:

```python
import gzip
import warc
import time
import glob
import lxml.html
import re
import io
import sys
from elasticsearch import Elasticsearch
import multiprocessing

warcPath = "~\Clueweb12B_sample\"
es0 = Elasticsearch(urls='http://localhost', port=9200, timeout=600)
bulk_size = 4000
bulk_count = 1000
indexName = "clueweb12_sample_kl"
docType = "clueweb"


request_body = {
    "settings": {
      "number_of_shards": 1,
      "number_of_replicas": 0,
      "analysis": {
        "analyzer": {
            "my_english": {
                "tokenizer": "standard",
                "filter": ["lowercase", "terrier_stopwords", "porter_stem"]
            }
        },
        "filter": {
          "terrier_stopwords": {
              "type": "stop",
              "stopwords_path": "stopwords/terrier-stop.txt"
          }
        }
      },
      "similarity": {
        "sim_title": {
            mu": "2000",
            "type": "KLDivergence",
            "ad": "700"
        },
        "sim_body": {
            mu": "2000",
            "type": "KLDivergence",
            "ad": "700"
        }
      }
    },
    "mappings": {
      docType: {
        "_source": {
            "enabled": False
        },
        "properties": {
            "title": {
                 "type": "text",
                 "similarity": "sim_title",
                 "analyzer": "my_english"
            },
            "body": {
                "type": "text",
                "similarity": "sim_body",
                "analyzer": "my_english"
            }
         }
      }
    }
}
```