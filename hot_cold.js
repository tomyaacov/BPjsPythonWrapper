const n = 3;
bp.registerBThread( "AddA", function(){
    bp.sync( {waitFor:bp.Event("Start")} );
    for (let i = 0; i < n; i++) {
        bp.hot(true).sync( {request:bp.Event("A")} );
    }
} );

bp.registerBThread( "AddB", function(){
    bp.sync( {waitFor:bp.Event("Start")} );
    for (let i = 0; i < n; i++) {
        bp.sync( {request:bp.Event("B")} );
    }
    while (true){
        bp.sync( {request:bp.Event("I")} );
    }
} );

bp.registerBThread( "control", function(){
    bp.sync( {request:bp.Event("Start")} );
    while (true){
        bp.sync( {waitFor:bp.Event("A")} );
        bp.sync( {waitFor:bp.Event("B"), block: bp.Event("A")} );
    }
} );