$(function () {

	//	Cache selector matches
	var $win = $(window), 
			$menu = $("#ul-menu"), 
			$runview = $("#iframe-runview"),
			$runall = $("#button-run-all"),

	//	Test runner module
			Test = {
				subject: location.pathname.split("/")[ 2 ], 
				files: {},
				titles: [], 
				runIdx: null, 
				running: false, 
				runningAll: false,

				//	save when running all
				data: {
					pass: 0,
					fail: 0, 
					total: 0 
				},

				fn: {
					data: function( type, data ) {
						
						return ({ 

							update: function( data ) {
								for ( var p in data ) {
									Test.data[ p ] += data[ p ];
								}

								return Test.data;
							}

						})[ type ]( data );
					
					}, 
					runner: function( idx )  {

						var $runview = $("#iframe-runview");

						$runview[ 0 ].src = "../" + Test.files[ Test.titles[ idx ] ] + "?subject=" + Test.subject;

						$("#ul-menu a").removeClass( "active" ).eq( idx ).addClass( "active" );
						
						Test.runIdx = idx;

						return ( Test.running = true );
					}, 
					setup: function( url, callback ) {

						$.ajax({
							url: url, 
							type: "get", 
							dataType: "json", 
							success: function( data ) {

								var title,
										lis = [];

								$menu.empty();
		
								$.each( data[ Test.subject ], function( idx, test ) {

									title = test.split("/")[ 1 ];

									lis.push( '<li><a data-test="'+ title +'" target="iframe-runview" href="../'+ test +'">'+ title +'</a></li>' );

									Test.files[ title ] = test;
									Test.titles.push( title );
			
								});

								$menu.append( lis.join("") );

								callback && callback();
							}
						});								
					}
				}
			};

	
	Test.fn.setup( Test.subject + ".json", function() {

		$runall.bind( "click", function() {

			Test.data = {
				pass: 0,
				fail: 0, 
				total: 0 
			};

			$(".pass, .fail, .total").html("0");

			Test.fn.runningAll = true;
		
			Test.fn.runner( 0 );
		});		

		$menu.delegate( "a", "click", function( event ) {

			var idx = $("#ul-menu a").index( event.target );

			Test.fn.runner( idx );

		});

		$win.bind( "message", function( event ) {

			Test.runIdx++;

			if ( Test.fn.runningAll ) {
				Test.fn.runner( Test.runIdx );
			}

			if ( Test.fn.data( "update", event.originalEvent.data.results ) ) {

				var cache = event.originalEvent.data.results;
																											
				$("#ul-menu a").eq( Test.runIdx - 1 ).append( 
					" <strong>(<b class='pass'>" + cache.pass + "</b>, <b class='fail'>" + cache.fail + "</b>, <b class='total'>" + cache.total + "</b>)</strong>" 
				);
				
				$.each( Test.data, function( key, val ) {
					//console.log( key, val );
					$("." + key, $("#all") ).html( val );
				});
			
			}
		
		});
	});

	window.Test = Test;

});
