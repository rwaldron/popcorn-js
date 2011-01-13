(function( global, document) {

  //  Cache refs to speed up calls to native utils
  //  Additionally improves compression 
  var  
  forEach = Array.prototype.forEach, 
  hasOwn = Object.prototype.hasOwnProperty, 
  slice = Array.prototype.slice,
  
  globalSetTimeout = global.setTimeout, 

  //  RegExp ID string matching
  rIdExp = /^(#([\w\-\_\.]+))$/, 
  
  // Ready function cache
  readyStack = [], 
  readyBound = false,
  readyFired = false,

  //  Popcorn constructor
  //  Returns a new Popcorn instance object.    
  Popcorn = function( entity ) {
    return new Popcorn.p.init( entity );
  };

  //  Declare a shortcut (Popcorn.p) to and a definition of 
  //  the new prototype for our Popcorn constructor 
  Popcorn.p = Popcorn.prototype = {

    init: function( entity ) {

      var elem, matches;

      //  Supports Popcorn(function () { /../ }) 
      //  Originally proposed by Daniel Brooks

      if ( typeof entity === "function" ) {

        //  If document ready has already fired
        if ( document.readyState === "interactive" || document.readyState === "complete" ) {

          entity( document, Popcorn );

          return;
        }
        
        //  Add this function to the queue of ready functions
        readyStack.push( entity );

        //  This process should happen once per page load
        if ( !readyBound ) {

          //  set readyBound flag
          readyBound = true;

          var DOMContentLoaded  = function () {

            readyFired = true;

            //  remove this listener
            document.removeEventListener( "DOMContentLoaded", DOMContentLoaded, false );

            //  Execute all ready function in the stack
            for ( var i = 0; i < readyStack.length; i++ ) {

              readyStack[i].call( document, Popcorn );

            }
            //  Garbage collect the readyStack
            readyStack = null;  
          };

          document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false);
        }

        return;  
      }
      
      //  Qualify the `entity` as a valid id selector
      matches = rIdExp.exec( entity );
      
      //  If `matches` is satified, attempt to get the element
      if ( matches.length && matches[2]  ) {
        elem = document.getElementById( matches[2] );
      }
      
      //  If no video elem, simply stop Popcorn
      if ( !elem ) {
        Popcorn.error( "No video element exists with id: " + entity );
        return;
      }
      
      //  setup instance video property
      this.video = elem;
      
      //  setup instance data object
      this.data = {
        history: [],
        events: {},
        trackEvents: {
          byStart: [ { start: -1, end: -1 } ],
          byEnd:   [ { start: -1, end: -1 } ],
          startIndex: 0,
          endIndex: 0,
          prevUpdateTime: 0
        }
      };
      
      //  Ensure that the video is actually ready to be used by the browser
      var isReady = function( that ) {
        
        var video = that.video, 
            videoDurationPlus;
        
        if ( video.readyState >= 3 ) {

          //  Adding padding to the front and end of the arrays
          videoDurationPlus = video.duration + 1;

          //  Add an initial empty track event
          Popcorn.addTrackEvent( that, {
            start: videoDurationPlus,
            end: videoDurationPlus
          });
          
          video.addEventListener( "timeupdate", function( event ) {

            var currentTime = this.currentTime,
                tracks = that.data.trackEvents, 
                previousTime = tracks.prevUpdateTime,
                byStart = tracks.byStart,
                byEnd = tracks.byEnd, 
                byStartIndex, byEndIndex;
                
            //  Playbar advancing
            if ( previousTime < currentTime ) {

              while ( byEnd[ tracks.endIndex ] && byEnd[ tracks.endIndex ].end <= currentTime ) {
                
                byEndIndex = byEnd[ tracks.endIndex ];
                
                if ( byEndIndex._running === true ) {
                  byEndIndex._running = false;
                  byEndIndex._natives.end.call( that, event, byEndIndex );
                }
                tracks.endIndex++;
              }
              
              while ( byStart[ tracks.startIndex ] && byStart[ tracks.startIndex ].start <= currentTime ) {
                
                byStartIndex = byStart[ tracks.startIndex ];
                
                if ( byStartIndex.end > currentTime && byStartIndex._running === false ) {
                  byStartIndex._running = true;
                  byStartIndex._natives.start.call( that, event, byStartIndex );
                }
                tracks.startIndex++;
              }
            }
            
            //  Playbar receding
            if ( previousTime > currentTime ) {

              while ( byStart[ tracks.startIndex ] && byStart[ tracks.startIndex ].start > currentTime ) {
                
                byStartIndex = byStart[ tracks.startIndex ];
                
                if ( byStartIndex._running === true ) {
                  byStartIndex._running = false;
                  byStartIndex._natives.end.call( that, event, byStartIndex );
                }
                tracks.startIndex--;
              }
              
              while ( byEnd[ tracks.endIndex ] && byEnd[ tracks.endIndex ].end > currentTime ) {
                
                byEndIndex = byEnd[ tracks.endIndex ];
                
                if ( byEndIndex.start <= currentTime && byEndIndex._running === false ) {
                  byEndIndex._running = true;
                  byEndIndex._natives.start.call( that, event, byEndIndex );
                }
                tracks.endIndex--;
              }
            } 
            
            //  Keep track of this update
            tracks.prevUpdateTime = currentTime;
            
          }, false);
          
        } else {
        
          globalSetTimeout( function() {
            isReady(that);
          }, 1);
        
        }
      };

      isReady( this );

      return this;
    }
  };

  //  Inherit to Popcorn instance objects
  Popcorn.p.init.prototype = Popcorn.p;
  
  //  Non-instance-specific utilities
  Popcorn.forEach = function( obj, fn, context ) {

    if ( !obj || !fn ) {
      return {};
    }

    context = context || this;
    //  Use native if possible
    if ( forEach && obj.forEach === forEach ) {
      return obj.forEach( fn, context );
    } 
    
    var key;
    
    for ( key in obj ) {
      if ( hasOwn.call( obj, key ) ) {
        fn.call( context, obj[ key ], key, obj );
      } 
    }        

    return obj;
  };    
  
  Popcorn.extend = function( obj ) {
    var dest = obj, 
        src = slice.call( arguments, 1 ), 
        prop;

    Popcorn.forEach( src, function( copy ) {
      for ( prop in copy ) {
        dest[ prop ] = copy[ prop ];
      }
    });
    return dest;      
  };

  Popcorn.extend( Popcorn, {
    error: function( msg ) {
      throw msg;
    },
    guid: function( prefix ) {
      return  ( prefix ? prefix : "" ) + ( +new Date() + Popcorn.guid.counter++ );
    }, 
    sizeOf: function ( obj ) {
      var size = 0, 
          prop;

      for ( prop in obj  ) {
        size++;
      }

      return size;
    }, 
    nop: function() {}
  });    
  
  //  Memoize counter
  Popcorn.guid.counter  = 0;
  
  //  Implements getters, setters and passthrough controllers 
  //  as methods of the returned Popcorn instance.
  Popcorn.extend(Popcorn.p, (function () {
      
      var methods = "load play pause currentTime playbackRate mute volume duration", 
          ret = {};
      
      //  Build methods, store in object that is returned and passed to extend
      Popcorn.forEach( methods.split(/\s+/g), function( name ) {
        
        ret[ name ] = function( arg ) {
          
          //  create and return as passthrough
          if ( typeof this.video[name] === "function" ) {
            this.video[ name ]();
            
            return this;
          }
          
          //  `arg` might be zero          
          if ( arg !== false && arg !== null && typeof arg !== "undefined" ) {
            
            //  Set property to new value
            this.video[ name ] = arg;
            
            return this;
          }
          
          //  return property's value
          return this.video[ name ];
        };
      });
      
      return ret;
  
    })()
  );
  
  
  //  Instance methods  
  Popcorn.extend(Popcorn.p, {
    
    //  DEPRECATED
    roundTime: function () {
      return -~this.video.currentTime;
    },
    
    //  Execute a function once at a specific time
    exec: function ( time, fn ) {
      
      !fn && ( fn = Popcorn.nop );
      
      var self = this, 
          guid = Popcorn.guid( "execCallback" ), 
          callback = function execCallback( event ) {
            
            if ( self.currentTime() >= time && !callback.fired ) {
              
              callback.fired = true;
              
              self.unlisten( "timeupdate", guid );
              
              fn.call( self, event );
              
            }
          };
      
      callback.fired = false;
      callback.name = guid;
      
      this.listen( "timeupdate", callback );
      
      return this;
    },
    removePlugin: function( name ) {

      var byStart = this.data.trackEvents.byStart, 
          byEnd = this.data.trackEvents.byEnd;
  
      delete Popcorn.p[ name ];
  
      // remove plugin reference from registry
      for ( var r = 0, rl = Popcorn.registry.length; r < rl; r++ ) {
        if ( Popcorn.registry[r].type === name ) {
          Popcorn.registry.splice(r, 1);
          break; // plugin found, stop checking
        }
      }

      // remove all trackEvents
      for ( var s = 0, sl = byStart.length; s < sl; s++ ) {
        if ( byStart[s] && byStart[s]._natives && byStart[s]._natives.type === name ) {
          byStart.splice( s, 1 );
          s--; sl--; // update for loop if something removed, but keep checking
          if ( this.data.trackEvents.startIndex <= s ) {
            this.data.trackEvents.startIndex--; // write test for this
          }
        }
      }
      for ( var e = 0, el = byEnd.length; e < el; e++ ) {
        if ( byEnd[e] && byEnd[e]._natives && byEnd[e]._natives.type === name ) {
          byEnd.splice( e, 1 );
          e--; el--; // update for loop if something removed, but keep checking
          if ( this.data.trackEvents.endIndex <= e ) {
            this.data.trackEvents.endIndex--; // write test for this
          }
        }
      }
      return this;
    }
  });

  Popcorn.Events  = {
    UIEvents: "blur focus focusin focusout load resize scroll unload  ", 
    MouseEvents: "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave click dblclick", 
    Events: "loadstart progress suspend emptied stalled play pause " + 
           "loadedmetadata loadeddata waiting playing canplay canplaythrough " + 
           "seeking seeked timeupdate ended ratechange durationchange volumechange"
  };
    
  Popcorn.Events.Natives = Popcorn.Events.UIEvents + " " + 
                            Popcorn.Events.MouseEvents + " " +
                              Popcorn.Events.Events;
  
  Popcorn.events  = {
  

    isNative: function( type ) {
      
      var checks = Popcorn.Events.Natives.split(/\s+/g);
      
      for ( var i = 0; i < checks.length; i++ ) {
        if ( checks[i] === type ) {
          return true;
        }
      }
      
      return false;
    },  
    getInterface: function( type ) {
      
      if ( !Popcorn.events.isNative( type ) ) {
        return false;
      }
      
      var natives = Popcorn.Events, proto;
      
      for ( var p in natives ) {
        if ( p !== "Natives" && natives[p].indexOf(type) > -1 ) {
          proto = p;
        }
      }
      
      return proto;
    
    }, 
    
    
    all: Popcorn.Events.Natives.split(/\s+/g), 
    
    fn: {
      trigger: function ( obj, type, data ) {
        
        var eventInterface, evt;
        //  setup checks for custom event system
        if ( obj.data.events[ type ] && Popcorn.sizeOf( obj.data.events[type] ) ) {
          
          eventInterface  = Popcorn.events.getInterface(type);
          
          if ( eventInterface ) {
          
            evt = document.createEvent( eventInterface );
            evt.initEvent(type, true, true, global, 1);          
          
            obj.video.dispatchEvent(evt);
            
            return obj;
          }        

          //  Custom events          
          Popcorn.forEach( obj.data.events[ type ], function ( obj, key ) {

            obj.call( obj, data );
            
          }, obj);
        }
        
        return obj;
      }, 
      listen: function ( obj, type, fn ) {
        
        var self = obj, hasEvents = true;
        
        if ( !obj.data.events[type] ) {
          obj.data.events[type] = {};
          hasEvents = false;
        }
        
        //  Register 
        obj.data.events[type][ fn.name || ( fn.toString() + Popcorn.guid() ) ] = fn;
        
        // only attach one event of any type          
        if ( !hasEvents && Popcorn.events.all.indexOf( type ) > -1 ) {

          obj.video.addEventListener( type, function( event ) {
            
            Popcorn.forEach( self.data.events[type], function ( obj, key ) {
              if ( typeof obj === "function" ) {
                obj.call(self, event);
              }

            });
            
            //fn.call( self, event );
          
          }, false);          
        }
        return obj;
      }, 
      unlisten: function( obj, type, fn ) {
        
        if ( obj.data.events[type] && obj.data.events[type][fn] ) {
          
          delete obj.data.events[type][ fn ];
          
          return obj;
        }
      
        obj.data.events[type] = null;
        return obj;        
      },      
      special: {
        // handles timeline controllers
        play: function () {
          //  renders all of the interally stored track commands
        }
      }
    }
  };
  
  //  Extend listen and trigger to all Popcorn instances
  Popcorn.forEach( [ "trigger", "listen", "unlisten" ], function ( key ) {

    Popcorn.p[ key ] = function() {
      
      var args = [ this ].concat( slice.call( arguments, 0 ) );
      
      return Popcorn.events.fn[ key ].apply( null, args );
    }
  });  

  //  These methods should be protected from overwriting (by the plugin factory)
  Popcorn.protect = {
    natives: "load play pause currentTime playbackRate mute volume duration removePlugin roundTime trigger listen unlisten".toLowerCase().split(/\s+/)
  };
  
  
  Popcorn.addTrackEvent = function( obj, track ) {
  
    if ( track._natives ) {
      // supports user defined track event id
      track._id = !track.id ? Popcorn.guid( track._natives.type ) : track.id;

      //  Push track event ids into the history
      obj.data.history.push( track._id );      
    }
  
    //  Push this track into the the start/end data
    obj.data.trackEvents.byStart.push( track );
    obj.data.trackEvents.byEnd.push( track );
    
    //  Sort by start times
    obj.data.trackEvents.byStart.sort( function( a, b ){
      return ( a.start - b.start );
    });
    
    //  Sort by end times
    obj.data.trackEvents.byEnd.sort( function( a, b ){
      return ( a.end - b.end );
    });

  };
  
  Popcorn.removeTrackEvent = function( obj, trackId ) {
    
    var historyLen = obj.data.history.length, 
        indexWasAt = 0, 
        byStart = [], 
        byEnd = [], 
        history = [], 
        i = 0; 
    
    
    Popcorn.forEach( obj.data.trackEvents.byStart, function( o, i, context) {
      
      // Preserve the original start/end trackEvents
      if ( !o._id ) {
        byStart.push( obj.data.trackEvents.byStart[i] );
        byEnd.push( obj.data.trackEvents.byEnd[i] );
      }  
      
      // Filter for user track events (vs system track events)
      if ( o._id ) {
        
        // Filter for the trackevent to remove
        if ( o._id !== trackId ) {
          byStart.push( obj.data.trackEvents.byStart[i] );
          byEnd.push( obj.data.trackEvents.byEnd[i] );
        }      
      
        //  Capture the position of the track being removed.
        if ( o._id === trackId ) {
          indexWasAt = i;
        }      
      }
    });
    
    
    //  Update 
    if ( indexWasAt <= obj.data.trackEvents.startIndex ) {
      obj.data.trackEvents.startIndex--;
    }

    if ( indexWasAt <= obj.data.trackEvents.endIndex ) {
      obj.data.trackEvents.endIndex--;
    }
    
    
    obj.data.trackEvents.byStart = byStart;
    obj.data.trackEvents.byEnd = byEnd;


    for ( ; i < historyLen; i++ ) {
      if ( obj.data.history[i] !== trackId ) {
        history.push( obj.data.history[i] );
      }
    }    
    
    obj.data.history = history;
    
    return Popcorn.getTrackEvents( obj );
  };
  
  Popcorn.getTrackEvents = function( obj ) {
    
    var trackevents = [];
    
    Popcorn.forEach( obj.data.trackEvents.byStart, function( obj ) {    
      if ( obj._id ) {
        trackevents.push( obj );
      } 
    });
    
    return trackevents;
  };
  
  
  Popcorn.getLastTrackEventId = function( obj ) {
    
    var history = obj.data.history;
    
    return history[ history.length - 1 ];
  };
  
  //  Map TrackEvents functions to the {popcorn}.prototype
  Popcorn.extend( Popcorn.p, {
    
    getTrackEvents: function() {
      return Popcorn.getTrackEvents.call( null, this );
    },
  
    getLastTrackEventId: function() {
      return Popcorn.getLastTrackEventId.call( null, this );
    }, 
    
    removeTrackEvent: function( id ) {
      Popcorn.removeTrackEvent.call( null, this, id );
      return this;
    }
  
  });
  
  //  Plugin manifests
  Popcorn.manifest = {};
  
  //  Plugins are registered 
  Popcorn.registry = [];
  
  //  An interface for extending Popcorn 
  //  with plugin functionality
  Popcorn.plugin = function( name, definition ) {

    if ( Popcorn.protect.natives.indexOf( name.toLowerCase() ) >= 0 ) {
      Popcorn.error("'" + name + "' is a protected function name");
      return;
    }

    //  Provides some sugar, but ultimately extends
    //  the definition into Popcorn.p 

    var reserved = [ "start", "end" ], 
        plugin = {type: name},
        pluginFn, 
        setup;

    if ( typeof definition === "object" ) {

      //  Reference the definition      
      setup = definition;

      //  Plugin function wrapper
      pluginFn  = function ( options ) {

        if ( !options ) {
          return this;
        } 

        // storing the plugin natives
        options._natives = setup;
        options._natives.type = name;
        options._running = false;

        //  Checks for expected properties
        if ( !options.start ) {
          options.start = 0;
        }

        if ( !options.end ) {
          options.end = this.duration();
        }

        //  If a _setup was declared and is a function, 
        //  then call it before the events commence
        if ( setup._setup && setup._setup.call ) {

          // Resolves 239, 241, 242
          options.target || 
            ( setup.manifest.options.target && 
                ( options.target = setup.manifest.options.target ) );

          setup._setup.call( this, options );
        }

        //  Store a track event created by options
        Popcorn.addTrackEvent( this, options );


        //  Future support for plugin event definitions 
        //  for all of the native events
        Popcorn.forEach( setup, function ( callback, type ) {
          if ( type !== "type" &&
                reserved.indexOf(type) === -1 ) {

            this.listen( type, callback );
          }
        }, this);

        return this;
      };
    }

    //  If a function is passed... 
    if ( typeof definition === "function" ) {

      //  Execute and capture returned object
      setup = definition.call(this);

      //  Ensure an object was returned 
      //  it has properties and isnt an array
      if ( typeof setup === "object" && 
            !( "length" in setup )  ) {

        Popcorn.plugin( name, setup );                
      }
      return;
    }

    //  Assign new named definition     
    plugin[ name ] = pluginFn;

    //  Extend Popcorn.p with new named definition
    Popcorn.extend( Popcorn.p, plugin );

    //  Push into the registry
    Popcorn.registry.push(plugin);

    //  If a manifest was provided
    if ( setup.manifest ) {
      //  Augment the manifest object
      Popcorn.manifest[ name ] = setup.manifest;
    }    

    return plugin;
  };

  //  Stores parsers keyed on filetype
  Popcorn.parsers = {};

  //  An interface for extending Popcorn
  //  with parser functionality
  Popcorn.parser = function( name, type, definition ) {

    if ( Popcorn.protect.natives.indexOf( name.toLowerCase() ) >= 0 ) {
      Popcorn.error("'" + name + "' is a protected function name");
      return;
    }

    if ( typeof definition !== "function" ) {
      return;
    }

    // Provides some sugar, but ultimately extends
    // the definition into Popcorn.p
    var natives = Popcorn.events.all,
        parseFn,
        parser = {};

    parseFn = function ( filename ) {

      if ( !filename ) {
        return this;
      }

      var that = this;

      Popcorn.xhr({
        url: filename,
        success: function( data ) {

          var tracksObject = definition( data ), 
              tracksObjectDataLen = tracksObject.data.length, 
              iter = 0, 
              key, current;

          // creating tracks out of parsed object
          for ( ; iter < tracksObjectDataLen; iter++ ) {
            
            current = tracksObject.data[ iter ];
            
            for ( key in current ) {

              if ( hasOwn.call( current, key) ) {
                that[ key ]( current[ key ] );
              }
            }
          }
        }
      });

      return this;
    };

    // Assign new named definition
    parser[ name ] = parseFn;

    // Extend Popcorn.p with new named definition
    Popcorn.extend( Popcorn.p, parser );

    // keys the function name by filetype extension
    Popcorn.parsers[type] = name;

    return parser;
  };


  //  Popcorn provides a small XHR API
  var setup = {
    url: "",
    data: "",
    dataType: "",
    success: Popcorn.nop,
    type: "GET",
    async: true, 
    xhr: function()  {
      return new global.XMLHttpRequest();
    }
  };   

  Popcorn.xhr = function ( options ) {

    var settings = Popcorn.extend( {}, setup, options );

    settings.ajax  = settings.xhr();

    if ( settings.ajax ) {

      settings.ajax.open( settings.type, settings.url, settings.async ); 
      settings.ajax.send( null ); 

      return Popcorn.xhr.httpData( settings );
    }       
  };

  Popcorn.xhr.httpData = function ( settings ) {

    var data, json = null;  

    settings.ajax.onreadystatechange = function() {

      if ( settings.ajax.readyState === 4 ) { 
        
        try {
          json = JSON.parse(settings.ajax.responseText);
        } catch(e) {
          //suppress
        }

        data = {
          xml: settings.ajax.responseXML, 
          text: settings.ajax.responseText, 
          json: json
        };

        settings.success.call( settings.ajax, data );
      } 
    }; 
    return data;  
  };

  //  Exposes Popcorn to global context
  global.Popcorn = Popcorn;

  document.addEventListener( "DOMContentLoaded", function () {

    var videos = document.getElementsByTagName( "video" );

    Popcorn.forEach( videos, function ( iter, key ) {

      var video = videos[ key ],
          dataSources, popcornVideo;

      //  Ensure we're looking at a dom node and that it has an id
      //  otherwise Popcorn won't be able to find the video element
      if ( video.nodeType && video.nodeType === 1 && video.id ) {

        dataSources = video.getAttribute( "data-timeline-sources" );

        //  If the video has data sources, continue to load
        if ( dataSources ) {

          //  Set up the video and load in the datasources
          popcornVideo = Popcorn( "#" + video.id ).parseXML( dataSources );

          //  Only play the video if it was specified to do so
          if ( !!popcornVideo.autoplay ) {
            popcornVideo.play();
          }
        }
      }
    });
  }, false );

})( this, this.document );
