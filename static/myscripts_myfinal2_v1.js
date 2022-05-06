// parse the date / time

/*
fetch('https://m3jxkh.deta.dev/docs')
        .then(res => res.json())
        .then(data => {console.log(data)})

fetch('https://m3jxkh.deta.dev/analystratings/symbolnames', { method: "GET", mode: 'cors', headers: { 'Content-Type': 'application/json',}}).then(response => response.json())
    .then(data => {
        console.log(data);
    })
    ;
*/

var parseTime = d3.timeParse("%Y-%m-%d");
var mywin1 = window;
var mywin1_H = mywin1.innerHeight;
var mywin1_W = mywin1.innerWidth;

var csvColors;
var txtFile = new XMLHttpRequest();
txtFile.open("GET", "/static/color_pallet.csv", true);
txtFile.onreadystatechange = function () {
  if (txtFile.readyState === 4) {
    // document is ready to parse.
    if (txtFile.status === 200) {
      // file is found
      allText = txtFile.responseText;
      csvColors = txtFile.responseText.split(",\n");
    }
  }
};
txtFile.send(null);

//Decideing only on the basis of the aspect ratio
var mobile_mode = 0;
var chart_font = { size: 30, font: "PoppinsRegular" };

var allLines = ["positive", "neutral", "negative", "count"];
var allLines_Labels = ["positive", "neutral", "negative", "count (rhs)"];
var my_color = "black";
var my_bgcolor = "white";
if (mywin1_W < mywin1_H) {
  document.getElementById("landscape_div").outerHTML = "";

  my_color = "white";
  my_bgcolor = "#000022"; //"black";
  mobile_mode = 1;
  //chart_font= "60px PoppinsRegular";
  //allLines_Labels = ["+ve","~","-ve","count"]
  allLines_Labels = ["positive", "neutral", "negative", "count"];
  document.getElementById("selectButton2").style.backgroundColor = my_bgcolor;
  document.getElementById("selectButton2").style.color = my_color;

  // set the dimensions and margins of the graph
  var margin = { top: 180, right: 100, bottom: 120, left: 90 };
  var width = 0.95 * mywin1.innerWidth - margin.left - margin.right;
  var height = 0.5 * mywin1.innerHeight - margin.top - margin.bottom;
} else {
  document.getElementById("portrait_div").outerHTML = "";

  // set the dimensions and margins of the graph
  var margin = { top: 20, right: 80, bottom: 140, left: 80 };
  var width = 0.7 * mywin1.innerWidth - margin.left - margin.right;
  var height = 0.9 * mywin1.innerHeight - margin.top - margin.bottom;
}
document.body.style.background = my_bgcolor;
document.body.style.color = my_color;

// set the ranges
var x = d3.scaleTime().range([0, width]);
var y0 = d3.scaleLinear().range([height, 0]);
var y1 = d3.scaleLinear().range([height, 0]);

// append the svg object to the body of the page
var svg = d3
  .select("#my_dataviz")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// gridlines in y0 axis function
function make_y0_gridlines() {
  return d3.axisLeft(y0).ticks(5);
}

