var room_visual_length = document.getElementById("room-visual").clientWidth;
var room_length = document.getElementById("room-length").value;
const scale_factor = room_visual_length / room_length;

const source_dot = document.getElementById("source_dot");
const sus_dot = document.getElementById("susceptible_dot");
const room_visual = document.getElementById("room-visual");

function passRoomLength() {
  //resizes room picture for new length
  var l = document.getElementById("room-length").value;
  document.getElementById("room-length").nextElementSibling.value = l;
  document.getElementById("room-visual").style.width = l * scale_factor + "px";

  //resets the coords for source and receiver
  resetDots();
}

function passRoomWidth() {
  //resizes room picture for new width
  var w = document.getElementById("room-width").value;
  document.getElementById("room-width").nextElementSibling.value = w;
  document.getElementById("room-visual").style.height = w * scale_factor + "px";

  //resets the coords for source and receiver
  resetDots();
}

function reset_source_dot() {
  var x0 = document.getElementById("x0");
  var l = document.getElementById("room-length").value;
  var w = document.getElementById("room-width").value;
  var y0 = document.getElementById("y0");

  //reset source dot
  x0.max = l;
  x0.value = round(l / 2, 2);
  x0.nextElementSibling.value = round(l / 2, 2);
  source_dot.style.left = round((x0.value / l) * 100, 2) + "%";

  y0.max = w;
  y0.value = round(w / 2, 2);
  y0.nextElementSibling.value = round(w / 2, 2);
  source_dot.style.bottom = round((y0.value / w) * 100, 2) + "%";

  source_dot.style.transform = "translate(-50%, 50%)";
}

function reset_sus_dot() {
  var l = document.getElementById("room-length").value;
  var w = document.getElementById("room-width").value;
  var xe = document.getElementById("x_e");
  var ye = document.getElementById("y_e");

  xe.max = l;
  xe.value = round(l / 4, 2);
  xe.nextElementSibling.value = round(l / 4, 2);
  sus_dot.style.left = round((xe.value / l) * 100, 2) + "%";

  ye.max = w;
  ye.value = round(w / 4, 2);
  ye.nextElementSibling.value = round(w / 4, 2);
  sus_dot.style.bottom = round((ye.value / w) * 100, 2) + "%";

  sus_dot.style.transform = "translate(-50%, 50%)";
}

function resetDots() {
  reset_source_dot();
  reset_sus_dot();
}

const roomResizeObserver = new ResizeObserver((entries) => {
  for (const entry of entries) {
    let new_length = round(entry.target.clientWidth / scale_factor, 1);
    let new_width = round(entry.target.clientHeight / scale_factor, 1);
    let l0 = document.getElementById("room-length");
    let w0 = document.getElementById("room-width");
    if (new_length) {
      l0.value = new_length;
      l0.nextElementSibling.value = new_length;
      resetDots();
    }
    if (new_width) {
      w0.value = new_width;
      w0.nextElementSibling.value = new_width;
      resetDots();
    }
  }
});
roomResizeObserver.observe(document.getElementById("room-visual"));

function pass_source_coord() {
  //takes source's new coordinates and repositions it
  var x0 = document.getElementById("x0");
  var y0 = document.getElementById("y0");
  var room_length = document.getElementById("room-length").value;
  var room_width = document.getElementById("room-width").value;

  x0.nextElementSibling.value = x0.value;
  y0.nextElementSibling.value = y0.value;
  source_dot.style.left = round((x0.value / room_length) * 100, 2) + "%";
  source_dot.style.bottom = round((y0.value / room_width) * 100, 2) + "%";
  source_dot.style.transform = "translate(-50%, 50%)";
}

function pass_sus_coord() {
  //takes sus person's new coordinates and repositions it
  var x0 = document.getElementById("x_e");
  var y0 = document.getElementById("y_e");
  var room_length = document.getElementById("room-length").value;
  var room_width = document.getElementById("room-width").value;

  x0.nextElementSibling.value = x0.value;
  y0.nextElementSibling.value = y0.value;
  sus_dot.style.left = round((x0.value / room_length) * 100, 2) + "%";
  sus_dot.style.bottom = round((y0.value / room_width) * 100, 2) + "%";
  sus_dot.style.transform = "translate(-50%, 50%)";
}

