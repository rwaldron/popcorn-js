test( "Popcorn.p.tracks() Public Facing API", 2, function () {

	// Public facing API
  ok( Popcorn.p.tracks , "tracks is a Popcorn prototype method");
  ok( "tracks" in Popcorn("#video"), "tracks is a method of the $pop instance");

});

test( "Dependencies loaded", 7, function () {

	var dependencies = {
				plugins: {
					names: [ "subtitle" ]
				},
				parsers: {
					prefix: "parser",
					names: [ "SBV", "SRT", "SSA", "TTML", "TTXT", "VTT" ]
				}
			};

	// Tests that tracks() ensures it's own deps
	Popcorn.forEach( dependencies, function( dep, type ) {
		Popcorn.forEach( dep.names, function( obj ) {

			var prefix = ( (dep.prefix && dep.prefix) || "" ),
					resource = prefix + obj,
					method = ( prefix && prefix.slice( 0, -1 ) || "" ) + obj;

			ok( Popcorn.p[ method ], "Popcorn.p." + method + " exists" );

		});
	});

});



var tests = [
	{
		type: "sbv",
		tests: [
			{
				time: 3,
				text: "Senator, we're making our final approach into Coruscant."
			},
			{
				time: 10,
				text: "Very good, Lieutenant."
			},
			{
				time: 17,
				text: "It's a trap!"
			}
		]
	},
	{
		type: "srt",
		tests: [
			{
				time: 3,
				text: "[Background Music Playing]"
			},
			{
				time: 10,
				text: "<true> To say that 2 is greater than three (3 > 2) would be lying<true>"
			},
			{
				time: 17,
				text: "Oh my god, Watch out! It's coming!!"
			}
		]
	},
	{
		type: "ttml",
		tests: [
			{
				time: 3,
				text: "Senator, we're making our final approach into Coruscant."
			},
			{
				time: 10,
				text: "Very good, Lieutenant."
			},
			{
				time: 17,
				text: "It's a trap!"
			}
		]
	},
	{
		type: "ttxt",
		tests: [
			{
				time: 3,
				text: "Senator, we're making our final approach into Coruscant."
			},
			{
				time: 10,
				text: "Very good, Lieutenant."
			},
			{
				time: 17,
				text: "It's a trap!"
			}
		]
	},
	{
		type: "vtt",
		tests: [
			{
				time: 3,
				text: "Senator, we're making our final approach into Coruscant."
			},
			{
				time: 10,
				text: "Very good, Lieutenant."
			},
			{
				time: 17,
				text: "It's a trap!"
			}
		]
	}
];

Popcorn.forEach( tests.slice( 1, 2 ), function( set, tIdx ) {

	test( set.type, function () {

	  var $pop = Popcorn( "#" + set.type ),
	      count = 0,
				text = "",
				subNode, children;

	  expect( set.tests.length );

	  function plus() {
	    if ( ++count === set.tests.length ) {
	      start();
	    }
	  }

	  stop();


		Popcorn.forEach( set.tests, function( test, idx ) {

			$pop.exec( test.time, function() {

				this.pause();

				subNode = document.querySelectorAll( "subtitlediv" );
				children = subNode.children;

				text = "";

				Popcorn.forEach( children, function( node ) {
					text += (( node.innerText && node.innerText ) || "").replace(/\n/, " ");
				});

				equal( text, test.text, "displayed text matches test text" );
				plus();


				if ( set.tests[ idx + 1 ] ) {
					this.currentTime( set.tests[ idx + 1 ].time - 1 ).play();
				}
			});


		});


		$pop.tracks().play();

	});




});

