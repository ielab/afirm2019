# Hands-on Activity 0: Installation and basic interaction

Welcome to the hands-on activities of the IR in Practice session at AFIRM 2019.

In this setting-the-scene activity we are going to familiarise ourself with the workstation at our disposal (a Linux box running Ubuntu 17.10) with both graphical and command line interfaces (also called console or terminal). We will often use the command line interface, so locate this and open a new command line. 

By typing

```console
pwd
```
you will be shown the current path at which you are -- for example `/home/c/csvisitor`.

## Preliminary activities

From the command line interface, clone the GitHub repository https://github.com/ielab/afirm2019. You do this by typing:

```console
git clone https://github.com/ielab/afirm2019.git
```

This creates a copy of the GitHub repository to your local workstation, in your home. This repository contains most of the material for this practical sesssion.

## Installing Elasticsearch

Next, let's download and install Elasticsearch. Do this by typing the following commands (make sure you are in your home -- you can download Elasticsearch where ever you want, but for simplicity in this tutorial we want to have it all in the same location):

```console
wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-6.5.4.tar.gz
```
Once the download is completed, unpack the tar.gz archive

```console
tar -xvzf elasticsearch-6.5.4.tar.gz
```

Next we can run the Elasticsearch server:

```console
cd elasticsearch-6.5.4/bin/
./elasticsearch
```

This will start up Elasticsearch. This console is now taken over by Elasticsearch. Let's open a new console.
(NB: Alternatively, we could have run Elasticsearch in a `screen` session)

Elasticsearch is now running as a RESTful service on the workstation and listening/responding at port 9200 (we could have change the port). Let us check if indeed it is running; type:

```console
curl http://localhost:9200
```
Elasticsearch is now responding you with a JSON answer, which include information about the Elasticsearch instance you are running.


#### Configuring Elasticsearch
Configurations are in `config/elasticsearch.yml`. This configuration file, for example, allows to change the port in which Elasticsearch listens. Each Elasticsearch node could be configured differently.

For now, we will not change these configurations, but you are welcome to explore this file during the break.

## Interacting with Elasticsearch

Commands to Elasticsearch are in the form `<REST verb> /<indexname>/<API>`.
For example: `GET /myindex/_search`. 

These could be issued to RESTful clients. We have already used an alternative: the `curl` linux command. In curl, the same GET request as above becomes `curl -XGET "http://localhost:9200/my_index/_search"`. Before trying this, however, we need to index some documents. We shall see this in the next activity.
