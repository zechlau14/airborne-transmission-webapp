// model input parameter declaration
let l, w, h;
let Q, v;
let x_o, y_o;
let time;
let time_break, break_start;
let p, mask_in;
let mask_ex, frac_speak, p_inf;
let R_b, R;
let d, s, I_o;
const r = 1;
let delta_x, delta_y, delta_t;
let V, K, q;
let loopy_fn;

// get DOM elements
const breakBox = document.getElementById("break");
const loading_bar = document.getElementById("progress-bar");
const P_contour_chart = document.getElementById("inf-contour");
const risk_avg_print = document.getElementById("risk_avg");
const inf_print = document.getElementById("infected");
const output_msg = document.getElementById("output-msg");
const infection_risk_contour = document.getElementById("chart_area");

const Position_loader = document.getElementById("position-loading");
const C_sus_chart = document.getElementById("conc-output");
const P_sus_chart = document.getElementById("risk-output");
const C_contour_loader = document.getElementById("C-contour-loading");
const C_contour_chart = document.getElementById("conc_contour");
const C_avg_loader = document.getElementById("C-avg-loading");
const P_avg_loader = document.getElementById("P-avg-loading");
const C_avg_chart = document.getElementById("C_avg-time");
const P_avg_chart = document.getElementById("P_avg-time");

function update_parameters() {
  //reads all the inputs from the page.

  //room dimensions: l, w, h
  l = parseFloat(document.getElementById("room-length").value);
  w = parseFloat(document.getElementById("room-width").value);
  h = parseFloat(document.getElementById("room-height").value);

  // infectious person's coordinates: x0, y0
  x_o = parseFloat(document.getElementById("x0").value);
  y_o = parseFloat(document.getElementById("y0").value);

  //mechanical ventilation: Q and v
  Q = document.getElementById("vent").value;
  if (Q == "customOption") {
    Q = parseFloat(document.getElementById("vent-custom").value);
  } else {
    Q = parseFloat(Q);
  }
  v = document.getElementById("airflow").value;
  if (v == "customOption") {
    v = parseFloat(document.getElementById("airflow-custom").value);
  } else {
    v = parseFloat(v);
  }

  // time, time_break, break_start
  time = parseFloat(document.getElementById("duration").value);
  if (breakBox.checked == false) {
    time_break = 0;
    break_start = time;
  } else {
    break_start = parseFloat(
      document.getElementById("break-start").textContent
    );
    let break_end = parseFloat(
      document.getElementById("break-end").textContent
    );
    time_break = round(break_end - break_start, 2);
  }

  // infectious person parameter: frac_speak, mask_ex
  frac_speak = document.getElementById("talk").value;
  if (frac_speak == "customOption") {
    frac_speak = parseFloat(document.getElementById("talk-custom").value) / 100;
  } else {
    frac_speak = parseFloat(frac_speak) / 100;
  }
  mask_ex = document.getElementById("inf-mask").value;
  if (mask_ex == "customOption") {
    mask_ex =
      parseFloat(document.getElementById("inf-mask-custom").value) / 100;
  } else {
    mask_ex = parseFloat(mask_ex);
  }
  p_inf = document.getElementById("inf-p").value;
  if (p_inf == "customOption") {
    p_inf = parseFloat(document.getElementById("inf-p-custom").value);
  } else {
    p_inf = parseFloat(p_inf);
  }


  // susceptible person parameters: p, mask_in
  mask_in = document.getElementById("occ-mask").value;
  if (mask_in == "customOption") {
    mask_in =
      parseFloat(document.getElementById("occ-mask-custom").value) / 100;
  } else {
    mask_in = parseFloat(mask_in);
  }
  p = document.getElementById("occ-act").value;
  if (p == "customOption") {
    p = parseFloat(document.getElementById("occ-act-custom").value);
  } else {
    p = parseFloat(p);
  }

  // Advance parameters
  // infectious person's advance: R_b and R
  R_b = parseInt(document.getElementById("emission").value) / 60;
  R = document.getElementById("viral-load").value;
  if (R == "customOption") {
    R =
      parseFloat(document.getElementById("viral-load-custom").value) /
      Math.log(10);
  } else {
    R = parseFloat(R);
  }

  // virus' advance: d, s, I_o
  d = parseFloat(document.getElementById("deact").value);
  s = parseFloat(document.getElementById("settle").value);
  I_o = parseFloat(document.getElementById("Inf-Const").value);

  // step sizes: delta_x, delta_y, delta_t
  delta_t = parseFloat(document.getElementById("delta-t").value);
  delta_x = parseFloat(document.getElementById("delta-x").value);
  delta_y = parseFloat(document.getElementById("delta-y").value);

  //converting parameters
  Q = Q / 3600;
  d = d / 3600;
  s = s / 3600;
  I_o = Math.log(2) / I_o;

  // calculating compound parameters
  V = l * w * h;
  K = 0.39 * V * Q * (2 * V * 0.059) ** (-1 / 3);

  q = (Math.PI / 6) * 125 * 10 ** (R - 12);
  if (q < 1) {
    q = (q * R_b * p_inf) / 8;
  } else {
    q = (R_b * p_inf) / 8;
  }
  p = (p * 0.001) / 60;
  p_inf = (p_inf * 0.001) / 60;
}

