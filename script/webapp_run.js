// model input parameter declaration
let l, w, h;
let Q, v;
let x_o, y_o;
let time;
let time_break, break_start;
let p, mask_in;
let mask_ex, frac_speak;
let R_b, R;
let d, s, I_o;
const r = 1;
let delta_x, delta_y, delta_t;
let V, K, q;
let loopy_fn;

const loading_bar = document.getElementById("progress-bar");
const P_contour_chart = document.getElementById("inf-contour");
const risk_avg_print = document.getElementById("risk_avg");
const inf_print = document.getElementById("infected");
const output_msg = document.getElementById("output-msg");
const infection_risk_contour = document.getElementById("chart_area");

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
  var breakBox = document.getElementById("break");
  if (breakBox.checked == false) {
    time_break = 0;
    break_start = time;
  } else {
    time_break = parseFloat(document.getElementById("break-duration").value);
    break_start = parseFloat(document.getElementById("break-start").value);
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
    q = (q * R_b * p) / 8;
  } else {
    q = (R_b * p) / 8;
  }
  p = (p * 0.001) / 60;
}

function reset_results() {
  loading_bar.style.display = "block";
  risk_avg_print.style.display = "none";
  inf_print.style.display = "none";
  P_contour_chart.style.display = "none";
}

function Run_moded() {
  reset_results();
  loading(0);

  update_parameters();

  // set up arrays for results
  var xx = x_array(l, delta_x);
  var yy = x_array(w, delta_y);
  var tt = t_array(time + time_break, delta_t);

  let C_room = new Array(tt.length);
  for (let i = 0; i < tt.length; i++) {
    C_room[i] = new Array(yy.length);
    for (let j = 0; j < yy.length; j++) {
      C_room[i][j] = new Array(xx.length);
    }
  }
  let P_room = new Array(tt.length);
  for (let i = 0; i < tt.length; i++) {
    P_room[i] = new Array(yy.length);
    for (let j = 0; j < yy.length; j++) {
      P_room[i][j] = new Array(xx.length);
    }
  }
  let Part_in = new Array(tt.length);
  for (let i = 0; i < tt.length; i++) {
    Part_in[i] = new Array(yy.length);
    for (let j = 0; j < yy.length; j++) {
      Part_in[i][j] = new Array(xx.length);
    }
  }

  // source function
  var S = new Array(tt.length);
  for (let i = 0; i < tt.length; i++) {
    S[i] =
      (1 - mask_ex) * (q * (1 - frac_speak) + 10 * q * frac_speak) * delta_t;
  }
  var n_temp1 = parseInt((break_start * 3600) / delta_t);
  var n_temp2 = n_temp1 + parseInt((time_break * 3600) / delta_t);
  for (let i = n_temp1; i < n_temp2; i++) {
    S[i] = 0;
  }

  // impulse function in y-direction
  var I_short = new Array(tt.length);
  for (let i = 0; i < tt.length; i++) {
    I_short[i] = new Array(yy.length);
    for (let j = 0; j < yy.length; j++) {
      I_short[i][j] =
        Math.exp((-1 * (yy[j] - y_o) ** 2) / (4 * K * tt[i])) +
        Math.exp((-1 * (yy[j] + y_o) ** 2) / (4 * K * tt[i]));
      for (let m = 1; m < 4; m++) {
        I_short[i][j] =
          I_short[i][j] +
          Math.exp((-1 * (yy[j] - y_o - 2 * m * w) ** 2) / (4 * K * tt[i])) +
          Math.exp((-1 * (yy[j] + y_o - 2 * m * w) ** 2) / (4 * K * tt[i]));
        I_short[i][j] =
          I_short[i][j] +
          Math.exp((-1 * (yy[j] - y_o + 2 * m * w) ** 2) / (4 * K * tt[i])) +
          Math.exp((-1 * (yy[j] + y_o + 2 * m * w) ** 2) / (4 * K * tt[i]));
      }
      I_short[i][j] =
        (1 / (4 * Math.PI * K * tt[i])) *
        Math.exp(-1 * tt[i] * (Q + s + d)) *
        I_short[i][j];
    }
  }

  //mode=0
  for (let j = 0; j < yy.length; j++) {
    for (let k = 0; k < xx.length; k++) {
      C_room[0][j][k] =
        (S[0] *
          I_short[0][j] *
          (Math.exp((-1 * (xx[k] - x_o - v * tt[0]) ** 2) / (4 * K * tt[0])) +
            Math.exp(
              (-1 * (xx[k] + x_o + v * tt[0]) ** 2) / (4 * K * tt[0])
            ))) /
        (h / 2);
      Part_in[0][j][k] = 0.5 * C_room[0][j][k] * delta_t;
      P_room[0][j][k] =
        1 - Math.exp(-1 * p * (1 - mask_in) * (1 + r) * I_o * Part_in[0][j][k]);

      for (let i = 1; i < tt.length; i++) {
        if (i < n_temp1) {
          C_room[i][j][k] =
            C_room[i - 1][j][k] +
            (S[i] *
              I_short[i][j] *
              (Math.exp(
                (-1 * (xx[k] - x_o - v * tt[i]) ** 2) / (4 * K * tt[i])
              ) +
                Math.exp(
                  (-1 * (xx[k] + x_o + v * tt[i]) ** 2) / (4 * K * tt[i])
                ))) /
              (h / 2);
        } else if (i >= n_temp2) {
          C_room[i][j][k] =
            C_room[i - 1][j][k] +
            (S[0] *
              I_short[i][j] *
              (Math.exp(
                (-1 * (xx[k] - x_o - v * tt[i]) ** 2) / (4 * K * tt[i])
              ) +
                Math.exp(
                  (-1 * (xx[k] + x_o + v * tt[i]) ** 2) / (4 * K * tt[i])
                ))) /
              (h / 2);
          C_room[i][j][k] =
            C_room[i][j][k] +
            (S[i] *
              I_short[i - n_temp2][j] *
              (Math.exp(
                (-1 * (xx[k] - x_o - v * tt[i]) ** 2) / (4 * K * tt[i])
              ) +
                Math.exp(
                  (-1 * (xx[k] + x_o + v * tt[i]) ** 2) / (4 * K * tt[i])
                ))) /
              (h / 2);
          C_room[i][j][k] =
            C_room[i][j][k] -
            (S[0] *
              I_short[i - n_temp1][j] *
              (Math.exp(
                (-1 * (xx[k] - x_o - v * tt[i - n_temp1]) ** 2) /
                  (4 * K * tt[i - n_temp1])
              ) +
                Math.exp(
                  (-1 * (xx[k] + x_o + v * tt[i - n_temp1]) ** 2) /
                    (4 * K * tt[i - n_temp1])
                ))) /
              (h / 2);
        } else {
          C_room[i][j][k] =
            C_room[i - 1][j][k] +
            (S[0] *
              I_short[i][j] *
              (Math.exp(
                (-1 * (xx[k] - x_o - v * tt[i]) ** 2) / (4 * K * tt[i])
              ) +
                Math.exp(
                  (-1 * (xx[k] + x_o + v * tt[i]) ** 2) / (4 * K * tt[i])
                ))) /
              (h / 2);
          C_room[i][j][k] =
            C_room[i][j][k] -
            (S[0] *
              I_short[i - n_temp1][j] *
              (Math.exp(
                (-1 * (xx[k] - x_o - v * tt[i - n_temp1]) ** 2) /
                  (4 * K * tt[i - n_temp1])
              ) +
                Math.exp(
                  (-1 * (xx[k] + x_o + v * tt[i - n_temp1]) ** 2) /
                    (4 * K * tt[i - n_temp1])
                ))) /
              (h / 2);
        }
      }

      for (let i = 1; i < tt.length; i++) {
        if (S[i] > 0) {
          Part_in[i][j][k] =
            Part_in[i - 1][j][k] +
            0.5 * (C_room[i - 1][j][k] + C_room[i][j][k]) * delta_t;
        } else {
          Part_in[i][j][k] = Part_in[i - 1][j][k];
        }
        P_room[i][j][k] =
          1 -
          Math.exp(-1 * p * (1 - mask_in) * (1 + r) * I_o * Part_in[i][j][k]);
      }
    }
  }

  // show first graph
  var n_plot = parseInt((2 * l) / v / delta_t);
  var chart_title = "Risk at " + round(tt[n_plot] / 60, 0) + " minutes";
  var chart_title_display = document.getElementById("chart_time");
  chart_title_display.innerHTML = chart_title;
  var dataptP_room = [
    {
      x: xx,
      y: yy,
      z: P_room[n_plot - 1],
      type: "contour",
    },
  ];
  Plotly.newPlot(P_contour_chart, dataptP_room, { margin: { t: 0 } });
  var P_output = avg_free(P_room[n_plot - 1], l, w, delta_x, delta_y) * 100;
  risk_avg_print.innerHTML =
    "Average infection risk from airborne transmission in the room is " +
    round(P_output, 1) +
    "%.";
  inf_print.innerHTML =
    "ie. <output>" +
    round(P_output, 0) +
    "</output> out of <input type='number' value='100' min='0' step='1' style='width:45px' oninput='this.previousElementSibling.value = round(this.value/100*" +
    P_output +
    ",0)'> </input> people in the room will likely be infected.";

  P_contour_chart.style.display = "block";
  risk_avg_print.style.display = "inline";
  inf_print.style.display = "inline";

  let m_x = parseInt((v * time * 3600) / (2 * l));
  var modes = 1;
  var temp = new Array(tt.length);
  for (let i = 0; i < tt.length; i++) {
    temp[i] = new Array(yy.length);
    for (let j = 0; j < yy.length; j++) {
      temp[i][j] = new Array(xx.length);
    }
  }
  loopy_fn = setInterval(add_modes, 10);

  function add_modes() {
    if (modes > m_x) {
      clearInterval(loopy_fn);
      loading_bar.style.display = "none";
      chart_title = "Infection risk at the end of the event";
      chart_title_display.innerHTML = chart_title;
    } else {
      for (let j = 0; j < yy.length; j++) {
        for (let k = 0; k < xx.length; k++) {
          temp[0][j][k] =
            ((S[0] * I_short[0][j]) / (h / 2)) *
            (Math.exp(
              (-1 * (xx[k] - x_o - v * tt[0] + 2 * modes * l) ** 2) /
                (4 * K * tt[0])
            ) +
              Math.exp(
                (-1 * (xx[k] + x_o + v * tt[0] + 2 * modes * l) ** 2) /
                  (4 * K * tt[0])
              ));
          temp[0][j][k] =
            temp[0][j][k] +
            ((S[0] * I_short[0][j]) / (h / 2)) *
              (Math.exp(
                (-1 * (xx[k] - x_o - v * tt[0] - 2 * modes * l) ** 2) /
                  (4 * K * tt[0])
              ) +
                Math.exp(
                  (-1 * (xx[k] + x_o + v * tt[0] - 2 * modes * l) ** 2) /
                    (4 * K * tt[0])
                ));
          for (let i = 1; i < tt.length; i++) {
            if (i < n_temp1) {
              temp[i][j][k] =
                temp[i - 1][j][k] +
                ((S[i] * I_short[i][j]) / (h / 2)) *
                  (Math.exp(
                    (-1 * (xx[k] - x_o - v * tt[i] + 2 * modes * l) ** 2) /
                      (4 * K * tt[i])
                  ) +
                    Math.exp(
                      (-1 * (xx[k] + x_o + v * tt[i] + 2 * modes * l) ** 2) /
                        (4 * K * tt[i])
                    ));
              temp[i][j][k] =
                temp[i][j][k] +
                ((S[i] * I_short[i][j]) / (h / 2)) *
                  (Math.exp(
                    (-1 * (xx[k] - x_o - v * tt[i] - 2 * modes * l) ** 2) /
                      (4 * K * tt[i])
                  ) +
                    Math.exp(
                      (-1 * (xx[k] + x_o + v * tt[i] - 2 * modes * l) ** 2) /
                        (4 * K * tt[i])
                    ));
            } else if (i >= n_temp2) {
              temp[i][j][k] =
                temp[i - 1][j][k] +
                ((S[0] * I_short[i][j]) / (h / 2)) *
                  (Math.exp(
                    (-1 * (xx[k] - x_o - v * tt[i] + 2 * modes * l) ** 2) /
                      (4 * K * tt[i])
                  ) +
                    Math.exp(
                      (-1 * (xx[k] + x_o + v * tt[i] + 2 * modes * l) ** 2) /
                        (4 * K * tt[i])
                    ));
              temp[i][j][k] =
                temp[i][j][k] +
                ((S[0] * I_short[i][j]) / (h / 2)) *
                  (Math.exp(
                    (-1 * (xx[k] - x_o - v * tt[i] - 2 * modes * l) ** 2) /
                      (4 * K * tt[i])
                  ) +
                    Math.exp(
                      (-1 * (xx[k] + x_o + v * tt[i] - 2 * modes * l) ** 2) /
                        (4 * K * tt[i])
                    ));
              temp[i][j][k] =
                temp[i][j][k] -
                ((S[0] * I_short[i - n_temp1][j]) / (h / 2)) *
                  (Math.exp(
                    (-1 *
                      (xx[k] - x_o - v * tt[i - n_temp1] + 2 * modes * l) **
                        2) /
                      (4 * K * tt[i - n_temp1])
                  ) +
                    Math.exp(
                      (-1 *
                        (xx[k] + x_o + v * tt[i - n_temp1] + 2 * modes * l) **
                          2) /
                        (4 * K * tt[i - n_temp1])
                    ));
              temp[i][j][k] =
                temp[i][j][k] -
                ((S[0] * I_short[i - n_temp1][j]) / (h / 2)) *
                  (Math.exp(
                    (-1 *
                      (xx[k] - x_o - v * tt[i - n_temp1] - 2 * modes * l) **
                        2) /
                      (4 * K * tt[i - n_temp1])
                  ) +
                    Math.exp(
                      (-1 *
                        (xx[k] + x_o + v * tt[i - n_temp1] - 2 * modes * l) **
                          2) /
                        (4 * K * tt[i - n_temp1])
                    ));
              temp[i][j][k] =
                temp[i][j][k] +
                ((S[i] * I_short[i - n_temp2][j]) / (h / 2)) *
                  (Math.exp(
                    (-1 * (xx[k] - x_o - v * tt[i] + 2 * modes * l) ** 2) /
                      (4 * K * tt[i - n_temp2])
                  ) +
                    Math.exp(
                      (-1 * (xx[k] + x_o + v * tt[i] + 2 * modes * l) ** 2) /
                        (4 * K * tt[i - n_temp2])
                    ));
              temp[i][j][k] =
                temp[i][j][k] +
                ((S[i] * I_short[i - n_temp2][j]) / (h / 2)) *
                  (Math.exp(
                    (-1 * (xx[k] - x_o - v * tt[i] - 2 * modes * l) ** 2) /
                      (4 * K * tt[i - n_temp2])
                  ) +
                    Math.exp(
                      (-1 * (xx[k] + x_o + v * tt[i] - 2 * modes * l) ** 2) /
                        (4 * K * tt[i - n_temp2])
                    ));
            } else {
              temp[i][j][k] =
                temp[i - 1][j][k] +
                ((S[0] * I_short[i][j]) / (h / 2)) *
                  (Math.exp(
                    (-1 * (xx[k] - x_o - v * tt[i] + 2 * modes * l) ** 2) /
                      (4 * K * tt[i])
                  ) +
                    Math.exp(
                      (-1 * (xx[k] + x_o + v * tt[i] + 2 * modes * l) ** 2) /
                        (4 * K * tt[i])
                    ));
              temp[i][j][k] =
                temp[i][j][k] +
                ((S[0] * I_short[i][j]) / (h / 2)) *
                  (Math.exp(
                    (-1 * (xx[k] - x_o - v * tt[i] - 2 * modes * l) ** 2) /
                      (4 * K * tt[i])
                  ) +
                    Math.exp(
                      (-1 * (xx[k] + x_o + v * tt[i] - 2 * modes * l) ** 2) /
                        (4 * K * tt[i])
                    ));
              temp[i][j][k] =
                temp[i][j][k] -
                ((S[0] * I_short[i - n_temp1][j]) / (h / 2)) *
                  (Math.exp(
                    (-1 *
                      (xx[k] - x_o - v * tt[i - n_temp1] + 2 * modes * l) **
                        2) /
                      (4 * K * tt[i - n_temp1])
                  ) +
                    Math.exp(
                      (-1 *
                        (xx[k] + x_o + v * tt[i - n_temp1] + 2 * modes * l) **
                          2) /
                        (4 * K * tt[i - n_temp1])
                    ));
              temp[i][j][k] =
                temp[i][j][k] -
                ((S[0] * I_short[i - n_temp1][j]) / (h / 2)) *
                  (Math.exp(
                    (-1 *
                      (xx[k] - x_o - v * tt[i - n_temp1] - 2 * modes * l) **
                        2) /
                      (4 * K * tt[i - n_temp1])
                  ) +
                    Math.exp(
                      (-1 *
                        (xx[k] + x_o + v * tt[i - n_temp1] - 2 * modes * l) **
                          2) /
                        (4 * K * tt[i - n_temp1])
                    ));
            }
          }
          C_room[0][j][k] = C_room[0][j][k] + temp[0][j][k];
          Part_in[0][j][k] = 0.5 * C_room[0][j][k] * delta_t;
          for (let i = 1; i < tt.length; i++) {
            C_room[i][j][k] = C_room[i][j][k] + temp[i][j][k];
            if (S[i] > 0) {
              Part_in[i][j][k] =
                Part_in[i - 1][j][k] +
                0.5 * (C_room[i][j][k] + C_room[i - 1][j][k]) * delta_t;
            } else {
              Part_in[i][j][k] = Part_in[i - 1][j][k];
            }
          }
          for (let i = 0; i < tt.length; i++) {
            P_room[i][j][k] =
              1 -
              Math.exp(
                -1 * p * (1 - mask_in) * (1 + r) * I_o * Part_in[i][j][k]
              );
          }
        }
      }

      var chart_title =
        "Risk at " + round(tt[n_plot * (modes - 1)] / 60, 0) + " minutes";
      chart_title_display.innerHTML = chart_title;
      var dataptP_room = [
        {
          x: xx,
          y: yy,
          z: P_room[n_plot * (modes - 1)],
          type: "contour",
        },
      ];
      Plotly.newPlot(P_contour_chart, dataptP_room, { margin: { t: 0 } });
      var P_output =
        avg_free(P_room[n_plot * (modes - 1)], l, w, delta_x, delta_y) * 100;
      risk_avg_print.innerHTML =
        "Average infection risk from airborne transmission in the room is " +
        round(P_output, 1) +
        "%.";
      inf_print.innerHTML =
        "ie. <output>" +
        round(P_output, 0) +
        "</output> out of <input type='number' value='100' min='0' step='1' style='width:45px' oninput='this.previousElementSibling.value = round(this.value/100*" +
        P_output +
        ",0)'> </input> people in the room will likely be infected.";

      loading(modes / m_x);
      modes++;
    }
  }
}

