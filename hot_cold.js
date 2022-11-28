bp.registerBThread( "AddA", function(){
    bp.sync( {request:bp.Event("A")} );
    bp.hot(true).sync( {request:bp.Event("A")} );
    bp.hot(true).sync( {request:bp.Event("A")} );
} );

bp.registerBThread( "AddB", function(){
    bp.sync( {request:bp.Event("B")} );
    bp.hot(true).sync( {request:bp.Event("B")} );
    bp.hot(true).sync( {request:bp.Event("B")} );
} );

bp.registerBThread( "control", function(){
    while (true){
        bp.sync( {waitFor:bp.Event("A")} );
        bp.sync( {waitFor:bp.Event("B"), block: bp.Event("A")} );
    }
} );