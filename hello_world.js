bp.registerBThread("bt-world",function(){
  bp.sync({request:bp.Event("world")});
})

bp.registerBThread("bt-hello", function(){
  bp.sync({request:bp.Event("hello")});
})