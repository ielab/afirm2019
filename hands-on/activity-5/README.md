# Implement a new Retrieval Model (Custom Similarity Plug-in)
Here we describe how to implement a custom similarity function (plugin) for Elasticsearch (based on version 5.1.1).
As a case study, we shall implement KL-Divergence similarity between language models.

This tutorial is derived from https://github.com/jimmyoentung/ES-KLDivergenceSimilarity.

## Implementation
- download/clone this project to your local machine

- define an `ES_PATH` environment variable using your terminal/command prompt. For example:

```bash
export ES_PATH=/usr/local/Cellar/elasticsearch/5.1.1
```

- use IntelliJ Idea or another IDE to import the project as a Gradle project

- specify the elastic version used by modifying the build.gradle:
```java
group 'com.github.jimmyoentung'

dependencies {
    compile group: 'org.elasticsearch', name: 'elasticsearch', version: '5.1.1'

    testCompile group: 'junit', name: 'junit', version: '4.11'
}

def esPluginPath = Paths.get(esPath, "/modules/${rootProject.name}")
```

- modify the settings.grade:
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
     * alphaD default value is 700 based on the average of CluewebB body field length*/
    public KLDivergenceSimilarity(CollectionModel collectionModel) {
        this(collectionModel, 2000, 700);

    }

    /** Instantiates the similarity with the default &mu; value of 2000.
     *  alphaD default value is 700 based on the average of CluewebB body field length*/
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

Note that in the above script we have two parameters: `mu` and `ad` - these are the KL Divergence parameters.
In our code, we may want to be able to set these two parameters. To this aim, modify the KLDivergenceSimilarityProvider.java to register the two parameters and their default value

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

Lastly, we need to register our new similarity plugin "KLDivergence" using the KLDivergenceSimilarityPlugin.java
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
the same directory as this readme file, run:

```bash
./gradlew installPlugin
```

For Elasticsearch to register the plugin as installed, you need to **restart** Elasticsearch.
If a new plugin is loaded succesfully, you will see the following message within the Elasticsearch log
```
[2017-07-27T13:51:33,444][INFO ][o.e.p.PluginsService     ] [J-8Q2RU] loaded module [ES KL Divergence Similarity]
```


## Using the custom similarity module
Now that we have loaded the KL Divergence similarity module, we can use it for retrieval from our index.
To demonstrate this, we shall use Kibana. In Kibana, create an index using the KL Divergence with default parameter values (mu=2000, ad=700 in this case).

```kibana
PUT books
{
  "settings":
  {
    "similarity": {
      "sim_title": {
          "type": "KLDivergence",
          "mu": 2000,
          "ad": 700
      },
      "sim_body": {
          "type": "KLDivergence",
          "mu": 2000,
          "ad": 700
      }
    }
  },
  "mappings":
  {
    "chapter":
    {
      "properties":
      {
        "title":
        {
          "type": "text",
          "similarity": "sim_title"
        },
        "summary":
        {
          "type": "text",
          "similarity": "sim_body"
        }
      }
    }
  }
}
```

Note that in the above script we created one similarity for each field in the document.
This is a good practice as it allows us to apply different parameter values to each of the fields.

To check if the KLDivergence is used in the "books" index settings used here for example, execute the following in Kibana:
```Kibana
GET /books/_settings
```

The expected output is:
```json
{
  "books": {
    "settings": {
      "index": {
        "number_of_shards": "5",
        "provided_name": "books",
        "similarity": {
          "sim_body": {
            "mu": "2000",
            "type": "KLDivergence",
            "ad": "700"
          },
          "sim_title": {
            "mu": "2000",
            "type": "KLDivergence",
            "ad": "700"
          }
        },
        "creation_date": "1501203229432",
        "number_of_replicas": "1",
        "uuid": "PNv8PN4yTBiaAV8dSScVsw",
        "version": {
          "created": "5010199"
        }
      }
    }
  }
}
```

Next, we need to check if the similarity settings has been assigned properly. In Kibana:
```kibana
GET /books/_mapping/chapter
```

The expected output is:
```json
{
  "books": {
    "mappings": {
      "chapter": {
        "properties": {
          "summary": {
            "type": "text",
            "similarity": "sim_body"
          },
          "title": {
            "type": "text",
            "similarity": "sim_title"
          }
        }
      }
    }
  }
}
```