function reset_results() {
  clearInterval(loopy_fn);

  loading_bar.style.display = "none";
  infection_risk_contour.style.display = "none";
  output_msg.style.display = "none";
  risk_avg_print.style.display = "none";
  inf_print.style.display = "none";
  P_contour_chart.style.display = "none";

  Position_loader.style.display = "none";
  C_sus_chart.style.display = "none";
  P_sus_chart.style.display = "none";
  C_contour_loader.style.display = "none";
  C_contour_chart.style.display = "none";
  C_avg_loader.style.display = "none";
  P_avg_loader.style.display = "none";
  C_avg_chart.style.display = "none";
  P_avg_chart.style.display = "none";
}

function Run_no_modes() {
  reset_results();
  update_parameters();
  loading_bar.style.display = "block";
  /*output_msg.style.display = "block";
  infection_risk_contour.style.display = "block"; */

  let t = t_array(time + time_break, delta_t);
  for (let i = 0; i < t.length; i++) {
    t[i] = t[i] / 60;
  }

  let xx = x_array(l, delta_x);
  let yy = x_array(w, delta_y);

  let P_room = new Array(yy.length);
  for (let j = 0; j < yy.length; j++) {
    P_room[j] = new Array(xx.length);
  }

  let S = Source(
    time,
    mask_ex,
    q,
    frac_speak,
    delta_t,
    break_start,
    time_break
  );

  let n_total = xx.length * yy.length;
  let n_points = 0;

  loopy_fn = setInterval(add_point, 10);
  function add_point() {
    if (n_points >= n_total) {
      clearInterval(loopy_fn);

      let P_avg = avg_free(P_room, l, w, delta_x, delta_y);
      //loading(1);
      loading_fn("the-bar", 1);

      output_msg.style.display = "block";
      infection_risk_contour.style.display = "block";

      var datapt = [
        {
          x: xx,
          y: yy,
          z: P_room,
          type: "contour",
        },
      ];

      Plotly.newPlot(
        P_contour_chart,
        datapt,
        { margin: { t: 0 } },
        { responsive: true }
      );

      risk_avg_print.textContent =
        "Average infection risk from airborne transmission in the room is " +
        round(P_avg * 100, 1) +
        "%. ";
      inf_print.innerHTML =
        "ie. <output>" +
        round(P_avg * 100, 0) +
        "</output> out of <input type='number' value='100' min='0' max='10000' step='1' style='width:85px' oninput='this.previousElementSibling.value = round(this.value*" +
        P_avg +
        ",0)'> </input> people in the room will likely be infected.";

      loading_bar.style.display = "none";
      P_contour_chart.style.display = "block";
      risk_avg_print.style.display = "inline";
      inf_print.style.display = "inline";
    } else {
      let i = Math.floor(n_points / xx.length);
      let j = n_points - i * xx.length;
      let I = Impulse(
        time,
        time_break,
        delta_t,
        xx[j],
        yy[i],
        x_o,
        y_o,
        l,
        w,
        K,
        v,
        Q,
        s,
        d
      );
      let C_here = Concentration(S, I, h);
      let Risk_here = Risk(
        S,
        C_here,
        time,
        time_break,
        delta_t,
        p,
        mask_in,
        I_o
      );

      P_room[i][j] = Risk_here[Risk_here.length - 1];

      n_points += 1;
      loading_fn("the-bar", n_points / (n_total + 1));
      //loading(n_points / (n_total+1));
    }
  }
}

