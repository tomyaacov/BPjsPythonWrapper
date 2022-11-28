const n = 3

bp.registerBThread("put A",function(){
  bp.sync({request:bp.Event("A")}); // first state should not be hot
  for (var i = 0; i < n-1; i++){
    bp.hot(true).sync({request:bp.Event("A")});
  }
})

bp.registerBThread("put B", function(){
  for (var i = 0; i < n; i++){
    bp.sync({request:bp.Event("B")});
  }
})

bp.registerBThread("control", function(){
  while (true) {
    bp.sync({waitFor:bp.Event("A")});
    bp.sync({waitFor:bp.Event("B"), block:bp.Event("A")});
  }
})