var selectedTicker = "A";
var dataFilter;
var legendSpace = (1.1 * width) / 4; // spacing for the legend
var allTickers;
var mydata;
var all_lines = [];
var dumvar;
//Read the json data
//var symbolnames, one_sym_data;
fetch("https://moby-api-dot-moby-data-services.ue.r.appspot.com/analystratings/symbolnames", {
//fetch("http://127.0.0.1:8000/analystratings/symbolnames", {
  method: "GET",
  //body: JSON.stringify(data),
  mode: "cors",
  headers: {
    "Content-Type": "application/json",
  },
})
  .then((response) => response.json())
  .then((data) => {
    console.log(data);
    allTickers = data.items;
    allTickers = allTickers.sort();
    selectedTicker = allTickers[0];
    //Assuming ther's at least one symbol
    fetch(
      "https://moby-api-dot-moby-data-services.ue.r.appspot.com/analystratings/ratings?symbol_name=" +
      //"http://127.0.0.1:8000/analystratings/ratings?symbol_name=" +
        selectedTicker,
      {
        method: "GET",
        //body: JSON.stringify(data),
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        dataFilter = data.items;
        ////////////////////////////////////////////////////////////////
        /*
         */
        // add the Y gridlines
        var y0Axis = svg
          .append("g")
          .attr("class", "grid")
          .call(make_y0_gridlines().tickSize(-width).tickFormat(""));

        y0Axis.selectAll("path").style("stroke", "white");

        for (i = 0; i < 4; i++) {
          // Initialize each line
          var line = svg
            .append("g")
            .append("path")
            .style("stroke-width", 4)
            .style("fill", "none");

          all_lines[i] = line;
        }

        // text label for the x axis
        if (!mobile_mode) {
        /*
          svg
            .append("text")
            .style("font", 1.0 * chart_font.size + "px " + chart_font.font)
            .attr(
              "transform",
              "translate(" +
                width / 2 +
                " ," +
                (height + 0.7 * margin.bottom) +
                ")"
            )
            //(height + 1.2*margin.top + 30) + ")")
            .style("text-anchor", "middle")
            .style("fill", my_color)
            .text("Date");
        */
          // Add Y axis
          //var y = d3.scaleLinear()
          y0.domain([0, 100]);
          svg
            .append("g")
            .style("font", 0.5 * chart_font.size + "px " + chart_font.font)
            .call(
              d3
                .axisLeft(y0)
                .ticks(5)
                .tickFormat(function (d) {
                  return d + " %";
                })
            );

          // Add Yright axis
          var y1Axis = svg
            .append("g")
            .style("font", 0.5 * chart_font.size + "px " + chart_font.font)
            .attr("transform", "translate(" + width + " ,0)")
            .call(d3.axisRight(y1).tickSize(0).ticks(5));

          // Add X axis --> it is a date format
          var x = d3
            .scaleLinear()
            .domain(
              d3.extent(dataFilter, function (d) {
                return parseTime(d.date);
              })
            )
            //.domain([0,10])
            .range([0, width]);
          svg
            .append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y-%m")).ticks(5))
            .selectAll("text")
            .style("font", 0.5 * chart_font.size + "px " + chart_font.font)
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");
          // text label for the y0 axis
          svg
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - 1.0 * margin.left)
            .attr("x", 0 - height / 2)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .style("font", 1.0 * chart_font.size + "px " + chart_font.font)
            .style("fill", my_color)
            .text("Percent of Analysts");

          // text label for the y1 axis
          svg
            .append("text")
            .attr("transform", "rotate(90)")
            .attr("y", -width - 1.0 * margin.right)
            .attr("x", 0 + height / 2)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .style("font", 1.0 * chart_font.size + "px " + chart_font.font)
            .style("fill", csvColors[3])
            .text("Number of Analysts");

          for (i = 0; i < 4; i++) {
            // Add the Legend
            svg
              .append("text")
              .attr("x", 0 * legendSpace + i * legendSpace) // space legend
              .attr("y", height + 0.9 * margin.bottom) //+ 35)
              .attr("class", "legend") // style the legend
              .style("fill", csvColors[i])
              .style("font", "2vw " + chart_font.font)
              //.style("fill", function() { // Add the colours dynamically
              //   return myColor(allLines[i]); })
              .text(allLines_Labels[i]);
          }
        } else {
          // Add Y axis
          //var y = d3.scaleLinear()
          y0.domain([0, 100]);
          svg
            .append("g")
            .style("font", 1.1 * chart_font.size + "px " + chart_font.font)
            .call(d3.axisLeft(y0).ticks(5));

          // Add Yright axis
          var y1Axis = svg
            .append("g")
            .style("font", 1.1 * chart_font.size + "px " + chart_font.font)
            .attr("transform", "translate(" + width + " ,0)")
            .call(d3.axisRight(y1).tickSize(0).ticks(5));

          // Add X axis --> it is a date format

          var x = d3
            .scaleLinear()
            .domain(
              d3.extent(dataFilter, function (d) {
                return parseTime(d.date);
              })
            )
            //.domain(d3.extent(mydata.get(selectedTicker), function(d) { return parseTime(d.date); }))
            //.domain(d3.extent(data, function(d) { return parseTime(d.date); }))
            //.domain([0,10])
            .range([0, width]);

          const longFormat = d3.timeFormat(""); //("'%y");
          const shortFormat = d3.timeFormat("'%y-%m");
          const xAxis = d3.axisBottom(x).ticks(50);

          dumvar = xAxis;

          svg
            .append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(
              xAxis.tickFormat((d, i) => {
                const ticks = xAxis.scale().ticks(50);

                //console.log((new Date(d)).getMonth() + " * " + (new Date(d)) + " # " + i + " $ " + (new Date(ticks[i])) );
                if (
                  i > 0 &&
                  new Date(d).getMonth() == 0 &&
                  new Date(d).getMonth() != new Date(ticks[i - 1]).getMonth()
                ) {
                  return shortFormat(d);
                } else {
                  return longFormat(d);
                }
              })
            )
            .selectAll("text")
            .style("font", 1.1 * chart_font.size + "px " + chart_font.font)
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", "1.25em")
            .attr("transform", "rotate(-0)");
          // text label for the y0 axis
          svg
            .append("text")
            .style("font", 1.5 * chart_font.size + "px " + chart_font.font)
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - 1.15 * margin.left)
            .attr("x", 0 - height / 2)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .style("fill", my_color)
            .text("Percent of Analysts");

          // text label for the y1 axis
          svg
            .append("text")
            .style("font", 1.5 * chart_font.size + "px " + chart_font.font)
            .attr("transform", "rotate(90)")
            .attr("y", -width - 1.0 * margin.right)
            .attr("x", 0 + height / 2)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .style("fill", csvColors[3])
            .text("Number of Analysts");

          for (i = 0; i < 4; i++) {
            var y_disp = 0.6;
            if (i > 1) y_disp = 0.2;
            // Add the Legend
            svg
              .append("text")
              .style("font", 1.5 * chart_font.size + "px " + chart_font.font)
              .attr("x", 0.2 * legendSpace + (i % 2) * 1.7 * legendSpace) // space legend
              .attr("y", 0.0 * height - y_disp * margin.top) //+ 35)
              .attr("class", "legend") // style the legend
              .style("fill", csvColors[i])
              .text(allLines_Labels[i]);
          }
        }

        y1Axis.selectAll("path").style("stroke", "white");

        var all_yaxes = [y0, y0, y0, y1];
        var all_ymults = [100, 100, 100, 1];

        // A function that update the chart
        function update() {
          //dataFilter = data.filter(filterCriteria);
          //dataFilter = mydata.get(selectedTicker);
          fetch(
            "https://moby-api-dot-moby-data-services.ue.r.appspot.com/analystratings/ratings?symbol_name=" +
            //"http://127.0.0.1:8000/analystratings/ratings?symbol_name=" +
              selectedTicker,
            {
              method: "GET",
              //body: JSON.stringify(data),
              mode: "cors",
              headers: {
                "Content-Type": "application/json",
              },
            }
          )
            .then((response) => response.json())
            .then((data) => {
              console.log(data);
              dataFilter = data.items;
            })
            .catch((err) => {
              console.log(err);
            });
          // Create new data with the selection?

          svg.selectAll("circle").remove();
          for (i = 0; i < 4; i++) {
            var dataPlotted = dataFilter.map(function (d) {
              return { date: parseTime(d.date), value: d[allLines[i]] };
            });

            if (i == 3) {
              var y1_max = d3.max(dataPlotted, function (d) {
                return +d.value;
              });
              y1.domain([0, y1_max]);
            }
            /*
             */
            //debugger;
            // Give these new data to update line
            //line
            all_lines[i]
              .datum(dataPlotted)
              .transition()
              .duration(500)
              .attr(
                "d",
                d3
                  .line()
                  .x(function (d) {
                    return x(d.date);
                  })
                  .y(function (d) {
                    return all_yaxes[i](+d.value * all_ymults[i]);
                  })
              )
              //.attr("stroke", function(d){ return myColor(allLines[i]) })
              .attr("stroke", csvColors[i]);

            // Add the circles
            svg
              .selectAll("myCircles")
              .data(dataPlotted)
              .enter()
              .append("circle")
              //.attr("fill", "red")
              .style("fill", csvColors[i])
              //.attr("fill", function(d){ return myColor(allLines[i]) })
              .attr("stroke", "none")
              //.attr("cy", function(d) { return y(d.value) })
              .attr("r", 4)
              //.transition()
              //.duration(1000)
              .attr("cx", function (d) {
                return x(d.date);
              })
              .attr("cy", function (d) {
                return all_yaxes[i](+d.value * all_ymults[i]);
              });

            //debugger;
          }

          // Add Yright axis
          y1Axis
            .transition()
            .duration(1000)
            .call(d3.axisRight(y1).ticks(5).tickSize(0));

          //svg.selectAll("text").style("font", chart_font);
        }

        /*
                function updateWindow(){
                    console.log("updating for window re-size .....");
                    //x = mywin1.innerWidth;
                    //y = mywin1.innerHeight;
                    width = 0.85*mywin1.innerWidth - margin.left - margin.right;
                    height = mywin1.innerHeight - margin.top - margin.bottom;

                    svg.attr("width", width + margin.left + margin.right);
                    svg.attr("height", height + margin.top + margin.bottom);
                    //svg.attr("width", x).attr("height", y);

                    update();
                }
                updateWindow();
                d3.select(mywin1).on('resize.updatesvg', updateWindow);
            */
        // add the options to the button
        d3.select("#selectButton2")
          .selectAll("myOptions2")
          .data(allTickers)
          .enter()
          .append("option")
          .text(function (d) {
            return d;
          }) // text showed in the menu
          .attr("value", function (d) {
            return d;
          }); // corresponding value returned by the button

        // When the button is changed, run the updateChart function
        d3.select("#selectButton2").on("change", function (d) {
          // recover the option that has been chosen
          d.preventDefault();
          d.stopPropagation();
          selectedTicker = d3.select(this).property("value");
          // run the updateChart function with this selected option
          console.log("Doing update .....");
          console.log(selectedTicker);
          debounce(update(), 600);
        });

        update();
        //debugger;
        ///////////////////////////////////////////////////////////////
      })
      .catch((err) => {
        console.log(err);
      });
  })
  .catch((err) => {
    console.log(err);
  });
//Read the csv data

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    const context = this;
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      timeout = null;
      func.apply(context, args);
    }, wait);
  };
}