function Run_position() {
  reset_results();
  loading_fn("position-loading", 0);

  update_parameters();
  var x_e = parseFloat(document.getElementById("x_e").value);
  var y_e = parseFloat(document.getElementById("y_e").value);

  // time axis
  let t = t_array(time + time_break, delta_t);
  let t_chart = new Array(t.length);
  for (i = 0; i < t.length; i++) {
    t_chart[i] = t[i] / 60;
  }

  var n_chart = 1;
  var S, zC;

  loopy_fn = setInterval(add_chart, 10);
  function add_chart() {
    if (n_chart > 2) {
      clearInterval(loopy_fn);

      Position_loader.style.display = "none";
    } else {
      if (n_chart == 1) {
        // Source function
        S = Source(
          time,
          mask_ex,
          q,
          frac_speak,
          delta_t,
          break_start,
          time_break
        );

        // Impulse function
        let I = Impulse(
          time,
          time_break,
          delta_t,
          x_e,
          y_e,
          x_o,
          y_o,
          l,
          w,
          K,
          v,
          Q,
          s,
          d
        );

        //plot Concentration graph.
        zC = Concentration(S, I, h);
        var dataptC = [
          {
            x: t_chart,
            y: zC,
          },
        ];
        Plotly.newPlot(
          C_sus_chart,
          dataptC,
          {
            margin: { t: 0 },
            xaxis: { title: { text: "Time (minutes)" } },
            yaxis: {
              title: { text: "Concentration (infectious particles / m^3)" },
            },
          },
          { responsive: true }
        );
        C_sus_chart.style.display = "block";
      } else {
        //plot Risk graph
        let zP = Risk(S, zC, time, time_break, delta_t, p, mask_in, I_o);
        var dataptP = [
          {
            x: t_chart,
            y: zP,
          },
        ];
        Plotly.newPlot(
          P_sus_chart,
          dataptP,
          {
            margin: { t: 0 },
            xaxis: { title: { text: "Time (minutes)" } },
            yaxis: { title: { text: "Infection Risk" } },
          },
          { responsive: true }
        );
        P_sus_chart.style.display = "block";
      }

      n_chart += 1;
      loading_fn("position-loading", n_chart / 2);
    }
  }
}

