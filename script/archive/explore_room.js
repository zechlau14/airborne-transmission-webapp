function passRoomLength(){  
    //resizes room picture for new length
    var l = document.getElementById('room-length').value;
    document.getElementById('room-length').nextElementSibling.value=l; 
    document.getElementById('room-visual').style.width=(l*60)+'px';
   
    //resets the coords for source and receiver
    resetDots();
}

function passRoomWidth(){
    //resizes room picture for new width
    var w = document.getElementById('room-width').value;
    document.getElementById('room-width').nextElementSibling.value=w; 
    document.getElementById('room-visual').style.height=(w*60)+'px';
    
    //resets the coords for source and receiver
    resetDots();
}

function resetDots(){
    var x0 = document.getElementById('x0');
    var l = document.getElementById('room-length').value;
    var w = document.getElementById('room-width').value;
    var y0 = document.getElementById('y0');
    var xe = document.getElementById('x_e');
    var ye = document.getElementById('y_e');

    //reset source dot
    x0.max = l;
    x0.value = round(l/2, 2);
    x0.nextElementSibling.value = round(l/2, 2);
    document.getElementById('source_dot').style.left = round(x0.value/l*100, 2) + "%";

    y0.max = w;
    y0.value = round(w/2, 2);
    y0.nextElementSibling.value = round(w/2, 2);
    document.getElementById('source_dot').style.bottom = round(y0.value/w*100, 2) + "%";

    //reset receiver dot
    xe.max = l;
    xe.value = round(l/4, 2);
    xe.nextElementSibling.value = round(l/4, 2);
    document.getElementById('susceptible_dot').style.left = round(xe.value/l*100, 2) + "%";

    ye.max = w;
    ye.value = round(w/4, 2);
    ye.nextElementSibling.value = round(w/4, 2);
    document.getElementById('susceptible_dot').style.bottom = round(ye.value/w*100, 2) + "%";
}

function getRoomDim(){
    //passes dragged rectangle's new dimensions to the inputs for room lenght and width
    var room = document.getElementById('room-visual');
    var l = room.offsetWidth;
    var w = room.offsetHeight;

    var l0 = document.getElementById('room-length');
    var w0 = document.getElementById('room-width');
    
    if (round((l-2)/60, 1) != l0.value){
        l0.value = round((l-2)/60, 1);
        l0.nextElementSibling.value = round((l-2)/60, 1);
        w0.value = round((w-2)/60, 1);
        w0.nextElementSibling.value = round((w-2)/60, 1);  
        resetDots();
    }
    else if(round((w-2)/60, 1) != w0.value){l0.value = round((l-2)/60, 1);
        l0.nextElementSibling.value = round((l-2)/60, 1);
        w0.value = round((w-2)/60, 1);
        w0.nextElementSibling.value = round((w-2)/60, 1);
        resetDots();
    }
    else {return 0;}
}

function passX0(){
    //takes source's x-coordinate and repositions source dot
    var x0 = document.getElementById('x0');
    var dot_x0 = document.getElementById('source_dot');
    var l = document.getElementById('room-length').value;

    x0.nextElementSibling.value=x0.value;
    dot_x0.style.left = round(x0.value/l*100, 2) + "%";
}

function passY0(){ 
    //takes source's y-coordinate and repositions source dot
    var y0 = document.getElementById('y0');
    var dot_y0 = document.getElementById('source_dot');
    var w = document.getElementById('room-width').value;

    y0.nextElementSibling.value=y0.value;
    dot_y0.style.bottom = round(y0.value/w*100, 2) + "%";
}

function passXe(){
    //takes receiver's x-coordinate and repositions their dot
    var xe = document.getElementById('x_e');
    var dot_xe = document.getElementById('susceptible_dot');
    var l = document.getElementById('room-length').value;

    xe.nextElementSibling.value=xe.value;
    dot_xe.style.left = round(xe.value/l*100, 2) + "%";
}

function passYe(){
    //takes receiver's y-coordinate and repositions dot
    var ye = document.getElementById('y_e');
    var dot_ye = document.getElementById('susceptible_dot');
    var w = document.getElementById('room-width').value;

    ye.nextElementSibling.value=ye.value;
    dot_ye.style.bottom = round(ye.value/w*100, 2) + "%";
}

function allowDrop(ev){
    ev.preventDefault();
}

