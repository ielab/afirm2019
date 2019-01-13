# Hands-on Activity 3: Produce a TREC Run

One of the core aspect of information retrieval research is evaluation retrieval and ranking methods. This is often achieved by using a tool called `trec_eval`, developed by NIST, which implements a number of standard retrieval measures, such as precision at k, mean average precision, bpref, etc.

The `trec_eval` tool defines a standard format for the formatting of results from retrieval experiments. This is called the TREC format -- it is the de-facto standard to represent a run in a retrieval experiments. Even evaluation tools alternative to `trec_eval` (e.g., ) follow the TREC result format.

In this activity we will see how to use Elasticsearch for performing a retrieval experiment, and produce a TREC formatted run file (result file). You will learn how to use `trec_eval` and interpret the results of an evaluation in the Evaluation session at AFIRM 2019.

### The TREC File Format

The TREC file format is described in much detail [in this online resource](http://faculty.washington.edu/levow/courses/ling573_SPR2011/hw/trec_eval_desc.htm.). We provide a brief overlook below.

The result file has the format: `query_id iter docno rank similarity run_id`,  delimited by spaces.  

* `query_id` is the query number (e.g. 136.6 or 1894, depending on the collection used).  
* `iter` is a constant, commonly `0` or `Q0`; it is required but ignored by `trec_eval`. It was used in early Interactive IR campaigns at TREC
*  `docno` are string values like `FR940104-0-00001`, which uniquely identify a document in the collection.  
*  `rank` is an integer, commonly starting from 0, which is required by the program.
*  `similarity` is a float value and represent the similarity value of the document to the query. Note internally `trec_eval` ignores the `rank` value and re-ranks documents by `similarity` value, resolving ties somewhat arbitrarily.
*    `run_id` is a string that identifies the run. This is useful to keep track of the provenance of your results, but is ignored by `trec_eval`.  

An example of a TREC file result line is shown below:
 
> 351   0  FR940104-0-00001  1   42.38   run-name

#### Pre-requisities

To do this, we will use Python (via a Python notebook). This activity requires some pre-requisites:
* Elasticsearch Python API, which can be found [here](https://elasticsearch-py.readthedocs.io/en/master/)
* the `ir-kit`, a Python library we have developed at [ielab](www.ielab.io) to facilitate IR experimentation with Elasticsearch and Python.
*  an index based on media releases by the [Queensland Art Gallery of Modern Art](https://data.qld.gov.au/dataset/qagoma-media-releases/resource/a1e4dffa-edb1-4e6d-a4a0-353aca79e9a3) (see exercise at the beginning of the python notebook we introduce below). (you may have already created this index if you have done activity-2).

#### Preliminaries

1. clone the GitHub repository for [`ir-kit`](https://github.com/hscells/ir-kit). (note, we suggest cloning the repository rather than installing the library using `pip`).

#### Produce a TREC run with Elasticsearch: examine the python notebook

We have prepared for you a Python notebook with the code to create a TREC formatted result using Elasticsearch as search engine. The notebook is contained in the file `trec-run.ipynb` in this activity folder. If you know how to run Jupyter notebooks, go ahead and run the notebook. Alternatively, follow the instructions below to run the notebook.


##### Running Jupyter for visualising Python notebooks

1. Open a terminal
2. Type `jupyter notebook`
3. Open your browser and direct it to the address `http://localhost:8888`. 
4. This will display the content of your home folder. Now navigate to the directory containing the notebook `trec-run.ipynb`. Open the notebook by clicking on it.
5. Now you can interact with the notebook. You can edit the text and the code. You can run a notebook by pressing the play button. To read more on how to use a Python notebook, you can look at [this resouce](https://www.datacamp.com/community/tutorials/tutorial-jupyter-notebook), or [this brief introduction](https://jupyter-notebook-beginner-guide.readthedocs.io/en/latest/).