function Run_C_contour() {
  reset_results();
  loading_fn("C-contour-loading", 0);
  update_parameters();

  let xx = x_array(l, delta_x);
  let yy = x_array(w, delta_y);

  let C_room = new Array(yy.length);
  for (let j = 0; j < yy.length; j++) {
    C_room[j] = new Array(xx.length);
  }

  let S = Source(
    time,
    mask_ex,
    q,
    frac_speak,
    delta_t,
    break_start,
    time_break
  );

  let t = t_array(time + time_break, delta_t);

  let n_total = xx.length;
  n_points = 0;

  loopy_fn = setInterval(add_point, 10);
  function add_point() {
    if (n_points >= n_total) {
      clearInterval(loopy_fn);
      C_contour_loader.style.display = "none";
      //plot graph
      var datapt = [
        {
          x: xx,
          y: yy,
          z: C_room,
          type: "contour",
        },
      ];
      var config = { responsive: true };
      Plotly.newPlot(C_contour_chart, datapt, { margin: { t: 0 } }, config);

      var chart_height = round((w / l) * 60, 0);
      C_contour_chart.style.display = "block";
    } else {
      for (let j = 0; j < yy.length; j++) {
        let I = Impulse(
          time,
          time_break,
          delta_t,
          xx[n_points],
          yy[j],
          x_o,
          y_o,
          l,
          w,
          K,
          v,
          Q,
          s,
          d
        );
        C_room[j][n_points] = 0;
        for (let k = 0; k < t.length; k++) {
          C_room[j][n_points] =
            C_room[j][n_points] + S[k] * I[t.length - 1 - k];
        }
      }
      n_points += 1;
      loading_fn("C-contour-loading", n_points / n_total);
    }
  }
}

function Run_avg_C() {
  reset_results();
  update_parameters();
  loading_fn("C-avg-loading", 0);

  let t = t_array(time + time_break, delta_t);
  for (let i = 0; i < t.length; i++) {
    t[i] = t[i] / 60;
  }

  let xx = x_array(l, delta_x);
  let yy = x_array(w, delta_y);
  let C_room = new Array(t.length);
  for (let i = 0; i < t.length; i++) {
    C_room[i] = new Array(yy.length);
    for (let j = 0; j < yy.length; j++) {
      C_room[i][j] = new Array(xx.length);
    }
  }

  let S = Source(
    time,
    mask_ex,
    q,
    frac_speak,
    delta_t,
    break_start,
    time_break
  );

  let n_total = xx.length * yy.length;
  n_points = 0;
  let C_avg = new Array(t.length);

  loopy_fn = setInterval(add_point, 10);
  function add_point() {
    if (n_points >= n_total) {
      clearInterval(loopy_fn);

      for (let k = 0; k < t.length; k++) {
        C_avg[k] = avg_free(C_room[k], l, w, delta_x, delta_y);
      }
      loading_fn("C-avg-loading", 1);

      var dataptC = [
        {
          x: t,
          y: C_avg,
        },
      ];
      Plotly.newPlot(
        C_avg_chart,
        dataptC,
        {
          margin: { t: 0 },
          xaxis: { title: { text: "Time (minutes)" } },
          yaxis: {
            title: {
              text: "Average Concentration (infectious particles / m^3)",
            },
          },
        },
        { responsive: true }
      );

      C_avg_loader.style.display = "none";
      C_avg_chart.style.display = "block";
    } else {
      let i = Math.floor(n_points / xx.length);
      let j = n_points - i * xx.length;
      let I = Impulse(
        time,
        time_break,
        delta_t,
        xx[j],
        yy[i],
        x_o,
        y_o,
        l,
        w,
        K,
        v,
        Q,
        s,
        d
      );
      let C_here = Concentration(S, I, h);

      for (let k = 0; k < t.length; k++) {
        C_room[k][i][j] = C_here[k];
      }

      n_points += 1;
      loading_fn("C-avg-loading", n_points / (n_total + 1));
    }
  }
}

