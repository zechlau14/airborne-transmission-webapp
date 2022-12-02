// From a previous edition; currently unused as it's slower.
function Run_moded() {
  reset_results();
  loading_fn("the-bar", 0);

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

        loading_fn("the-bar", modes / m_x);
      modes++;
    }
  }
}