// Functions for source_dot mouse drags
var dragImgMouseStart = {};
var lastDiff = { x: 0, y: 0 };
var initialPos = source_dot.getBoundingClientRect();
var currentPos = { x: -initialPos.width / 2, y: 0 };
function mousedownDragImg(ev) {
  ev.preventDefault();
  dragImgMouseStart.x = ev.clientX;
  dragImgMouseStart.y = ev.clientY;
  currentPos.x += lastDiff.x;
  currentPos.y += lastDiff.y;
  window.addEventListener("mousemove", mousemoveDragImg);
  window.addEventListener("mouseup", mouseupDragImg);
}
function mousemoveDragImg(ev) {
  ev.preventDefault();
  lastDiff.x = ev.clientX - dragImgMouseStart.x;
  lastDiff.y = ev.clientY - dragImgMouseStart.y;
  requestAnimationFrame(function () {
    source_dot.style.transform =
      "translate(" +
      (currentPos.x + lastDiff.x) +
      "px," +
      (currentPos.y + lastDiff.y) +
      "px)";
  });
  get_dragged_coords(source_dot);
}
function mouseupDragImg(ev) {
  ev.preventDefault();
  isInRoom(source_dot);
  window.removeEventListener("mousemove", mousemoveDragImg);
  window.removeEventListener("mouseup", mouseupDragImg);
}
source_dot.addEventListener("mousedown", mousedownDragImg);

// Functions for sus_dot mouse drags
var dragImgMouseStart_sus = {};
var lastDiff_sus = { x: 0, y: 0 };
var initialPos_sus = sus_dot.getBoundingClientRect();
var currentPos_sus = { x: -initialPos_sus.width / 2, y: 0 };
function mousedownDragImg_sus(ev) {
  ev.preventDefault();
  dragImgMouseStart_sus.x = ev.clientX;
  dragImgMouseStart_sus.y = ev.clientY;
  currentPos_sus.x += lastDiff_sus.x;
  currentPos_sus.y += lastDiff_sus.y;
  window.addEventListener("mousemove", mousemoveDragImg_sus);
  window.addEventListener("mouseup", mouseupDragImg_sus);
}
function mousemoveDragImg_sus(ev) {
  ev.preventDefault();
  lastDiff_sus.x = ev.clientX - dragImgMouseStart_sus.x;
  lastDiff_sus.y = ev.clientY - dragImgMouseStart_sus.y;
  requestAnimationFrame(function () {
    sus_dot.style.transform =
      "translate(" +
      (currentPos_sus.x + lastDiff_sus.x) +
      "px," +
      (currentPos_sus.y + lastDiff_sus.y) +
      "px)";
  });
  get_dragged_coords(sus_dot);
}
function mouseupDragImg_sus(ev) {
  ev.preventDefault();
  isInRoom(sus_dot);
  window.removeEventListener("mousemove", mousemoveDragImg_sus);
  window.removeEventListener("mouseup", mouseupDragImg_sus);
}
sus_dot.addEventListener("mousedown", mousedownDragImg_sus);

function isInRoom(person) {
  // gets the person's new dragged coordinates, and checks if they are still
  // in the room. If not, reset their position.
  let dot_centre_x =
    person.getBoundingClientRect().left + 0.5 * person.clientWidth;
  let dot_centre_y =
    person.getBoundingClientRect().top + 0.5 * person.clientHeight;
  let room_left = room_visual.getBoundingClientRect().left;
  let room_right =
    room_visual.getBoundingClientRect().left + room_visual.clientWidth;
  let room_top = room_visual.getBoundingClientRect().top;
  let room_bottom =
    room_visual.getBoundingClientRect().top + room_visual.clientHeight;

  if (
    dot_centre_x < room_left ||
    dot_centre_x > room_right ||
    dot_centre_y < room_top ||
    dot_centre_y > room_bottom
  ) {
    if (person == source_dot) {
      lastDiff = { x: 0, y: 0 };
      initialPos = source_dot.getBoundingClientRect();
      currentPos = { x: -initialPos.width / 2, y: 0 };
      reset_source_dot();
    } else {
      lastDiff_sus = { x: 0, y: 0 };
      initialPos_sus = sus_dot.getBoundingClientRect();
      currentPos_sus = { x: -initialPos_sus.width / 2, y: 0 };
      reset_sus_dot();
    }
  }
}