function Run_avg_P() {
  reset_results();
  update_parameters();
  loading_fn("P-avg-loading", 0);

  let t = t_array(time + time_break, delta_t);
  for (let i = 0; i < t.length; i++) {
    t[i] = t[i] / 60;
  }

  let xx = x_array(l, delta_x);
  let yy = x_array(w, delta_y);
  let P_room = new Array(t.length);
  for (let i = 0; i < t.length; i++) {
    P_room[i] = new Array(yy.length);
    for (let j = 0; j < yy.length; j++) {
      P_room[i][j] = new Array(xx.length);
    }
  }

  let S = Source(
    time,
    mask_ex,
    q,
    frac_speak,
    delta_t,
    break_start,
    time_break
  );

  let n_total = xx.length * yy.length;
  n_points = 0;
  let P_avg = new Array(t.length);

  loopy_fn = setInterval(add_point, 10);
  function add_point() {
    if (n_points >= n_total) {
      clearInterval(loopy_fn);

      for (let k = 0; k < t.length; k++) {
        P_avg[k] = avg_free(P_room[k], l, w, delta_x, delta_y);
      }
      loading_fn("P-avg-loading", 1);

      var datapt = [
        {
          x: t,
          y: P_avg,
        },
      ];
      Plotly.newPlot(
        P_avg_chart,
        datapt,
        {
          margin: { t: 0 },
          xaxis: { title: { text: "Time (minutes)" } },
          yaxis: { title: { text: "Infection Risk" } },
        },
        { responsive: true }
      );

      P_avg_loader.style.display = "none";
      P_avg_chart.style.display = "block";
    } else {
      let i = Math.floor(n_points / xx.length);
      let j = n_points - i * xx.length;
      let I = Impulse(
        time,
        time_break,
        delta_t,
        xx[j],
        yy[i],
        x_o,
        y_o,
        l,
        w,
        K,
        v,
        Q,
        s,
        d
      );
      let C_here = Concentration(S, I, h);
      let Risk_here = Risk(
        S,
        C_here,
        time,
        time_break,
        delta_t,
        p,
        mask_in,
        I_o
      );

      for (let k = 0; k < t.length; k++) {
        P_room[k][i][j] = Risk_here[k];
      }

      n_points += 1;
      loading_fn("P-avg-loading", n_points / (n_total + 1));
    }
  }
}

// abstract functions: called by the model, but not by the webapp directly
// abstract functions to calculate average in room, round numbers,
// and set up the time array and the x,y-array.
function avg_free(result, l, w, delta_x, delta_y) {
  let xx_array = x_array(l, delta_x);
  let yy_array = x_array(w, delta_y);
  let n_x = xx_array.length;
  let n_y = yy_array.length;

  let sum = 0;
  for (let i = 0; i < n_x; i++) {
    for (let j = 0; j < n_y; j++) {
      sum = sum + result[j][i];
    }
  }

  let average = sum / (n_x * n_y);
  return average;
}

function round(num, dp) {
  // round num to #dp decimal places
  var m = Number((Math.abs(num) * 10 ** dp).toPrecision(15));
  return (Math.round(m) / 10 ** dp) * Math.sign(num);
}

function t_array(time, delta_t) {
  //set up time axis (in s) -- returns an array of len(int(time*3600/delta_t))
  //its output is required in almost all following functions
  //inputs are time and delta_t from user input form
  let t_end = time * 60 * 60;
  let n_t = parseInt(t_end / delta_t);
  let t = new Array();
  for (let i = 0; i < n_t; i++) {
    t[i] = (i + 1) * delta_t;
  }
  return t;
}

function x_array(l, delta_x) {
  // returns x-steps for plotting of contour graphs, ie. the x-data of the contour graphs
  // returns an array of len(l / delta_x + 1)
  // Required inputs from user form: l and delta_x
  let x = new Array();
  n_x = parseInt(l / delta_x + 1);
  for (let i = 0; i < n_x; i++) {
    x[i] = i * delta_x;
  }
  return x;
}

function Source(
  time,
  mask_ex,
  q,
  frac_speak,
  delta_t,
  break_start,
  time_break
) {
  let t = t_array(time + time_break, delta_t);
  let result = new Array(t.length);
  for (let i = 0; i < t.length; i++) {
    result[i] =
      (1 - mask_ex) * (q * (1 - frac_speak) + 10 * q * frac_speak) * delta_t;
  }
  var n_temp1 = parseInt((break_start * 3600) / delta_t);
  var n_temp2 = n_temp1 + parseInt((time_break * 3600) / delta_t);
  for (let i = n_temp1; i < n_temp2; i++) {
    result[i] = 0;
  }
  return result;
}

