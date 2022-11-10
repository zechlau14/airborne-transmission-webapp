function show_hide_custom(elem){
    if(elem.options[elem.selectedIndex].value=='customOption'){
        elem.nextElementSibling.style.display='inline'
    } else{
        elem.nextElementSibling.style.display='none'
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
    var breaky = document.getElementById("break-start");

    breaky.max = duration;
}

function add_break(){
    //check the checkbox for adding a break
    //if checked, show the inputs for a break.
    var checkBox = document.getElementById("break");
    var break_input = document.getElementById("break-time");
    var break_when = document.getElementById("break-when");

    if(checkBox.checked == false){
        break_input.style.display='none';
        break_when.style.display='none';
    }  else{
        break_input.style.display='inline';
        break_when.style.display='inline';
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
    if (bar_width < 1){
        elem.style.width = round(bar_width*100, 2) + '%';
        elem.innerHTML = round(bar_width*100, 2) + '%';
    }   
}