function get_dragged_coords(person) {
  let dot_centre_x =
    person.getBoundingClientRect().left + 0.5 * person.clientWidth;
  let dot_centre_y =
    person.getBoundingClientRect().top + 0.5 * person.clientHeight;
  let room_left = room_visual.getBoundingClientRect().left;
  let room_bottom =
    room_visual.getBoundingClientRect().top + room_visual.clientHeight;
  let room_length = document.getElementById("room-length").value;
  let room_width = document.getElementById("room-width").value;

  let x_vis = dot_centre_x - room_left;
  let y_vis = room_bottom - dot_centre_y;
  let x_person = round((x_vis / room_visual.clientWidth) * room_length, 2);
  let y_person = round((y_vis / room_visual.clientHeight) * room_width, 2);
  if (person == source_dot) {
    var x0 = document.getElementById("x0");
    var y0 = document.getElementById("y0");
  } else {
    var x0 = document.getElementById("x_e");
    var y0 = document.getElementById("y_e");
  }
  x0.value = x_person;
  y0.value = y_person;
  x0.nextElementSibling.value = x_person;
  y0.nextElementSibling.value = y_person;
}

/* to be removed later, thanks firefox
function allowDrop(ev) {
  // for Room-visual to allow source/receiver to be dropped back onto it.
  ev.preventDefault();
}
function drag(ev){
  // initialises drag for firefox
  ev.dataTransfer.setData("text/plain", ev.target.id);
}

let x_inf_temp = 0;
let y_inf_temp = 0;
function dragInf(ev) {
  //allows dragging of the source dots
  var bounds = document.getElementById("room-visual");
  var x0 = document.getElementById("x0");
  var y0 = document.getElementById("y0");
  var l = document.getElementById("room-length").value;
  var w = document.getElementById("room-width").value;

  var y_i = bounds.getBoundingClientRect().top;
  var x_i = bounds.getBoundingClientRect().left;

  //then pass new coordinates to the inputs
  x_inf_temp = round((ev.clientX - x_i) / scale_factor, 2);
  y_inf_temp = round((ev.clientY - y_i) / scale_factor, 2);
  console.log(x_inf_temp, y_inf_temp);

  x0.value = x_inf_temp;
  if (x0.value < 0) {
    x0.value = 0;
  } else if (x0.value > l) {
    x0.value = l;
  }
  x0.nextElementSibling.value = x0.value;

  y0.value = w - y_inf_temp;
  if (y0.value < 0) {
    y0.value = 0;
  } else if (y0.value > w) {
    y0.value = w;
  }
  y0.nextElementSibling.value = y0.value;
}
function dragInfend(ev) {
  //function for drag-drop
  //checks if source dot was dragged out of the box
  //if it was, reset the coordinates
  var dot = ev.target;
  var x0 = document.getElementById("x0");
  var y0 = document.getElementById("y0");
  var l = document.getElementById("room-length").value;
  var w = document.getElementById("room-width").value;

  if (x_inf_temp < 0 || y_inf_temp < 0) {
    //reset source dot
    x0.value = round(l / 2, 2);
    x0.nextElementSibling.value = round(l / 2, 2);
    dot.style.left = round((x0.value / l) * 100, 2) + "%";

    y0.value = round(w / 2, 2);
    y0.nextElementSibling.value = round(w / 2, 2);
    dot.style.bottom = round((y0.value / w) * 100, 2) + "%";
  } else {
    dot.style.left = x0.value * scale_factor + "px";
    dot.style.bottom = y0.value * scale_factor + "px";
    dot.style.transform = "translate(-50%, 50%)";
  }
}

let x_sus_temp = 0;
let y_sus_temp = 0;
function dragSus(ev){
    //allows draging of receiver dot
    var bounds = document.getElementById('room-visual');
    var x0 = document.getElementById('x_e');
    var y0 = document.getElementById('y_e');
    var l = document.getElementById('room-length').value;
    var w = document.getElementById('room-width').value;

    //pass new coordinates to input
    var y_i = bounds.getBoundingClientRect().top;
    var x_i = bounds.getBoundingClientRect().left;

    x_inf_temp = round((ev.clientX - x_i)/scale_factor, 2);
    y_inf_temp = round((ev.clientY - y_i)/scale_factor, 2);

    x0.value = x_inf_temp;
    if(x0.value<0){x0.value=0;}
    else if(x0.value>l){x0.value=l;}
    x0.nextElementSibling.value = x0.value;

    y0.value = w - y_inf_temp;
    if(y0.value<0){y0.value=0;}
    else if(y0.value>w){y0.value=w;}
    y0.nextElementSibling.value = y0.value;
}
function dragSusend(ev){
    //function for drag-drop
    //checks if receiver dot was dragged out of the box
    //if it was, reset the coordinates
    var dot = ev.target;
    var x0 = document.getElementById('x_e');
    var y0 = document.getElementById('y_e');
    var l = document.getElementById('room-length').value;
    var w = document.getElementById('room-width').value;

    if(x_inf_temp<0 || y_inf_temp<0){
        //reset source dot
        x0.value = round(l/4, 2);
        x0.nextElementSibling.value = round(l/4, 2);
        dot.style.left = round(x0.value/l*100, 2) + "%";

        y0.value = round(w/4, 2);
        y0.nextElementSibling.value = round(w/4, 2);
        dot.style.bottom = round(y0.value/w*100, 2) + "%";
    }
    else{
        dot.style.left = (x0.value * scale_factor) + 'px';
        dot.style.bottom = (y0.value * scale_factor) + 'px';
        dot.style.transform = "translate(-50%, 50%)";
    }
}
*/

