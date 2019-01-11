# Hands-on Activity 0

Welcome to the hands-on activities of the IR in Practice session at AFIRM 2019.

In this setting-the-scene activity we are going to familiarise ourself with the workstation at our disposal (a Linux box running Ubuntu 17.10) with both graphical and command line interfaces. We will often use the command line interface, so locate this and open a new command line. 

By typing

```bash
pwd
```
you will be shown the current path at which you are -- for example `/home/c/csvisitor`.

## Preliminary activities

From the command line interface, clone the GitHub repository https://github.com/ielab/afirm2019. You do this by typing:

```bash
git clone https://github.com/ielab/afirm2019.git
```

This creates a copy of the GitHub repository to your local workstation, in your home. This repository contains most of the material for this practical sesssion.

## Installing Elasticsearch

Next, let's download and install Elasticsearch. Do this by typing the following commands (make sure you are in your home -- you can download Elasticsearch where ever you want, but for simplicity in this tutorial we want to have it all in the same location):

```bash
wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-6.5.4.tar.gz
```
Once the download is completed, unpack the tar.gz archive

```bash
tar -xvzf elasticsearch-6.5.4.tar.gz
```

