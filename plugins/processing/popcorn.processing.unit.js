test("Popcorn Processing Plugin", function () {
  
  var popped = Popcorn("#video"),
      expects = 3, 
      count = 0,
      interval,
      interval2,
      interval3,
      processingdiv = document.getElementById('processing-container');
  
  expect(expects);
  
  function plus() {
    if ( ++count===expects) {
      start();
    }
  }
  
  stop();
   
  ok ('processing' in popped, "processing is a method of the popped instance");
  plus();
  
  equals ( processingdiv.childNodes.length, 0, "initially, there is nothing inside the processingdiv" );
  plus();
  

  ok( "Processing" in window, "`Processing` is loaded" );
  plus();
  
  popped.processing({
      start: 1, // seconds
      end: 5, // seconds
      text: ( "Processing" in window ? "Processing.js is loaded" : "Processing is not loaded  epic fail" ),
      target: "processing-container"
    })
    .volume(0)
    .play();
  

});
