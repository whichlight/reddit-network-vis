$(document).ready(function(){
  getFrontPage();
});

var width = 1000,
    height = 1000,
    nodeMin = 3;
var force, nodes, links, svg, OP;
var names = {};
var nodecolor = {};
var discussion_url;
var loading_gif = new Image();
loading_gif.src = "./img/ajax-loader.gif";

var baseURL= location.pathname


var loading_gif_small = new Image();
loading_gif_small.src = "./img/small-loader.gif";


//Create tooltip element
var tooltip = d3.select("#chart")
.append("div")
.attr("class", "large-3 columns")
.attr("id", "tooltip")
.style("position", "absolute")
.style("z-index", "10")
.style("opacity", 0);


function setupGraph(){
  $(".network").empty();
  names = {};
  nodecolor = {};

  force = d3.layout.force()
    .charge(-100)
    .linkDistance(20)
    .size([width, height]);

  nodes = force.nodes(),
        links = force.links();

  force.on("tick", function () {
    svg.selectAll("line.link")
    .attr("x1", function (d) { return d.source.x; })
    .attr("y1", function (d) { return d.source.y; })
    .attr("x2", function (d) { return d.target.x; })
    .attr("y2", function (d) { return d.target.y; });

  svg.selectAll("circle.node")
    .attr("cx", function (d) { return d.x; })
    .attr("cy", function (d) { return d.y; });
  });


  d3.select("svg").remove();
  svg = d3.select("#chart").append("svg:svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class","network");
}

function updateNetwork(){
  var link = svg.selectAll("line.link")
    .data(links, function (d) { return d.source.id + "-" + d.target.id;});

  link.enter().insert("svg:line", "circle.node")
    .attr("class", "link")
    .style("stroke-width", function(d) { return 2; })
    .style("stroke", "gray")
    .style("opacity",0.8);

  var node = svg.selectAll("circle.node")
    .data(nodes, function (d) {return d.id;});

  var nodeEnter = node.enter().append("svg:circle")
    .attr("class", "node")
    .call(force.drag)
    .attr("r", function(d){
      if(d.score>=0){
        return nodeMin + Math.pow(d.score, 1/(2.7));
      }
      return 1;
    })
  .style("opacity",0.8)
    .on("mouseover", displayTooltip)
    .on("mousemove", moveTooltip)
    .on("mouseout", removeTooltip)
    .call(force.drag)

    force.start();
  colorNodes();
}

function colorNodes(){
  for(name in nodecolor){
    nodecolor[name]=d3.rgb(255*Math.random(), 255*Math.random(), 255*Math.random())
  }

  //set colors
  svg.selectAll("circle")
    .style("fill", function(d){
      if (d.name === OP.name){
        return "orange";
      }
      else if (names[d.name]===1){
        return "black"
      }
      else{
        return nodecolor[d.name];
      }
    }
    )
}


function displayTooltip(node){
  var pos = d3.mouse(this);

  tooltip.html(
      "<span id='name'>"+node.name+"</span> : "+
      showLinks(node.body)
      )
    .style("top", (pos[1])+"px")
    .style("left",(pos[0])+"px")
    .style("z-index", 10)
    .style("opacity", .9)
    $("#tooltip a").append(loading_gif_small);
    $("#tooltip a").embedly({
      query: {maxheight: 100},
      done: function(){$(this).remove(loading_gif_small);}
    });
}

function moveTooltip(node){
  var pos = d3.mouse(this);
  tooltip
    .style("top", (d3.event.pageY+10)+"px")
    .style("left",(d3.event.pageX+10)+"px");
}

function removeTooltip(node){
  tooltip
    .style("z-index",  -1)
    .style("opacity", 0)    //Make tooltip invisible
    svg.selectAll("circle")
    .transition()
    .style("opacity", 0.8);
}

// from http://dzone.com/snippets/validate-url-regexp
function showLinks(text) {
  var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
  return text.replace(exp,"<a href='$1'>$1</a>");
}

function displayPreview(e, preview){
  var pos = [e.pageX, e.pageY+20]
    tooltip.html(preview.innerHTML)
    .style("top", (pos[1])+"px")
    .style("left",(pos[0])+"px")
    .style("z-index", 10)
    .style("opacity", .9)
}

$("#input").click(function(){
  buildNetwork($("input").val());
})