let x_inf_temp = 0;
let y_inf_temp = 0;
function dragInf(ev){
    //allows dragging of the source dots
    var dot = ev.target;
    var bounds = document.getElementById('room-visual');
    var x0 = document.getElementById('x0');
    var y0 = document.getElementById('y0');
    var l = document.getElementById('room-length').value;
    var w = document.getElementById('room-width').value;
    
    var y_i = bounds.getBoundingClientRect().top;
    var x_i = bounds.getBoundingClientRect().left;
    
    //then pass new coordinates to the inputs
    x_inf_temp = round((ev.clientX - x_i)/60, 2);
    y_inf_temp = round((ev.clientY - y_i)/60, 2);

    x0.value = x_inf_temp;
    if(x0.value<0){x0.value=0;}
    else if(x0.value>l){x0.value=l;}
    x0.nextElementSibling.value = x0.value;
    
    y0.value = w - y_inf_temp;
    if(y0.value<0){y0.value=0;}
    else if(y0.value>w){y0.value=w;}
    y0.nextElementSibling.value = y0.value;
}
function dragInfend(ev){
    //function for drag-drop
    //checks if source dot was dragged out of the box
    //if it was, reset the coordinates
    var dot = ev.target;
    var bounds = document.getElementById('room-visual').getBoundingClientRect();
    var dotDim = dot.getBoundingClientRect();
    var x0 = document.getElementById('x0');
    var y0 = document.getElementById('y0');
    var l = document.getElementById('room-length').value;
    var w = document.getElementById('room-width').value;

    if(x_inf_temp<0 || y_inf_temp<0){
        //reset source dot
        x0.value = round(l/2, 2);
        x0.nextElementSibling.value = round(l/2, 2);
        dot.style.left = round(x0.value/l*100, 2) + "%";

        y0.value = round(w/2, 2);
        y0.nextElementSibling.value = round(w/2, 2);
        dot.style.bottom = round(y0.value/w*100, 2) + "%";
    }
    else{
        dot.style.left = (x0.value * 60) + 'px';
        dot.style.bottom = (y0.value*60) + 'px'; 
    }
}


let x_sus_temp = 0;
let y_sus_temp = 0;
function dragSus(ev){
    //allows draging of receiver dot
    var dot = ev.target;
    var bounds = document.getElementById('room-visual');
    var x0 = document.getElementById('x_e');
    var y0 = document.getElementById('y_e');
    var l = document.getElementById('room-length').value;
    var w = document.getElementById('room-width').value;
    
    //pass new coordinates to input
    var y_i = bounds.getBoundingClientRect().top;
    var x_i = bounds.getBoundingClientRect().left;
    
    x_inf_temp = round((ev.clientX - x_i)/60, 2);
    y_inf_temp = round((ev.clientY - y_i)/60, 2);

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
    var bounds = document.getElementById('room-visual').getBoundingClientRect();
    var dotDim = dot.getBoundingClientRect();
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
        dot.style.left = (x0.value * 60) + 'px';
        dot.style.bottom = (y0.value * 60) + 'px'; 
    }
}

function inf_mask_visual(){
    //on mask input, return a picture of the mask
    var frame = document.getElementById("inf_mask_pic");
    var choice = document.getElementById("inf-mask").value;
  
    if(choice == 0){frame.innerHTML=" ";}
    else if(choice == 0.35){frame.innerHTML='<img src="images/bara-buri-cloth.jpg" style="width: 200px;"></img>';}
    else if(choice == 0.5){frame.innerHTML='<img src="images/bara-buri-cloth.jpg" style="width: 200px;"></img>';}
    else if(choice == 0.59){frame.innerHTML='<img src="images/marek-studzinski.jpg" style="width: 200px;"></img>';}
    else if(choice == 0.9){frame.innerHTML='<img src="images/obi-N95.jpg" style="width: 200px;"></img>';}
    else if(choice == "customOption"){frame.innerHTML=" ";}
}
  
function sus_mask_visual(){
    //on mask input, return a picture of the mask
    var frame = document.getElementById("occ_mask_pic");
    var choice = document.getElementById("occ-mask").value;
  
    if(choice == 0){frame.innerHTML=" ";}
    else if(choice == 0.2){frame.innerHTML='<img src="images/bara-buri-cloth.jpg" style="width: 200px;"></img>';}
    else if(choice == 0.5){frame.innerHTML='<img src="images/marek-studzinski.jpg" style="width: 200px;"></img>';}
    else if(choice == 0.9){frame.innerHTML='<img src="images/obi-N95.jpg" style="width: 200px;"></img>';}
    else if(choice == "customOption"){frame.innerHTML=" ";}
}
