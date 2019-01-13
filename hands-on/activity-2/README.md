# Hands-on Activity 2: Boolean Retrieval



A Boolean retrieval model defines a query as a Boolean expression (an expression defined using Boolean logics), and it retrieves all and only documents that satisfy the Boolean expression representing the query. Through the use of operations such as `AND`, `OR`, and `NOT`, the relationship between the set of documents that matches the boolean expression in the query can be defined.
There is no ranking provided by the Boolean model; although some form of ranking could be added on top of the Boolean model (e.g. rank by date).





#### Pre-requisities

To do this, we will use Python (via a Python notebook). This activity requires some pre-requisites:
* Elasticsearch Python API, which can be found [here](https://elasticsearch-py.readthedocs.io/en/master/)
*  an index based on media releases by the [Queensland Art Gallery of Modern Art](https://data.qld.gov.au/dataset/qagoma-media-releases/resource/a1e4dffa-edb1-4e6d-a4a0-353aca79e9a3) (see exercise at the beginning of the python notebook we introduce below).



#### Boolean retrieval: examine the python notebook

We have prepared for you a Python notebook with the code to perform Boolean retrieval using Elasticsearch. The notebook is contained in the file `boolean-retrieval.ipynb` in this activity folder. If you know how to run Jupyter notebooks, go ahead and run the notebook. Alternatively, follow the instructions below to run the notebook.


##### Running Jupyter for visualising Python notebooks

1. Open a terminal
2. Type `jupyter notebook`
3. Open your browser and direct it to the address `http://localhost:8888`. 
4. This will display the content of your home folder. Now navigate to the directory containing the notebook `boolean-retrieval.ipynb`. Open the notebook by clicking on it.
5. Now you can interact with the notebook. You can edit the text and the code. You can run a notebook by pressing the play button. To read more on how to use a Python notebook, you can look at [this resouce](https://www.datacamp.com/community/tutorials/tutorial-jupyter-notebook), or [this brief introduction](https://jupyter-notebook-beginner-guide.readthedocs.io/en/latest/).

