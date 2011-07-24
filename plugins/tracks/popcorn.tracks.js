// PLUGIN: Tracks
(function( Popcorn ) {

	/**
		* Tracks popcorn plug-in
		* Parses <track> elements as a fallback native support
		*
		* @param {Object} options
		*
		* Example:
			Popcorn("#video").tracks();
		*
		*/

	// Store result of feature detecting real track element support
	var supportsTrack = !!( "kind" in document.createElement( "track" ) ),
		dependencies = {
			plugins: {
				names: [ "subtitle" ]
			},
			parsers: {
				prefix: "parser",
				names: [ "SBV", "SRT", "SSA", "TTML", "TTXT", "VTT" ]
			}
		};

	// Check for dependencies, load as needed
	Popcorn.forEach( dependencies, function( dep, type ) {

		// Iterate all named dependencies
		Popcorn.forEach( dep.names, function( obj ) {

			// Build correct names from given patterns
			var prefix = ( (dep.prefix && dep.prefix) || "" ),
					resource = prefix + obj,
					method = ( prefix && prefix.slice( 0, -1 ) || "" ) + obj,
					uri;

			// Only make requests for dependencies that don't currently exist
			if ( !Popcorn.p[ method ] ) {

				// Create array of path information and join it
				uri = [
					"http://popcornjs.org/code/",
					type + "/",
					resource + "/",
					"popcorn." + resource + ".js"
				].join( "" );

				Popcorn.getScript( uri, Popcorn.nop );
			}
		})
	});

	// tracks()
	Popcorn.p.tracks = function() {

		var tracks;

		// If host support for track elements does not exist
		if ( !supportsTrack ) {

			// Store reference to all track elements that are children
			// of this media element
			tracks = this.media.querySelectorAll( "track" );

			// If there are track elements...
			if ( tracks.length ) {

				// Iterate all track elements available and
				// process each of them through the proto.track() plugin
				Popcorn.forEach( tracks, function( track ) {

					var src = track.getAttribute( "src" ),
							lastIndexOf = src.lastIndexOf("."),
							parserType = src.slice( lastIndexOf + 1, src.length );

					// Call the parser with the source param
					this[ "parse" + parserType.toUpperCase() ]( src );

				// Pass popcorn instance as context
				}, this );
			}
		}

		// Return instance to continue chain
		return this;
	};

})( Popcorn );
