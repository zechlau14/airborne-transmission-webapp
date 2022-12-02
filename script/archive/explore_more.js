const Position_loader = document.getElementById("position-loading");
const C_sus_chart = document.getElementById("conc-output");
const P_sus_chart = document.getElementById("risk-output");
const C_contour_loader = document.getElementById("C-contour-loading");
const C_contour_chart = document.getElementById("conc_contour");
const C_avg_loader = document.getElementById("C-avg-loading");
const P_avg_loader = document.getElementById("P-avg-loading");
const C_avg_chart = document.getElementById("C_avg-time");
const P_avg_chart = document.getElementById("P_avg-time");
const breakBox = document.getElementById("break");

function clear_all(){
    clearInterval(loopy_fn);

    Position_loader.style.display = 'none';
    C_sus_chart.style.display = 'none';
    P_sus_chart.style.display = 'none';
    C_contour_loader.style.display = 'none';
    C_contour_chart.style.display = 'none';
    C_avg_loader.style.display = 'none';
    P_avg_loader.style.display = 'none';
    C_avg_chart.style.display = 'none';
    P_avg_chart.style.display = 'none';
}

function Source(time, mask_ex, q, frac_speak, delta_t, break_start, time_break){
    let t = t_array(time+time_break, delta_t);
    let result = new Array(t.length);
    for (let i=0; i<t.length; i++){
        result[i] = (1-mask_ex)*(q*(1-frac_speak)+10*q*frac_speak) * delta_t;
    }
    var n_temp1 = parseInt(break_start * 3600 / delta_t); 
    var n_temp2 = n_temp1 + parseInt(time_break * 3600 / delta_t);
    for (let i=n_temp1; i<n_temp2;i++){result[i]=0;}
    return result;
}

function Impulse(time, time_break, delta_t, x_e, y_e, x_o, y_o, l, w, K, v, Q, s, d){
    let t = t_array(time+time_break, delta_t);

    let I_y = new Array(t.length); 
    for(let i=0; i<t.length; i++){
        I_y[i] = Math.exp((-1)*(y_e-y_o)**2 / (4*K*t[i])) + Math.exp((-1)*(y_e+y_o)**2 / (4*K*t[i]));
        for(let m=1; m<5; m++){
            I_y[i] = I_y[i] +  Math.exp((-1)*(y_e-y_o-2*m*w)**2 / (4*K*t[i])) + Math.exp((-1)*(y_e+y_o-2*m*w)**2 / (4*K*t[i]));
            I_y[i] = I_y[i] +  Math.exp((-1)*(y_e-y_o+2*m*w)**2 / (4*K*t[i])) + Math.exp((-1)*(y_e+y_o+2*m*w)**2 / (4*K*t[i]));
        }
    }
    
    let I_x = new Array(t.length);
    let m_x = parseInt(v * time * 3600 / (2*l))
    for(let i=0; i<t.length; i++){
        I_x[i] = Math.exp((-1)*(x_e-x_o-v*t[i])**2 / (4*K*t[i])) + Math.exp((-1)*(x_e+x_o+v*t[i])**2 / (4*K*t[i]));
        for(let m=1; m<m_x+1; m++){
            I_x[i] = I_x[i] +  Math.exp((-1)*(x_e-x_o-v*t[i]-2*m*l)**2 / (4*K*t[i])) + Math.exp((-1)*(x_e+x_o+v*t[i]-2*m*l)**2 / (4*K*t[i]));
            I_x[i] = I_x[i] +  Math.exp((-1)*(x_e-x_o-v*t[i]+2*m*l)**2 / (4*K*t[i])) + Math.exp((-1)*(x_e+x_o+v*t[i]+2*m*l)**2 / (4*K*t[i]));
        }
    }
    
    let I = new Array(t.length);
    for(let i=0; i<t.length; i++){
        I[i] = 1/(4*Math.PI*K*t[i]) * Math.exp((-1)*t[i]*(Q+s+d)) * I_y[i] * I_x[i];
    }

    return I;
}

function Concentration(S, I, h){
    let C = new Array(S.length);
    for(i=0; i<C.length; i++){
        let temp = 0;
        for(j=0;j<i+1;j++){temp = temp + S[j] * I[i-j]}
        C[i] = temp / (h/2);
    }
    return C;
}

