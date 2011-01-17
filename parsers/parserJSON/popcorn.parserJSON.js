// PARSER: 0.3 JSON

(function (Popcorn) {
  Popcorn.parser( "parseJSON", "JSON", function( data ) {

    // declare needed variables
    var retObj = {
          title: "",
          remote: "",
          data: []
        },
        manifestData = {}, 
        dataObj = data.json.data;
        
        
    Popcorn.forEach( dataObj, function ( obj, key ) {
      retObj.data.push( obj );
    });

    return retObj;
  });

})( Popcorn );
