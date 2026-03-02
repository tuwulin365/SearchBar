(function(){
  chrome.storage.local.get(null,function(settings){
    var matchesoneof=function(string,wildcardstrings){
      var matches=false;
      for(var i=0;i<wildcardstrings.length;i++){
        var regularexpression=new RegExp("^"+wildcardstrings[i].replace(/[\-\/\\\^\$\+\?\.\(\)\|\{\}\[\]]/g,"\\$&").replace(/\*/g,".*")+"$","g");
        if(string.search(regularexpression)==0){
          matches=true;
        }
      }
      return matches;
    };
    if(!matchesoneof(window.location.hostname,settings.disablehostnames)){
      chrome.runtime.sendMessage("start",function(response){
        if(((settings.showonsessionstartup&&response.lastshowing==="")||(settings.showingremember&&response.lastshowing==1))&&settings.pinned&&window.location.href.search(/https?:\/\/www.google.[^\/]*\/maps/)!=0){
          var style=document.createElement("style");
          if(settings.position[0]=="bottom"){
            var css=document.createTextNode("html{padding-bottom:"+response.height+"px;}");
          }
          else{
            var css=document.createTextNode("html{position:relative;top:"+response.height+"px;}");
          }
          style.appendChild(css);
          document.documentElement.appendChild(style);
        }
      });
    }
  });
})();