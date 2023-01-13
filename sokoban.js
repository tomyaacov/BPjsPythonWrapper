// MAP = [
//     "XXXXXXXX",
//     "X   XXXX",
//     "X   X  X",
//     "XX     X",
//     "XX XXXtX",
//     "X bXXXXX",
//     "Xa XXXXX",
//     "XXXXXXXX"
// ];

// MAP = [
//     "XXXXXXXX",
//     "X     aX",
//     "Xt  b  X",
//     "X  tb  X",
//     "XXX X  X",
//     "XXXXXXXX",
//     "XXXXXXXX",
//     "XXXXXXXX",
// ];

// MAP = [
//     "XXXXXXXX",
//     "Xt  b aX",
//     "X  tb  X",
//     "XXX XXXX",
//     "XXXXXXXX",
//     "XXXXXXXX",
//     "XXXXXXXX",
// ];

MAP = [
    "XXXXXX",
    "Xtb aX",
    "Xt b X",
    "XXXXXX"
];

// MAP = [
//     "XXXXXXXX",
//     "X a b tX",
//     "X      X",
//     "XXXXXXXX"
// ];

// MAP = [
//     "XXXXX",
//     "XabtX",
//     "XXXXX"
// ];

function action_to_new_location(action, i, j) {
    if (action === "Up") {
        return [i - 1, j];
    } else if (action === "Down") {
        return [i + 1, j];
    } else if (action === "Left") {
        return [i, j - 1];
    } else if (action === "Right") {
        return [i, j + 1];
    }
}

function event_to_new_location(event) {
    return action_to_new_location(event.name, event.data.i, event.data.j);
}

function event_to_2_steps_trajectory(event) {
    let [i, j] = event_to_new_location(event);
    return event_to_new_location(bp.Event(event.name, {i: i, j: j}));
}

function new_location_to_events(i, j) {
    return [bp.Event("Up",  {i: i + 1, j:j}),
bp.Event("Down",  {i: i - 1, j: j}),
bp.Event("Left", {i: i, j: j + 1}),
bp.Event("Right",  {i: i, j: j - 1})];
}

function is_adjacent(l1, l2) {
    let terms = [];
    terms.push(l1[0] === l2[0] && l1[1] === l2[1] + 1);
    terms.push(l1[0] === l2[0] && l1[1] === l2[1] - 1);
    terms.push(l1[0] === l2[0] + 1 && l1[1] === l2[1]);
    terms.push(l1[0] === l2[0] - 1 && l1[1] === l2[1]);
    return terms.reduce((a, b) => a + b, 0) === 1;
}

function find_adjacent_objects(list1, list2) {
    return list1.flatMap(l1 =>
        list2.map(l2 =>
            is_adjacent(l1, l2) ? [l1, l2] : []
        )
    ).filter(x => x.length > 0);
}

function find_adjacent_boxes(location, l) {
    return l.filter(l2 => is_adjacent(location, l2)).map(x => [location, x])
}


// function block_action(neighbors_list) {
//     return function(event) {
//         bp.log.info(neighbors_list)
//         bp.log.info(event)
//         let p1 = event_to_new_location(event);
//         let p2 = event_to_2_steps_trajectory(event);
//         bp.log.info(p1)
//         bp.log.info(p2)
//         bp.log.info(neighbors_list.includes([p1,p2]))
//         bp.log.info(neighbors_list.includes([p2,p1]))
//
//         return neighbors_list.includes([p1,p2]) || neighbors_list.includes([p2,p1])
//     }}

function get_action(i, j, next_i, next_j){
    if (i === next_i + 1) {
        return bp.Event("Up",  {i: i + 1, j: j});
    } else if (i === next_i - 1) {
        return bp.Event("Down",  {i: i - 1, j: j});
    } else if (j === next_j + 1) {
        return bp.Event("Left",  {i: i, j: j + 1});
    } else if (j === next_j - 1) {
        return bp.Event("Right",  {i: i, j: j - 1});
    }
}

