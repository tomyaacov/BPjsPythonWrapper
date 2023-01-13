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

MAP = [
    "XXXXXXXX",
    "X XXX aX",
    "X t X  X",
    "X btb  X",
    "X  b  tX",
    "XX     X",
    "XX     X",
    "XXXXXXXX"
];

// MAP = [
//     "XXXXXX",
//     "Xtb aX",
//     "Xt b X",
//     "XXXXXX"
// ];


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


function data_to_str(player_location, box_list) {
    let s = player_location[0].toString() + "_" + player_location[1].toString() + "_" + "D";
    for (let i = 0; i < box_list.length; i++){
        s = s + "_" + box_list[i][0].toString() + "_" + box_list[i][1].toString()
    }
    return s;
}

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

function event_to_new_location(event, i, j) {
    return action_to_new_location(event.name, i, j);
}

function event_to_2_steps_trajectory(event, i, j) {
    let [new_i, new_j] = event_to_new_location(event, i, j);
    return event_to_new_location(event, new_i, new_j);
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




function get_action(i, j, next_i, next_j){
    if (i === next_i + 1) {
        return ["Up", i + 1, j];
    } else if (i === next_i - 1) {
        return ["Down", i - 1, j];
    } else if (j === next_j + 1) {
        return ["Left", i, j + 1];
    } else if (j === next_j - 1) {
        return ["Right", i, j - 1];
    }
}

function block_action(neighbors_list, i, j) {
    let current_list = []
    for (let k = 0; k < neighbors_list.length; k++) {
        let a = get_action(neighbors_list[k][0][0], neighbors_list[k][0][1], neighbors_list[k][1][0], neighbors_list[k][1][1]);
        if (a[1] === i && a[2] === j){
            current_list.push(bp.Event(a[0]));
        }
    }
    return current_list;
}

let dataEventSet = bp.EventSet( "dataEventSet", function(evt){
    return evt.name === "Data";
});

let walls_list = [];
let box_list = [];
let target_list = [];
let player_location = [];
for (let i = 0; i < MAP.length; i++) {
    for (let j = 0; j < MAP[i].length; j++) {
        if (MAP[i][j] === "a"){
            player_location.push(i);
            player_location.push(j);
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

bp.registerBThread( "player", function(){
    while (true){
        bp.sync( {waitFor:dataEventSet} );
        bp.sync( {request:[bp.Event("Up"), bp.Event("Down"), bp.Event("Left"), bp.Event("Right")]} );
    }
} );

bp.registerBThread( "wall", function(){
    let e;
    let player_location;
    let neighbors_list;
    let block_list;
    while (true){
        e = bp.sync( {waitFor:dataEventSet} );
        player_location = e.data.player_location
        neighbors_list = find_adjacent_boxes(player_location, walls_list)
        block_list = [];
        for (let i = 0; i < neighbors_list.length; i++) {
            block_list.push(bp.Event(get_action(neighbors_list[i][0][0], neighbors_list[i][0][1], neighbors_list[i][1][0], neighbors_list[i][1][1] )[0]))
        }
        bp.sync( {block: block_list, waitFor:bp.eventSets.all} );
    }
} );

for (let i = 0; i < box_list.length; i++) {
    bp.registerBThread( "box" + i.toString(), {box_id: i}, function(){
        let first_time = true;
        let e;
        let double_object_movement;
        while (true){
            e = bp.sync( {waitFor:dataEventSet} );
            let neighbors_list = find_adjacent_boxes(e.data.box_list[bp.thread.data.box_id], walls_list).concat(
                find_adjacent_boxes(e.data.box_list[bp.thread.data.box_id], e.data.box_list));
            double_object_movement =  block_action(neighbors_list, e.data.player_location[0], e.data.player_location[1])
            let box_in_target = target_list.includes(e.data.box_list[bp.thread.data.box_id])
            if ((!box_in_target) && (!first_time)){
                bp.hot(true).sync( {block:double_object_movement, waitFor:bp.eventSets.all} );
            } else {
                bp.sync( {block:double_object_movement, waitFor:bp.eventSets.all} );
            }
            first_time = false

        }
    });
}
bp.registerBThread( "data", {box_list: box_list, player_location: player_location, str: "A"+data_to_str(player_location, box_list)}, function() {
    let e;
    let new_player_location;
    while (true) {
        bp.sync({request:  bp.Event("Data", bp.thread.data), block: bp.eventSets.not(bp.Event("Data", bp.thread.data))});
        bp.thread.data.str = "B"+data_to_str(bp.thread.data.player_location, bp.thread.data.box_list);
        e = bp.sync({waitFor: bp.eventSets.all});
        new_player_location = event_to_new_location(e, bp.thread.data.player_location[0], bp.thread.data.player_location[1]);
        for (let b = 0; b < box_list.length; b++) {
            if ((new_player_location[0] === bp.thread.data.box_list[b][0]) &&
                (new_player_location[1] === bp.thread.data.box_list[b][1])) {
                bp.thread.data.box_list[b] = event_to_2_steps_trajectory(e, bp.thread.data.player_location[0], bp.thread.data.player_location[1]);
            }
        }
        bp.thread.data.player_location = new_player_location;
        bp.thread.data.str = "A"+data_to_str(bp.thread.data.player_location, bp.thread.data.box_list);
    }
});
