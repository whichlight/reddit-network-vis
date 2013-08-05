function getFrontPage(){
  $.getJSON("http://reddit.com/.json?jsonp=?", function(json){
    articles = json["data"]["children"];
    url = "http://reddit.com"+articles[0]["data"]["permalink"];
    var discussion = location.search.substring(12);
    if (discussion===""){
      buildNetwork(url);
    }
    else{
      buildNetwork(discussion);
    }

  articles.forEach(function(article, i){
    url = "http://reddit.com"+article["data"]["permalink"];
    var rank = i+1;
    var preview = document.createElement("div");
    var embed = document.createElement("a");
    embed.href = article["data"]["url"];
    embed.innerHTML = article["data"]["url"];
    $(embed).embedly({
      query: {maxheight: 200}
    });

    $(preview).append("<strong>"+article["data"]["title"]+"</strong>");
    $(preview).append(embed);

    button = document.createElement('li');
    var a = document.createElement("a");
    a.innerHTML = rank;
    a.className="tiny button";
    $(a).attr("data-discussion", url);
    $(a).click(function(){
      buildNetwork(a.dataset.discussion)
    });
    $(a).mouseover(function(e){
      displayPreview(e, preview);
    });
    $(a).mouseout(function(){
      removeTooltip();
    });
    $(button).append(a);
    $("#stories").append(button);
  });
  }).error(function(){alert("Error loading data from Reddit, please try again");});

}

function readJSON(input){

  setupGraph();
  svg.selectAll("circle.node").remove();
  svg.selectAll("line.link").remove();
  var data = input;
  var firstNode = data[0];
  var entry = firstNode['data']['children'][0]['data'];
  var out = {}
  out.name = entry.author;
  out.id = entry.name;
  out.created = entry.created;
  out.body = entry.title;
  out.score= entry.ups - entry.downs;
  discussion_url = entry.url;
  OP = out;
  var a = document.createElement("a");
  a.href = entry.url;
  a.innerHTML = entry.url;
  $("#preview").empty();
  $("#preview").append(a);
  $(a).embedly({
    query: {maxheight: 100}
  });

  var title = document.createElement("a");
  title.href = "http://reddit.com"+ entry.permalink;
  title.target="_blank";
  title.innerHTML = "<h4 class='subheader'>"+entry.title+"</h4>";
  $("#topic_title").empty();
  $("#topic_title").append(title);
  nodes.push(out);
  var convo = data[1];
  walkGraph(convo);
}

function walkGraph(entry){
  if (entry instanceof Array){
    entry.forEach(function(a){
      walkGraph(a);
    });
  }
  else{
    for (var a in entry){
      if (a =='data' || entry[a] instanceof Object){
        walkGraph(entry[a]);
      }
    }
  }
  checkIfUser(entry)
}


function checkIfUser(entry){
  var out = {};
  if (entry.hasOwnProperty('name') &&
      entry.hasOwnProperty('id') &&
      entry.hasOwnProperty('created')
     ){
    out.name = entry.author;
    out.id = entry.name;
    out.parent_id = entry.parent_id;
    out.created = entry.created;
    out.body = entry.body;
    out.score= entry.ups - entry.downs;
    nodes.push(out);
    getParentNode(out, addLink);
    addName(out);
  }
  else{
    //console.log('false');
  }
}

function addName(user){
  if (user.name in names){
    names[user.name]+=1
      nodecolor[user.name]= "red";
  }
  else{
    names[user.name]=1;
  }
}

//check for a link, between parent and child, or child and parent
function getParentNode(user, fn){
  nodes.forEach(function(node){
    if (node.id === user.parent_id){
      fn(user, node);
    }
    if (node.parent_id === user.id){
      fn(node, user);
    }
  });
}

function addLink(user, target){
  var link = { "source" : user,
    "target" : target,
    "value" : 5};
  if (links.indexOf(link)==-1){
    links.push(link);
    updateNetwork();
  }
}

function buildNetwork(url){
  _gaq.push(["_trackEvent", "Reddit Network", "Discussion", url]);
  req = url+".json?jsonp=?";
  window.history.pushState(req, "Title", baseURL + "?discussion="+url);
  $("#topic_title").html("<h4 class='subheader'>Loading new Network...</h4>");
  $("#preview").empty();
  $("#preview").append(loading_gif);

  $.ajax({
    dataType: "jsonp",
    url: req,
    success: readJSON,
    error: showError
  });
}

function showError(){
  alert("something went wrong.  make sure the URL is a reddit discussion link.");
}


