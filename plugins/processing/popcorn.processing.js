// PLUGIN: Processing

(function (Popcorn) {
  
  /**
   * Processing popcorn plug-in 
   */


  //  Preload Processing.js
  if ( !( "Processing" in window ) ) {
  
    var head = document.head || document.getElementsByTagName( "head" )[0] || document.documentumentElement,
        script = document.createElement( "script" );

    script.src = "http://processingjs.org/content/download/processing-js-1.0.0/processing-1.0.0.min.js";
    script.async = true;

    //  Insert script into the head at first position
    head.insertBefore( script, head.firstChild );
    
  };

  //  Processing init()
  window.addEventListener("load", function() {
    var scripts = document.getElementsByTagName("script"), 
        canvasArray = Array.prototype.slice.call(document.getElementsByTagName("canvas")), 
        canvas, src;

    for (var i = 0, j = 0; i < scripts.length; i++) {
      if (scripts[i].type == "application/processing") {

        src = scripts[i].getAttribute("target");

        if (src && src.indexOf("#") > -1) {
          canvas = document.getElementById(src.substr(src.indexOf("#") + 1));
          if (canvas) {
            new Processing(canvas, scripts[i].text);
            for (var k = 0; k< canvasArray.length; k++) {
              if (canvasArray[k] === canvas) {
                // remove the canvas from the array so we dont override it in the else
                canvasArray.splice(k,1);
              }
            }
          }
        } else {    
          if (canvasArray.length >= j) {
            new Processing(canvasArray[j], scripts[i].text);          
          }
          j++;
        }       
      }
    }
  }, false);   
  
  
  Popcorn.plugin( "processing" , {
    
    manifest: {
      about:{
        name: "Popcorn processing Plugin",
        version: "0.1",
        author: "@rwaldron",
        website: "weblog.bocoup.com/author/Rick-Waldron"
      },
      options:{
        start    : {elem:'input', type:'text', label:'In'},
        end      : {elem:'input', type:'text', label:'Out'},
        target   : 'processing-container',
        
        //  Replace below here with processing-js stuff
        text     : {elem:'input', type:'text', label:'Text'}
      }
    },
    _setup: function(options) {
      options._container = document.createElement( 'div' );
      options._container.style.display = "none";
      options._container.innerHTML  = options.text;
      if ( document.getElementById( options.target ) ) {
        document.getElementById( options.target ).appendChild( options._container );
      }
    },
    /**
     * @member processing 
     * The start function will be executed when the currentTime 
     * of the video  reaches the start time provided by the 
     * options variable
     */
    start: function(event, options){
    
      //  replace this with processing-js code
      options._container.style.display = "inline";
    },
    /**
     * @member processing 
     * The end function will be executed when the currentTime 
     * of the video  reaches the end time provided by the 
     * options variable
     */
    end: function(event, options){
    
      //  replace this with processing-js code
      options._container.style.display = "none";
    }
   
  });

})( Popcorn );