function Impulse(
  time,
  time_break,
  delta_t,
  x_e,
  y_e,
  x_o,
  y_o,
  l,
  w,
  K,
  v,
  Q,
  s,
  d
) {
  let t = t_array(time + time_break, delta_t);

  let I_y = new Array(t.length);
  for (let i = 0; i < t.length; i++) {
    I_y[i] =
      Math.exp((-1 * (y_e - y_o) ** 2) / (4 * K * t[i])) +
      Math.exp((-1 * (y_e + y_o) ** 2) / (4 * K * t[i]));
    for (let m = 1; m < 5; m++) {
      I_y[i] =
        I_y[i] +
        Math.exp((-1 * (y_e - y_o - 2 * m * w) ** 2) / (4 * K * t[i])) +
        Math.exp((-1 * (y_e + y_o - 2 * m * w) ** 2) / (4 * K * t[i]));
      I_y[i] =
        I_y[i] +
        Math.exp((-1 * (y_e - y_o + 2 * m * w) ** 2) / (4 * K * t[i])) +
        Math.exp((-1 * (y_e + y_o + 2 * m * w) ** 2) / (4 * K * t[i]));
    }
  }

  let I_x = new Array(t.length);
  let m_x = parseInt((v * time * 3600) / (2 * l));
  for (let i = 0; i < t.length; i++) {
    I_x[i] =
      Math.exp((-1 * (x_e - x_o - v * t[i]) ** 2) / (4 * K * t[i])) +
      Math.exp((-1 * (x_e + x_o + v * t[i]) ** 2) / (4 * K * t[i]));
    for (let m = 1; m < m_x + 1; m++) {
      I_x[i] =
        I_x[i] +
        Math.exp(
          (-1 * (x_e - x_o - v * t[i] - 2 * m * l) ** 2) / (4 * K * t[i])
        ) +
        Math.exp(
          (-1 * (x_e + x_o + v * t[i] - 2 * m * l) ** 2) / (4 * K * t[i])
        );
      I_x[i] =
        I_x[i] +
        Math.exp(
          (-1 * (x_e - x_o - v * t[i] + 2 * m * l) ** 2) / (4 * K * t[i])
        ) +
        Math.exp(
          (-1 * (x_e + x_o + v * t[i] + 2 * m * l) ** 2) / (4 * K * t[i])
        );
    }
  }

  let I = new Array(t.length);
  for (let i = 0; i < t.length; i++) {
    I[i] =
      (1 / (4 * Math.PI * K * t[i])) *
      Math.exp(-1 * t[i] * (Q + s + d)) *
      I_y[i] *
      I_x[i];
  }

  return I;
}

function Concentration(S, I, h) {
  let C = new Array(S.length);
  for (i = 0; i < C.length; i++) {
    let temp = 0;
    for (j = 0; j < i + 1; j++) {
      temp = temp + S[j] * I[i - j];
    }
    C[i] = temp / (h / 2);
  }
  return C;
}

function Risk(S, C, time, time_break, delta_t, p, mask_in, I_o) {
  let t = t_array(time + time_break, delta_t);
  let Part_in = new Array(t.length);
  let risk = new Array(t.length);

  Part_in[0] = 0.5 * C[0] * delta_t;
  for (i = 1; i < t.length; i++) {
    if (S[i] > 0) {
      Part_in[i] = Part_in[i - 1] + 0.5 * (C[i - 1] + C[i]) * delta_t;
    } else {
      Part_in[i] = Part_in[i - 1];
    }
    risk[i] = 1 - Math.exp(-1 * p * (1 - mask_in) * (1 + r) * I_o * Part_in[i]);
  }

  return risk;
}
