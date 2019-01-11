angular.module('ESSearchMod', ['constants']).
factory('ESSearchHandler', function($filter,ESSearch,$q,RESOURCE_ELASTICSEARCH_ADDRESS) {

    var searchData = {
      hits:null, 
      hitData:null,
      totalHits:0,
      pageNumber: 0,
      query:'',
      searchWithQuery:searchWithQuery,
      setCurrentReviewingDoc:setCurrentReviewingDoc,
      hasMorePages:hasMorePages,
      resetSearch:resetSearch,
      currentReviewingDoc:null,
      snippetsPerPage_CONST: 10
	   };
     return searchData;

    function hasMorePages(){
      var currentLastHit = searchData.pageNumber * searchData.snippetsPerPage_CONST;
      console.log('hasMorePages vars: currentLastHit:' + currentLastHit);
      console.log('hasMorePages vars: total hits:' + searchData.totalHits);
       if (searchData.totalHits> currentLastHit)
        return true;
      else
        return false;
     }

     //public
     function resetSearch(){
        searchData.hits = null;
        searchData.hitData = null;
        searchData.totalHits=0;
        searchData.pageNumber = 0;
        searchData.query = '';
        searchData.currentReviewingDoc = null;
     }

     //public
    function setCurrentReviewingDoc(documentId){
        searchData.currentReviewingDoc = null;
        if (documentId==null) return;
        if (searchData.hitData==null){
          console.log('no hitdata available');
          return;
        } 
        var keepGoing = true;
        angular.forEach(searchData.hitData,function(aHit){
          console.log('comparing hitdata item id:' + aHit.docId + " with documentId:" + documentId);
          if(keepGoing) {
            if (aHit.docId==documentId){
              searchData.currentReviewingDoc=aHit;
              keepGoing = false;
            }
          }

        });
      };

      //private function
      function getHighlightData(anAbstractSnippet){
          var snippetText = '';
          angular.forEach(anAbstractSnippet,function(aSubSnippet){
            snippetText = snippetText + aSubSnippet + "...";
          });
          snippetText = snippetText.split("<em>").join("<kbd>");
          snippetText = snippetText.split("</em>").join("</kbd>");
          return snippetText;
      }

      //private function
      function getHitData(id,jTitle,jPubDate,aTitle,aSnippet,htmlDoc,snippetNum, abstractText){
           var aHit = {
              articleTitle:aTitle,
              journalTitle:jTitle,
              abstract: abstractText,
              pubDate: jPubDate,
              docId:id,
              snippet:getHighlightData(aSnippet.abstract),
              snippetNumber:snippetNum, //the order in which the snippet was retrieved
              snippetID:null,  //to be set later when we make a snippet record
              htmlDocument: htmlDoc
            }
            
            //console.log('TEMP: snippetNumber in HitData is:' + aHit.snippetNumber);
            console.log('TEMP: snippet data is' + angular.toJson(aSnippet));
            return aHit;
      };

      //public function
     function searchWithQuery(query,pageNumber){
        //if (searchData.query!=query) resetSearch();
        searchData.pageNumber = pageNumber;
        searchData.query = query;

        //Defines the search
        var searchBody = {
          query:{
            match:{
              abstract: query
            }  
          },
          highlight:{
            fields:{
              abstract:{}
            }
          }
        };
        console.log('the query body is:' + angular.toJson(searchBody));
        var fromHitNumber = 1;
        askForRange = false;
        if (pageNumber>1){ //only get range after page 1 as we need the total hits
          fromHitNumber =  (pageNumber-1)*searchData.snippetsPerPage_CONST + 1;
          askForRange = true;
        }


        var first = $q.defer();
        var promiseOfSearchResult = ESSearch.searchResponse(searchBody,askForRange,searchData.snippetsPerPage_CONST,fromHitNumber); 
        promiseOfSearchResult.then(function(result) { 
          if(result==null){
            
            console.log('no data retrieved');
            first.reject(result);
          }
          else{
      
            var log = [];
            var hits =[];
            var hitSources = [];
            var allHits;
            var hitcount = 0;
            
 
            angular.forEach(result.data, function(value, key) {
              this.push(key + ': ' + value);
              if (key=="hits"){
                allHits = value;

                if (pageNumber==1) // get the total hits for the first page, after that we get ranges
                  searchData.totalHits = allHits.total;
                console.log('total hits are:' + searchData.totalHits);

                angular.forEach(allHits,function(value2,key2){
                  if (key2=="hits"){
                    angular.forEach(value2,function(hit){
                        hitcount++;
                        hits.push(hit);
                        //this is where the type fields are selected from ES
                        //USE BODY-> hitSources.push(getHitData(hit._id,hit._source["journal-title"],hit._source["pub-date"],hit._source["article-title"],hit.highlight,hit._source["HTML_BODY"],hitcount,hit._source["abstract"]));
                        hitSources.push(getHitData(hit._id,hit._source["journal-title"],hit._source["pub-date"],hit._source["article-title"],hit.highlight,hit._source["HTML_ALL"],hitcount,hit._source["abstract"]));
                    });
                  }

                })
              } 
            }, log);
            console.log('there were ' + hitcount + 'hits found');
            // console.log('key value pairs are:' + angular.toJson(log));
            // console.log('first hit source articleTitle is:' + angular.toJson(hitSources[0].ArticleTitle));
            // console.log('second hit source articleTitle is:' + angular.toJson(hitSources[1].ArticleTitle));
            // console.log('first hit is:' + angular.toJson(hits[0]));
            searchData.hits = hits;
            searchData.hitData = hitSources;
            first.resolve(result);
          }
        });
        return first.promise;
      };



  })
 .factory('ESSearch', function($http,RESOURCE_ELASTICSEARCH_ADDRESS) {

      var searchResponse = function(searchBody, wantARange,numberOfHits,fromHitNum){
        var sizeURLText = '?pretty';
        if (wantARange==true)
          sizeURLText = '?size=' + numberOfHits + '&from=' + fromHitNum;

        return $http.post(RESOURCE_ELASTICSEARCH_ADDRESS+'_search' + sizeURLText,searchBody).success(function(data, status) {
          console.log('status is:' + angular.toJson(status));
          console.log('we have search data OK');
            return data;
         })
        .error(function(data, status) {
            console.log("Error getting ES data with status:" + angular.toJson(status) + ' and data: ' + angular.toJson(data) );
            return null;
        })

      };
      return { searchResponse: searchResponse };
  });
