(function (Popcorn) {
  
  
  function Foo( data ) {
    
    this.foo = data;
    
    return this;
  };
  
  
  Foo.prototype.getFoo = function() {
    return this.foo;
  };

  Popcorn.plugin( "scopemonkey" , (function(){
      
    var setups = 0;

    return {
      manifest: {
        about:{
          name: "Popcorn scopemonkey Plugin",
        },
        options:{
          start    : {elem:'input', type:'text', label:'In'},
          end      : {elem:'input', type:'text', label:'Out'},
          target   : 'scope-container',
          output      : {elem:'input', type:'text', label:'Out'}
        }
      },
      _setup : function( options ) {
        
        setups++;
        
        options.foo = new Foo( setups );
        
        // Note that container is 
        options._container = document.createElement( "div" );
        options._container.style.display = "none";
        
        
        if ( document.getElementById( options.target ) ) {
        
          document.getElementById( options.target ).appendChild( options._container );
        }

      },

      start: function(event, options) {
      
        options._container.innerHTML = options.foo.getFoo() ;
        
        options._container.style.display = "";

      },

      end: function(event, options){
        
        options._container.style.display = "none";
        
      }
    };
    
  })());

})( Popcorn );
