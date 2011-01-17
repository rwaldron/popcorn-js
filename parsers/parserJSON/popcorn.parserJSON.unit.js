test("Popcorn 0.3 JSON Parser Plugin", function () {
  
  var expects = 4,
      count = 0,
      timeOut = 0,
      numLoadingEvents = 5, 
      trackEvents, 
      interval,
      poppercorn = Popcorn( "#video" );
      
  function plus() {
    if ( ++count === expects ) {
      start();
      // clean up added events after tests
      clearInterval( interval );
    }
  }
  
  poppercorn.parseJSON("data/data.json");
  
  expect(expects);
  
  stop( 10000 );
  
  trackEvents = poppercorn.data.trackEvents;
  
  
  
  equals( trackEvents.byStart.length,  numLoadingEvents + 2 , "trackEvents.byStart.length === (5 loaded, 2 padding) " );
  
  
  
  
  
  
  

  // interval used to wait for data to be parsed
  interval = setInterval( function() {
    poppercorn.currentTime(5).play().currentTime(6);
  }, 2000);
  
});