function Risk(S, C, time, time_break, delta_t, p, mask_in, I_o){
    let t = t_array(time+time_break, delta_t);
    let Part_in = new Array(t.length); 
    let risk = new Array(t.length);

    Part_in[0] = 0.5 * C[0] * delta_t;
    for (i=1; i<t.length; i++){
        if(S[i]>0){Part_in[i] = Part_in[i-1] + 0.5 * (C[i-1] + C[i]) * delta_t;}
        else{Part_in[i] = Part_in[i-1];}
        risk[i] = 1 - Math.exp((-1)*p*(1-mask_in)*(1+r)*I_o*Part_in[i]);
    }

    return risk;
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

function Run_position(){
    clear_all();
    loading_fn("position-loading", 0)

    update_parameters();
    var x_e = parseFloat(document.getElementById("x_e").value);
    var y_e = parseFloat(document.getElementById("y_e").value);

    // time axis
    let t = t_array(time+time_break, delta_t);
    let t_chart = new Array(t.length);
    for(i=0; i<t.length; i++){t_chart[i] = t[i] / 60;}
    
    var n_chart = 1;
    var S, zC;

    loopy_fn = setInterval(add_chart,10);
    function add_chart(){    
        if(n_chart > 2){
            clearInterval(loopy_fn);
           
            Position_loader.style.display='none';
        } else {
            if(n_chart == 1){
                // Source function
                S = Source(time, mask_ex, q, frac_speak, delta_t, break_start, time_break)

                // Impulse function
                let I = Impulse(time, time_break, delta_t, x_e, y_e, x_o, y_o, l, w, K, v, Q, s, d);
    
                //plot Concentration graph.
                zC = Concentration(S, I, h);
                var dataptC = [{
                    x: t_chart,
                    y: zC
                }];
                Plotly.newPlot(C_sus_chart,dataptC,{margin:{t:0},xaxis:{title:{text:'Time (minutes)'}},yaxis:{title:{text:'Concentration (infectious particles / m^3)'}}});
                C_sus_chart.style.display='block';
            } else{
                //plot Risk graph
                let zP = Risk(S, zC, time, time_break, delta_t, p, mask_in, I_o);
                var dataptP = [{
                    x: t_chart,
                    y: zP
                }];
                Plotly.newPlot(P_sus_chart,dataptP,{margin:{t:0},xaxis:{title:{text:'Time (minutes)'}},yaxis:{title:{text:'Infection Risk'}}});
                P_sus_chart.style.display='block';
            }

            n_chart += 1;
            loading_fn("position-loading", n_chart / 2);
        }
    }   
}

function Run_C_contour(){
    clear_all();
    loading_fn("C-contour-loading", 0)
    update_parameters();

    let xx = x_array(l, delta_x);
    let yy = x_array(w, delta_y);
        
    let C_room = new Array(yy.length);
    for (let j=0;j<yy.length;j++){
        C_room[j] = new Array(xx.length);
    }

    let S = Source(time, mask_ex, q, frac_speak, delta_t, break_start, time_break);
       
    let t = t_array(time+time_break, delta_t);

    let n_total = xx.length; n_points = 0;

    loopy_fn = setInterval(add_point,10);
    function add_point(){    
        if(n_points >= n_total){
            clearInterval(loopy_fn);
            C_contour_loader.style.display = "none";
            //plot graph
            var datapt = [{
                x: xx,
                y: yy,
                z: C_room,
                type: 'contour'
            }];
            Plotly.newPlot(C_contour_chart,datapt,{margin:{t:0}});
            C_contour_chart.style.display = "block";
        }else{
            for (let j=0; j<yy.length; j++){
                let I = Impulse(time, time_break, delta_t, xx[n_points], yy[j], x_o, y_o, l, w, K, v, Q, s, d);
                C_room[j][n_points] = 0;
                for(let k=0; k<t.length; k++){
                    C_room[j][n_points] = C_room[j][n_points] + S[k] * I[t.length - 1 - k];
                }
            }    
            n_points += 1;
            loading_fn("C-contour-loading", n_points /(n_total))
        }
    }
    /*
    //brings up loading wheel
    $("#loading2").show();
    setTimeout(function(){
        let xx = x_array(l, delta_x);
        let yy = x_array(w, delta_y);
        
        let C_room = new Array(yy.length);
        for (let j=0;j<yy.length;j++){
            C_room[j] = new Array(xx.length);
        }

        let S = Source(time, mask_ex, q, frac_speak, delta_t, break_start, time_break);
       
        let t = t_array(time+time_break, delta_t);
        
        for(let j=0; j<yy.length; j++){
            for(let i=0; i<xx.length; i=i+1){
                let I = Impulse(time, time_break, delta_t, xx[i], yy[j], x_o, y_o, l, w, K, v, Q, s, d);
                let temp = 0
                for(let k=0; k<t.length; k++){
                    temp = temp + S[k] * I[t.length - 1 - k];
                }
                C_room[j][i] = temp;  
            }
        }
        
        var datapt = [{
            x: xx,
            y: yy,
            z: C_room,
            type: 'contour'
        }];
        Plotly.newPlot(C_contour_chart,datapt,{margin:{t:0}});
        $("#loading2").hide();
        C_contour_chart.style.display='block';
    },1);
    */
}

function Run_avg_C(){
    clear_all();
    update_parameters();
    loading_fn("C-avg-loading", 0);

    let t = t_array(time+time_break, delta_t);
    for(let i=0; i<t.length; i++){t[i] = t[i] / 60;}

    let xx = x_array(l, delta_x);
    let yy = x_array(w, delta_y);
    let C_room = new Array(t.length);
    for (let i=0;i<t.length;i++){
        C_room[i] = new Array(yy.length);
        for (let j=0;j<yy.length;j++){
            C_room[i][j] = new Array(xx.length);
        }
    }

    let S = Source(time, mask_ex, q, frac_speak, delta_t, break_start, time_break);

    let n_total = xx.length * yy.length; n_points = 0;
    let C_avg = new Array(t.length);

    loopy_fn = setInterval(add_point,10);
    function add_point(){    
        if(n_points >= n_total){
            clearInterval(loopy_fn);
            
            for (let k=0; k<t.length; k++){
                C_avg[k] = avg_free(C_room[k],l,w,delta_x,delta_y);
            }
            loading_fn("C-avg-loading", 1);

            var dataptC = [{
                x: t,
                y: C_avg
            }];
            Plotly.newPlot(C_avg_chart,dataptC,{margin:{t:0},xaxis:{title:{text:'Time (minutes)'}},yaxis:{title:{text:'Average Concentration (infectious particles / m^3)'}}});
            
            C_avg_loader.style.display='none';
            C_avg_chart.style.display='block';
        } else {
            let i = Math.floor(n_points / xx.length);
            let j = n_points - i * xx.length;
            let I = Impulse(time, time_break, delta_t, xx[j], yy[i], x_o, y_o, l, w, K, v, Q, s, d);
            let C_here = Concentration(S, I, h);

            for(let k=0; k<t.length; k++){
                C_room[k][i][j] = C_here[k];
            }

            n_points += 1;
            loading_fn("C-avg-loading", n_points/(n_total+1));
        }
    }   
}

function Run_avg_P(){
    clear_all();
    update_parameters();
    loading_fn("P-avg-loading", 0)

    let t = t_array(time+time_break, delta_t);
    for(let i=0; i<t.length; i++){t[i] = t[i] / 60;}

    let xx = x_array(l, delta_x);
    let yy = x_array(w, delta_y);
    let P_room = new Array(t.length);
    for (let i=0;i<t.length;i++){
        P_room[i] = new Array(yy.length);
        for (let j=0;j<yy.length;j++){
            P_room[i][j] = new Array(xx.length);
        }
    }

    let S = Source(time, mask_ex, q, frac_speak, delta_t, break_start, time_break);

    let n_total = xx.length * yy.length; n_points = 0;
    let P_avg = new Array(t.length);

    loopy_fn = setInterval(add_point,10);
    function add_point(){    
        if(n_points >= n_total){
            clearInterval(loopy_fn);
            
            for (let k=0; k<t.length; k++){
                P_avg[k] = avg_free(P_room[k],l,w,delta_x,delta_y);
            }
            loading_fn("P-avg-loading", 1);

            var datapt = [{
                x: t,
                y: P_avg
            }];
            Plotly.newPlot(P_avg_chart,datapt,{margin:{t:0},xaxis:{title:{text:'Time (minutes)'}},yaxis:{title:{text:'Infection Risk'}}});
            
            P_avg_loader.style.display='none';
            P_avg_chart.style.display='block';
        } else {
            let i = Math.floor(n_points / xx.length);
            let j = n_points - i * xx.length;
            let I = Impulse(time, time_break, delta_t, xx[j], yy[i], x_o, y_o, l, w, K, v, Q, s, d);
            let C_here = Concentration(S, I, h);
            let Risk_here = Risk(S, C_here, time, time_break, delta_t, p, mask_in, I_o);

            for(let k=0; k<t.length; k++){
                P_room[k][i][j] = Risk_here[k];
            }

            n_points += 1;
            loading_fn("P-avg-loading", n_points /(n_total+1))
        }
    }   
}