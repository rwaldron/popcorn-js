test("Popcorn scopemonkey Plugin", function () {
  
  var popped = Popcorn("#video"),
      expects = 10, 
      count = 0,
      mapInterval,
      mapInterval2,
      mapInterval3,
      mapInterval4;
  
  expect(expects);
  
  function plus() {
    if ( ++count===expects) {
      start();
    }
  }
  
  stop();

  
});
