function show_hide_custom(elem){
    if(elem.options[elem.selectedIndex].value=='customOption'){
        elem.nextElementSibling.style.display='inline'
        elem.nextElementSibling.nextElementSibling.style.display='inline';
    } else{
        elem.nextElementSibling.style.display='none'
        elem.nextElementSibling.nextElementSibling.style.display='none';
    }
}

function show_hide_custom_percent(elem){
    if(elem.options[elem.selectedIndex].value=='customOption'){
        elem.nextElementSibling.style.display='inline';
        elem.nextElementSibling.nextElementSibling.style.display='inline';
    } else{
        elem.nextElementSibling.style.display='none';
        elem.nextElementSibling.nextElementSibling.style.display='none';
    }
}

function pass_break(){
    //function to pass duration value selected by user to the break slider
    var duration = document.getElementById("duration").value;
    var break1 = document.getElementById("break-part1");
    var break2 = document.getElementById("break-part2");

    break1.max = duration;
    break2.max = duration;
    break1.value = round(duration/2, 1) - 0.05;
    break2.value = round(duration/2, 1) + 0.05;

    show_break_numbers()
}

function add_break(){
    //check the checkbox for adding a break
    //if checked, show the inputs for a break.
    var checkBox = document.getElementById("break");
    var break_inputs = document.getElementById("break-inputs");
    var duration = document.getElementById("duration");

    if(checkBox.checked == false){
        break_inputs.style.display='none';
        duration.max = 3;
        if (duration.value > duration.max){
            duration.value = duration.max;
        }
    }  else{
        break_inputs.style.display='block';
        duration.max = 4;
    }
    duration.nextElementSibling.value = duration.value;
}

function show_break_numbers(){
    var break_start = document.getElementById("break-start");
    var break_end = document.getElementById("break-end");
    var break_slider1 = document.getElementById("break-part1");
    var break_slider2 = document.getElementById("break-part2");

    if (break_slider1.value <= break_slider2.value){
        break_start.textContent = break_slider1.value;
        break_end.textContent = break_slider2.value;
    } else {
        break_start.textContent = break_slider2.value;
        break_end.textContent = break_slider1.value;
    }

    if (break_slider1.value == break_slider2.value){
        break_end.style.display = "none";
    } else {
        break_end.style.display = "inline";
    }
}

function advanced_options(){
    //function for advanced options button
    //when button is pressed, show the advanced-options inputs
    var checkBox = document.getElementById("advanced-options");
    if(checkBox.style.display == "none"){
        checkBox.style.display = "block";
    } else{
        checkBox.style.display = "none";
    }
}

function loading(bar_width){
    //takes the fraction of progress, and update the progress bar
    var elem = document.getElementById('the-bar');  
    elem.style.display='block'; 
    if (bar_width <= 1){
        elem.style.width = round(bar_width*100, 2) + '%';
        elem.innerHTML = round(bar_width*100, 2) + '%';
    }   
}

function loading_fn(bar_id, bar_width){
    //takes the fraction of progress, and update the progress bar
    var elem = document.getElementById(bar_id);  
    elem.style.display='block'; 
    if (bar_width <= 1){
        elem.style.width = round(bar_width*100, 2) + '%';
        elem.innerHTML = round(bar_width*100, 2) + '%';
    }   
}

function explore_more(){
    let more_options= document.getElementById("Explore_more_container")
    if (more_options.style.display == "none"){
        more_options.style.display = "block";
    }
    else {
        more_options.style.display = "none";
    }
}

function room_presets(id){
    var length = document.getElementById("room-length");
    var width = document.getElementById("room-width");
    var height = document.getElementById("room-height");

    if (id == "classroom-choice"){
        length.value = 7.6;
        width.value = 6.1;
        height.value = 3;
    }
    if (id == "office-choice"){
        height.value = 2.5;
        length.value = 4;
        width.value = 4;
    }
    if (id == "reception-choice"){
        height.value = 4;
        width.value = 10;
        length.value = 10;
    }

    length.nextElementSibling.value = length.value;
    width.nextElementSibling.value = width.value;
    height.nextElementSibling.value = height.value;

    passRoomLength()
    passRoomWidth()
}

function room_preset_custom(){
    document.getElementById("custom-room-preset").checked = "checked";
}