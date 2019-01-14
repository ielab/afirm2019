package com.github.jimmyoentung.eskldivergencesimilarity;

import org.elasticsearch.index.IndexModule;
import org.elasticsearch.plugins.Plugin;

//
// Created by Harry Scells on 6/4/17.
// Modified by Jimmy on 11 Apr 2017
//
public class KLDivergenceSimilarityPlugin extends Plugin {

    private static final String SIMILARITY_NAME = "KLDivergence";

    @Override
    public void onIndexModule(IndexModule indexModule) {
        super.onIndexModule(indexModule);
        indexModule.addSimilarity(SIMILARITY_NAME, KLDivergenceSimilarityProvider::new);
    }
}