function stop_model() {
  //a function to stop the model when it is running the long form, ie. for the whole room
  clearInterval(loopy_fn);
}

function Run_no_modes() {
  reset_results();
  update_parameters();
  loading_bar.style.display = "block";
  output_msg.style.display = "block";
  infection_risk_contour.style.display = "block";

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
  n_points = 0;

  let loading_fn = setInterval(add_point, 10);
  function add_point() {
    if (n_points >= n_total) {
      clearInterval(loading_fn);

      let P_avg = avg_free(P_room, l, w, delta_x, delta_y);
      loading(n_points / n_total);

      // document.getElementById("chart_time").innerHTML =
      //   "Infection risk at the end of the event";

      var datapt = [
        {
          x: xx,
          y: yy,
          z: P_room,
          type: "contour",
        },
      ];
      Plotly.newPlot(P_contour_chart, datapt, { margin: { t: 0 } });

      risk_avg_print.innerHTML =
        "Average infection risk from airborne transmission in the room is " +
        round(P_avg * 100, 1) +
        "%.";
      inf_print.innerHTML =
        "ie. <output>" +
        round(P_avg * 100, 0) +
        "</output> out of <input type='number' value='100' min='0' step='1' style='width:45px' oninput='this.previousElementSibling.value = round(this.value*" +
        P_avg +
        ",0)'> </input> people in the room will likely be infected.";

      loading_bar.style.display = "none";
      P_contour_chart.style.display = "block";
      risk_avg_print.style.display = "inline";
      inf_print.style.display = "inline";
    } else {
      let i = Math.floor(n_points / yy.length);
      let j = n_points - i * yy.length;
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
      loading(n_points / n_total);
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
