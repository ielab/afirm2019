# Hands-on Activity 5: Implementation of a new Retrieval Model in Elasticsearch

### Introduction


Elasticsearch API's went through a major restructuring when moving from version 5.x.x to 6.x.x. 

The changes affected most of the methods used so far in the hand-on activities. The implementation of a new retrieval model based on Elasticsearch, however, is probably where changes produced the largest disruption. 

For this reason, we provide two avenues for implementing a new retrieval method on top of Elasticsearch:

1. *Method A:* The implementation of a custom similarity plug-in, in Java
2. *Methods B:* A similarity that allows you to use a REST script in order to specify how scores should be computed.

The first method suits version 5.x.x, the second suits version  6.x.x.

In this hands-on activity we will work with [Method B](elastic-6/), since we have installed an Elasticsearch 6.x.x version. You can explore [Method B](elastic-5/) if there is time (but you would not be able to run it, unless you install also Elastic 5.x.x).