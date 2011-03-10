(function ( global, QUnit ) {

	var done = QUnit.done;

	//	Redefinition
	QUnit.done = function() {

		var args =  [].slice.call( arguments );

		//	Duck punch the messaging into the method
		parent.postMessage({
			status: "complete", 
			results: {
				pass: args[ 1 ], 
				fail: args[ 0 ],
				total: args.reduce(function( a, b ) { return a + b })
			}
		}, location.origin + "/popcorn-js/" + parent.window.Test.subject + "/index.html"  );

		// Call original
		done.apply( this, arguments );

	};

})( this, QUnit );