function inf_mask_visual() {
  //on mask input, return a picture of the mask
  var frame = document.getElementById("inf_mask_pic");
  var choice = document.getElementById("inf-mask").value;

  if (choice == 0) {
    frame.innerHTML = " ";
  } else if (choice == 0.35) {
    frame.innerHTML =
      '<img src="images/bara-buri-cloth.jpg" style="width: 50px;"></img>';
  } else if (choice == 0.5) {
    frame.innerHTML =
      '<img src="images/bara-buri-cloth.jpg" style="width: 50px;"></img>';
  } else if (choice == 0.59) {
    frame.innerHTML =
      '<img src="images/marek-studzinski.jpg" style="width: 50px;"></img>';
  } else if (choice == 0.9) {
    frame.innerHTML =
      '<img src="images/obi-N95.jpg" style="width: 50px;"></img>';
  } else if (choice == "customOption") {
    frame.innerHTML = " ";
  }
}

function sus_mask_visual() {
  //on mask input, return a picture of the mask
  var frame = document.getElementById("occ_mask_pic");
  var choice = document.getElementById("occ-mask").value;

  if (choice == 0) {
    frame.innerHTML = " ";
  } else if (choice == 0.2) {
    frame.innerHTML =
      '<img src="images/bara-buri-cloth.jpg" style="width: 50px;"></img>';
  } else if (choice == 0.5) {
    frame.innerHTML =
      '<img src="images/marek-studzinski.jpg" style="width: 50px;"></img>';
  } else if (choice == 0.9) {
    frame.innerHTML =
      '<img src="images/obi-N95.jpg" style="width: 50px;"></img>';
  } else if (choice == "customOption") {
    frame.innerHTML = " ";
  }
}