function block_action(neighbors_list) {
    let current_list = []
    //bp.log.info(neighbors_list)
    //bp.log.info(i)
    //bp.log.info(j)
    for (let k = 0; k < neighbors_list.length; k++) {
        let a = get_action(neighbors_list[k][0][0], neighbors_list[k][0][1], neighbors_list[k][1][0], neighbors_list[k][1][1]);
        // bp.log.info(neighbors_list[k]);
        // bp.log.info(a);
        current_list.push(a);
        // let b = get_action(i, j, neighbors_list[k][0], neighbors_list[k][1]);
        // current_list.push(bp.Event(b,  {i: i, j: j}));
    }
    // bp.log.info(neighbors_list.toString());
    // bp.log.info(current_list.toString());
    return current_list;
}



let walls_list = [];
let box_list = [];
let target_list = [];
for (let i = 0; i < MAP.length; i++) {
    for (let j = 0; j < MAP[i].length; j++) {
        if (MAP[i][j] === "a"){
            bp.registerBThread( "player", {i:i, j:j}, function(){
                while (true){
                    bp.log.info([bp.thread.data.i, bp.thread.data.j].toString())
                    let e = bp.sync( {request:[bp.Event("Up", {i:bp.thread.data.i, j:bp.thread.data.j}),
                            bp.Event("Down", {i:bp.thread.data.i, j:bp.thread.data.j}),
                            bp.Event("Left", {i:bp.thread.data.i, j:bp.thread.data.j}),
                            bp.Event("Right", {i:bp.thread.data.i, j:bp.thread.data.j}),]} );
                    let l = event_to_new_location(e);
                    bp.thread.data.i = l[0];
                    bp.thread.data.j = l[1];
                }
            } );
        }
        if (MAP[i][j] === "X"){
            walls_list.push([i,j])
        }
        if (MAP[i][j] === "b"){
            box_list.push([i,j])
        }
        if (MAP[i][j] === "t"){
            target_list.push([i,j])
        }
    }
}
bp.registerBThread( "wall", function(){
    let block_list = []
    let current_list = []
    for (let i = 0; i < walls_list.length; i++) {
        current_list = new_location_to_events(walls_list[i][0], walls_list[i][1])
        current_list.forEach(element => block_list.push(element));
    }
    bp.sync( {block: block_list} );
} );

for (let i = 0; i < box_list.length; i++) {
    bp.registerBThread( "box" + i.toString(), {box_idx: i, i:box_list[i][0], j:box_list[i][1]}, function(){
        let first_time = true;
        while (true){
            // bp.log.info(walls_list.toString());
            // bp.log.info(box_list.toString());
            bp.log.info(box_list.toString())
            let neighbors_list = find_adjacent_boxes([bp.thread.data.i, bp.thread.data.j], walls_list).concat(
                find_adjacent_boxes([bp.thread.data.i, bp.thread.data.j], box_list));
            let double_object_movement =  block_action(neighbors_list)
            //let double_object_movement =  bp.EventSet("double_object_movement" + bp.thread.data.box_idx.toString(), block_action(neighbors_list))
            let box_in_target = target_list.includes([bp.thread.data.i, bp.thread.data.j])
            let e;
            if ((!box_in_target) && (!first_time)){
                e = bp.hot(true).sync( {block:double_object_movement, waitFor:bp.eventSets.all} );
            } else {
                e = bp.sync( {block:double_object_movement, waitFor:bp.eventSets.all} );
            }
            first_time = false
            let new_player_location = event_to_new_location(e)
            for (let b = 0; b < box_list.length; b++){
                if ((new_player_location[0] === box_list[b][0]) && (new_player_location[1] === box_list[b][1])){
                let new_box_location = event_to_2_steps_trajectory(e)
                box_list[b] = new_box_location;
                if(b === bp.thread.data.box_idx) {
                    bp.thread.data.i = new_box_location[0]
                    bp.thread.data.j = new_box_location[1]
                }
            }
            }

        }
    });
}
