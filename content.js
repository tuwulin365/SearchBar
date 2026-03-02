(function(){
  if(document.getElementById("searchbarnoscriptinjection")===null){
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
        var persistentports=[];
        var persistentconnect=function(connectInfo){
          var persistentport={
            "connectInfo":connectInfo,
            "port":null,
            "connect":function(){
              if(this.port!==null){
                try{
                  this.port.disconnect();
                }
                catch(error){}
              }
              this.port=chrome.runtime.connect(this.connectInfo);
              var messagelisteners=this.onMessage.listeners.slice();
              var disconnectlisteners=this.onDisconnect.listeners.slice();
              this.onMessage.listeners=[];
              this.onDisconnect.listeners=[];
              for(var i=0;i<messagelisteners.length;i++){
                this.onMessage.addListener(messagelisteners[i]);
              }
              for(var i=0;i<disconnectlisteners.length;i++){
                this.onDisconnect.addListener(disconnectlisteners[i]);
              }
            },
            "postMessage":function(message){
              try{
                this.port.postMessage(message);
              }
              catch(error){
                window.setTimeout((function(){
                  this.connect();
                  this.port.postMessage(message);
                }).bind(this),1);
              }
            },
            "onMessage":{
              "listeners":[]
            },
            "onDisconnect":{
              "listeners":[]
            }
          };
          persistentport.onMessage.addListener=(function(listener){
            this.onMessage.listeners.push(listener);
            this.port.onMessage.addListener(listener);
          }).bind(persistentport);
          persistentport.onDisconnect.addListener=(function(listener){
            this.onDisconnect.listeners.push(listener);
            this.port.onDisconnect.addListener((function(){
              window.setTimeout((function(){
                try{
                  this.connect();
                }
                catch(error){
                  listener();
                }
              }).bind(this),1);
            }).bind(this));
          }).bind(persistentport);
          persistentport.connect();
          persistentports.push(persistentport);
          return persistentport;
        };
        window.addEventListener("pageshow",function(event){
          if(event.persisted){
            for(var i=0;i<persistentports.length;i++){
              persistentports[i].connect();
            }
          }
        });
        if(window.self==window.top){
          var randomclass="searchbar"+Math.random().toString().split(".")[1];
          var printstyletag=document.createElement("style");
          printstyletag.appendChild(document.createTextNode("@media print{."+randomclass+"{display:none!important;}}"));
          document.documentElement.appendChild(printstyletag);
          var popup=(window.location.protocol=="chrome-extension:");
          if(popup){
            settings.position=["top","left"];
            settings.displayhighlightbutton=false;
            settings.displayfindbuttons=false;
            settings.pinned=false;
            settings.hotkeys.show=[false,false,false,false,false];
          }
          if(window.location.href.search(/https?:\/\/www.google.[^\/]*\/maps/)==0){
            settings.pinned=false;
          }
          var showing=0;
          var showontextselectionoverride=false;
          var iframe;
          var searchbar;
          var cross;
          var box;
          var buttons=[];
          var images=[];
          var highlightorfindseparator;
          var findbuttonsdiv;
          var findbuttons=[];
          var textnodes;
          var optionspagelink;
          var optionspageimage;
          if(popup){
            var helpimage;
          }
          var menu;
          var options;
          var infoframe;
          var infodiv;
          var infoheader;
          var infooptionspagelink;
          var customsearchdiv;
          var customsearcherrordiv;
          var searchsuggestions=[];
          var searchhistorysuggestions=[];
          var highlightedoption=-1;
          var storedtext="";
          var searchhistory=[];
          var changedtimeout;
          var lasteventframe="top";
          var lastcustomsearch=null;
          var eventlisteners=[];
          var port=persistentconnect({
            "name":"top"
          });
          var existingtoolbarelements=(function(){
            var existingtoolbardata=[["www.facebook.com",["#blueBar","[role=banner]"]],["www.youtube.com",["#masthead-positioner",".appbar-guide-menu-layout"]]];
            var returnvalue=[];
            for(var i=0;i<existingtoolbardata.length;i++){
              if(window.location.hostname==existingtoolbardata[i][0]){
                for(var j=0;j<existingtoolbardata[i][1].length;j++){
                  var elements=document.querySelectorAll(existingtoolbardata[i][1][j]);
                  for(var k=0;k<elements.length;k++){
                    returnvalue.push(elements[k]);
                  }
                }
              }
            }
            return returnvalue;
          })();
          var fixdisplay=function(){
            searchbar.oldoffsetheight=searchbar.offsetHeight;
            if(!popup){
              port.postMessage({
                "type":"height",
                "data":searchbar.offsetHeight
              });
            }
            iframe.style.height=searchbar.offsetHeight+"px";
            if(popup){
              document.body.style.minWidth=Math.min(800,searchbar.offsetWidth+1)+"px";
              document.body.style.minHeight=searchbar.offsetHeight+"px";
            }
            if(settings.pinned){
              if(settings.position[0]=="top"){
                document.documentElement.style.top=searchbar.offsetHeight+"px";
                for(var i=0;i<existingtoolbarelements.length;i++){
                  if(window.getComputedStyle(existingtoolbarelements[i]).getPropertyValue("position")=="fixed"){
                    existingtoolbarelements[i].style.top=searchbar.offsetHeight+"px";
                  }
                  else{
                    existingtoolbarelements[i].style.top="0px";
                  }
                }
              }
              else{
                var oldscrolltop=document.body.scrollTop;
                document.documentElement.style.paddingBottom="0px";
                document.documentElement.style.paddingBottom=Math.max(0,document.documentElement.scrollHeight-Math.max(document.documentElement.clientHeight,document.documentElement.offsetHeight))+searchbar.offsetHeight+"px";
                document.body.scrollTop=oldscrolltop;
                searchbar.olddocumentElement.scrollHeight=document.documentElement.scrollHeight;
                searchbar.olddocumentElement.clientHeight=document.documentElement.clientHeight;
                searchbar.olddocumentElement.offsetHeight=document.documentElement.offsetHeight;
              }
            }
            else{
              iframe.style.width=(searchbar.offsetWidth+1)+"px";
            }
            if(settings.position[0]=="bottom"){
              menu.style.top="auto";
              menu.style.bottom=(searchbar.offsetHeight-box.offsetTop-2)+"px";
            }
            else{
              menu.style.top=(box.offsetTop+box.offsetHeight-1)+"px";
              menu.style.bottom="auto";
            }
            if(settings.position[1]=="right"){
              menu.style.left="auto";
              menu.style.right=(searchbar.offsetWidth-box.offsetLeft-box.offsetWidth-(settings.pinned?0:1))+"px";
            }
            else{
              menu.style.left=box.offsetLeft+"px";
              menu.style.right="auto";
            }
            menu.style.minWidth=(box.offsetWidth-6)+"px";
          };
          var fixdisplayinterval=function(){
            if(showing>0&&searchbar.oldoffsetheight!=searchbar.offsetHeight){
              fixdisplay();
            }
            window.setTimeout(fixdisplayinterval,50);
          };
          window.setTimeout(fixdisplayinterval,50);
          var fixdisplaypaddingbottominterval=function(){
            if(showing>0&&settings.pinned&&settings.position[0]=="bottom"&&(searchbar.olddocumentElement.scrollHeight!=document.documentElement.scrollHeight||searchbar.olddocumentElement.clientHeight!=document.documentElement.clientHeight||searchbar.olddocumentElement.offsetHeight!=document.documentElement.offsetHeight)){
              fixdisplay();
            }
            window.setTimeout(fixdisplaypaddingbottominterval,500);
          };
          window.setTimeout(fixdisplaypaddingbottominterval,500);
          var show=function(active){
            showontextselectionoverride=false;
            iframe.style.display="block";
            searchbar.style.display="block";
            if(settings.pinned&&settings.position[0]=="top"){
              document.documentElement.style.position="relative";
            }
            if(active){
              iframe.style.width="100%";
              window.setTimeout(fixdisplay,1);
            }
          };
          var hide=function(){
            showing=0;
            if(popup){
              port.postMessage({
                "type":"lastsearch",
                "data":[storedtext,showing,buttons[1].highlighting]
              });
              window.close();
            }
            iframe.style.display="none";
            searchbar.style.display="none";
            if(settings.pinned){
              if(settings.position[0]=="top"){
                document.documentElement.style.position="static";
                document.documentElement.style.top="0px";
                for(var i=0;i<existingtoolbarelements.length;i++){
                  existingtoolbarelements[i].style.top="0px";
                }
              }
              else{
                document.documentElement.style.paddingBottom="0px";
              }
            }
            resetmenu();
          };
          var resetmenu=function(){
            menu.isreset=true;
            highlightoption(-1);
            menu.style.display="none";
            if(popup){
              document.body.style.height="auto";
            }
            searchsuggestions=[];
            searchhistorysuggestions=[];
            for(var i=0;i<options.length;i++){
              options[i].innerHTML="";
            }
          };
          var getsuggestions=function(getsearchsuggestions){
            menu.isreset=false;
            storedtext=box.value;
            highlightoption(-1);
            findbuttonsreset();
            iframe.style.width="100%";
            window.setTimeout(fixdisplay,1);
            if(getsearchsuggestions==false){
              searchsuggestions=[];
              for(var i=0;i<settings.maximumnumberofsearchsuggestions;i++){
                options[i].innerHTML="";
              }
            }
            port.postMessage({
              "type":"getsuggestions",
              "data":(getsearchsuggestions?("https://www.google"+settings.searchsuggestionslocale+"/complete/search?client=hp&q="+encodeURIComponent(box.value.substring(0,100))):false)
            });
          };
          var highlightoption=function(n){
            highlightedoption=n;
            for(var i=0;i<options.length;i++){
              options[i].style.backgroundColor="#ffffff";
            }
            if(n!=-1){
              options[n].style.backgroundColor="#f4f4f4";
            }
          };
          var addEventListenerToAllFrames=function(searchbariframes,eventname,listener){
            eventlisteners.push([eventname,(function(eventname){
              return function(event){
                window.setTimeout((function(eventname){
                  return function(){
                    lasteventframe="top";
                    event.selection=document.getSelection().toString().replace(/\n/g," ").substr(0,65535);
                    event.activetag=(document.activeElement?document.activeElement:event.target).tagName.toLowerCase();
                    event.activeeditable=(document.activeElement?document.activeElement:event.target).contentEditable.toLowerCase();
                    event.customsearch=eventname=="contextmenu"?getcustomsearch(event.target):null;
                    listener(event);
                  };
                })(eventname),0);
              };
            })(eventname)]);
            window.addEventListener(eventlisteners[eventlisteners.length-1][0],eventlisteners[eventlisteners.length-1][1]);
            if(searchbariframes){
              iframe.contentDocument.addEventListener(eventname,function(event){
                listener(event);
              });
              infoframe.contentDocument.addEventListener(eventname,function(event){
                listener(event);
              });
            }
            port.onMessage.addListener(function(message){
              if(message.type=="event"){
                lasteventframe=message.frameid;
                if(message.data[0]==eventname){
                  listener(message.data[1]);
                }
              }
            });
          };
          var middlemousedownelement=document.body;
          var addClickIncludingMiddleListener=function(element,listener){
            element.addEventListener("click",function(event){
              if(event.button!=1){
                listener(event);
              }
            });
            element.addEventListener("mousedown",function(event){
              if(event.button==1){
                middlemousedownelement=element;
                element.focus();
                event.stopPropagation();
                event.preventDefault();
              }
              else{
                middlemousedownelement=document.body;
              }
            });
            element.addEventListener("mouseup",function(event){
              if(event.button==1&&middlemousedownelement.isSameNode(element)){
                listener(event);
                event.preventDefault();
              }
              middlemousedownelement=document.body;
            });
          };
          var focusonlasteventframe=function(){
            if(lasteventframe=="top"){
              window.focus();
            }
            else{
              port.postMessage({
                "type":"focus",
                "frameid":lasteventframe
              });
            }
          };
          var highlightsearchtermsinallframes=function(searchterms){
            highlightsearchterms(searchterms);
            port.postMessage({
              "type":"highlight",
              "data":searchterms
            });
          };
          var unhighlightsearchtermsinallframes=function(){
            unhighlightsearchterms();
            port.postMessage({
              "type":"unhighlight"
            });
          };
          var findinlasteventframe=function(searchterm,findprevious){
            if(lasteventframe=="top"){
              window.find(searchterm,false,findprevious,true,false,false,false);
            }
            else{
              port.postMessage({
                "type":"find",
                "frameid":lasteventframe,
                "data":[searchterm,findprevious]
              });
            }
          };
          var cssreset=function(object){
            object.style.border="0px";
            object.style.margin="0px";
            object.style.padding="0px";
            object.style.outline="0px";
            object.style.verticalAlign="baseline";
          };
          var removeleadingandtrailingwhitespace=function(text){
            return text.replace(/^\s+|\s+$/g,"");
          };
          var keycodetotext=function(keycode){
            var lookup=[];
            lookup[8]="Backspace";
            lookup[9]="Tab";
            lookup[13]="Enter";
            lookup[16]="Shift";
            lookup[17]="Ctrl";
            lookup[18]="Alt";
            lookup[19]="PauseBreak";
            lookup[20]="CapsLock";
            lookup[27]="Esc";
            lookup[32]="Space";
            lookup[33]="PageUp";
            lookup[34]="PageDown";
            lookup[35]="End";
            lookup[36]="Home";
            lookup[37]="Left";
            lookup[38]="Up";
            lookup[39]="Right";
            lookup[40]="Down";
            lookup[44]="PrintScreen";
            lookup[45]="Insert";
            lookup[46]="Delete";
            lookup[96]="Num0";
            lookup[97]="Num1";
            lookup[98]="Num2";
            lookup[99]="Num3";
            lookup[100]="Num4";
            lookup[101]="Num5";
            lookup[102]="Num6";
            lookup[103]="Num7";
            lookup[104]="Num8";
            lookup[105]="Num9";
            lookup[106]="Num*";
            lookup[107]="Num+";
            lookup[109]="Num-";
            lookup[110]="Num.";
            lookup[111]="Num/";
            lookup[112]="F1";
            lookup[113]="F2";
            lookup[114]="F3";
            lookup[115]="F4";
            lookup[116]="F5";
            lookup[117]="F6";
            lookup[118]="F7";
            lookup[119]="F8";
            lookup[120]="F9";
            lookup[121]="F10";
            lookup[122]="F11";
            lookup[123]="F12";
            lookup[144]="NumLock";
            lookup[145]="ScrollLock";
            lookup[186]=";";
            lookup[187]="=";
            lookup[188]=",";
            lookup[189]="-";
            lookup[190]=".";
            lookup[191]="/";
            lookup[219]="[";
            lookup[220]="\\";
            lookup[221]="]";
            if(keycode===false){
              return "";
            }
            else if((keycode>=48&&keycode<=57)||(keycode>=65&&keycode<=90)){
              return String.fromCharCode(keycode);
            }
            else if(typeof(lookup[keycode])=="undefined"){
              return "[keyCode:"+keycode.toString()+"]";
            }
            else{
              return lookup[keycode];
            }
          };
          var hotkeytotext=function(hotkey){
            return hotkey[0]===false?"":(hotkey[1]?"Alt+":"")+(hotkey[2]?"Ctrl+":"")+(hotkey[3]?"Shift+":"")+(hotkey[4]?"Meta+":"")+keycodetotext(hotkey[0]);
          };
          var getimagedata=function(fileinput,callback){
            if(fileinput.files.length>0){  
              var reader=new FileReader();
              reader.onload=function(event){
                var imagedata=event.target.result;
                if(imagedata.length>0){
                  if(imagedata.indexOf("data:image")!=0){
                    alert("That is not an image file.");
                  }
                  else if(imagedata.length>65535){
                    alert("That file is too big. The maximum permitted file size is "+(65535-23)*0.75+" bytes.");
                  }
                  else{
                    callback(imagedata);
                  }
                }
              };
              reader.readAsDataURL(fileinput.files[0]);
            }
          };
          var gettopost=function(address,postparameters){
            return chrome.runtime.getURL("post.html")+"?address="+encodeURIComponent(address)+"&parameters="+encodeURIComponent(postparameters);
          };
          iframe=document.createElement("iframe");
          iframe.className=randomclass;
          iframe.src="about:blank";
          iframe.scrolling="no";
          cssreset(iframe);
          iframe.style.display="none";
          iframe.style.position="fixed";
          iframe.style.zIndex="2147483646";
          document.body.appendChild(iframe);
          iframe.contentDocument.open("text/html","replace");
          iframe.contentDocument.write("<!DOCTYPE html><html><head><style>button:focus{outline:1px solid #4D90FE!important;}</style></head><body><div id=\"searchbarnoscriptinjection\" style=\"display:none;\"></div></body></html>");
          iframe.contentDocument.close();
          iframe.contentDocument.body.style.WebkitBackfaceVisibility="hidden";
          searchbar=document.createElement("div");
          cssreset(searchbar);
          searchbar.style.display="none";
          searchbar.style.position="fixed";
          searchbar.style.height="auto";
          searchbar.style.zIndex="2147483646";
          searchbar.style.padding="3px";
          searchbar.style.color="#b0b0b0";
          searchbar.style.cursor="default";
          searchbar.oldoffsetheight=0;
          searchbar.olddocumentElement={
            "scrollHeight":0,
            "clientHeight":0,
            "offsetHeight":0
          };
          cross=document.createElement("button");
          images[0]=document.createElement("img");
          images[0].src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH1gcHCyMfGLAkTgAAAppJREFUOMuVk0+LFFcUxX9V9aq63lhdXWVbTlrtDExpixsRe6Fgh2yCy3yCTAhGMTERQaMYNy7cuFARXLjwD6JrF4K4SPINzHJIoskMaMCJSXom092jVne9d7PoYaIEBO/m3LM498K55zpAAMSr+C41BHoKSM9XK59HjrPfdWh6MP02lYF5K/w+EPnudL+4oQAncpz9Hx+c+TDZWAdjwRrEGhDzX2/GXKydXvprcfrB3e8BbirAeg5b0qlNlH8/o+w+w1pBRLDWYldxzIVKLSHdnFHPki30/rBuu932XMjxPcyrJST0iQ+fwd3cxDDEyBCvOUX967PYiZCVlWUIFRVdydvttud2Oh0fQBBEIP70JOGufdRPXMRvbsV/fxvvnbrMut0fsPHgt5hyBGJBhE6n46tWqzV23xqsWHr3b1PfthN3IiI7cQkAdyLCvBiweO/W2ElrAWi1WoHK87zyBLD9lxRPuoxm53n19ACbLlzHq8Zj5/s95o59xsv5xxgRTL0BIuR5XnGzLAsBzNKA0UrBaFBgivJ/57NDw2hQUA4Kym4fKQ1ZloVukiQaQIYjrBX8fDvNK7fwqjGm38P0e3jVmK1X76BbO7ACUgyRUUmSJNqNokiveWAtGw58tSb+7cgMv345Q9nvoaoxjUNHERGwBkSIokgrrfUbA56eO02T8yxcu8KLxz8jIjw6/AmNQ0eZO3sKT3mrIQOttVZKKe1XqwtiTUOn6+n/+Zy5b46snVVEGPzyE4+Of4Ef+NTSGIxBQr2glNIqCIKwkqTdf7qLjVqaMlGLxxusQcxrUX4t0su9AUM/7AZBECrATu7ZO/vwx4dusbRYHy4vT77tmYJa7XklXd+d3LN3FrCOiEwBHwHr3vGdV4Af/gXVzUVdmatoKQAAAABJRU5ErkJggg==";
          cross.appendChild(images[0]);
          addClickIncludingMiddleListener(cross,function(){
            if(showing==2){
              showontextselectionoverride=true;
            }
            port.postMessage({
              "type":"hideallatonce"
            });
            hide();
            focusonlasteventframe();
          });
          box=document.createElement("input");
          box.autocomplete="off";
          box.style.display="inline-block";
          box.style.margin="1px 3px";
          box.style.padding="2px";
          box.style.outline="none";
          box.style.verticalAlign="1px";
          box.isfocused=0;
          box.addEventListener("keydown",function(event){
            box.isfocused=2;
            if(settings.escfromanywhere==false&&event.keyCode==settings.hotkeys.hide[0]&&event.keyCode>0&&event.altKey==settings.hotkeys.hide[1]&&event.ctrlKey==settings.hotkeys.hide[2]&&event.shiftKey==settings.hotkeys.hide[3]&&event.metaKey==settings.hotkeys.hide[4]){
              box.blur();
              if(showing==2){
                showontextselectionoverride=true;
              }
              port.postMessage({
                "type":"hideallatonce"
              });
              hide();
              focusonlasteventframe();
            }
            else if((event.keyCode==38||event.keyCode==40)&&event.altKey==false&&event.ctrlKey==false&&event.shiftKey==false&&event.metaKey==false){
              event.preventDefault();
            }
          });
          box.addEventListener("keyup",function(event){
            if(box.isfocused==2){
              if(event.keyCode==8||event.keyCode==27||(event.keyCode>=32&&event.keyCode<=37)||event.keyCode==39||event.keyCode==45||event.keyCode==46||(event.keyCode>=48&&event.keyCode<=57)||(event.keyCode>=65&&event.keyCode<=90)||(event.keyCode>=96&&event.keyCode<=123&&event.keyCode!=108)||(event.keyCode>=186&&event.keyCode<=192)||(event.keyCode>=219&&event.keyCode<=223)||event.keyCode==13||((event.keyCode==38||event.keyCode==40)&&menu.isreset==true)){
                getsuggestions(settings.sendsearchsuggestions);
              }
              else if(event.keyCode==38||event.keyCode==40){
                if(event.altKey||event.ctrlKey||event.shiftKey||event.metaKey){
                  if(event.keyCode==38){
                    if(highlightedoption==-1){
                      if(searchhistorysuggestions.length>0){
                        highlightedoption=settings.maximumnumberofsearchsuggestions;
                      }
                      else if(searchsuggestions.length>0){
                        highlightedoption=0;
                      }
                    }
                    else if(highlightedoption<settings.maximumnumberofsearchsuggestions){
                      highlightedoption=-1;
                    }
                    else{
                      if(searchsuggestions.length>0){
                        highlightedoption=0;
                      }
                      else{
                        highlightedoption=-1;
                      }
                    }
                  }
                  else{
                    if(highlightedoption==-1){
                      if(searchsuggestions.length>0){
                        highlightedoption=0;
                      }
                      else if(searchhistorysuggestions.length>0){
                        highlightedoption=settings.maximumnumberofsearchsuggestions;
                      }
                    }
                    else if(highlightedoption<settings.maximumnumberofsearchsuggestions){
                      if(searchhistorysuggestions.length>0){
                        highlightedoption=settings.maximumnumberofsearchsuggestions;
                      }
                      else{
                        highlightedoption=-1;
                      }
                    }
                    else{
                      highlightedoption=-1;
                    }
                  }
                }
                else{
                  if(event.keyCode==38){
                    highlightedoption--;
                    if(highlightedoption==-2){
                      highlightedoption=settings.maximumnumberofsearchsuggestions+searchhistorysuggestions.length-1;
                    }
                    if(highlightedoption==settings.maximumnumberofsearchsuggestions-1){
                      highlightedoption=searchsuggestions.length-1;
                    }
                  }
                  else{
                    highlightedoption++;
                    if(highlightedoption==searchsuggestions.length){
                      highlightedoption=settings.maximumnumberofsearchsuggestions;
                    }
                    if(highlightedoption==settings.maximumnumberofsearchsuggestions+searchhistorysuggestions.length){
                      highlightedoption=-1;
                    }
                  }
                }
                highlightoption(highlightedoption);
                if(highlightedoption==-1){
                  box.value=storedtext;
                }
                else{
                  box.value=searchsuggestions.concat(new Array(settings.maximumnumberofsearchsuggestions-searchsuggestions.length),searchhistorysuggestions)[highlightedoption];
                }
              }
            }
          });
          box.addEventListener("focus",function(){
            box.isfocused=1;
            box.select();
          });
          box.addEventListener("mousedown",function(event){
            if(box.isfocused==0){
              box.focus();
              event.preventDefault();
            }
            else{
              box.isfocused=2;
            }
          });
          box.addEventListener("mouseup",function(event){
            if(box.isfocused==2){
              getsuggestions(settings.sendsearchsuggestions);
            }
          });
          box.addEventListener("blur",function(){
            iframe.contentDocument.getSelection().removeAllRanges();
            box.isfocused=0;
            resetmenu();
          });
          buttons[0]=cross;
          var createbutton=function(buttonid,enabled,hotkey,title,imgsrc,site,searchstring){
            buttons[buttonid]=document.createElement("button");
            buttons[buttonid].title=title;
            images[buttonid]=document.createElement("img");
            images[buttonid].alt=title.charAt(0);
            buttons[buttonid].appendChild(images[buttonid]);
            if(enabled){
              if(imgsrc.search(/https?:\/\//)==0){
                port.postMessage({
                  "type":"imagesrc",
                  "data":imgsrc,
                  "buttonid":buttonid
                });
              }
              else{
                images[buttonid].src=imgsrc;
              }
              buttons[buttonid].clickfunction=(function(site,searchstring){
                return function(text,ctrlKey,shiftKey){
                  if(ctrlKey&&shiftKey&&settings.showingremember==false){
                    port.postMessage({
                      "type":"hideallatonce"
                    });
                    hide();
                  }
                  storedtext=box.value;
                  var urlstring=searchstring;
                  if(box.value==""){
                    urlstring=site;
                  }
                  var forceincognito=false;
                  if(urlstring.search(/i:/)==0){
                    forceincognito=true;
                    urlstring=urlstring.substr("i:".length);
                  }
                  var getlocation=function(callback){
                    if(popup){
                      chrome.tabs.query({"active":true,"lastFocusedWindow":true},function(activetabs){
                        if(activetabs.length>0){
                          var currentlocation=document.createElement("a");
                          currentlocation.href=activetabs[0].url;
                          callback(currentlocation);
                        }
                        else{
                          callback({"href":"","hostname":""});
                        }
                      });
                    }
                    else{
                      callback(window.location);
                    }
                  };
                  getlocation(function(currentlocation){
                    var urlparts=urlstring.split("%{");
                    var urlexpressions=[]
                    for(var i=1;i<urlparts.length;i++){
                      var urlexpressionendlocation=urlparts[i].lastIndexOf("}");
                      if(urlexpressionendlocation!=-1){
                        urlexpressions.push(urlparts[i].substr(0,urlexpressionendlocation));
                        urlparts[i]=urlparts[i].substr(urlexpressionendlocation+1);
                      }
                      else{
                        urlexpressions.push(null);
                        urlparts[i]="%{"+urlparts[i];
                      }
                    }
                    var address="";
                    var foundquestionmark=false;
                    for(var i=0;i<urlparts.length;i++){
                      var urlpartquestionmarklocation=urlparts[i].indexOf("?");
                      if(urlpartquestionmarklocation!=-1&&urlstring.search(/https?:\/\//)==0&&foundquestionmark===false){
                        var urlpartbeforequestionmark=urlparts[i].substr(0,urlpartquestionmarklocation);
                        var urlpartfromquestionmark=urlparts[i].substr(urlpartquestionmarklocation);
                        foundquestionmark=true;
                      }
                      else if(foundquestionmark){
                        var urlpartbeforequestionmark="";
                        var urlpartfromquestionmark=urlparts[i];
                      }
                      else{
                        var urlpartbeforequestionmark=urlparts[i];
                        var urlpartfromquestionmark="";
                      }
                      address+=urlpartbeforequestionmark.replace(/%h/g,currentlocation.hostname).replace(/%u/g,currentlocation.href).replace(/%s/g,text)+urlpartfromquestionmark.replace(/%h/g,encodeURIComponent(currentlocation.hostname)).replace(/%u/g,encodeURIComponent(currentlocation.href)).replace(/%s/g,encodeURIComponent(text));
                      if(i>0){
                        if(urlexpressions[i-1]!==null){
                          address+=evalExpr(urlexpressions[i-1],{"h":currentlocation.hostname,"u":currentlocation.href,"s":text})
                        }
                      }
                    }
                    var addressdoublequestionmarklocation=address.indexOf("??");
                    if(addressdoublequestionmarklocation!=-1){
                      var addressafterdoublequestionmark=address.substr(addressdoublequestionmarklocation+2);
                      var postparametersendlocation=addressafterdoublequestionmark.search(/(\?|#)/);
                      if(postparametersendlocation!=-1){
                        var postparameters=addressafterdoublequestionmark.substr(0,postparametersendlocation);
                        var addressafterpostparameters=addressafterdoublequestionmark.substr(postparametersendlocation);
                      }
                      else{
                        var postparameters=addressafterdoublequestionmark;
                        var addressafterpostparameters="";
                      }
                      address=address.substr(0,addressdoublequestionmarklocation)+addressafterpostparameters;
                      address=gettopost(address,postparameters);
                    }
                    port.postMessage({
                      "type":"search",
                      "data":[address,ctrlKey,shiftKey,popup,forceincognito],
                      "lastsearch":[text,showing,buttons[1].highlighting],
                      "disablesearchhistory":settings.disablesearchhistory
                    });
                  });
                };
              })(site,searchstring);
              addClickIncludingMiddleListener(buttons[buttonid],(function(buttonid){
                return function(event){
                  buttons[buttonid].clickfunction(box.value,(event.ctrlKey||event.metaKey||(event.button==1))!=settings.alwaysnewtab,event.shiftKey!=settings.alwaysforegroundtab);
                };
              })(buttonid));
              buttons[buttonid].hotkeyfunction=(function(buttonid,hotkey){
                return function(event,text){
                  var currenttab=((event.keyCode==hotkey[0][0])&&event.keyCode>0&&event.altKey==hotkey[0][1]&&event.ctrlKey==hotkey[0][2]&&event.shiftKey==hotkey[0][3]&&event.metaKey==hotkey[0][4]);
                  var newbackgroundtab=((event.keyCode==hotkey[1][0])&&event.keyCode>0&&event.altKey==hotkey[1][1]&&event.ctrlKey==hotkey[1][2]&&event.shiftKey==hotkey[1][3]&&event.metaKey==hotkey[1][4]);
                  var newforegroundtab=((event.keyCode==hotkey[2][0])&&event.keyCode>0&&event.altKey==hotkey[2][1]&&event.ctrlKey==hotkey[2][2]&&event.shiftKey==hotkey[2][3]&&event.metaKey==hotkey[2][4]);
                  if(currenttab||newforegroundtab||newbackgroundtab){
                    if(box.isfocused>0){
                      event.preventDefault();
                    }
                    buttons[buttonid].clickfunction(text,newforegroundtab||newbackgroundtab,newforegroundtab);
                  }
                };
              })(buttonid,hotkey);
            }
          };
          box.addEventListener("keydown",function(event){
            for(var i=0;i<settings.custombuttons.length;i++){
              if(settings.custombuttons[i][0]){
                buttons[i+2].hotkeyfunction(event,box.value);
              }
            }
          });
          addEventListenerToAllFrames(false,"keydown",function(event){
            if(settings.removewhitespace){
              event.selection=removeleadingandtrailingwhitespace(event.selection);
            }
            for(var i=0;i<settings.custombuttons.length;i++){
              if(settings.custombuttons[i][0]&&event.selection!=""){
                buttons[i+2].hotkeyfunction(event,event.selection);
              }
            }
          });
          box.addEventListener("keydown",function(event){
            if(event.keyCode==13&&settings.custombuttons.length>0&&settings.custombuttons[0][0]){
              buttons[2].clickfunction(box.value,(event.ctrlKey||event.metaKey)!=settings.alwaysnewtab,event.shiftKey!=settings.alwaysforegroundtab);
            }
          });
          highlightorfindseparator=document.createElement("span");
          cssreset(highlightorfindseparator);
          highlightorfindseparator.appendChild(document.createTextNode(" | "));
          var getwords=function(string){
            var regularexpression=new RegExp("((["+numberletter+"][,\\.]["+numberletter+"])|["+wordletter+"'])+","g");
            var matches=string.match(regularexpression);
            if(matches==null){
              matches=[];
            }
            for(var i=0;i<matches.length;i++){
              matches[i]=matches[i].replace(/^'+|'+$/g,"");
              if(matches[i].length==0){
                matches.splice(i,1);
                i--;
              }
            }
            return matches;
          }
          var getsearchterms=function(search){
            var returnvalue=[[],[]];
            search=search.split("\"");
            for(var i=0;i<search.length;i++){
              if(i%2==0||i==search.length-1){
                var searchterms=getwords(search[i]);
                if(searchterms!=null){
                  for(var j=0;j<searchterms.length;j++){
                    if(returnvalue[0].indexOf(searchterms[j])==-1){
                      returnvalue[0].push(searchterms[j]);
                      if((new RegExp("["+cjkletter+"]")).test(searchterms[j])){
                        returnvalue[1].push("cjkword");
                      }
                      else{
                        returnvalue[1].push("word");
                      }
                    }
                  }
                }
              }
              else{
                if(search[i].length>0&&returnvalue[0].indexOf(search[i])==-1){
                  returnvalue[0].push(search[i]);
                  returnvalue[1].push("phrase");
                }
              }
            }
            return returnvalue;
          };
          buttons[1]=document.createElement("button");
          buttons[1].highlighting="";
          images[1]=document.createElement("img");
          images[1].offsrc="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAAAmJLR0QA/4ePzL8AAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAHdElNRQfcCRsXDhJXcy0oAAAA8klEQVQoz23QMS9DURjG8d+5mlI0pDqIjQ8gEhGLkc5GH86nMTTpoEREDEgEW3WRDpXe+xp6W9V6z3KS53/+ed4jLJ5OPMbknsL8XEeusGo/YRG4jVyuQHKcyP7G96WaMNKNOeApcqEwttaN/AFeYqCYxisyD7PAW3wp5CVQsa6t9Qv047OMx/UarpzaSVTgK15LeQGa7hzYSyaGd0vT12z6wGEauzMYqquVP7fm27PzNOmWMYwVb1ZtoGrJjYuZ1bNR9K1repI01XWcqaVfIPViIJerurLlVassNzV0Lavqa9vWczQXU2m4NLJn10nyz/wAxclsa1wEXXAAAAAASUVORK5CYII=";
          images[1].onsrc="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAA7DAAAOwwHHb6hkAAABzklEQVQ4jZWSy0sbURjF02ihti4ULWkRHwhGUAJ2WVBaqCDSlYgKrnSjRLtxrairtn9AacUHpQuXihsFl0EUM20y0zER4yORECwRfBRBDDLn9DMzpq0Za7q4cBnu73fuPd84SDpyWQg8InbaePN7brD2hAg8JL46iNAz/pcAeg2hPhbBA1OgOGkoLuYkwGYj8b2KCBYT3/JNgT+PxloBjcAL/lOAvW5io5bQnkp6ocD3LEE+Df0lz9Y7bxcg5hW4XtIrrPT7metD8zC10UtluslegMSYwHUCV8rbSyW9wISvVrBMJtFH/yc3TxJ6tgDH84TuFrhc4BKreaclkH30DdXJch7urmSXiLM1E9RcklRkte78ffXoAGPz9Ywps/ZjRKRFZuwxU68bv4Yj7Tz2Pac65739R7rUmol9KS/cYIFXjQscamRK7+Lq1OssOCPARZypzVGe++T90R5JbE2PC0E3U+F+KjMiOT+1F+DyJ/Fjkki8TR8+XaomtjrSbSPipTpdm2ncXnA0R8SH5fpDxF4vjfg4Q188TC42UPlQ9VfjtoLYcjuRnCAO3jPpH6Q6+4rh5Xdc/dyd1bi9QA4tjru4MFKRhrZ9H++E/ly/ANXB/kXk+RjIAAAAAElFTkSuQmCC";
          images[1].src=buttons[1].highlighting==""?images[1].offsrc:images[1].onsrc;
          buttons[1].appendChild(images[1]);
          buttons[1].clickfunction=function(search){
            storedtext=box.value;
            var searchterms=getsearchterms(search);
            if(buttons[1].highlighting!=search&&searchterms[0].length>0){
              buttons[1].highlighting=search;
              images[1].src=images[1].onsrc;
              highlightsearchtermsinallframes(searchterms);
            }
            else{
              images[1].src=images[1].offsrc;
              buttons[1].highlighting="";
              unhighlightsearchtermsinallframes();
            }
          };
          addClickIncludingMiddleListener(buttons[1],function(event){
            buttons[1].clickfunction(box.value);
          });
          buttons[1].hotkeyfunction=function(event){
            if(event.keyCode==settings.hotkeys.highlight[0]&&event.keyCode>0&&event.altKey==settings.hotkeys.highlight[1]&&event.ctrlKey==settings.hotkeys.highlight[2]&&event.shiftKey==settings.hotkeys.highlight[3]&&event.metaKey==settings.hotkeys.highlight[4]){
              buttons[1].clickfunction(box.value);
            }
          };
          var findbuttonimagesuffices=["70lEQVQ4jY2Ty28SURSH+9e60IVLF1q7wJgoBfpI7SOlJNIUUs3EUtJHolGh0tICgwMzHR7zHp5CodX9z3NvBW0ZEhe/mczkft+595yZGQAzLL9uOvh53cL1wMXwysZVz0Svq6HbrqHTVNFyFTTsEkbrR/kDt2/hYYNgB4O+BcdSUBQzkEtZWIaEpiuTQOKZENwQeFvZoao6MpnPODzcRzL5AXt7AgThHdKpY7jWd28BA4d9G4OeRQs/4ehon14/uJNY7C3SXw+8Bey8LKZe5pXvw6NsRze9BX3aNmsYOzPb9jRBOLziLfhBne62qyjkT5BICFMFGxuL3oJOs4I2jSr1JckbNk2wvPzKW8Bm3KIxyVIaW1tvEI9HJ+D19QWsrga8BQ2nxD8S15IgvN/E0tJL7O5uY2cngig1LhaLkHgFwaAPfv/cpIDN1zGL43w8jmMxNAv/66cIBp4jEp6n+xzW1gJc8K+EX2yjCNsQeSydpQBTy8Oo56BVL1CvnOP02wEJn01IuIADHCoQlIfOwFoOdYJrahYV5QyXcoY+pAR8vic0jQWEQi/+CkxNhE4Ay6giBy/PoMqnUMoZlKUTSGKKSx49fsgzFrAHUyvCoOh1JhNJVECtkkdVzUFVLqDIWdrF+Ri804OR5H9y/3f+DUsBNIL146pwAAAAAElFTkSuQmCC","7klEQVQ4jY2T22/SYBiH9/fqhZdeqNsFxkQR2CFzh4xhZBlkmsYxskOiUWF2YwPKCu3KoUfKURhsev/z/b4JzlESL35tmn7P837f+7YzAGZYft108PO6heuBi+GVg6uehV5XR7ddRaepoeWqaDhFjNaP8gdu38LDBsF1DPo26raKgiRCKWZgmzKarkICmWdCcEPgbeU6VTUgil9wcLCHZPIjdncFCMJ7pFNHcO0LbwEDh30Hg55NCz/j8HAPb+nF3cRi75D+tu8tYOdlsYwSr3wfHmUruuEt6NO2WcPYmdm2pwnC4WVvwQ/qdLddQT53jERCmCpYX1/wFnSaZbRpVKmvSd6waYKlpZfeAjbjFo1JkdPY3HyDeDw6Aa+tzWNlJeAtaNSL/CNxbRnChw0sLr7Azs4WtrcjiFLjYrEIiZcRDPrg989NCth861ZhnE9HcSyEnsH/6gmCgVlEwq/pPofV1QAX3JXwi2MW4JgSj22w5GHpOZi1LPTKOWrlM5x83yfh0wkJF3CAQ3mCcjAYWM2iRnBVy6CsnuJSEelDSsDne0zTmEco9PyvwNIlGASwjCpy8PIUmnICtSSiJB9DllJc8vDRA56xgD1YegEmxagxmUSiPKrlHCpaFpp6DlXJ0C7OxuA/PRhJ/if3f+ffmS87wsGwqvAAAAAASUVORK5CYII=","7ElEQVQ4jY2TW28SQRiG+3v1opdeqO0FxkQR6CG1h5SSSFNINRtLSQ+JRoVKSwssLux2Oex5OQqFVu9fv5kKKiyJmby72WSeZ2a+b3YOwBzLz7sOfty2cDtwMbyxcdMz0etq6LZr6DRVtFwFDbuE0fxRfsPte3jYINjBoG/BsRQUxQzkUhaWIaHpyiSQeKYEdwTer+zQqjoymU84Pj5EMvkeBwcCBOEt0qlTuNY3bwEDh30bg55FEz/i5OQQmxMjFnuD9JcjbwE7L4upl/nKk/Bo7Ea3vQV92jYrGDsz2/YsQTi85i34TpXutqso5M+QSAgzBVtby96CTrOCNrUq9TnJCzZLsLr6wlvAetyiNslSGjs7rxGPR6fxzSWsrwe8BQ2nxC+Ja0kQ3m1jZeU59vd3sbcXQZQKF4tFSLyGYNAHv39xWsD665jFcT6cxrEcegr/y8cIBhYQCb+i9yI2NgJc8LeEP2yjCNsQeSydpQBTy8Oo56BVr1CvXOL86xEJn0xJuIADHCoQlIfOwFoOdYJrahYV5QLXcoYuUgI+3yPqxhJCoWd/BKYmQieAZbQiB68voMrnUMoZlKUzSGKKSx7OP+AZC9iHqRVhUPQ6k4kkKqBWyaOq5qAqV1DkLO3icgz+U4OR5H8y+Tv/AgQBLiJ7Ikn9AAAAAElFTkSuQmCC","7UlEQVQ4jY2T2W8SURSH+/fqg48+uPQBY6IIdEltaUpJSlNINcRS0iXRqFCnpWVzYKbDMvuwCoVW33+ee+ugLUPiw28mk9zvO/eec2cOwBzLr5sefl53cD1yML6ycDUwMOir6Hcb6LUVdBwZLasCd72bP3D3Fh63CLYxGpqwTRnlkgCpkoOpi2g7EglEninBDYG3lW2qqkEQPuPwcB/p9Afs7SWRTL5DNnMMx/zuLWDgeGhhNDBp4SccHe0D4fCdxONbyH498Baw87IYWpVXvg+72Y5teAuGtG3WMHZmtu1ZgkhkxVvwgzrd79ZRLJwglUrOFKyvL3oLeu0aujSqzJc0b9gswfLyK28Bm3GHxiSJWWxuvkUiEZuCw+EFrK4GvAUtu8IviWOKSL7fwNLSS+zubmNnJ4oYNS4ej5J4BcGgD37//LSAzdc2ypN8PE5gMfQM/tdPEAw8RzTyht7zWFsLcMG/Ev6w9DIsvcRjaixFGGoBejMPtX6BZu0cp98OSPh0SsIFHOBQkaACNAY28mgS3FByqMlnuJQEukgp+HyPaRoLCIVe/BUYagkaASxuRQ5enkGRTiFXBVTFE4ilDJc8fPSAZyJgH4Zahk7RmkxWIlERjVoBdSUPRb6ALOVoF+cT8E4PXMn/5P7v/BsQwS4iJhUloQAAAABJRU5ErkJggg==","7klEQVQ4jY2Ty28SURSH+9e60IVLF1q7wJgoBfpI7SOlJNIUUs3EUtJHolGh0tICgwMzHR7zHp5CodX9z3NvBW0ZEhe/mUxyv+/ce86dGQAzLL9uOvh53cL1wMXwysZVz0Svq6HbrqHTVNFyFTTsEkbrR/kDt2/hYYNgB4O+BcdSUBQzkEtZWIaEpiuTQOKZENwQeFvZoao6MpnPODzcRzL5AXt7AgThHdKpY7jWd28BA4d9G4OeRQs/4ehoH3iAO4nF3iL99cBbwM7LYuplXvk+PMp2dNNb0Kdts4axM7NtTxOEwyvegh/U6W67ikL+BImEMFWwsbHoLeg0K2jTqFJfkrxh0wTLy6+8BWzGLRqTLKWxtfUG8Xh0Al5fX8DqasBb0HBK/JK4lgTh/SaWll5id3cbOzsRRKlxsViExCsIBn3w++cmBWy+jlkc5+NxHIuhWfhfP0Uw8ByR8Dy957C2FuCCfyX8YRtF2IbIY+ksBZhaHkY9B616gXrlHKffDkj4bELCBRzgUIGgPHQG1nKoE1xTs6goZ7iUM3SREvD5ntA0FhAKvfgrMDUROgEso4ocvDyDKp9CKWdQlk4giSkuefT4Ic9YwD5MrQiDoteZTCRRAbVKHlU1B1W5gCJnaRfnY/BOD0aS/8n93/k3N+E0ghyHo7AAAAAASUVORK5CYII=","7klEQVQ4jY2T2U8TURSH+Xv1wUcfVHioMWppyxJkCaWJJbRBM5HSsCQatcWBQjennWG6zd7Vlhb0/ee5F6cinSY+/GYymft9595zZmYAzLD8uuni53Ub10MHoysLV30D/V4DvU4N3ZaKtqOgaZXgrnfzB+7cwqMmwTaGAxO2qaBYECGXMjB1CS1HJoHEMyG4IfC2sk1VNYjiZxwe7iOZ/IC9PQGC8A7p1DEc87u3gIGjgYVh36SFn3B0tI+X9OpuYrG3SH898Baw87IYWplXvg+72Y5uegsGtG3WMHZmtu1pgnB4xVvwgzrd61SRz50gkRCmCjY2Fr0F3VYFHRpV6kuSN2yaYHn5lbeAzbhNY5KlNLa23iAej07A6+sLWF0NeAuadol/JI4pQXi/iaWlF9jd3cbOTgRRalwsFiHxCoJBH/z+uUkBm69tFMf5eBzHYugZ/K+fIBiYRSQ8T/c5rK0FuOCuhF8svQhLL/CYGkseRiMHvZ5Fo3qBeuUcp98OSPh0QsIFHOBQnqAcNAbWsqgTXFMzqChnuJRF+pAS8Pke0zQWEAo9/yswGgVoBLC4FTl4eQZVPoVSFlGWTiAVUlzy8NEDnrGAPRiNInSKVmeyAonyqFVyqKpZqMoFFDlDuzgfg//0wJX8T+7/zr8BD0j4840yv4gAAAAASUVORK5CYII=","7klEQVQ4jY2T2W8SURSH+Xv1oY8+uPQBY6IIdEntklKS0hRCzcRS0iXRqFBpadkcmOmwzDAbq1Bo9f3nubcO2jIkPvxmMsn9vnPvOXc8ADwsv257+HnTwc3IxvjaxPVAx6Cvot+to9dW0LFltMwynPVO/sDdO3jcItjCaGjAMmSUihlI5SyMpoi2LZFA5JkS3BJ4V9miqhoymc84OjpAMvkB+/sCBGEP6dQJbOO7u4CB46GJ0cCghZ9wfHwAT9xzL9HoNtJfD90F7LwsulbhlR/CTnYim+6CIW2bNYydmW17liAUWnEX/KBO97s1FPKnSCSEmYKNjUV3Qa9dRZdGlfqS5A2bJVhefu0uYDPu0JgkMY2trXeIxSJT8Pr6AlZX/e6CllXml8Q2RAjvN7G09Arx+A52d8OIUOOi0TCJVxAIeOHzzU8L2HwtvTTJx5MYFoPP4XvzFAH/C4RDb+k9j7U1Pxf8K+EPs1mC2SzyGBpLAbqaR7ORg1q7RKN6gbNvhyR8NiXhAg5wqEBQHhoD6zk0CK4rWVTlc1xJGbpICXi9T2gaCwgGX/4V6GoRGgEsTkUOXp1Dkc4gVzKoiKcQiykueTz3iGciYB+6WkKTojWYrEiiAurVPGpKDop8CVnK0i4uJuC9HjiS/8nD3/k3y379M2+aOrkAAAAASUVORK5CYII=","8ElEQVQ4jY2T2W8SURSH+XONPvjog0sfMEZFoEtql5SSlKaQaiaWki6JRoU6LS1bB2Y6LLPBsAqFVt9/nnvroC1D0offTCa533fuPeeOB4CH5fd1F7+u2rga2hhd1nHZN9Hvaeh1qui2VLRtBc16Ec56J3/hzg08ahLcwHBgoWEpKORFyMU0LENCy5ZJIPFMCK4JvKncoKo6RPEr9vd3kUh8ws6OAEH4gFTyELZ17i5g4GhQx7Bv0cIvODjYxesHnluJRjeQ+r7nLmDnZTH1Eq98F3ayGVlzFwxo26xh7Mxs29MEodCiu+AndbrXqSCXPUI8LkwVrK7OuQu6rTI6NKrktwRv2DTBwsIbdwGbcZvGJEsprK+/RywWmYBXVmaxtOR3FzQbRX5JbEuC8HEN8/OvsL29ia2tMCLUuGg0TOJFBAJe+HwzkwI234ZZGOfzYQxzwefwvX2KgP8FwqF39J7B8rKfC/6X8EfdKKBu5HksnSUHU8vCqGWgVc5QK5/i+MceCZ9NSLiAAxzKEZSFzsBqBjWCq2oaZeUEF7JIFykOr/cJTWMWweDLfwJTy0MngMWpyMGLE6jyMZSSiJJ0BCmf5JJHjx/yjAXsw9QKMCh6jcnyJMqhWs6iomagKmdQ5DTt4nQM3uqBI7lP7v7OfwAZtwYCHEDAeAAAAABJRU5ErkJggg==","8ElEQVQ4jY2TW28SURRG+XX+GH3w0QetfcCYKAV6SW1pSkmkKaSaiaWkl0SjQqWlBQYHZspt7sNVKLT6/rnPqaAtQ+LDN5NJzlr7nL3PeAB4WH7ddPHzuo3roYPRlYWrvoF+T0WvU0e3VUHbUdC0ShivH+cP3LmFR02CbQwHJmxTQVHMQC5lYeoSWo5MAolnSnBD4G1lm6pqyGQ+4/BwH8nkB+ztCRCEd0injuGY390FDBwNLAz7Ji38hKOjfXgehO4kFnuL9NcDdwE7L4uhlXnl+/A429FNd8GAts0axs7Mtj1LEA6vugt+UKd7nRoK+RMkEsJMwcbGkrug26qiQ6NKfUnyhs0SrKy8chewGbdpTLKUxtbWG8Tj0Sk4FFrE2prfXdC0S/ySOKYE4f0mlpdfYnd3Gzs7EUSpcbFYhMSrCAS88PnmpwVsvrZRnOTjcRxLwTn4Xj9FwP8ckfACveexvu7ngn8l/GHpRVi6yGNqLAUYah56Iwe1doFG9Ryn3w5I+GxKwgUc4FCBoDw0BtZzaBBcr2RRVc5wKWfoIiXg9T6haSwiGHzxV2CoIjQCWMYVOXh5hop8CqWcQVk6gSSmuOTR44c8EwH7MNQidIrWYDKRRAXUq3nUKjlUlAsocpZ2cT4B7/RgLPmf3P+dfwOO7QPixKE8twAAAABJRU5ErkJggg==","7UlEQVQ4jY2Ty08aURSH+Xvbhcsu+nBB06SlgI9YxYgkYoRoM6lIfCRt2oIdRYGhAzPymifDsyBou//13GuhVYaki99MJrnfd+49544HgIfl120XP2/auBk6GF3buO6b6Pc09Do1dFtltB0VTbuI8fpx/sCdO3jUJLiB4cBCw1JRkEQoxQwsQ0bLUUgg80wJbgm8q9ygqjpE8TOOjg6QTH7A/r4AQdhDOnUCx/ruLmDgaGBj2Ldo4SccHx8g5AndSyy2hfTXQ3cBOy+LqZd45YfwONvRDXfBgLbNGsbOzLY9SxAOr7gLflCne50q8rlTJBLCTMH6+qK7oNuqoEOjSn1J8obNEiwvv3YXsBm3aUyKnMbm5jvE49FpQWgBq6t+d0GzUeSXxLFkCO83sLT0Cru729jZiSBKjYvFIiReQSDghc83Py1g822YhUk+nsSxGHwO35unCPhfIBJ+S+95rK35ueBfCX/YRgG2IfFYOkseppaDUc9Cq16iXrnA2bdDEj6bknABBziUJygHnYG1LOoE18oZVNRzXCkiXaQEvN4nNI0FBIMv/wpMTYJOAMu4IgevzlFWzqCWRJTkU8hSiksezz3imQjYh6kVYFD0OpNJJMqjVsmhWs6irF5CVTK0i4sJeK8HY8n/5OHv/BsAkg5CwfkjCQAAAABJRU5ErkJggg=="];
          findbuttonsdiv=document.createElement("div");
          cssreset(findbuttonsdiv);
          var findbuttonsreset=function(){
            while(findbuttons.length>0){
              findbuttonsdiv.removeChild(findbuttons[0]);
              findbuttons.splice(0,1);
            }
            var searchterms=getsearchterms(box.value)[0];
            if(searchterms.length>0){
              for(var i=0;i<Math.min(settings.maximumnumberoffindbuttons,searchterms.length);i++){
                findbuttons[i]=document.createElement("button");
                findbuttons[i].title="在网页里查找"+(i<settings.findbuttonhotkeys.length?(settings.findbuttonhotkeys[i][0][0]===false?"":(" ("+hotkeytotext(settings.findbuttonhotkeys[i][0])+")")):"");
                findbuttons[i].style.display="inline-block";
                findbuttons[i].style.height=26+settings.extrapixels+"px";
                findbuttons[i].style.width="auto";
                findbuttons[i].style.margin="1px 1px 2px 1px";
                findbuttons[i].style.padding="1px 3px 0px 3px";
                findbuttons[i].style.outline="0px";
                findbuttons[i].style.verticalAlign="baseline";
                findbuttons[i].style.font=13+settings.extrapixels+"px sans-serif";
                findbuttons[i].style.cursor="pointer";
                findbuttons[i].style.backgroundColor=settings.buttonbackgrounddefault?"":settings.buttonbackgroundcolour;
                findbuttons[i].style.borderColor=settings.buttonbackgrounddefault?"":settings.buttonbackgroundcolour;
                findbuttons[i].image=document.createElement("img");
                findbuttons[i].image.src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAA7DAAAOwwHHb6hkAAAB"+findbuttonimagesuffices[i%findbuttonimagesuffices.length];
                findbuttons[i].image.alt="find";
                cssreset(findbuttons[i].image);
                findbuttons[i].image.style.height=16+settings.extrapixels+"px";
                findbuttons[i].image.style.width=16+settings.extrapixels+"px";
                findbuttons[i].image.style.verticalAlign=-2-settings.extrapixels/4+"px";
                findbuttons[i].appendChild(findbuttons[i].image);
                findbuttons[i].appendChild(document.createTextNode("\u00A0"+searchterms[i]));
                findbuttons[i].clickfunction=(function(searchterm){
                  return function(findprevious){
                    storedtext=box.value;
                    findinlasteventframe(searchterm,findprevious);
                  };
                })(searchterms[i]);
                addClickIncludingMiddleListener(findbuttons[i],(function(i){
                  return function(event){
                    findbuttons[i].clickfunction(event.button==1||event.altKey||event.ctrlKey||event.shiftKey||event.metaKey);
                  };
                })(i));
                findbuttonsdiv.appendChild(findbuttons[i]);
              }
              highlightorfindseparator.style.display=(settings.displayhighlightbutton||settings.displayfindbuttons)?"inline":"none";
            }
            else{
              highlightorfindseparator.style.display=settings.displayhighlightbutton?"inline":"none";
            }
            if(showing>0){
              iframe.style.width="100%";
              window.setTimeout(fixdisplay,1);
            }
          };
          optionspagelink=document.createElement("a");
          optionspagelink.href=chrome.runtime.getURL("options.html");
          addClickIncludingMiddleListener(optionspagelink,function(event){
            port.postMessage({
              "type":"url",
              "url":chrome.runtime.getURL("options.html"),
              "popup":popup
            });
            event.preventDefault();
          });
          optionspagelink.target="_blank";
          optionspagelink.title="选项/帮助";
          optionspagelink.separator=document.createElement("span");
          cssreset(optionspagelink.separator);
          optionspagelink.separator.appendChild(document.createTextNode(" | "));
          optionspageimage=document.createElement("img");
          optionspageimage.src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABmJLR0QA/wD/AP+gvaeTAAAEdUlEQVQ4jYWUbWxTVRjH/+fcc2/Xrmtvu64b61i7F2hhgyEEBkgREwhGRD4gkCAExIgxvCgkfhE+YIxi/ECUDyIOhaCJH1QIJG4YCeNNwOLAjZcxBmNrR9+7tWu7vtzeWz8oS4EFnuRJnic55/eck/8/D8FzYtGyreuqbNXbFUniPJ7BnRfaDpx71nn2PKDBIC5RieWzi3iGUDC0FMAzgbSwWbbmw1Vvbd171uncVgYAixbtYTq9pi6VkiDlFGi1mgbs2UMBYMnybS9tfO9T19IVO5yFDPKoeHn5ltUb169sMZSW6u509w52XOu8PH3a1LlDo/nK4NAoxzMeJh3LjgyH+gK+YM8ku92pcBojk0ceujo6V585sf/SY1/mZKlblhVZzilwTJlUNaNpyqpT528jGkuiiBdACDCSzAsqbYVjxuw6x1A0CTVPkYlnRhNU7hnjPCr6ejuCQvFEcebMxvn5PIisKJAlGfF4GjzjIDAGgXHgKEU2K0PFGLQqeeRGV9e77cf2d44rSjabjfOMQlaAXE5GIBiD3WaGLI0mOI5y4NTqQCgOSggoIVDxHE+JUlTI4AqbdzZ/cMBimVBOAPT2BWEu1aSuXnEddF24su5m960W5GWxwVHbkM0oVGAc7PUW3u/3W4rFmvaB+9eiAEDWbNy1c17zC2+KupIyi6ViAghjwXAc6bSErs7rJ7/6YvuKwqEf7z1ywWGfugB5oMpigMcbgd8biI+mEmHX39f306rKSmfT9MaZJnPFxGA4zQLBEXg8Q9AUMTzod1950mcP7rm7TEYtbNUmuN1DSMYk6LTGksm1jhqxRF/PvD5f7Po/t8MCrzEKKjVNJDIoEngwylBmNFifBNpqLVUVZj3u9viRy8go1nCK1+8NRCJSJJNJuwkALF68WS+UkDlzZ7/YYjZXWwkAnudAadp7/ETbqhO/7LsEAOs27X59w9qVR3VanX6gPwKecejq7uw81do27/Lln1NjKp8+/W0MwB/WqpoO+ySHNZ2SQAmBRmOoXL/2jdZXljj7OUqpzWqtqywv0wwPJVEk8FCrGQYGPRcfwZ6yzUC/77DUnHhNLWgFSgggAxxV6avLa5sIAXKjQCYlgREKtcCDEkWR07nIuLaZNWszv8DZeMRe57BSQqAS2JihGSVglENxsQqiQQOecZAlBTzliWjUTqaK+Fv3XVcYKFgO1jrdroXNc+fwhIKQbKbn/i2fVsNDp1VBLQhQq3gIjCEaied/bz9779a92w95FYc6q9VcbCrd8tQLeU57lTB+YU6RhOOtJ/cd/u7LTwLDSSUaixpmTGswIg+4bnT4D/34w/cHD322u6e3tzVPVE037/Tc+Obrj94GkHvSEdBXVxtstlkOADUAGgE0L311Q8tf53rzHecf5He8//mfAOYDaAJQD7XaAlEUC7V4TJSY2z0cgzsJQA0gBSARDHrPDHp9m0wmI/WFw30AAgDSAFJIpf7LghhvY2f/zxgA1NeInp9+PZZRFJIPhaIXAYTGuTMW/wLs+r0RwXE/QAAAAABJRU5ErkJggg==";
          optionspageimage.alt="Options";
          optionspageimage.style.display="inline-block";
          cssreset(optionspageimage);
          optionspageimage.style.margin="0px 1px 0px 1px";
          optionspagelink.appendChild(optionspageimage);
          if(popup){
            helpimage=document.createElement("img");
            helpimage.src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABmJLR0QA/wD/AP+gvaeTAAAEMUlEQVQ4ja2UWWzUVRSHv3v/23RKoVNmOrR0aqEUqC0FGQQEWa0ajBZUINEHCCZGEo0+GYIxWlyi6AuJQQIxEJA0URIRQhGKSsWAQgMl4sKwRbrQWTot7bRjmfkvPsy0URoSHzzJzX0453755Zzzu/A/h7hXYlrd1jwEG2ZVBmpLCsf5ADq7+yMXfu/4Vtj23tDhTYn/Bqyvl8s7ij5aVxd8oXbeFI+Ukkh8AIAJ3jGYls33LTd69hw8t7s5EN5Efb19T6D/sY9zVy0qP16/sXbhL9cifHHiEtc7e1GkRIhMdfnEAtbWVlM12cc7u7778avmaysiTa8Pjgau+VLZUCVOfvjqikXbGs7w06V2NE1FUxWklEgpcBwH23YwLYuFNQE2PvMgb3zyzQ+fvb16GQgHQBnmBWct+mD75lXPb2s4Q8sft8gxdAo8uTxccx9Lg2XMvb+E0qJ8wj1JANoifbSH+3jtuQVlZyK7lVuXjp4cAU6r25r34rPz9iaSKfehUyFyXDoul876J2pYs6yCyjIvFYECqieNZ2ZFIRevxjFtm85oPwH/WMqKPZU3uwM7Yn82pySAJcS6lUurvI2nr2DoKoau4jJ0pCK53pWg6Xw7LaEYQggmjnezsKYEl6Gj6xpNZ2/w1JJKX9rjXg+gAgSnFz2uqQpt4X7cOQa6pqHrKsfO3URKBU1TWDyzBMdxEEKQshwMXcO2bdqj/bg0lbmVpbVXDrJdBSj25XtjvYMoikRVMwBdVxFS4nJpzJk+gSUzirBtmxvhAa7e6kPXVUzLQk1bxG4nKSoc6x9RiMzMW5ESRZEoioKqKGiqSn5eDkurC5FYdPakONLSkcmrmRpVya6UzAxXBeiKJmJ+zxiEFEghkFKMwMflGsQH0oDkcmcCkKiKRMmukpQCb76bcGwgMqyNC6GOppRpMbnYM8o4Ll0hz1Bw65DrUnEAJ5tzgFL/OFJpi7O/tZ0YAQrL2dd46nL3ioemYDsOtm1j2TaWZWNaNppIY4g0qZSJaZpYloVl29i2zSNzymg8HYr2DTh7R4Chw5sSexrP76wuL2T2VH8GZFqk0ia9/UmuR1NcCd8h3DPI0J00qbSFaVrMLC9kamkBnx9p3Tlsv3942REvvX+o+b2XH128/9ivXLwWJcelYxgamqqiKBLHcUibFqlUmhllXtYsn86bnx5v3rF55fJR1oMtdKjBA7Ge3mWvrJ0fmFSUT7R3kNuJoRHFZtpiQoGbpxdXML+qmHd3nfi54cDRJ4e66oZGNT8bXnS9asHaLfv3Hz3f3xVPOLHbSSfUFndCbXGnuy/phOMDTsOx1sSC1W81gBYEAoA+DLj7PzQAHzDecPuK/bNXrpobfCBYWuzzCBzR1hXrPdfSeqGj9esjVjLeBfQAMaDvXsB/bQzgzt56ttYEhoC/sse6+9HfXvyuD9R6Y2oAAAAASUVORK5CYII=";
            helpimage.alt="?";
            helpimage.style.display="inline-block";
            cssreset(helpimage);
            helpimage.style.margin="0px 1px 0px 1px";
            helpimage.separator=document.createTextNode(" | ");
          }
          iframe.contentDocument.body.appendChild(searchbar);
          menu=document.createElement("bdi");
          menu.className=randomclass;
          cssreset(menu);
          menu.style.display="none";
          menu.style.position="fixed";
          menu.style.height="auto";
          menu.style.width="auto";
          menu.style.zIndex="2147483647";
          menu.style.border="1px solid #b0b0b0";
          menu.style.padding="2px";
          menu.style.background="#ffffff none";
          menu.style.maxHeight="none";
          menu.style.maxWidth="none";
          menu.style.minHeight="0px";
          menu.isreset=true;
          document.body.appendChild(menu);
          infoframe=document.createElement("iframe");
          infoframe.className=randomclass;
          infoframe.src="about:blank";
          infoframe.scrolling="no";
          cssreset(infoframe);
          infoframe.style.display="none";
          infoframe.style.position="fixed";
          infoframe.style.top="50%";
          infoframe.style.left="50%";
          infoframe.style.marginTop="-186px";
          infoframe.style.marginLeft="-202px";
          infoframe.style.zIndex="2147483645";
          infoframe.style.borderRadius="5px";
          infoframe.fixdisplay=function(){
            infoframe.style.display="block";
            infodiv.style.display="block";
            infoframe.style.width="100%";
            infoframe.style.boxShadow="none";
            customsearchdiv.trs[2].button.label.nodeValue=customsearchdiv.trs[2].button.showing?"隐藏高级选项":"显示高级选项";
            for(var i=3;i<8;i++){
              customsearchdiv.trs[i].style.display="table-row";
            }
            window.setTimeout(function(){
              infoframe.style.marginTop=parseInt(-infodiv.offsetHeight/2,10)+"px";
              infoframe.style.marginLeft=parseInt(-infodiv.offsetWidth/2,10)+"px";
              for(var i=3;i<8;i++){
                customsearchdiv.trs[i].style.display=customsearchdiv.trs[2].button.showing?"table-row":"none";
              }
              window.setTimeout(function(){
                infoframe.style.height=infodiv.offsetHeight+"px";
                infoframe.style.width=(infodiv.offsetWidth+1)+"px";
                infoframe.style.boxShadow="3px 3px 6px #888888";
              },0);
            },0);
          };
          document.body.appendChild(infoframe);
          infoframe.contentDocument.open("text/html","replace");
          infoframe.contentDocument.write("<!DOCTYPE html><html><head></head><body><div id=\"searchbarnoscriptinjection\" style=\"display:none;\"></body></html>");
          infoframe.contentDocument.close();
          infoframe.contentDocument.addEventListener("keydown",function(event){
            if(event.keyCode==27){
              infoframe.style.display="none";
              infodiv.style.display="none";
              focusonlasteventframe();
            }
          });
          infodiv=document.createElement("div");
          infodiv.style.display="none";
          infodiv.style.position="fixed";
          infodiv.style.top="0px";
          infodiv.style.left="0px";
          infodiv.style.height="auto";
          infodiv.style.width="auto";
          infodiv.style.border="1px solid #bababa";
          infodiv.style.padding="3px";
          infodiv.style.zIndex="2147483645";
          infodiv.style.backgroundColor="#f0f0f0";
          infodiv.style.font="14px sans-serif";
          infodiv.style.borderRadius="5px";
          infoheader=document.createElement("h2");
          infoheader.style.margin="5px";
          infoheader.img=document.createElement("img");
          infoheader.img.src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACYAAAAmCAYAAACoPemuAAAABmJLR0QA/wD/AP+gvaeTAAAKlUlEQVRYhe2Ya2wc13XH/+fOY7kvch8k13yKtEjJFqmYVWm1NEyLVvSA6xiu2kJB1cIuWn1pPxRoYQIFijYEDBuUaUs1UvQBNEDrfqrdD2mQgDRlU0pVWU4cSbEokbQlSqK4Wmq5JPc9uzsz955+sCisFbkRGaTohx7g4N45mHvnh/O4c2aA/6NCG13w+uuvR4UQzUT0CBFZUsqlSqVya2RkxP1fBzt+/HiLlPIP2traXu7s7OwOhULweDxwHAe5XA6Li4v29evX/8113XeHh4d/QET8SwU7ceJECMBfDQwM/Hlvby+klCiXy7BtG0opCCFgGAa8Xi9M08TNmzdx6tSpz4rF4p8MDw9P/VLARkdHd3Z0dPzX888/X2vbNrLZLG4tF/HJ1TTiKyXkSg78XgOtkRr0d4fRGfOjtrYWgUAAZ8+exYULF0Yty/rLkZERtRkw/UHGsbGxX+vp6fl4aGgIqVQKF6+t4p1TC9JVIlMXDiZD/rq1xrBZzhRs7cpyKXL285sx6TqRl55tN3/9sQY89dRTiEQifzE1NdXJzL+7mdD+DNixY8da29razg0NDWFp6Q7+deomPrmez+7c3v7p0BNNwc5Gf73H0COuYum4Ui5nK9nPbudnPr2+Un7ndGLXjz9P1//xb0h9+/btqFQq3xwbG/sMwLc2Cqbdb3jxxRf/4/Dhw50rKyv4p8l5zN2xE994ZseVbz7T8VhbfSDi0YV5N/7MDHgNzYiFaoItUb9REZ4r1xN5/nR+pa6vvUbv6urC8vLynv7+/vEPPvjg9kbAxH3e2j84ODhULBbxw0tJfJaopPYPbJvb/0TscY8udJ2gaUIQCQIRIIiYwQCBIgHDP/hYtL29PTaXzPPC9z9JuJlMBkNDQzBN862NeuxLYF6v96+3bNmCTDaP7/5oye7ubv7x4I76rQywlKxsKR3JymFmhwAHxI4QZAsiG0Su0L7IpS0dj1wev7CcXU3n4ff7sXXr1qdHR0ef3hTYa6+9Fuvu7n66Uqngh1dSCAQD8V2P1keIBLmKpctsS4myK7ksFVeYucKMCpgqYK4QuJIpOGkQ24IEh+rq5n/wk4QsFAp4/PHHIYT4nU2Bmab5jebmZlQqFZydTXNdKHitOVxTK6WU0lUVV6mSVKrkSlVSYMtVXALDYnAJRCUQlRKrpQSYLIArjY2hxNm5TLFcLiMUCsHr9R7eFBgz93i9XkgpkcqUHI/HU/CYQnekqriKy47DZVux5UouSheWYhQVswWwxYqtrOWmbmfKSQAWQCVNF6ViWbq27QAAamtrm8bGxvwPC3bvuGDmJk3TIBVDQbhCgBzJNhFJIpYguJCQgshlKEkghxmuYpIuS/f8fPqyUkrdrVgNDN0wtHK2aCMYlKipqQEzNwO4uiEwIvLoug7HccGsSCqocsW1BBkMKIeZpNLI0QQ5YDiC4CiwK6VUF+ezV5JZq0CADwRNgXRiGEop0jQBKSWICEopc8MeA3DHcRxomgZNkEbMMpW10026qGEWDmvCZsABoyIE2ZKVU7Zl/tzc2uXryWKZhPCBoTGUQQwTAq6SylPrM+69Y3VdT24YjJkXSqUSwuEwOhp9RsGywleTnjs1NVptyGeSUspmhQprWtmy7eVkzr1+8drKzZLrGiAKMEMnYg+YXAjIUtk2wwFDaJoGIkIul1t55ZVXVjYMJoQYX1hYGG1qasLenQ303o9S3T6f78Z/TqeWDQ1WwOcpk1D5rGWvKYkMg/OktIoCgtDIJVaKQYrArJj4zp3V7uf6GoMejwcrKytYWlr67sNCAVVVOTw8fCkej8c1TUP/tiig7OZKxQ4yKbIVq9ViqbKWdyqOC1ZgTSmYSmMfiHUhlQYmwYqImcituDV2qbJjb98jmmmamJ6ehmVZ720KDADy+fzY1atXEYlEcHRfh7lw8/ZzrqsMItaIhc5ggwCTIWoA8rOigIDmU0QmAIOIdcWkz83f+s0//Hp7JFRXi3Q6jenp6Z+eOHHi5KbBPB7PP54/f37JdV30bWvCbw00hT6/dutIqewGAWWCycPgGmL2CYEAoIKA8guGj8A1jiMDV2bmf//gE/XNA71NQtd1jI+PI51OfxvAhlqfL3UX4+Pjcs+ePbOpVOr3ent70RkLIFzDvg8+WdgpXaUCAf8dIgIzaQw2iIUJsIeIvIuJ1K/eXFh6+cietqbfHtxqhkIhrK2t4W6OvRCNRkuzs7MfbQoMAE6ePHl19+7dVj6f379t2zY82hLB7q0BM76cf/Snc7d3F/LFznzBas0WrFgmk9+ZSqWfXowvH+qs9+x85dD2uqe+tkX4/X7kcjnE43FcuHABjY2NVFtbu1/X9diuXbsmZmZmfq73vrK1fuONN/6sqanp+L59+xAOh1EoFJDN5jC7mMWddBlrBRt1PgOxUA16toQQqgsiGAwil8thamoKAwMDOH/+PNLpNNbW1hCNRpHL5fD++++Pl0qlw6dPny5sCgwAjh079nWv1/sPPT09XT09PQgGgxBCwHXdex8juq5DKYVisYjZ2VmcOXOmnEgkao4ePYqZmRl4PB5YloVUKoVwOAzbtjExMXHZsqyDJ0+eTGwKDABGRkZ0v9//smmafxqLxXY2NDRQIBBAIBBAuVxGoVBAKpXCjRs3VpaWlv4+m83+jW3bQ9u3b//33t5eKhaL0DQNSikkk0n4fD4IIXDq1KnkysrKvsnJycubAquW0dHRdiHEPmZuJ6IYgJLruvFSqXTm1Vdf/QmqKu/gwYNHduzY8S+Dg4O6bduQUsIwDCSTSQgh4PV68dFHH5Xi8fgLExMTH/5CYHfvr9b/aQ8+cODAM+3t7d87cOCAn4hgWRaCwSCSySQcx0EgEMClS5fU3NzcH01MTPxz9eKfqcqqh2l3Vb+rBgDz7vgwqs/PzydM0/ze0tLSC11dXUG/349sNov6+no4joNCoYDOzk7yer0v+nw+unbt2ul1gOrugvDFgbuu918LAPTWW281PPnkk23RaDTm8XiCQghTSilLpZK1tra2evHixcXjx48vLy4uugD4448/vpVOp/dalvXuoUOHvhYOh7G2toZwOAzDMEBEOHLkCNXV1X0LwJWJiYn3qj0mqjxU7aV7euTIkdq33377if7+/t0tLS0D0Wj0mUgkciAcDj8XDAZ/JRAItNfW1ja2tLTUP/vss4GGhgb33LlzNgBtdXW1nMvl3l1eXt7W2traHYvFkMlkEI1G0dfXB8Mw0NfXh8nJyYa5ubl31sGqPaN91Xx6elq1tLRwJBIxACjXdUuO46xalrWQz+cX0ul0PJVKLcXj8aUzZ87Ex8bGUqjKxUKhIBOJxPfz+bw/HA73t7a2IhaLwe//otv2eDyYmJhYnZ2d/Q4AXk/cnwf2IBu1tbUZPp9Pt20bN27cqP4NxQDUV+nevXuPDgwMvP7SSy+Rz+cDEWFmZgZvvvnm8OTk5HEAaj3H1H2bruv9OSer5rS4uGjjyxX6oD3WIe/BTk1N/R0zX11YWPjbwcHBRzKZjDp9+vR3NE379jrLg0p9PbTVIa62PcyRwVXjVwFyV1cXdXR0bGPmxIcffrh6P8TDyIPA8ICxGup+MFSB/cI/9v5f7pf/Bj5kZhaKbyyLAAAAAElFTkSuQmCC";
          infoheader.img.style.verticalAlign="middle";
          infoheader.appendChild(infoheader.img);
          infoheader.appendChild(document.createTextNode(" 添加自定义搜索到 SearchBar"));
          infooptionspagelink=document.createElement("a");
          infooptionspagelink.href=chrome.runtime.getURL("options.html")+"#customsearches";
          addClickIncludingMiddleListener(infooptionspagelink,function(event){
            port.postMessage({
              "type":"url",
              "url":chrome.runtime.getURL("options.html")+"#customsearches",
              "popup":popup
            });
            event.preventDefault();
          });
          infooptionspagelink.target="_blank";
          infooptionspagelink.title=optionspagelink.title;
          infooptionspagelink.style.float="right";
          infooptionspagelink.img=document.createElement("img");
          infooptionspagelink.img.src=optionspageimage.src;
          infooptionspagelink.img.alt=optionspageimage.alt;
          infooptionspagelink.img.style.display="inline-block";
          infooptionspagelink.img.style.height="20px";
          infooptionspagelink.img.style.width="20px";
          cssreset(infooptionspagelink.img);
          infooptionspagelink.img.style.margin="3px 4px 3px 4px";
          infooptionspagelink.appendChild(infooptionspagelink.img);
          customsearchdiv=document.createElement("div");
          customsearchdiv.preview=document.createElement("div");
          customsearchdiv.preview.style.margin="3px";
          customsearchdiv.preview.style.fontWeight="bold";
          customsearchdiv.preview.button=document.createElement("button");
          customsearchdiv.preview.button.style.display="inline-block";
          customsearchdiv.preview.button.style.margin="1px 1px 2px 1px";
          customsearchdiv.preview.button.style.padding="1px 3px 0px 3px";
          customsearchdiv.preview.button.style.outline="0px";
          customsearchdiv.preview.button.style.verticalAlign="baseline";
          customsearchdiv.preview.button.img=document.createElement("img");
          cssreset(customsearchdiv.preview.button.img);
          customsearchdiv.preview.button.appendChild(customsearchdiv.preview.button.img);
          customsearchdiv.preview.appendChild(document.createTextNode("按钮预览："));
          customsearchdiv.preview.appendChild(customsearchdiv.preview.button);
          customsearchdiv.table=document.createElement("table");
          customsearchdiv.table.style.borderCollapse="collapse";
          customsearchdiv.table.style.fontWeight="bold";
          customsearchdiv.trs=[];
          customsearchdiv.texts=["描述","热键","","主页 URL","搜索 URL","图标 URI","新标签页热键","新标签页热键"];
          customsearchdiv.smalltexts=["","(按叉键移除)\u00A0","","","用 %s 替代搜索词","","– 后台标签页","– 前台标签页"];
          customsearchdiv.inputs=[];
          for(var i=0;i<8;i++){
            customsearchdiv.trs[i]=document.createElement("tr");
            if(i==2){
              customsearchdiv.trs[2].td=document.createElement("td");
              customsearchdiv.trs[2].td.colSpan="2";
              customsearchdiv.trs[2].button=document.createElement("button");
              customsearchdiv.trs[2].button.style.fontSize="12px";
              customsearchdiv.trs[2].button.showing=false;
              customsearchdiv.trs[2].button.label=document.createTextNode("");
              customsearchdiv.trs[2].button.appendChild(customsearchdiv.trs[2].button.label);
              customsearchdiv.trs[2].button.addEventListener("click",function(event){
                customsearchdiv.trs[2].button.showing=!customsearchdiv.trs[2].button.showing;
                infoframe.fixdisplay();
              });
              customsearchdiv.trs[2].td.appendChild(customsearchdiv.trs[2].button);
              customsearchdiv.trs[2].appendChild(customsearchdiv.trs[2].td);
            }
            else{
              customsearchdiv.trs[i].tds=[document.createElement("td"),document.createElement("td")];
              customsearchdiv.trs[i].tds[0].small=document.createElement("small");
              customsearchdiv.trs[i].tds[0].small.style.fontSize="12px";
              customsearchdiv.trs[i].tds[0].small.appendChild(document.createTextNode(customsearchdiv.smalltexts[i]));
              customsearchdiv.trs[i].tds[0].appendChild(document.createTextNode(customsearchdiv.texts[i]));
              customsearchdiv.trs[i].tds[0].appendChild(document.createElement("br"));
              customsearchdiv.trs[i].tds[0].appendChild(customsearchdiv.trs[i].tds[0].small);
              customsearchdiv.trs[i].appendChild(customsearchdiv.trs[i].tds[0]);
              customsearchdiv.inputs[i]=document.createElement("input");
              customsearchdiv.trs[i].tds[1].appendChild(customsearchdiv.inputs[i]);
              if(i==0||i==3||i==4){
                customsearchdiv.inputs[i].size=36;
              }
              else if(i==5){
                customsearchdiv.inputs[i].size=27;
                customsearchdiv.fileinputbutton=document.createElement("button");
                customsearchdiv.fileinputbutton.appendChild(document.createTextNode("上传"));
                customsearchdiv.fileinputbutton.addEventListener("click",function(){
                  customsearchdiv.fileinput.click();
                });
                customsearchdiv.trs[i].tds[1].appendChild(customsearchdiv.fileinputbutton);
                customsearchdiv.fileinput=document.createElement("input");
                customsearchdiv.fileinput.type="file";
                customsearchdiv.fileinput.accept="image/*";
                customsearchdiv.fileinput.style.display="none";
                customsearchdiv.fileinput.addEventListener("change",function(){
                  getimagedata(customsearchdiv.fileinput,function(imagedata){
                    customsearchdiv.inputs[5].value=imagedata;
                    customsearchdiv.inputs[5].changefunction();
                  });
                });
                customsearchdiv.trs[i].tds[1].appendChild(customsearchdiv.fileinput);
              }
              else{
                customsearchdiv.inputs[i].size=32;
                customsearchdiv.inputs[i].hotkeyvalue=[false,false,false,false,false];
                customsearchdiv.inputs[i].addEventListener("keydown",(function(i){
                  return function(event){
                    if((event.keyCode<15||event.keyCode>18)&&event.keyCode!=9){
                      this.hotkeyvalue=[event.keyCode,event.altKey,event.ctrlKey,event.shiftKey,event.metaKey];
                      this.value=hotkeytotext(this.hotkeyvalue);
                      if(i==1){
                        if(customsearchdiv.hotkeyautofill[0]){
                          customsearchdiv.inputs[6].hotkeyvalue=event.ctrlKey?[false,false,false,false,false]:[event.keyCode,event.altKey,true,event.shiftKey,event.metaKey];
                          customsearchdiv.inputs[6].value=hotkeytotext(customsearchdiv.inputs[6].hotkeyvalue);
                        }
                        if(customsearchdiv.hotkeyautofill[1]){
                          customsearchdiv.inputs[7].hotkeyvalue=(event.ctrlKey||event.shiftKey)?[false,false,false,false,false]:[event.keyCode,event.altKey,true,true,event.metaKey];
                          customsearchdiv.inputs[7].value=hotkeytotext(customsearchdiv.inputs[7].hotkeyvalue);
                        }
                      }
                      else if(i==6){
                        if(customsearchdiv.hotkeyautofill[1]){
                          customsearchdiv.inputs[7].hotkeyvalue=((!event.ctrlKey)||event.shiftKey)?[false,false,false,false,false]:[event.keyCode,event.altKey,true,true,event.metaKey];
                          customsearchdiv.inputs[7].value=hotkeytotext(customsearchdiv.inputs[7].hotkeyvalue);
                        }
                        customsearchdiv.hotkeyautofill[0]=false;
                      }
                      else{
                        customsearchdiv.hotkeyautofill[1]=false;
                      }
                      event.preventDefault();
                    }
                  };
                })(i));
                customsearchdiv.inputs[i].cross=document.createElement("button");
                customsearchdiv.inputs[i].cross.title="remove";
                customsearchdiv.inputs[i].cross.style.height="20px";
                customsearchdiv.inputs[i].cross.style.width="20px";
                customsearchdiv.inputs[i].cross.style.padding="0px";
                customsearchdiv.inputs[i].cross.img=document.createElement("img");
                customsearchdiv.inputs[i].cross.img.src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACvUlEQVQ4jW3TT08TQRgG8GdnpkuhxZaCYKEIippsuxuNKMYD6EUUDQkIHL0g8WS8izHphzAhfgETQruBCx6UpAc8GA94QIkhNhZq+Q+1tOzSndn1gC1C+hxn8kvevE9ein+Z6JDVgTN0rPOP+JQAHFRIFCD3W9jL7hq2lyiIzfLH25CsLkTOG9n+PuddqDoeBUgl/CYoxxduaU6sPWC8bpJVAKATrbLa5Tv3RRt44mahdoQkWdnKpbRreRErTRIFSH1QnuruUB97Q+0I+AOMZ7dGL1Y5M7TPR5/1RG73spY2cF4EDdSjWZKVNSMdubEv4ncBKRCUJ3s61CFPsBXCKsJ2AHZosuV8do125cT8diGttUqyQgP14EULxOdHi8TCaWM94vbSkTuX1OES5pwjm0khsf5Ld23wFzQBOFdzPLaeW9GaJVmhPj9sywKt9SFIWbjN3xA+jecySd1Z5yNRwKYAkACc63kRWy2ktVbCFFrrg+BF0BovmKe2jPcyKcylkzo2jjAA0NKWE4DTlRexlYOM1kKYQj1eCM7LeDeTwofVpE62jjFQoS4LsC0hTmBhFSFsAcc+hqWUJ4gCxNPIJu9d1oY9wfMnMbdA5SqcpVL4hziI9Bp2vFQxLeHqRjbZe+Uk3sukUMjnQGUZQnAw5kIDccLfnYPIQwPxBODQKEDcjWzyQQX8PpXUl3PZpSYqKYy5wC0LLspQT6XwomRG+g3EaWcTezV4QXnuDbWfWNhsKqlX7fARl2FPLYqC1kSguCgDFxwuicAv2eF5h3NigUwvraXNYmH/GK8mdffO0bajgF23I0Y+bm3q2/ksBOcw+SF+moemQ+1p+rkgNhvc9gzZ3RitKpps9ndKrz5VVQJwHhmIfYWpBYhQlgoH5reidXN6D4vlOp7WyepYHRmvdIn/NzXkI+ODdVBLb38BroR/wFohUYYAAAAASUVORK5CYII=";
                customsearchdiv.inputs[i].cross.img.style.verticalAlign="-3px";
                customsearchdiv.inputs[i].cross.appendChild(customsearchdiv.inputs[i].cross.img);
                customsearchdiv.inputs[i].cross.addEventListener("click",(function(i){
                  return function(){
                    customsearchdiv.inputs[i].hotkeyvalue=[false,false,false,false,false];
                    customsearchdiv.inputs[i].value="";
                    if(i==1){
                      if(customsearchdiv.hotkeyautofill[0]){
                        customsearchdiv.inputs[6].hotkeyvalue=[false,false,false,false,false];
                        customsearchdiv.inputs[6].value="";
                      }
                      if(customsearchdiv.hotkeyautofill[1]){
                        customsearchdiv.inputs[7].hotkeyvalue=[false,false,false,false,false];
                        customsearchdiv.inputs[7].value="";
                      }
                    }
                    else if(i==6){
                      if(customsearchdiv.hotkeyautofill[1]){
                        customsearchdiv.inputs[7].hotkeyvalue=[false,false,false,false,false];
                        customsearchdiv.inputs[7].value="";
                      }
                      customsearchdiv.hotkeyautofill[0]=false;
                    }
                    else{
                      customsearchdiv.hotkeyautofill[1]=false;
                    }
                  };
                })(i));
                customsearchdiv.trs[i].tds[1].appendChild(customsearchdiv.inputs[i].cross);
              }
              customsearchdiv.trs[i].appendChild(customsearchdiv.trs[i].tds[1]);
            }
            customsearchdiv.table.appendChild(customsearchdiv.trs[i]);
          }
          customsearchdiv.inputs[0].changefunction=function(){
            customsearchdiv.preview.button.title=this.value;
          };
          customsearchdiv.inputs[0].addEventListener("keyup",customsearchdiv.inputs[0].changefunction);
          customsearchdiv.inputs[0].addEventListener("change",customsearchdiv.inputs[0].changefunction);
          customsearchdiv.inputs[5].changefunction=function(){
            customsearchdiv.fileinput.value="";
            customsearchdiv.preview.button.img.src=this.value;
          };
          customsearchdiv.inputs[5].addEventListener("keyup",customsearchdiv.inputs[5].changefunction);
          customsearchdiv.inputs[5].addEventListener("change",customsearchdiv.inputs[5].changefunction);
          customsearchdiv.buttons=document.createElement("div");
          customsearchdiv.buttons.style.margin="3px";
          customsearchdiv.buttons.accept=document.createElement("button");
          customsearchdiv.buttons.accept.appendChild(document.createTextNode("添加到 SearchBar"));
          customsearchdiv.buttons.accept.addEventListener("click",function(){
            infoframe.style.display="none";
            infodiv.style.display="none";
            focusonlasteventframe();
            port.postMessage({
              "type":"custombutton",
              "custombutton":[true,false,[customsearchdiv.inputs[1].hotkeyvalue,customsearchdiv.inputs[6].hotkeyvalue,customsearchdiv.inputs[7].hotkeyvalue],customsearchdiv.inputs[0].value,customsearchdiv.inputs[3].value,customsearchdiv.inputs[4].value],
              "i":customsearchdiv.inputs[5].value
            });
          });
          customsearchdiv.buttons.cancel=document.createElement("button");
          customsearchdiv.buttons.cancel.appendChild(document.createTextNode("取消"));
          customsearchdiv.buttons.cancel.addEventListener("click",function(){
            infoframe.style.display="none";
            infodiv.style.display="none";
            focusonlasteventframe();
          });
          customsearchdiv.buttons.appendChild(customsearchdiv.buttons.accept);
          customsearchdiv.buttons.appendChild(customsearchdiv.buttons.cancel);
          customsearchdiv.appendChild(customsearchdiv.preview);
          customsearchdiv.appendChild(customsearchdiv.table);
          customsearchdiv.appendChild(customsearchdiv.buttons);
          customsearcherrordiv=document.createElement("div");
          customsearcherrordiv.messages=[document.createElement("div"),document.createElement("div")];
          customsearcherrordiv.messages[0].style.margin="3px";
          customsearcherrordiv.messages[0].appendChild(document.createTextNode("SearchBar 检测不到此自定义搜索的设置。"));
          customsearcherrordiv.messages[0].appendChild(document.createElement("br"));
          customsearcherrordiv.messages[0].appendChild(document.createTextNode("请等待页面完成加载然后重试。"));
          customsearcherrordiv.messages[1].style.margin="3px";
          customsearcherrordiv.messages[1].appendChild(document.createTextNode("SearchBar 检测不到此自定义搜索的设置。"));
          customsearcherrordiv.messages[1].appendChild(document.createElement("br"));
          customsearcherrordiv.messages[1].appendChild(document.createTextNode("也许可以通过选项页面手动添加该自定义搜索。"));
          customsearcherrordiv.button=document.createElement("button");
          customsearcherrordiv.button.style.margin="3px";
          customsearcherrordiv.button.appendChild(document.createTextNode("关闭"));
          customsearcherrordiv.button.addEventListener("click",function(){
            infoframe.style.display="none";
            infodiv.style.display="none";
            focusonlasteventframe();
          });
          customsearcherrordiv.appendChild(customsearcherrordiv.messages[0]);
          customsearcherrordiv.appendChild(customsearcherrordiv.messages[1]);
          customsearcherrordiv.appendChild(customsearcherrordiv.button);
          infodiv.appendChild(infoheader);
          infodiv.appendChild(infooptionspagelink);
          infodiv.appendChild(customsearchdiv);
          infodiv.appendChild(customsearcherrordiv);
          infoframe.contentDocument.body.appendChild(infodiv);
          var init=function(){
            if(settings.position[0]=="bottom"){
              iframe.style.top="auto";
              iframe.style.bottom="0px";
              searchbar.style.top="auto";
              searchbar.style.bottom="0px";
              searchbar.style.borderTop="1px solid #bababa";
              searchbar.style.borderBottom="0px";
              if(popup){
                searchbar.style.borderTop="0px";
              }
            }
            else{
              iframe.style.top="0px";
              iframe.style.bottom="auto";
              searchbar.style.top="0px";
              searchbar.style.bottom="auto";
              searchbar.style.borderTop="0px";
              searchbar.style.borderBottom="1px solid #bababa";
              if(popup){
                searchbar.style.borderBottom="0px";
              }
            }
            if(settings.position[1]=="right"){
              iframe.style.left="auto";
              iframe.style.right="0px";
              searchbar.style.left="auto";
              searchbar.style.right="0px";
              searchbar.style.borderLeft=settings.pinned?"0px":"1px solid #bababa";
              searchbar.style.borderRight="0px";
              searchbar.style.textAlign="right";
              if(popup){
                searchbar.style.borderLeft="0px";
              }
            }
            else{
              iframe.style.left="0px";
              iframe.style.right="auto";
              searchbar.style.left="0px";
              searchbar.style.right="auto";
              searchbar.style.borderLeft="0px";
              searchbar.style.borderRight=settings.pinned?"0px":"1px solid #bababa";
              searchbar.style.textAlign="left";
              if(popup){
                searchbar.style.borderRight="0px";
              }
            }
            iframe.style.height=36+settings.extrapixels+"px";
            iframe.style.width="100%";
            searchbar.style.width=settings.pinned?"100%":"auto";
            searchbar.style.font=16+settings.extrapixels+"px sans-serif";
            searchbar.style.backgroundColor=settings.searchbarbackgroundcolour;
            box.type=settings.displayboxclear?"search":"text";
            box.style.width=250+settings.extrapixels*4+settings.extraboxpixels+"px";
            box.style.font=16+settings.extrapixels+"px sans-serif";
            cross.title="隐藏 SearchBar"+(settings.hotkeys.hide[0]===false?"":(" ("+hotkeytotext(settings.hotkeys.hide)+")"));
            cross.style.display=settings.displaycross?"inline-block":"none";
            images[0].alt="x";
            for(var i=0;i<settings.custombuttons.length;i++){
              createbutton(i+2,settings.custombuttons[i][0],settings.custombuttons[i][2],settings.custombuttons[i][3],settings["i"+(i+1).toString()],settings.custombuttons[i][4],settings.custombuttons[i][5]);
            }
            highlightorfindseparator.style.display=settings.displayhighlightbutton?"inline":"none";
            buttons[1].title="高亮搜索项目"+(settings.hotkeys.highlight[0]===false?"":(" ("+hotkeytotext(settings.hotkeys.highlight)+")"));
            buttons[1].style.display=settings.displayhighlightbutton?"inline-block":"none";
            images[1].alt="highlight";
            findbuttonsdiv.style.display=settings.displayfindbuttons?"inline-block":"none";
            for(var i=0;i<buttons.length;i++){
              if(i>=2){
                buttons[i].style.display="inline-block";
              }
              buttons[i].style.height=26+settings.extrapixels+"px";
              buttons[i].style.width=26+settings.extrapixels+"px";
              buttons[i].style.margin="1px 1px 2px 1px";
              buttons[i].style.padding="1px 3px 0px 3px";
              buttons[i].style.outline="0px";
              buttons[i].style.verticalAlign="baseline";
              buttons[i].style.cursor="pointer";
              buttons[i].style.backgroundColor=settings.buttonbackgrounddefault?"":settings.buttonbackgroundcolour;
              buttons[i].style.borderColor=settings.buttonbackgrounddefault?"":settings.buttonbackgroundcolour;
              cssreset(images[i]);
              images[i].style.height=16+settings.extrapixels+"px";
              images[i].style.width=16+settings.extrapixels+"px";
              images[i].style.verticalAlign=-2-settings.extrapixels/4+"px";
            }
            optionspageimage.style.height=20+settings.extrapixels+"px";
            optionspageimage.style.width=20+settings.extrapixels+"px";
            optionspageimage.style.verticalAlign=-4-settings.extrapixels/4+"px";
            optionspagelink.style.display=settings.displayoptionspagelink?"inline":"none";
            optionspagelink.separator.style.display=settings.displayoptionspagelink?"inline":"none";
            if(popup){
              helpimage.title="This is the \"popup\" version of SearchBar designed for the New Tab page, Chrome settings pages, and web pages on which you have chosen to prevent SearchBar from running. \n\n"+(settings.forcepopup?"It is being displayed because you have selected the \"Always show SearchBar in a popup when I press the toolbar button\" option.":"The full version is accessible from any ordinary web page on which you have allowed SearchBar to run. If you are on such a web page, please try again after the page has finished loading.");
              helpimage.style.height=22+settings.extrapixels+"px";
              helpimage.style.width=22+settings.extrapixels+"px";
              helpimage.style.verticalAlign=-4-settings.extrapixels/4+"px";
            }
            if(settings.direction=="ltr"||settings.direction=="initial"){
              searchbar.appendOrPrependChild=searchbar.appendChild;
            }
            else if(settings.direction=="rtl"){
              searchbar.appendOrPrependChild=function(child){
                if(searchbar.hasChildNodes()){
                  searchbar.insertBefore(child, searchbar.firstChild)
                }
                else{
                  searchbar.appendChild(child)
                }
              }
            }
            searchbar.appendOrPrependChild(cross);
            searchbar.appendOrPrependChild(box);
            for(var i=0;i<settings.custombuttons.length;i++){
              if(settings.custombuttons[i][0]){
                if(settings.custombuttons[i][1]){
                  if(settings.separatorsaslinebreaks){
                    buttons[i+2].separator=document.createElement("span");
                    buttons[i+2].separator.appendChild(document.createElement("br"));
                  }
                  else{
                    buttons[i+2].separator=document.createTextNode(" | ");
                  }
                  searchbar.appendOrPrependChild(buttons[i+2].separator);
                }
                searchbar.appendOrPrependChild(buttons[i+2]);
              }
            }
            searchbar.appendOrPrependChild(highlightorfindseparator);
            searchbar.appendOrPrependChild(buttons[1]);
            searchbar.appendOrPrependChild(findbuttonsdiv);
            searchbar.appendOrPrependChild(optionspagelink.separator);
            searchbar.appendOrPrependChild(optionspagelink);
            if(popup){
              searchbar.appendOrPrependChild(helpimage.separator);
              searchbar.appendOrPrependChild(helpimage);
            }
            options=new Array(settings.maximumnumberofsearchsuggestions+settings.maximumnumberofsearchhistorysuggestions);
            for(var i=0;i<options.length;i++){
              options[i]=document.createElement("bdi");
              options[i].style.display="block";
              cssreset(options[i]);
              options[i].style.position="static";
              options[i].style.height="auto";
              options[i].style.width="auto";
              options[i].style.zIndex="2147483647";
              options[i].style.font=16+settings.extrapixels+"px sans-serif";
              options[i].style.textAlign="left";
              options[i].style.color=i<settings.maximumnumberofsearchsuggestions?"#000000":"#0000ff";
              options[i].style.background="#ffffff none";
              options[i].style.cursor="default";
              options[i].style.maxHeight="none";
              options[i].style.maxWidth="none";
              options[i].style.minHeight="0px";
              options[i].style.minWidth="0px";
              options[i].style.letterSpacing="normal";
              options[i].style.lineHeight="normal";
              options[i].style.textDecoration="none";
              options[i].style.textIndent="0";
              options[i].style.textTransform="none";
              options[i].style.wordSpacing="normal";
              options[i].style.wordWrap="normal";
              options[i].style.whiteSpace="pre";
              options[i].addEventListener("mouseover",(function(n){
                return function(){
                  highlightoption(n);
                };
              })(i));
              options[i].addEventListener("mouseout",function(){
                highlightoption(-1);
              });          
              options[i].addEventListener("click",(function(n){
                return function(){
                  box.value=searchsuggestions.concat(new Array(settings.maximumnumberofsearchsuggestions-searchsuggestions.length),searchhistorysuggestions)[n];
                  getsuggestions(settings.sendsearchsuggestions);
                };
              })(i));
              options[i].addEventListener("mousedown",function(event){
                event.preventDefault();
              });
              menu.appendChild(options[i]);
            }
            customsearchdiv.preview.button.style.height=26+settings.extrapixels+"px";
            customsearchdiv.preview.button.style.width=26+settings.extrapixels+"px";
            customsearchdiv.preview.button.style.backgroundColor=settings.buttonbackgrounddefault?"":settings.buttonbackgroundcolour;
            customsearchdiv.preview.button.style.borderColor=settings.buttonbackgrounddefault?"":settings.buttonbackgroundcolour;
            customsearchdiv.preview.button.img.style.height=16+settings.extrapixels+"px";
            customsearchdiv.preview.button.img.style.width=16+settings.extrapixels+"px";
            customsearchdiv.preview.button.img.style.verticalAlign=-2-settings.extrapixels/4+"px";
            if(infoframe.style.display=="block"){
              infoframe.fixdisplay();
            }
          };
          init();
          chrome.storage.onChanged.addListener(function(changes,areaName){
            if(areaName=="local"){
              var refresh=false;
              for(var key in changes){
                if(changes.hasOwnProperty(key)&&key.charAt(0)!="_"){
                  refresh=true;
                }
              }
              if(refresh){
                window.clearTimeout(changedtimeout);
                changedtimeout=window.setTimeout(function(){
                  chrome.storage.local.get(null,function(newsettings){
                    resetmenu();
                    for(var i=0;i<settings.custombuttons.length;i++){
                      if(settings.custombuttons[i][0]){
                        if(settings.custombuttons[i][1]){
                          searchbar.removeChild(buttons[i+2].separator);
                        }
                        searchbar.removeChild(buttons[i+2]);
                      }
                    }
                    for(var i=0;i<options.length;i++){
                      menu.removeChild(options[i]);
                    }
                    settings=newsettings;
                    if(popup){
                      settings.position=["top","left"];
                      settings.displayhighlightbutton=false;
                      settings.displayfindbuttons=false;
                      settings.pinned=false;
                      settings.hotkeys.show=[false,false,false,false,false];
                    }
                    if(window.location.href.search(/https?:\/\/www.google.[^\/]*\/maps/)==0){
                      settings.pinned=false;
                    }
                    init();
                    if(settings.pinned&&settings.position[0]=="top"&&showing>0){
                      document.documentElement.style.position="relative";
                    }
                    else{
                      document.documentElement.style.position="static";
                    }
                    if(!(settings.pinned&&settings.position[0]=="bottom"&&showing>0)){
                      document.documentElement.style.paddingBottom="0px";
                    }
                    findbuttonsreset();
                  });
                },100);
              }
            }
          });
          addEventListenerToAllFrames(true,"keydown",buttons[1].hotkeyfunction);
          addEventListenerToAllFrames(true,"keydown",function(event){
            var showhotkeypressed=event.keyCode==settings.hotkeys.show[0]&&event.keyCode>0&&event.altKey==settings.hotkeys.show[1]&&event.ctrlKey==settings.hotkeys.show[2]&&event.shiftKey==settings.hotkeys.show[3]&&event.metaKey==settings.hotkeys.show[4];
            var hidehotkeypressed=event.keyCode==settings.hotkeys.hide[0]&&event.keyCode>0&&event.altKey==settings.hotkeys.hide[1]&&event.ctrlKey==settings.hotkeys.hide[2]&&event.shiftKey==settings.hotkeys.hide[3]&&event.metaKey==settings.hotkeys.hide[4];
            if(showhotkeypressed&&((!hidehotkeypressed)||showing!=1)){
              port.postMessage({
                "type":"showallatonce"
              });
              show(true);
              showing=1;
              window.setTimeout(function(){box.focus();}, 1);
            }
            else if(settings.escfromanywhere==true&&hidehotkeypressed){
              if(box.isfocused>0){
                box.blur();
              }
              if(showing>0){
                if(showing==2){
                  showontextselectionoverride=true;
                }
                port.postMessage({
                  "type":"hideallatonce"
                });
                hide();
                focusonlasteventframe();
              }
            }
            if(settings.displayfindbuttons&&showing>0){
              for(var j=0;j<2;j++){
                for(var i=0;i<Math.min(findbuttons.length,settings.findbuttonhotkeys.length);i++){
                  if(event.keyCode==settings.findbuttonhotkeys[i][j][0]&&event.keyCode>0&&event.altKey==settings.findbuttonhotkeys[i][j][1]&&event.ctrlKey==settings.findbuttonhotkeys[i][j][2]&&event.shiftKey==settings.findbuttonhotkeys[i][j][3]&&event.metaKey==settings.findbuttonhotkeys[i][j][4]){
                    findbuttons[i].clickfunction(j==1);
                    findbuttons[i].focus();
                    i=findbuttons.length;
                    j=2;
                  }
                }
              }
            }
          });
          var selectioncheck=function(event){
            if(settings.removewhitespace){
              event.selection=removeleadingandtrailingwhitespace(event.selection);
            }
            if(box.isfocused==0){
              if(event.selection==""){
                if(showing==2){
                  hide();
                }
                box.value=storedtext;
                findbuttonsreset();
              }
              else{
                box.value=event.selection;
                findbuttonsreset();
                if(settings.showontextselectionexception&&(event.activetag=="input"||event.activetag=="textarea"||event.activeeditable=="true")){
                  if(showing==2){
                    hide();
                  }
                }
                else{
                  if(settings.showontextselection&&showing==0&&showontextselectionoverride==false){
                    show(true);
                    showing=2;
                  }
                }
              }
            }
          };
          addEventListenerToAllFrames(false,"keyup",selectioncheck);
          addEventListenerToAllFrames(false,"mouseup",selectioncheck);
          port.onMessage.addListener(function(message){
            if(message.type=="init"){
              storedtext=settings.searchremember?message.lastsearch[0]:"";
              if(message.lastsearch[1]&&settings.detect){
                var popuplatestrings=settings.detectprimary?[settings.custombuttons[0][5]]:settings.detectcustom;
                var numberofpopulatestrings=popuplatestrings.length;
                for(var i=0;i<numberofpopulatestrings;i++){
                  if(popuplatestrings[i].indexOf("http://")==0){
                    popuplatestrings.push("https://"+popuplatestrings[i].substr(7));
                  }
                  else if(popuplatestrings[i].indexOf("https://")==0){
                    popuplatestrings.push("http://"+popuplatestrings[i].substr(8));
                  }
                }
                for(var i=0;i<popuplatestrings.length;i++){
                  var searchstringpattern=new RegExp(popuplatestrings[i].replace(/[\-\/\\\^\$\*\+\?\.\(\)\|\{\}\[\]]/g,"\\$&").replace(/%s/g,"([^&#]*)").replace(/%[hu]/g,"[^&#]*"));
                  if(window.location.href.search(searchstringpattern)===0){
                    var searchstringterms=window.location.href.match(searchstringpattern);
                    searchstringterms.splice(0,1);
                    if(searchstringterms.length>0){
                      searchstringterms[0]=searchstringterms[0].replace(/\+/g,"%20");
                      if(encodeURIComponent(decodeURIComponent(searchstringterms[0]))==searchstringterms[0]){
                        while(searchstringterms.length>1){
                          searchstringterms[1]=searchstringterms[1].replace(/\+/g,"%20");
                          if(searchstringterms[0]==searchstringterms[1]){
                            searchstringterms.splice(0,1);
                          }
                          else{
                            searchstringterms=[];
                          }
                        }
                        if(searchstringterms.length>0){
                          storedtext=decodeURIComponent(searchstringterms[0]);
                          i=popuplatestrings.length;
                          if(settings.detecttosearchhistory){
                            port.postMessage({
                              "type":"searchhistory",
                              "data":storedtext
                            });
                          }
                        }
                      }
                    }
                  }
                }
              }
              box.value=storedtext;
              findbuttonsreset();
              var inpopupwindow=window.opener!=null&&(window.menubar.visible==false||window.toolbar.visible==false);
              if((settings.showonsessionstartup&&message.lastshowing==="")||(settings.showingremember&&message.lastshowing==1&&(!inpopupwindow))||popup){
                show(true);
                showing=1;
              }
              else if(!settings.showingremember){
                port.postMessage({
                  "type":"hideallatonce"
                });
              }
              if(popup){
                document.body.style.minWidth="800px";
                document.body.style.minHeight=(message.height-1)+"px";
                window.setTimeout(function(){box.focus();}, 1);
              }
              if(settings.highlightingremember){
                buttons[1].clickfunction(message.lasthighlighting);
              }
            }
            else if(message.type=="getsearchhistory"){
              if(box.isfocused>0){
                searchhistory=message.data;
                searchhistorysuggestions=[];
                for(var i=0;i<searchhistory.length&&searchhistorysuggestions.length<settings.maximumnumberofsearchhistorysuggestions;i++){
                  if(searchhistory[i].toLowerCase().indexOf(box.value.toLowerCase())==0&&searchhistory[i].toLowerCase()!=box.value.toLowerCase()&&searchhistorysuggestions.indexOf(searchhistory[i])==-1){
                    searchhistorysuggestions.push(searchhistory[i]);
                  }
                }
                for(var i=0;i<settings.maximumnumberofsearchhistorysuggestions;i++){
                  if(i<searchhistorysuggestions.length){
                    options[i+settings.maximumnumberofsearchsuggestions].innerHTML="";
                    var boldtext=document.createElement("bdi");
                    boldtext.style.display="inline";
                    cssreset(boldtext);
                    boldtext.style.position="static";
                    boldtext.style.height="auto";
                    boldtext.style.width="auto";
                    boldtext.style.zIndex="2147483647";
                    boldtext.style.font=16+settings.extrapixels+"px sans-serif";
                    boldtext.style.textAlign="left";
                    boldtext.style.color="#0000ff";
                    boldtext.style.background="transparent none";
                    boldtext.style.cursor="default";
                    boldtext.style.maxHeight="none";
                    boldtext.style.maxWidth="none";
                    boldtext.style.minHeight="0px";
                    boldtext.style.minWidth="0px";
                    boldtext.style.letterSpacing="normal";
                    boldtext.style.lineHeight="normal";
                    boldtext.style.textDecoration="none";
                    boldtext.style.textIndent="0";
                    boldtext.style.textTransform="none";
                    boldtext.style.wordSpacing="normal";
                    boldtext.style.wordWrap="normal";
                    boldtext.style.whiteSpace="pre";
                    boldtext.style.fontWeight="bold";
                    boldtext.appendChild(document.createTextNode(searchhistorysuggestions[i].substring(box.value.length)));
                    options[i+settings.maximumnumberofsearchsuggestions].appendChild(document.createTextNode(searchhistorysuggestions[i].substring(0,box.value.length)));
                    options[i+settings.maximumnumberofsearchsuggestions].appendChild(boldtext);
                  }
                  else{
                    options[i+settings.maximumnumberofsearchsuggestions].innerHTML="";
                  }
                }
                if(searchsuggestions.length==0&&searchhistorysuggestions.length==0){
                  menu.style.display="none";
                  if(popup){
                    document.body.style.height="auto";
                  }
                }
                else{
                  menu.style.display="block";
                  if(popup){
                    document.body.style.height=Math.min(600,menu.offsetTop+menu.offsetHeight)+"px";
                  }
                }
                if(highlightedoption>=settings.maximumnumberofsearchsuggestions){
                  highlightoption(-1);
                }
              }
            }
            else if(message.type=="getsearchsuggestions"){
              if(box.isfocused>0){
                searchsuggestions=new Array(message.data[1].length);
                searchsuggestions.length=Math.min(searchsuggestions.length,settings.maximumnumberofsearchsuggestions);
                for(var i=0;i<settings.maximumnumberofsearchsuggestions;i++){
                  if(i<message.data[1].length){
                    options[i].innerHTML=message.data[1][i][0].replace(/<(\/?)[^>]*>/g,"<$1bdi>").replace(/<bdi>/g,"<bdi style=\"display:inline;border:0px;margin:0px;padding:0px;outline:0px;vertical-align:baseline;position:static;height:auto;width:auto;z-index:2147483647;font:"+(16+settings.extrapixels)+"px sans-serif;text-align:left;color:#000000;background:transparent none;cursor:default;max-height:none;max-width:none;min-height:0px;min-width:0px;letter-spacing:normal;line-height:normal;text-decoration:none;text-indent:0;text-transform:none;word-spacing:normal;word-wrap:normal;text-align-last:auto;white-space:pre;font-weight:bold;\">").replace(/<[^>]*$/g,"");
                    searchsuggestions[i]=options[i].textContent;
                  }
                  else{
                    options[i].innerHTML="";
                  }
                }
                if(searchsuggestions.length==0&&searchhistorysuggestions.length==0){
                  menu.style.display="none";
                  if(popup){
                    document.body.style.height="auto";
                  }
                }
                else{
                  menu.style.display="block";
                  if(popup){
                    document.body.style.height=Math.min(600,menu.offsetTop+menu.offsetHeight)+"px";
                  }
                }
                if(highlightedoption>=0&&highlightedoption<settings.maximumnumberofsearchsuggestions){
                  highlightoption(-1);
                }
              }
            }
            else if(message.type=="browseraction"){
              if(showing==0){
                port.postMessage({
                  "type":"showallatonce"
                });
                show(true);
                showing=1;
                window.setTimeout(function(){box.focus();}, 1);
              }
              else{
                if(box.isfocused>0){
                  box.blur();
                }
                if(showing==2){
                  showontextselectionoverride=true;
                }
                port.postMessage({
                  "type":"hideallatonce"
                });
                hide();
                focusonlasteventframe();
              }
            }
            else if(message.type=="showallatonce"&&settings.showhideallatonce&&showing==0){
              show(settings.pinned);
              showing=1;
            }
            else if(message.type=="hideallatonce"&&settings.showhideallatonce&&showing>0){
              if(box.isfocused>0){
                box.blur();
              }
              hide();
            }
            else if(message.type=="closepopup"&&popup){
              window.close();
            }
            else if(message.type=="contextmenu"){
              infoframe.fixdisplay();
              if(lastcustomsearch==null||lastcustomsearch==false){
                customsearchdiv.style.display="none";
                customsearcherrordiv.style.display="block";
                customsearcherrordiv.messages[0].style.display=(lastcustomsearch==null?"block":"none");
                customsearcherrordiv.messages[1].style.display=(lastcustomsearch==null?"none":"block");
                infoframe.contentWindow.focus();
                customsearcherrordiv.button.focus();
              }
              else{
                customsearchdiv.style.display="block";
                customsearcherrordiv.style.display="none";
                customsearchdiv.preview.button.title=lastcustomsearch[0];
                customsearchdiv.preview.button.img.src=lastcustomsearch[3];
                customsearchdiv.preview.button.img.alt=lastcustomsearch[0].charAt(0);
                if(lastcustomsearch[4]!=false){
                  customsearchdiv.favicon=new Image();
                  customsearchdiv.favicon.addEventListener("error",(function(badfavicon,googlefavicon){
                    return function(){
                      if(customsearchdiv.inputs[5].value==badfavicon){
                        customsearchdiv.inputs[5].value=googlefavicon;
                        customsearchdiv.preview.button.img.src=googlefavicon;
                      }
                    }
                  })(lastcustomsearch[3],"https://www.google.com/s2/favicons?domain="+lastcustomsearch[4]));
                  customsearchdiv.favicon.src=lastcustomsearch[3];
                }
                customsearchdiv.inputs[0].value=lastcustomsearch[0];
                customsearchdiv.inputs[1].value="";
                customsearchdiv.inputs[1].hotkeyvalue=[false,false,false,false,false];
                customsearchdiv.inputs[3].value=lastcustomsearch[1];
                customsearchdiv.inputs[4].value=lastcustomsearch[2];
                customsearchdiv.inputs[5].value=lastcustomsearch[3];
                customsearchdiv.inputs[6].value="";
                customsearchdiv.inputs[6].hotkeyvalue=[false,false,false,false,false];
                customsearchdiv.inputs[7].value="";
                customsearchdiv.inputs[7].hotkeyvalue=[false,false,false,false,false];
                customsearchdiv.hotkeyautofill=[true,true];
                infoframe.contentWindow.focus();
                customsearchdiv.buttons.accept.focus();
              }
            }
            else if(message.type=="imagesrc"){
              images[message.buttonid].src=message.data;
            }
          });
          port.onDisconnect.addListener(function(){
            hide();
            focusonlasteventframe();
            unhighlightsearchterms();
            for(var i=0;i<eventlisteners.length;i++){
              window.removeEventListener(eventlisteners[i][0],eventlisteners[i][1]);
            }
            document.body.removeChild(iframe);
            document.body.removeChild(menu);
            document.body.removeChild(infoframe);
          });
          port.postMessage({
            "type":"init"
          });
          addEventListenerToAllFrames(true,"keydown",function(event){
            port.postMessage({
              "type":"lastsearch",
              "data":[storedtext,showing,buttons[1].highlighting]
            });
          });
          addEventListenerToAllFrames(true,"keyup",function(event){
            port.postMessage({
              "type":"lastsearch",
              "data":[storedtext,showing,buttons[1].highlighting]
            });
          });
          addEventListenerToAllFrames(true,"mousedown",function(event){
            port.postMessage({
              "type":"lastsearch",
              "data":[storedtext,showing,buttons[1].highlighting]
            });
            lastcustomsearch=false;
          });
          addEventListenerToAllFrames(true,"mousedown",function(event){
            if(event.button==1){
              middlemousedownelement=document.body;
            }
          });
          addEventListenerToAllFrames(true,"mouseup",function(event){
            if(event.button==1){
              middlemousedownelement=document.body;
            }
          });
          addEventListenerToAllFrames(false,"contextmenu",function(event){
            lastcustomsearch=event.customsearch;
          });
          window.addEventListener("beforeunload",function(event){
            port.postMessage({
              "type":"lastsearch",
              "data":[storedtext,showing,buttons[1].highlighting]
            });
          });
        }
        else{
          var eventnames=["keydown","keyup","mousedown","mouseup","contextmenu"];
          var port=persistentconnect({
            "name":"frame"
          });
          for(var i=0;i<eventnames.length;i++){
            window.addEventListener(eventnames[i],(function(eventname){
              return function(event){
                window.setTimeout(function(){
                  port.postMessage({
                    "type":"event",
                    "data":[eventname,{
                      "keyCode":event.keyCode,
                      "altKey":event.altKey,
                      "ctrlKey":event.ctrlKey,
                      "shiftKey":event.shiftKey,
                      "metaKey":event.metaKey,
                      "button":event.button,
                      "selection":document.getSelection().toString().replace(/\n/g," ").substr(0,65535),
                      "activetag":(document.activeElement?document.activeElement:event.target).tagName.toLowerCase(),
                      "activeeditable":(document.activeElement?document.activeElement:event.target).contentEditable.toLowerCase(),
                      "customsearch":eventname=="contextmenu"?getcustomsearch(event.target):null
                    }]
                  });
                },0);
              };
            })(eventnames[i]));
          }
          port.onMessage.addListener(function(message){
            if(message.type=="focus"){
              window.focus();
            }
            else if(message.type=="highlight"){
              highlightsearchterms(message.data);
            }
            else if(message.type=="unhighlight"){
              unhighlightsearchterms(message.data);
            }
            else if(message.type=="find"){
              window.find(message.data[0],false,message.data[1],true,false,false,false);
            };
          });
          port.onDisconnect.addListener(function(){
            unhighlightsearchterms();
          });
        }
        var searchtermhighlightcolours=["#ffff66","#a0ffff","#99ff99","#ff9999","#ff66ff","#880000","#00aa00","#886800","#004699","#990099"];
        var searchtermtextcolours=["#000000","#000000","#000000","#000000","#000000","#ffffff","#ffffff","#ffffff","#ffffff","#ffffff"];
        var highlightingtags=[];
        var unicode={
          "expand":function(string){return string.replace(/\w{4}/g,"\\u$&")},
          "noncjkletter":"0041-005A0061-007A00AA00B500BA00C0-00D600D8-00F600F8-02C102C6-02D102E0-02E402EC02EE0370-037403760377037A-037D03860388-038A038C038E-03A103A3-03F503F7-0481048A-05270531-055605590561-058705D0-05EA05F0-05F20620-064A066E066F0671-06D306D506E506E606EE06EF06FA-06FC06FF07100712-072F074D-07A507B107CA-07EA07F407F507FA0800-0815081A082408280840-085808A008A2-08AC0904-0939093D09500958-09610971-09770979-097F0985-098C098F09900993-09A809AA-09B009B209B6-09B909BD09CE09DC09DD09DF-09E109F009F10A05-0A0A0A0F0A100A13-0A280A2A-0A300A320A330A350A360A380A390A59-0A5C0A5E0A72-0A740A85-0A8D0A8F-0A910A93-0AA80AAA-0AB00AB20AB30AB5-0AB90ABD0AD00AE00AE10B05-0B0C0B0F0B100B13-0B280B2A-0B300B320B330B35-0B390B3D0B5C0B5D0B5F-0B610B710B830B85-0B8A0B8E-0B900B92-0B950B990B9A0B9C0B9E0B9F0BA30BA40BA8-0BAA0BAE-0BB90BD00C05-0C0C0C0E-0C100C12-0C280C2A-0C330C35-0C390C3D0C580C590C600C610C85-0C8C0C8E-0C900C92-0CA80CAA-0CB30CB5-0CB90CBD0CDE0CE00CE10CF10CF20D05-0D0C0D0E-0D100D12-0D3A0D3D0D4E0D600D610D7A-0D7F0D85-0D960D9A-0DB10DB3-0DBB0DBD0DC0-0DC60E01-0E300E320E330E40-0E460E810E820E840E870E880E8A0E8D0E94-0E970E99-0E9F0EA1-0EA30EA50EA70EAA0EAB0EAD-0EB00EB20EB30EBD0EC0-0EC40EC60EDC-0EDF0F000F40-0F470F49-0F6C0F88-0F8C1000-102A103F1050-1055105A-105D106110651066106E-10701075-1081108E10A0-10C510C710CD10D0-10FA10FC-1248124A-124D1250-12561258125A-125D1260-1288128A-128D1290-12B012B2-12B512B8-12BE12C012C2-12C512C8-12D612D8-13101312-13151318-135A1380-138F13A0-13F41401-166C166F-167F1681-169A16A0-16EA1700-170C170E-17111720-17311740-17511760-176C176E-17701780-17B317D717DC1820-18771880-18A818AA18B0-18F51900-191C1950-196D1970-19741980-19AB19C1-19C71A00-1A161A20-1A541AA71B05-1B331B45-1B4B1B83-1BA01BAE1BAF1BBA-1BE51C00-1C231C4D-1C4F1C5A-1C7D1CE9-1CEC1CEE-1CF11CF51CF61D00-1DBF1E00-1F151F18-1F1D1F20-1F451F48-1F4D1F50-1F571F591F5B1F5D1F5F-1F7D1F80-1FB41FB6-1FBC1FBE1FC2-1FC41FC6-1FCC1FD0-1FD31FD6-1FDB1FE0-1FEC1FF2-1FF41FF6-1FFC2071207F2090-209C21022107210A-211321152119-211D212421262128212A-212D212F-2139213C-213F2145-2149214E218321842C00-2C2E2C30-2C5E2C60-2CE42CEB-2CEE2CF22CF32D00-2D252D272D2D2D30-2D672D6F2D80-2D962DA0-2DA62DA8-2DAE2DB0-2DB62DB8-2DBE2DC0-2DC62DC8-2DCE2DD0-2DD62DD8-2DDE2E2FA500-A60CA610-A61FA62AA62BA640-A66EA67F-A697A6A0-A6E5A717-A71FA722-A788A78B-A78EA790-A793A7A0-A7AAA7F8-A801A803-A805A807-A80AA80C-A822A840-A873A882-A8B3A8F2-A8F7A8FBFB00-FB06FB13-FB17FB1DFB1F-FB28FB2A-FB36FB38-FB3CFB3EFB40FB41FB43FB44FB46-FBB1FBD3-FD3DFD50-FD8FFD92-FDC7FDF0-FDFBFE70-FE74FE76-FEFCFF21-FF3AFF41-FF5AFF66-FFBEFFC2-FFC7FFCA-FFCFFFD2-FFD7FFDA-FFDC",
          "mark":"0300-036F0483-04890591-05BD05BF05C105C205C405C505C70610-061A064B-065F067006D6-06DC06DF-06E406E706E806EA-06ED07110730-074A07A6-07B007EB-07F30816-0819081B-08230825-08270829-082D0859-085B08E4-08FE0900-0903093A-093C093E-094F0951-0957096209630981-098309BC09BE-09C409C709C809CB-09CD09D709E209E30A01-0A030A3C0A3E-0A420A470A480A4B-0A4D0A510A700A710A750A81-0A830ABC0ABE-0AC50AC7-0AC90ACB-0ACD0AE20AE30B01-0B030B3C0B3E-0B440B470B480B4B-0B4D0B560B570B620B630B820BBE-0BC20BC6-0BC80BCA-0BCD0BD70C01-0C030C3E-0C440C46-0C480C4A-0C4D0C550C560C620C630C820C830CBC0CBE-0CC40CC6-0CC80CCA-0CCD0CD50CD60CE20CE30D020D030D3E-0D440D46-0D480D4A-0D4D0D570D620D630D820D830DCA0DCF-0DD40DD60DD8-0DDF0DF20DF30E310E34-0E3A0E47-0E4E0EB10EB4-0EB90EBB0EBC0EC8-0ECD0F180F190F350F370F390F3E0F3F0F71-0F840F860F870F8D-0F970F99-0FBC0FC6102B-103E1056-1059105E-10601062-10641067-106D1071-10741082-108D108F109A-109D135D-135F1712-17141732-1734175217531772177317B4-17D317DD180B-180D18A91920-192B1930-193B19B0-19C019C819C91A17-1A1B1A55-1A5E1A60-1A7C1A7F1B00-1B041B34-1B441B6B-1B731B80-1B821BA1-1BAD1BE6-1BF31C24-1C371CD0-1CD21CD4-1CE81CED1CF2-1CF41DC0-1DE61DFC-1DFF20D0-20F02CEF-2CF12D7F2DE0-2DFF302A-302F3099309AA66F-A672A674-A67DA69FA6F0A6F1A802A806A80BA823-A827A880A881A8B4-A8C4A8E0-A8F1A926-A92DA947-A953A980-A983A9B3-A9C0AA29-AA36AA43AA4CAA4DAA7BAAB0AAB2-AAB4AAB7AAB8AABEAABFAAC1AAEB-AAEFAAF5AAF6ABE3-ABEAABECABEDFB1EFE00-FE0FFE20-FE26",
          "number":"0030-003900B200B300B900BC-00BE0660-066906F0-06F907C0-07C90966-096F09E6-09EF09F4-09F90A66-0A6F0AE6-0AEF0B66-0B6F0B72-0B770BE6-0BF20C66-0C6F0C78-0C7E0CE6-0CEF0D66-0D750E50-0E590ED0-0ED90F20-0F331040-10491090-10991369-137C16EE-16F017E0-17E917F0-17F91810-18191946-194F19D0-19DA1A80-1A891A90-1A991B50-1B591BB0-1BB91C40-1C491C50-1C5920702074-20792080-20892150-21822185-21892460-249B24EA-24FF2776-27932CFD30073021-30293038-303A3192-31953220-32293248-324F3251-325F3280-328932B1-32BFA620-A629A6E6-A6EFA830-A835A8D0-A8D9A900-A909A9D0-A9D9AA50-AA59ABF0-ABF9FF10-FF19",
          "currencysymbol":"002400A2-00A5058F060B09F209F309FB0AF10BF90E3F17DB20A0-20B9A838FDFCFE69FF04FFE0FFE1FFE5FFE6",
          "cjkletter":"300530063031-3035303B303C3041-3096309D-309F30A1-30FA30FC-30FF3105-312D3131-318E31A0-31BA31F0-31FF3400-4DB54E00-9FCCA000-A48CA4D0-A4FDA90A-A925A930-A946A960-A97CA984-A9B2A9CFAA00-AA28AA40-AA42AA44-AA4BAA60-AA76AA7AAA80-AAAFAAB1AAB5AAB6AAB9-AABDAAC0AAC2AADB-AADDAAE0-AAEAAAF2-AAF4AB01-AB06AB09-AB0EAB11-AB16AB20-AB26AB28-AB2EABC0-ABE2AC00-D7A3D7B0-D7C6D7CB-D7FBF900-FA6DFA70-FAD9"
        };
        var numberletter=unicode.expand(unicode.number);
        var wordletter=unicode.expand(unicode.noncjkletter+unicode.mark+unicode.number+unicode.currencysymbol+unicode.cjkletter)+"%_";
        var cjkletter=unicode.expand(unicode.cjkletter);
        var highlightsearchterms=function(searchterms){
          searchterms[0]=searchterms[0].slice(0,1024);
          searchterms[1]=searchterms[1].slice(0,1024);
          unhighlightsearchterms();
          var nodeiterator=document.createNodeIterator(document.body,NodeFilter.SHOW_TEXT,null,false);
          var node;
          textnodes=[];
          while(node=nodeiterator.nextNode()){
            textnodes.push(node);
          }
          var regularexpression=searchterms[0].slice();
          for(var i=0;i<regularexpression.length;i++){
            regularexpression[i]=regularexpression[i].replace(/[\-\/\\\^\$\*\+\?\.\(\)\|\{\}\[\]]/g,"\\$&");
          }
          var regularexpression=new RegExp(regularexpression.join("|"),"gi");
          for(var i=0;i<searchterms[0].length;i++){
            searchterms[0][i]=searchterms[0][i].toLowerCase();
          }
          var nonletterregularexpression=new RegExp("[^"+wordletter+"]");
          var nonlettertest=function(character){
            if(character==""){
              return true;
            }
            else{
              return nonletterregularexpression.test(character);
            }
          };
          for(var i=0;i<textnodes.length;i++){
            var text=textnodes[i].textContent;
            var lastendposition=0;
            var result;
            while((result=regularexpression.exec(text))!==null){
              var position=result.index;
              var match=result[0];
              var key=searchterms[0].indexOf(result[0].toLowerCase());
              if(searchterms[1][key]!="word"||(nonlettertest(text.charAt(position-1))&&nonlettertest(text.charAt(position+match.length)))){
                textnodes[i].parentNode.insertBefore(document.createTextNode(text.substring(lastendposition,position)),textnodes[i]);
                var highlight=document.createElement("b");
                highlightingtags.push(highlight);
                highlight.textContent=match;
                highlight.style.fontWeight="bold";
                highlight.style.color=searchtermtextcolours[key%(searchtermtextcolours.length)];
                highlight.style.backgroundColor=searchtermhighlightcolours[key%(searchtermhighlightcolours.length)];
                textnodes[i].parentNode.insertBefore(highlight,textnodes[i]);
                textnodes[i].textContent=text.substring(position+match.length);
                lastendposition=position+match.length;
              }
            }
          }
        };
        var unhighlightsearchterms=function(){
          for(var i=0;i<highlightingtags.length;i++){
            if(highlightingtags[i].parentNode!=null){
              highlightingtags[i].parentNode.replaceChild(document.createTextNode(highlightingtags[i].textContent),highlightingtags[i]);
            }
          }
          if(highlightingtags.length>0){
            document.body.normalize();
            document.getSelection().removeAllRanges();
          }
          highlightingtags=[];
        };
        var getcustomsearch=function(element){
          var searchurl=false;
          if(["input","textarea"].indexOf(element.tagName.toLowerCase())!=-1&&element.name!==""){
            var form=element;
            while(form.tagName.toLowerCase()!="form"&&form.parentElement!=null){
              form=form.parentElement;
            }
            if(form.tagName.toLowerCase()=="form"&&(form.action==""||form.action.search(/https?:\/\//)==0)){
              if(form.action==""){
                searchurl=window.location.href;
              }
              else{
                searchurl=form.action;
              }
              searchurl=searchurl.split("#")[0].split("?");
              if(form.method.toLowerCase()=="post"){
                if(searchurl.length>1&&searchurl[1].length>0){
                  searchurl=searchurl[0]+"?"+searchurl[1]+"??";
                }
                else{
                  searchurl=searchurl[0]+"??";
                }
              }
              else{
                searchurl=searchurl[0]+"?";
              }
              var nodeiterator=document.createNodeIterator(form,NodeFilter.SHOW_ELEMENT,function(node){
                return (["input","textarea","select"].indexOf(node.nodeName.toLowerCase())!=-1&&node.name!=="")?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT;
              },false);
              var node;
              var formelements=[];
              while(node=nodeiterator.nextNode()){
                formelements.push(node);
              }
              for(var i=0;i<formelements.length;i++){
                if(formelements[i]==element){
                  searchurl+=encodeURIComponent(element.name)+"=%s&";
                }
                else if(formelements[i].disabled==false||element.disabled==true){
                  if(formelements[i].tagName.toLowerCase()=="select"){
                    if(formelements[i].multiple==true){
                      for(var j=0;j<formelements[i].options.length;j++){
                        if(formelements[i].options[j].selected==true){
                          searchurl+=encodeURIComponent(formelements[i].name)+"="+encodeURIComponent(formelements[i].options[j].value)+"&";
                        }
                      }
                    }
                    else{
                      searchurl+=encodeURIComponent(formelements[i].name)+"="+encodeURIComponent(formelements[i].options[formelements[i].selectedIndex].value)+"&";
                    }
                  }
                  else if(formelements[i].tagName.toLowerCase()=="input"&&["checkbox","radio"].indexOf(formelements[i].type.toLowerCase())!=-1){
                    if(formelements[i].checked==true){
                      searchurl+=encodeURIComponent(formelements[i].name)+"="+encodeURIComponent(formelements[i].value)+"&";
                    }
                  }
                  else if(formelements[i].tagName.toLowerCase()=="textarea"||(formelements[i].tagName.toLowerCase()=="input"&&["file","submit","image","reset","button"].indexOf(formelements[i].type.toLowerCase())==-1)){
                    searchurl+=encodeURIComponent(formelements[i].name)+"="+(formelements[i].type.toLowerCase()=="password"?"":encodeURIComponent(formelements[i].value))+"&";
                  }
                }
              }
              searchurl=searchurl.substring(0,searchurl.length-1);
            }
          }
          if(searchurl==false){
            return false;
          }
          else{
            var links=document.getElementsByTagName("link");
            var rels=[];
            for(var i=0;i<links.length;i++){
              rels[i]=links[i].rel.toLowerCase();
            }
            var favicon=window.location.protocol+"//"+window.location.hostname+"/favicon.ico";
            var hostnameifneeded=window.location.hostname;
            if(rels.indexOf("shortcut icon")!=-1){
              favicon=links[rels.indexOf("shortcut icon")].href;
              hostnameifneeded=false;
            }
            else if(rels.indexOf("icon")!=-1){
              favicon=links[rels.indexOf("icon")].href;
              hostnameifneeded=false;
            }
            return [document.title,window.location.href,searchurl,favicon,hostnameifneeded];
          }
        };
        // Since Manifest V3, JavaScript URLs don't work, so instead we allow the user to use syntax like %{s.replace(/ /g,'_')} in their Search URLs, using the following function to evaluate expressions. This function is derived from static-eval (MIT license) and esprima (BSD-2-Clause license), and is not guaranteed to be secure, but these kinds of Search URLs can only be entered manually by clicking "show advanced options" (or by importing them under "Advanced settings"), so we assume the user knows what they are doing. Note that this function is never used to evaluate remote code.
var evalExpr=(()=>{var re=(m,i)=>()=>(i||m((i={exports:{}}).exports,i),i.exports);var It=re((Ue,ft)=>{(function(i,f){typeof Ue=="object"&&typeof ft=="object"?ft.exports=f():typeof define=="function"&&define.amd?define([],f):typeof Ue=="object"?Ue.esprima=f():i.esprima=f()})(Ue,function(){return function(m){var i={};function f(a){if(i[a])return i[a].exports;var d=i[a]={exports:{},id:a,loaded:!1};return m[a].call(d.exports,d,d.exports,f),d.loaded=!0,d.exports}return f.m=m,f.c=i,f.p="",f(0)}([function(m,i,f){"use strict";Object.defineProperty(i,"__esModule",{value:!0});var a=f(1),d=f(3),D=f(8),l=f(15);function g(s,e,t){var u=null,n=function(P,X){t&&t(P,X),u&&u.visit(P,X)},C=typeof t=="function"?n:null,x=!1;if(e){x=typeof e.comment=="boolean"&&e.comment;var k=typeof e.attachComment=="boolean"&&e.attachComment;(x||k)&&(u=new a.CommentHandler,u.attach=k,e.comment=!0,C=n)}var y=!1;e&&typeof e.sourceType=="string"&&(y=e.sourceType==="module");var B;e&&typeof e.jsx=="boolean"&&e.jsx?B=new d.JSXParser(s,e,C):B=new D.Parser(s,e,C);var M=y?B.parseModule():B.parseScript(),T=M;return x&&u&&(T.comments=u.comments),B.config.tokens&&(T.tokens=B.tokens),B.config.tolerant&&(T.errors=B.errorHandler.errors),T}i.parse=g;function F(s,e,t){var u=e||{};return u.sourceType="module",g(s,u,t)}i.parseModule=F;function v(s,e,t){var u=e||{};return u.sourceType="script",g(s,u,t)}i.parseScript=v;function p(s,e,t){var u=new l.Tokenizer(s,e),n;n=[];try{for(;;){var C=u.getNextToken();if(!C)break;t&&(C=t(C)),n.push(C)}}catch(x){u.errorHandler.tolerate(x)}return u.errorHandler.tolerant&&(n.errors=u.errors()),n}i.tokenize=p;var E=f(2);i.Syntax=E.Syntax,i.version="4.0.1"},function(m,i,f){"use strict";Object.defineProperty(i,"__esModule",{value:!0});var a=f(2),d=function(){function D(){this.attach=!1,this.comments=[],this.stack=[],this.leading=[],this.trailing=[]}return D.prototype.insertInnerComments=function(l,g){if(l.type===a.Syntax.BlockStatement&&l.body.length===0){for(var F=[],v=this.leading.length-1;v>=0;--v){var p=this.leading[v];g.end.offset>=p.start&&(F.unshift(p.comment),this.leading.splice(v,1),this.trailing.splice(v,1))}F.length&&(l.innerComments=F)}},D.prototype.findTrailingComments=function(l){var g=[];if(this.trailing.length>0){for(var F=this.trailing.length-1;F>=0;--F){var v=this.trailing[F];v.start>=l.end.offset&&g.unshift(v.comment)}return this.trailing.length=0,g}var p=this.stack[this.stack.length-1];if(p&&p.node.trailingComments){var E=p.node.trailingComments[0];E&&E.range[0]>=l.end.offset&&(g=p.node.trailingComments,delete p.node.trailingComments)}return g},D.prototype.findLeadingComments=function(l){for(var g=[],F;this.stack.length>0;){var v=this.stack[this.stack.length-1];if(v&&v.start>=l.start.offset)F=v.node,this.stack.pop();else break}if(F){for(var p=F.leadingComments?F.leadingComments.length:0,E=p-1;E>=0;--E){var s=F.leadingComments[E];s.range[1]<=l.start.offset&&(g.unshift(s),F.leadingComments.splice(E,1))}return F.leadingComments&&F.leadingComments.length===0&&delete F.leadingComments,g}for(var E=this.leading.length-1;E>=0;--E){var v=this.leading[E];v.start<=l.start.offset&&(g.unshift(v.comment),this.leading.splice(E,1))}return g},D.prototype.visitNode=function(l,g){if(!(l.type===a.Syntax.Program&&l.body.length>0)){this.insertInnerComments(l,g);var F=this.findTrailingComments(g),v=this.findLeadingComments(g);v.length>0&&(l.leadingComments=v),F.length>0&&(l.trailingComments=F),this.stack.push({node:l,start:g.start.offset})}},D.prototype.visitComment=function(l,g){var F=l.type[0]==="L"?"Line":"Block",v={type:F,value:l.value};if(l.range&&(v.range=l.range),l.loc&&(v.loc=l.loc),this.comments.push(v),this.attach){var p={comment:{type:F,value:l.value,range:[g.start.offset,g.end.offset]},start:g.start.offset};l.loc&&(p.comment.loc=l.loc),l.type=F,this.leading.push(p),this.trailing.push(p)}},D.prototype.visit=function(l,g){l.type==="LineComment"?this.visitComment(l,g):l.type==="BlockComment"?this.visitComment(l,g):this.attach&&this.visitNode(l,g)},D}();i.CommentHandler=d},function(m,i){"use strict";Object.defineProperty(i,"__esModule",{value:!0}),i.Syntax={AssignmentExpression:"AssignmentExpression",AssignmentPattern:"AssignmentPattern",ArrayExpression:"ArrayExpression",ArrayPattern:"ArrayPattern",ArrowFunctionExpression:"ArrowFunctionExpression",AwaitExpression:"AwaitExpression",BlockStatement:"BlockStatement",BinaryExpression:"BinaryExpression",BreakStatement:"BreakStatement",CallExpression:"CallExpression",CatchClause:"CatchClause",ClassBody:"ClassBody",ClassDeclaration:"ClassDeclaration",ClassExpression:"ClassExpression",ConditionalExpression:"ConditionalExpression",ContinueStatement:"ContinueStatement",DoWhileStatement:"DoWhileStatement",DebuggerStatement:"DebuggerStatement",EmptyStatement:"EmptyStatement",ExportAllDeclaration:"ExportAllDeclaration",ExportDefaultDeclaration:"ExportDefaultDeclaration",ExportNamedDeclaration:"ExportNamedDeclaration",ExportSpecifier:"ExportSpecifier",ExpressionStatement:"ExpressionStatement",ForStatement:"ForStatement",ForOfStatement:"ForOfStatement",ForInStatement:"ForInStatement",FunctionDeclaration:"FunctionDeclaration",FunctionExpression:"FunctionExpression",Identifier:"Identifier",IfStatement:"IfStatement",ImportDeclaration:"ImportDeclaration",ImportDefaultSpecifier:"ImportDefaultSpecifier",ImportNamespaceSpecifier:"ImportNamespaceSpecifier",ImportSpecifier:"ImportSpecifier",Literal:"Literal",LabeledStatement:"LabeledStatement",LogicalExpression:"LogicalExpression",MemberExpression:"MemberExpression",MetaProperty:"MetaProperty",MethodDefinition:"MethodDefinition",NewExpression:"NewExpression",ObjectExpression:"ObjectExpression",ObjectPattern:"ObjectPattern",Program:"Program",Property:"Property",RestElement:"RestElement",ReturnStatement:"ReturnStatement",SequenceExpression:"SequenceExpression",SpreadElement:"SpreadElement",Super:"Super",SwitchCase:"SwitchCase",SwitchStatement:"SwitchStatement",TaggedTemplateExpression:"TaggedTemplateExpression",TemplateElement:"TemplateElement",TemplateLiteral:"TemplateLiteral",ThisExpression:"ThisExpression",ThrowStatement:"ThrowStatement",TryStatement:"TryStatement",UnaryExpression:"UnaryExpression",UpdateExpression:"UpdateExpression",VariableDeclaration:"VariableDeclaration",VariableDeclarator:"VariableDeclarator",WhileStatement:"WhileStatement",WithStatement:"WithStatement",YieldExpression:"YieldExpression"}},function(m,i,f){"use strict";var a=this&&this.__extends||function(){var e=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,u){t.__proto__=u}||function(t,u){for(var n in u)u.hasOwnProperty(n)&&(t[n]=u[n])};return function(t,u){e(t,u);function n(){this.constructor=t}t.prototype=u===null?Object.create(u):(n.prototype=u.prototype,new n)}}();Object.defineProperty(i,"__esModule",{value:!0});var d=f(4),D=f(5),l=f(6),g=f(7),F=f(8),v=f(13),p=f(14);v.TokenName[100]="JSXIdentifier",v.TokenName[101]="JSXText";function E(e){var t;switch(e.type){case l.JSXSyntax.JSXIdentifier:var u=e;t=u.name;break;case l.JSXSyntax.JSXNamespacedName:var n=e;t=E(n.namespace)+":"+E(n.name);break;case l.JSXSyntax.JSXMemberExpression:var C=e;t=E(C.object)+"."+E(C.property);break;default:break}return t}var s=function(e){a(t,e);function t(u,n,C){return e.call(this,u,n,C)||this}return t.prototype.parsePrimaryExpression=function(){return this.match("<")?this.parseJSXRoot():e.prototype.parsePrimaryExpression.call(this)},t.prototype.startJSX=function(){this.scanner.index=this.startMarker.index,this.scanner.lineNumber=this.startMarker.line,this.scanner.lineStart=this.startMarker.index-this.startMarker.column},t.prototype.finishJSX=function(){this.nextToken()},t.prototype.reenterJSX=function(){this.startJSX(),this.expectJSX("}"),this.config.tokens&&this.tokens.pop()},t.prototype.createJSXNode=function(){return this.collectComments(),{index:this.scanner.index,line:this.scanner.lineNumber,column:this.scanner.index-this.scanner.lineStart}},t.prototype.createJSXChildNode=function(){return{index:this.scanner.index,line:this.scanner.lineNumber,column:this.scanner.index-this.scanner.lineStart}},t.prototype.scanXHTMLEntity=function(u){for(var n="&",C=!0,x=!1,k=!1,y=!1;!this.scanner.eof()&&C&&!x;){var B=this.scanner.source[this.scanner.index];if(B===u)break;if(x=B===";",n+=B,++this.scanner.index,!x)switch(n.length){case 2:k=B==="#";break;case 3:k&&(y=B==="x",C=y||d.Character.isDecimalDigit(B.charCodeAt(0)),k=k&&!y);break;default:C=C&&!(k&&!d.Character.isDecimalDigit(B.charCodeAt(0))),C=C&&!(y&&!d.Character.isHexDigit(B.charCodeAt(0)));break}}if(C&&x&&n.length>2){var M=n.substr(1,n.length-2);k&&M.length>1?n=String.fromCharCode(parseInt(M.substr(1),10)):y&&M.length>2?n=String.fromCharCode(parseInt("0"+M.substr(1),16)):!k&&!y&&p.XHTMLEntities[M]&&(n=p.XHTMLEntities[M])}return n},t.prototype.lexJSX=function(){var u=this.scanner.source.charCodeAt(this.scanner.index);if(u===60||u===62||u===47||u===58||u===61||u===123||u===125){var n=this.scanner.source[this.scanner.index++];return{type:7,value:n,lineNumber:this.scanner.lineNumber,lineStart:this.scanner.lineStart,start:this.scanner.index-1,end:this.scanner.index}}if(u===34||u===39){for(var C=this.scanner.index,x=this.scanner.source[this.scanner.index++],k="";!this.scanner.eof();){var y=this.scanner.source[this.scanner.index++];if(y===x)break;y==="&"?k+=this.scanXHTMLEntity(x):k+=y}return{type:8,value:k,lineNumber:this.scanner.lineNumber,lineStart:this.scanner.lineStart,start:C,end:this.scanner.index}}if(u===46){var B=this.scanner.source.charCodeAt(this.scanner.index+1),M=this.scanner.source.charCodeAt(this.scanner.index+2),n=B===46&&M===46?"...":".",C=this.scanner.index;return this.scanner.index+=n.length,{type:7,value:n,lineNumber:this.scanner.lineNumber,lineStart:this.scanner.lineStart,start:C,end:this.scanner.index}}if(u===96)return{type:10,value:"",lineNumber:this.scanner.lineNumber,lineStart:this.scanner.lineStart,start:this.scanner.index,end:this.scanner.index};if(d.Character.isIdentifierStart(u)&&u!==92){var C=this.scanner.index;for(++this.scanner.index;!this.scanner.eof();){var y=this.scanner.source.charCodeAt(this.scanner.index);if(d.Character.isIdentifierPart(y)&&y!==92)++this.scanner.index;else if(y===45)++this.scanner.index;else break}var T=this.scanner.source.slice(C,this.scanner.index);return{type:100,value:T,lineNumber:this.scanner.lineNumber,lineStart:this.scanner.lineStart,start:C,end:this.scanner.index}}return this.scanner.lex()},t.prototype.nextJSXToken=function(){this.collectComments(),this.startMarker.index=this.scanner.index,this.startMarker.line=this.scanner.lineNumber,this.startMarker.column=this.scanner.index-this.scanner.lineStart;var u=this.lexJSX();return this.lastMarker.index=this.scanner.index,this.lastMarker.line=this.scanner.lineNumber,this.lastMarker.column=this.scanner.index-this.scanner.lineStart,this.config.tokens&&this.tokens.push(this.convertToken(u)),u},t.prototype.nextJSXText=function(){this.startMarker.index=this.scanner.index,this.startMarker.line=this.scanner.lineNumber,this.startMarker.column=this.scanner.index-this.scanner.lineStart;for(var u=this.scanner.index,n="";!this.scanner.eof();){var C=this.scanner.source[this.scanner.index];if(C==="{"||C==="<")break;++this.scanner.index,n+=C,d.Character.isLineTerminator(C.charCodeAt(0))&&(++this.scanner.lineNumber,C==="\r"&&this.scanner.source[this.scanner.index]===`
`&&++this.scanner.index,this.scanner.lineStart=this.scanner.index)}this.lastMarker.index=this.scanner.index,this.lastMarker.line=this.scanner.lineNumber,this.lastMarker.column=this.scanner.index-this.scanner.lineStart;var x={type:101,value:n,lineNumber:this.scanner.lineNumber,lineStart:this.scanner.lineStart,start:u,end:this.scanner.index};return n.length>0&&this.config.tokens&&this.tokens.push(this.convertToken(x)),x},t.prototype.peekJSXToken=function(){var u=this.scanner.saveState();this.scanner.scanComments();var n=this.lexJSX();return this.scanner.restoreState(u),n},t.prototype.expectJSX=function(u){var n=this.nextJSXToken();(n.type!==7||n.value!==u)&&this.throwUnexpectedToken(n)},t.prototype.matchJSX=function(u){var n=this.peekJSXToken();return n.type===7&&n.value===u},t.prototype.parseJSXIdentifier=function(){var u=this.createJSXNode(),n=this.nextJSXToken();return n.type!==100&&this.throwUnexpectedToken(n),this.finalize(u,new D.JSXIdentifier(n.value))},t.prototype.parseJSXElementName=function(){var u=this.createJSXNode(),n=this.parseJSXIdentifier();if(this.matchJSX(":")){var C=n;this.expectJSX(":");var x=this.parseJSXIdentifier();n=this.finalize(u,new D.JSXNamespacedName(C,x))}else if(this.matchJSX("."))for(;this.matchJSX(".");){var k=n;this.expectJSX(".");var y=this.parseJSXIdentifier();n=this.finalize(u,new D.JSXMemberExpression(k,y))}return n},t.prototype.parseJSXAttributeName=function(){var u=this.createJSXNode(),n,C=this.parseJSXIdentifier();if(this.matchJSX(":")){var x=C;this.expectJSX(":");var k=this.parseJSXIdentifier();n=this.finalize(u,new D.JSXNamespacedName(x,k))}else n=C;return n},t.prototype.parseJSXStringLiteralAttribute=function(){var u=this.createJSXNode(),n=this.nextJSXToken();n.type!==8&&this.throwUnexpectedToken(n);var C=this.getTokenRaw(n);return this.finalize(u,new g.Literal(n.value,C))},t.prototype.parseJSXExpressionAttribute=function(){var u=this.createJSXNode();this.expectJSX("{"),this.finishJSX(),this.match("}")&&this.tolerateError("JSX attributes must only be assigned a non-empty expression");var n=this.parseAssignmentExpression();return this.reenterJSX(),this.finalize(u,new D.JSXExpressionContainer(n))},t.prototype.parseJSXAttributeValue=function(){return this.matchJSX("{")?this.parseJSXExpressionAttribute():this.matchJSX("<")?this.parseJSXElement():this.parseJSXStringLiteralAttribute()},t.prototype.parseJSXNameValueAttribute=function(){var u=this.createJSXNode(),n=this.parseJSXAttributeName(),C=null;return this.matchJSX("=")&&(this.expectJSX("="),C=this.parseJSXAttributeValue()),this.finalize(u,new D.JSXAttribute(n,C))},t.prototype.parseJSXSpreadAttribute=function(){var u=this.createJSXNode();this.expectJSX("{"),this.expectJSX("..."),this.finishJSX();var n=this.parseAssignmentExpression();return this.reenterJSX(),this.finalize(u,new D.JSXSpreadAttribute(n))},t.prototype.parseJSXAttributes=function(){for(var u=[];!this.matchJSX("/")&&!this.matchJSX(">");){var n=this.matchJSX("{")?this.parseJSXSpreadAttribute():this.parseJSXNameValueAttribute();u.push(n)}return u},t.prototype.parseJSXOpeningElement=function(){var u=this.createJSXNode();this.expectJSX("<");var n=this.parseJSXElementName(),C=this.parseJSXAttributes(),x=this.matchJSX("/");return x&&this.expectJSX("/"),this.expectJSX(">"),this.finalize(u,new D.JSXOpeningElement(n,x,C))},t.prototype.parseJSXBoundaryElement=function(){var u=this.createJSXNode();if(this.expectJSX("<"),this.matchJSX("/")){this.expectJSX("/");var n=this.parseJSXElementName();return this.expectJSX(">"),this.finalize(u,new D.JSXClosingElement(n))}var C=this.parseJSXElementName(),x=this.parseJSXAttributes(),k=this.matchJSX("/");return k&&this.expectJSX("/"),this.expectJSX(">"),this.finalize(u,new D.JSXOpeningElement(C,k,x))},t.prototype.parseJSXEmptyExpression=function(){var u=this.createJSXChildNode();return this.collectComments(),this.lastMarker.index=this.scanner.index,this.lastMarker.line=this.scanner.lineNumber,this.lastMarker.column=this.scanner.index-this.scanner.lineStart,this.finalize(u,new D.JSXEmptyExpression)},t.prototype.parseJSXExpressionContainer=function(){var u=this.createJSXNode();this.expectJSX("{");var n;return this.matchJSX("}")?(n=this.parseJSXEmptyExpression(),this.expectJSX("}")):(this.finishJSX(),n=this.parseAssignmentExpression(),this.reenterJSX()),this.finalize(u,new D.JSXExpressionContainer(n))},t.prototype.parseJSXChildren=function(){for(var u=[];!this.scanner.eof();){var n=this.createJSXChildNode(),C=this.nextJSXText();if(C.start<C.end){var x=this.getTokenRaw(C),k=this.finalize(n,new D.JSXText(C.value,x));u.push(k)}if(this.scanner.source[this.scanner.index]==="{"){var y=this.parseJSXExpressionContainer();u.push(y)}else break}return u},t.prototype.parseComplexJSXElement=function(u){for(var n=[];!this.scanner.eof();){u.children=u.children.concat(this.parseJSXChildren());var C=this.createJSXChildNode(),x=this.parseJSXBoundaryElement();if(x.type===l.JSXSyntax.JSXOpeningElement){var k=x;if(k.selfClosing){var y=this.finalize(C,new D.JSXElement(k,[],null));u.children.push(y)}else n.push(u),u={node:C,opening:k,closing:null,children:[]}}if(x.type===l.JSXSyntax.JSXClosingElement){u.closing=x;var B=E(u.opening.name),M=E(u.closing.name);if(B!==M&&this.tolerateError("Expected corresponding JSX closing tag for %0",B),n.length>0){var y=this.finalize(u.node,new D.JSXElement(u.opening,u.children,u.closing));u=n[n.length-1],u.children.push(y),n.pop()}else break}}return u},t.prototype.parseJSXElement=function(){var u=this.createJSXNode(),n=this.parseJSXOpeningElement(),C=[],x=null;if(!n.selfClosing){var k=this.parseComplexJSXElement({node:u,opening:n,closing:x,children:C});C=k.children,x=k.closing}return this.finalize(u,new D.JSXElement(n,C,x))},t.prototype.parseJSXRoot=function(){this.config.tokens&&this.tokens.pop(),this.startJSX();var u=this.parseJSXElement();return this.finishJSX(),u},t.prototype.isStartOfExpression=function(){return e.prototype.isStartOfExpression.call(this)||this.match("<")},t}(F.Parser);i.JSXParser=s},function(m,i){"use strict";Object.defineProperty(i,"__esModule",{value:!0});var f={NonAsciiIdentifierStart:/[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B4\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309B-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AD\uA7B0-\uA7B7\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF30-\uDF4A\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD804[\uDC03-\uDC37\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDF00-\uDF19]|\uD806[\uDCA0-\uDCDF\uDCFF\uDEC0-\uDEF8]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50\uDF93-\uDF9F]|\uD82C[\uDC00\uDC01]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD83A[\uDC00-\uDCC4]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1]|\uD87E[\uDC00-\uDE1D]/,NonAsciiIdentifierPart:/[\xAA\xB5\xB7\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u08A0-\u08B4\u08E3-\u0963\u0966-\u096F\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0AF9\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C00-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58-\u0C5A\u0C60-\u0C63\u0C66-\u0C6F\u0C81-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D01-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D57\u0D5F-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1369-\u1371\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19DA\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1AB0-\u1ABD\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1CD0-\u1CD2\u1CD4-\u1CF6\u1CF8\u1CF9\u1D00-\u1DF5\u1DFC-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u200C\u200D\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AD\uA7B0-\uA7B7\uA7F7-\uA827\uA840-\uA873\uA880-\uA8C4\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA8FD\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uA9E0-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE2F\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDDFD\uDE80-\uDE9C\uDEA0-\uDED0\uDEE0\uDF00-\uDF1F\uDF30-\uDF4A\uDF50-\uDF7A\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCA0-\uDCA9\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00-\uDE03\uDE05\uDE06\uDE0C-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE38-\uDE3A\uDE3F\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE6\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD804[\uDC00-\uDC46\uDC66-\uDC6F\uDC7F-\uDCBA\uDCD0-\uDCE8\uDCF0-\uDCF9\uDD00-\uDD34\uDD36-\uDD3F\uDD50-\uDD73\uDD76\uDD80-\uDDC4\uDDCA-\uDDCC\uDDD0-\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE37\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEEA\uDEF0-\uDEF9\uDF00-\uDF03\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3C-\uDF44\uDF47\uDF48\uDF4B-\uDF4D\uDF50\uDF57\uDF5D-\uDF63\uDF66-\uDF6C\uDF70-\uDF74]|\uD805[\uDC80-\uDCC5\uDCC7\uDCD0-\uDCD9\uDD80-\uDDB5\uDDB8-\uDDC0\uDDD8-\uDDDD\uDE00-\uDE40\uDE44\uDE50-\uDE59\uDE80-\uDEB7\uDEC0-\uDEC9\uDF00-\uDF19\uDF1D-\uDF2B\uDF30-\uDF39]|\uD806[\uDCA0-\uDCE9\uDCFF\uDEC0-\uDEF8]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE60-\uDE69\uDED0-\uDEED\uDEF0-\uDEF4\uDF00-\uDF36\uDF40-\uDF43\uDF50-\uDF59\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50-\uDF7E\uDF8F-\uDF9F]|\uD82C[\uDC00\uDC01]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99\uDC9D\uDC9E]|\uD834[\uDD65-\uDD69\uDD6D-\uDD72\uDD7B-\uDD82\uDD85-\uDD8B\uDDAA-\uDDAD\uDE42-\uDE44]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB\uDFCE-\uDFFF]|\uD836[\uDE00-\uDE36\uDE3B-\uDE6C\uDE75\uDE84\uDE9B-\uDE9F\uDEA1-\uDEAF]|\uD83A[\uDC00-\uDCC4\uDCD0-\uDCD6]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1]|\uD87E[\uDC00-\uDE1D]|\uDB40[\uDD00-\uDDEF]/};i.Character={fromCodePoint:function(a){return a<65536?String.fromCharCode(a):String.fromCharCode(55296+(a-65536>>10))+String.fromCharCode(56320+(a-65536&1023))},isWhiteSpace:function(a){return a===32||a===9||a===11||a===12||a===160||a>=5760&&[5760,8192,8193,8194,8195,8196,8197,8198,8199,8200,8201,8202,8239,8287,12288,65279].indexOf(a)>=0},isLineTerminator:function(a){return a===10||a===13||a===8232||a===8233},isIdentifierStart:function(a){return a===36||a===95||a>=65&&a<=90||a>=97&&a<=122||a===92||a>=128&&f.NonAsciiIdentifierStart.test(i.Character.fromCodePoint(a))},isIdentifierPart:function(a){return a===36||a===95||a>=65&&a<=90||a>=97&&a<=122||a>=48&&a<=57||a===92||a>=128&&f.NonAsciiIdentifierPart.test(i.Character.fromCodePoint(a))},isDecimalDigit:function(a){return a>=48&&a<=57},isHexDigit:function(a){return a>=48&&a<=57||a>=65&&a<=70||a>=97&&a<=102},isOctalDigit:function(a){return a>=48&&a<=55}}},function(m,i,f){"use strict";Object.defineProperty(i,"__esModule",{value:!0});var a=f(6),d=function(){function u(n){this.type=a.JSXSyntax.JSXClosingElement,this.name=n}return u}();i.JSXClosingElement=d;var D=function(){function u(n,C,x){this.type=a.JSXSyntax.JSXElement,this.openingElement=n,this.children=C,this.closingElement=x}return u}();i.JSXElement=D;var l=function(){function u(){this.type=a.JSXSyntax.JSXEmptyExpression}return u}();i.JSXEmptyExpression=l;var g=function(){function u(n){this.type=a.JSXSyntax.JSXExpressionContainer,this.expression=n}return u}();i.JSXExpressionContainer=g;var F=function(){function u(n){this.type=a.JSXSyntax.JSXIdentifier,this.name=n}return u}();i.JSXIdentifier=F;var v=function(){function u(n,C){this.type=a.JSXSyntax.JSXMemberExpression,this.object=n,this.property=C}return u}();i.JSXMemberExpression=v;var p=function(){function u(n,C){this.type=a.JSXSyntax.JSXAttribute,this.name=n,this.value=C}return u}();i.JSXAttribute=p;var E=function(){function u(n,C){this.type=a.JSXSyntax.JSXNamespacedName,this.namespace=n,this.name=C}return u}();i.JSXNamespacedName=E;var s=function(){function u(n,C,x){this.type=a.JSXSyntax.JSXOpeningElement,this.name=n,this.selfClosing=C,this.attributes=x}return u}();i.JSXOpeningElement=s;var e=function(){function u(n){this.type=a.JSXSyntax.JSXSpreadAttribute,this.argument=n}return u}();i.JSXSpreadAttribute=e;var t=function(){function u(n,C){this.type=a.JSXSyntax.JSXText,this.value=n,this.raw=C}return u}();i.JSXText=t},function(m,i){"use strict";Object.defineProperty(i,"__esModule",{value:!0}),i.JSXSyntax={JSXAttribute:"JSXAttribute",JSXClosingElement:"JSXClosingElement",JSXElement:"JSXElement",JSXEmptyExpression:"JSXEmptyExpression",JSXExpressionContainer:"JSXExpressionContainer",JSXIdentifier:"JSXIdentifier",JSXMemberExpression:"JSXMemberExpression",JSXNamespacedName:"JSXNamespacedName",JSXOpeningElement:"JSXOpeningElement",JSXSpreadAttribute:"JSXSpreadAttribute",JSXText:"JSXText"}},function(m,i,f){"use strict";Object.defineProperty(i,"__esModule",{value:!0});var a=f(2),d=function(){function S(w){this.type=a.Syntax.ArrayExpression,this.elements=w}return S}();i.ArrayExpression=d;var D=function(){function S(w){this.type=a.Syntax.ArrayPattern,this.elements=w}return S}();i.ArrayPattern=D;var l=function(){function S(w,_,q){this.type=a.Syntax.ArrowFunctionExpression,this.id=null,this.params=w,this.body=_,this.generator=!1,this.expression=q,this.async=!1}return S}();i.ArrowFunctionExpression=l;var g=function(){function S(w,_,q){this.type=a.Syntax.AssignmentExpression,this.operator=w,this.left=_,this.right=q}return S}();i.AssignmentExpression=g;var F=function(){function S(w,_){this.type=a.Syntax.AssignmentPattern,this.left=w,this.right=_}return S}();i.AssignmentPattern=F;var v=function(){function S(w,_,q){this.type=a.Syntax.ArrowFunctionExpression,this.id=null,this.params=w,this.body=_,this.generator=!1,this.expression=q,this.async=!0}return S}();i.AsyncArrowFunctionExpression=v;var p=function(){function S(w,_,q){this.type=a.Syntax.FunctionDeclaration,this.id=w,this.params=_,this.body=q,this.generator=!1,this.expression=!1,this.async=!0}return S}();i.AsyncFunctionDeclaration=p;var E=function(){function S(w,_,q){this.type=a.Syntax.FunctionExpression,this.id=w,this.params=_,this.body=q,this.generator=!1,this.expression=!1,this.async=!0}return S}();i.AsyncFunctionExpression=E;var s=function(){function S(w){this.type=a.Syntax.AwaitExpression,this.argument=w}return S}();i.AwaitExpression=s;var e=function(){function S(w,_,q){var r=w==="||"||w==="&&";this.type=r?a.Syntax.LogicalExpression:a.Syntax.BinaryExpression,this.operator=w,this.left=_,this.right=q}return S}();i.BinaryExpression=e;var t=function(){function S(w){this.type=a.Syntax.BlockStatement,this.body=w}return S}();i.BlockStatement=t;var u=function(){function S(w){this.type=a.Syntax.BreakStatement,this.label=w}return S}();i.BreakStatement=u;var n=function(){function S(w,_){this.type=a.Syntax.CallExpression,this.callee=w,this.arguments=_}return S}();i.CallExpression=n;var C=function(){function S(w,_){this.type=a.Syntax.CatchClause,this.param=w,this.body=_}return S}();i.CatchClause=C;var x=function(){function S(w){this.type=a.Syntax.ClassBody,this.body=w}return S}();i.ClassBody=x;var k=function(){function S(w,_,q){this.type=a.Syntax.ClassDeclaration,this.id=w,this.superClass=_,this.body=q}return S}();i.ClassDeclaration=k;var y=function(){function S(w,_,q){this.type=a.Syntax.ClassExpression,this.id=w,this.superClass=_,this.body=q}return S}();i.ClassExpression=y;var B=function(){function S(w,_){this.type=a.Syntax.MemberExpression,this.computed=!0,this.object=w,this.property=_}return S}();i.ComputedMemberExpression=B;var M=function(){function S(w,_,q){this.type=a.Syntax.ConditionalExpression,this.test=w,this.consequent=_,this.alternate=q}return S}();i.ConditionalExpression=M;var T=function(){function S(w){this.type=a.Syntax.ContinueStatement,this.label=w}return S}();i.ContinueStatement=T;var P=function(){function S(){this.type=a.Syntax.DebuggerStatement}return S}();i.DebuggerStatement=P;var X=function(){function S(w,_){this.type=a.Syntax.ExpressionStatement,this.expression=w,this.directive=_}return S}();i.Directive=X;var j=function(){function S(w,_){this.type=a.Syntax.DoWhileStatement,this.body=w,this.test=_}return S}();i.DoWhileStatement=j;var U=function(){function S(){this.type=a.Syntax.EmptyStatement}return S}();i.EmptyStatement=U;var L=function(){function S(w){this.type=a.Syntax.ExportAllDeclaration,this.source=w}return S}();i.ExportAllDeclaration=L;var W=function(){function S(w){this.type=a.Syntax.ExportDefaultDeclaration,this.declaration=w}return S}();i.ExportDefaultDeclaration=W;var $=function(){function S(w,_,q){this.type=a.Syntax.ExportNamedDeclaration,this.declaration=w,this.specifiers=_,this.source=q}return S}();i.ExportNamedDeclaration=$;var Z=function(){function S(w,_){this.type=a.Syntax.ExportSpecifier,this.exported=_,this.local=w}return S}();i.ExportSpecifier=Z;var H=function(){function S(w){this.type=a.Syntax.ExpressionStatement,this.expression=w}return S}();i.ExpressionStatement=H;var K=function(){function S(w,_,q){this.type=a.Syntax.ForInStatement,this.left=w,this.right=_,this.body=q,this.each=!1}return S}();i.ForInStatement=K;var De=function(){function S(w,_,q){this.type=a.Syntax.ForOfStatement,this.left=w,this.right=_,this.body=q}return S}();i.ForOfStatement=De;var me=function(){function S(w,_,q,r){this.type=a.Syntax.ForStatement,this.init=w,this.test=_,this.update=q,this.body=r}return S}();i.ForStatement=me;var Se=function(){function S(w,_,q,r){this.type=a.Syntax.FunctionDeclaration,this.id=w,this.params=_,this.body=q,this.generator=r,this.expression=!1,this.async=!1}return S}();i.FunctionDeclaration=Se;var O=function(){function S(w,_,q,r){this.type=a.Syntax.FunctionExpression,this.id=w,this.params=_,this.body=q,this.generator=r,this.expression=!1,this.async=!1}return S}();i.FunctionExpression=O;var xe=function(){function S(w){this.type=a.Syntax.Identifier,this.name=w}return S}();i.Identifier=xe;var Ie=function(){function S(w,_,q){this.type=a.Syntax.IfStatement,this.test=w,this.consequent=_,this.alternate=q}return S}();i.IfStatement=Ie;var Ee=function(){function S(w,_){this.type=a.Syntax.ImportDeclaration,this.specifiers=w,this.source=_}return S}();i.ImportDeclaration=Ee;var Y=function(){function S(w){this.type=a.Syntax.ImportDefaultSpecifier,this.local=w}return S}();i.ImportDefaultSpecifier=Y;var fe=function(){function S(w){this.type=a.Syntax.ImportNamespaceSpecifier,this.local=w}return S}();i.ImportNamespaceSpecifier=fe;var Me=function(){function S(w,_){this.type=a.Syntax.ImportSpecifier,this.local=w,this.imported=_}return S}();i.ImportSpecifier=Me;var it=function(){function S(w,_){this.type=a.Syntax.LabeledStatement,this.label=w,this.body=_}return S}();i.LabeledStatement=it;var rt=function(){function S(w,_){this.type=a.Syntax.Literal,this.value=w,this.raw=_}return S}();i.Literal=rt;var qe=function(){function S(w,_){this.type=a.Syntax.MetaProperty,this.meta=w,this.property=_}return S}();i.MetaProperty=qe;var ge=function(){function S(w,_,q,r,h){this.type=a.Syntax.MethodDefinition,this.key=w,this.computed=_,this.value=q,this.kind=r,this.static=h}return S}();i.MethodDefinition=ge;var ut=function(){function S(w){this.type=a.Syntax.Program,this.body=w,this.sourceType="module"}return S}();i.Module=ut;var ne=function(){function S(w,_){this.type=a.Syntax.NewExpression,this.callee=w,this.arguments=_}return S}();i.NewExpression=ne;var We=function(){function S(w){this.type=a.Syntax.ObjectExpression,this.properties=w}return S}();i.ObjectExpression=We;var Ne=function(){function S(w){this.type=a.Syntax.ObjectPattern,this.properties=w}return S}();i.ObjectPattern=Ne;var nt=function(){function S(w,_,q,r,h,o){this.type=a.Syntax.Property,this.key=_,this.computed=q,this.value=r,this.kind=w,this.method=h,this.shorthand=o}return S}();i.Property=nt;var Ke=function(){function S(w,_,q,r){this.type=a.Syntax.Literal,this.value=w,this.raw=_,this.regex={pattern:q,flags:r}}return S}();i.RegexLiteral=Ke;var st=function(){function S(w){this.type=a.Syntax.RestElement,this.argument=w}return S}();i.RestElement=st;var at=function(){function S(w){this.type=a.Syntax.ReturnStatement,this.argument=w}return S}();i.ReturnStatement=at;var ot=function(){function S(w){this.type=a.Syntax.Program,this.body=w,this.sourceType="script"}return S}();i.Script=ot;var lt=function(){function S(w){this.type=a.Syntax.SequenceExpression,this.expressions=w}return S}();i.SequenceExpression=lt;var ht=function(){function S(w){this.type=a.Syntax.SpreadElement,this.argument=w}return S}();i.SpreadElement=ht;var Ge=function(){function S(w,_){this.type=a.Syntax.MemberExpression,this.computed=!1,this.object=w,this.property=_}return S}();i.StaticMemberExpression=Ge;var V=function(){function S(){this.type=a.Syntax.Super}return S}();i.Super=V;var se=function(){function S(w,_){this.type=a.Syntax.SwitchCase,this.test=w,this.consequent=_}return S}();i.SwitchCase=se;var J=function(){function S(w,_){this.type=a.Syntax.SwitchStatement,this.discriminant=w,this.cases=_}return S}();i.SwitchStatement=J;var oe=function(){function S(w,_){this.type=a.Syntax.TaggedTemplateExpression,this.tag=w,this.quasi=_}return S}();i.TaggedTemplateExpression=oe;var ee=function(){function S(w,_){this.type=a.Syntax.TemplateElement,this.value=w,this.tail=_}return S}();i.TemplateElement=ee;var ct=function(){function S(w,_){this.type=a.Syntax.TemplateLiteral,this.quasis=w,this.expressions=_}return S}();i.TemplateLiteral=ct;var Dt=function(){function S(){this.type=a.Syntax.ThisExpression}return S}();i.ThisExpression=Dt;var Ce=function(){function S(w){this.type=a.Syntax.ThrowStatement,this.argument=w}return S}();i.ThrowStatement=Ce;var Ve=function(){function S(w,_,q){this.type=a.Syntax.TryStatement,this.block=w,this.handler=_,this.finalizer=q}return S}();i.TryStatement=Ve;var Be=function(){function S(w,_){this.type=a.Syntax.UnaryExpression,this.operator=w,this.argument=_,this.prefix=!0}return S}();i.UnaryExpression=Be;var ie=function(){function S(w,_,q){this.type=a.Syntax.UpdateExpression,this.operator=w,this.argument=_,this.prefix=q}return S}();i.UpdateExpression=ie;var He=function(){function S(w,_){this.type=a.Syntax.VariableDeclaration,this.declarations=w,this.kind=_}return S}();i.VariableDeclaration=He;var pt=function(){function S(w,_){this.type=a.Syntax.VariableDeclarator,this.id=w,this.init=_}return S}();i.VariableDeclarator=pt;var te=function(){function S(w,_){this.type=a.Syntax.WhileStatement,this.test=w,this.body=_}return S}();i.WhileStatement=te;var ce=function(){function S(w,_){this.type=a.Syntax.WithStatement,this.object=w,this.body=_}return S}();i.WithStatement=ce;var we=function(){function S(w,_){this.type=a.Syntax.YieldExpression,this.argument=w,this.delegate=_}return S}();i.YieldExpression=we},function(m,i,f){"use strict";Object.defineProperty(i,"__esModule",{value:!0});var a=f(9),d=f(10),D=f(11),l=f(7),g=f(12),F=f(2),v=f(13),p="ArrowParameterPlaceHolder",E=function(){function s(e,t,u){t===void 0&&(t={}),this.config={range:typeof t.range=="boolean"&&t.range,loc:typeof t.loc=="boolean"&&t.loc,source:null,tokens:typeof t.tokens=="boolean"&&t.tokens,comment:typeof t.comment=="boolean"&&t.comment,tolerant:typeof t.tolerant=="boolean"&&t.tolerant},this.config.loc&&t.source&&t.source!==null&&(this.config.source=String(t.source)),this.delegate=u,this.errorHandler=new d.ErrorHandler,this.errorHandler.tolerant=this.config.tolerant,this.scanner=new g.Scanner(e,this.errorHandler),this.scanner.trackComment=this.config.comment,this.operatorPrecedence={")":0,";":0,",":0,"=":0,"]":0,"||":1,"&&":2,"|":3,"^":4,"&":5,"==":6,"!=":6,"===":6,"!==":6,"<":7,">":7,"<=":7,">=":7,"<<":8,">>":8,">>>":8,"+":9,"-":9,"*":11,"/":11,"%":11},this.lookahead={type:2,value:"",lineNumber:this.scanner.lineNumber,lineStart:0,start:0,end:0},this.hasLineTerminator=!1,this.context={isModule:!1,await:!1,allowIn:!0,allowStrictDirective:!0,allowYield:!0,firstCoverInitializedNameError:null,isAssignmentTarget:!1,isBindingElement:!1,inFunctionBody:!1,inIteration:!1,inSwitch:!1,labelSet:{},strict:!1},this.tokens=[],this.startMarker={index:0,line:this.scanner.lineNumber,column:0},this.lastMarker={index:0,line:this.scanner.lineNumber,column:0},this.nextToken(),this.lastMarker={index:this.scanner.index,line:this.scanner.lineNumber,column:this.scanner.index-this.scanner.lineStart}}return s.prototype.throwError=function(e){for(var t=[],u=1;u<arguments.length;u++)t[u-1]=arguments[u];var n=Array.prototype.slice.call(arguments,1),C=e.replace(/%(\d)/g,function(B,M){return a.assert(M<n.length,"Message reference must be in range"),n[M]}),x=this.lastMarker.index,k=this.lastMarker.line,y=this.lastMarker.column+1;throw this.errorHandler.createError(x,k,y,C)},s.prototype.tolerateError=function(e){for(var t=[],u=1;u<arguments.length;u++)t[u-1]=arguments[u];var n=Array.prototype.slice.call(arguments,1),C=e.replace(/%(\d)/g,function(B,M){return a.assert(M<n.length,"Message reference must be in range"),n[M]}),x=this.lastMarker.index,k=this.scanner.lineNumber,y=this.lastMarker.column+1;this.errorHandler.tolerateError(x,k,y,C)},s.prototype.unexpectedTokenError=function(e,t){var u=t||D.Messages.UnexpectedToken,n;if(e?(t||(u=e.type===2?D.Messages.UnexpectedEOS:e.type===3?D.Messages.UnexpectedIdentifier:e.type===6?D.Messages.UnexpectedNumber:e.type===8?D.Messages.UnexpectedString:e.type===10?D.Messages.UnexpectedTemplate:D.Messages.UnexpectedToken,e.type===4&&(this.scanner.isFutureReservedWord(e.value)?u=D.Messages.UnexpectedReserved:this.context.strict&&this.scanner.isStrictModeReservedWord(e.value)&&(u=D.Messages.StrictReservedWord))),n=e.value):n="ILLEGAL",u=u.replace("%0",n),e&&typeof e.lineNumber=="number"){var C=e.start,x=e.lineNumber,k=this.lastMarker.index-this.lastMarker.column,y=e.start-k+1;return this.errorHandler.createError(C,x,y,u)}else{var C=this.lastMarker.index,x=this.lastMarker.line,y=this.lastMarker.column+1;return this.errorHandler.createError(C,x,y,u)}},s.prototype.throwUnexpectedToken=function(e,t){throw this.unexpectedTokenError(e,t)},s.prototype.tolerateUnexpectedToken=function(e,t){this.errorHandler.tolerate(this.unexpectedTokenError(e,t))},s.prototype.collectComments=function(){if(!this.config.comment)this.scanner.scanComments();else{var e=this.scanner.scanComments();if(e.length>0&&this.delegate)for(var t=0;t<e.length;++t){var u=e[t],n=void 0;n={type:u.multiLine?"BlockComment":"LineComment",value:this.scanner.source.slice(u.slice[0],u.slice[1])},this.config.range&&(n.range=u.range),this.config.loc&&(n.loc=u.loc);var C={start:{line:u.loc.start.line,column:u.loc.start.column,offset:u.range[0]},end:{line:u.loc.end.line,column:u.loc.end.column,offset:u.range[1]}};this.delegate(n,C)}}},s.prototype.getTokenRaw=function(e){return this.scanner.source.slice(e.start,e.end)},s.prototype.convertToken=function(e){var t={type:v.TokenName[e.type],value:this.getTokenRaw(e)};if(this.config.range&&(t.range=[e.start,e.end]),this.config.loc&&(t.loc={start:{line:this.startMarker.line,column:this.startMarker.column},end:{line:this.scanner.lineNumber,column:this.scanner.index-this.scanner.lineStart}}),e.type===9){var u=e.pattern,n=e.flags;t.regex={pattern:u,flags:n}}return t},s.prototype.nextToken=function(){var e=this.lookahead;this.lastMarker.index=this.scanner.index,this.lastMarker.line=this.scanner.lineNumber,this.lastMarker.column=this.scanner.index-this.scanner.lineStart,this.collectComments(),this.scanner.index!==this.startMarker.index&&(this.startMarker.index=this.scanner.index,this.startMarker.line=this.scanner.lineNumber,this.startMarker.column=this.scanner.index-this.scanner.lineStart);var t=this.scanner.lex();return this.hasLineTerminator=e.lineNumber!==t.lineNumber,t&&this.context.strict&&t.type===3&&this.scanner.isStrictModeReservedWord(t.value)&&(t.type=4),this.lookahead=t,this.config.tokens&&t.type!==2&&this.tokens.push(this.convertToken(t)),e},s.prototype.nextRegexToken=function(){this.collectComments();var e=this.scanner.scanRegExp();return this.config.tokens&&(this.tokens.pop(),this.tokens.push(this.convertToken(e))),this.lookahead=e,this.nextToken(),e},s.prototype.createNode=function(){return{index:this.startMarker.index,line:this.startMarker.line,column:this.startMarker.column}},s.prototype.startNode=function(e,t){t===void 0&&(t=0);var u=e.start-e.lineStart,n=e.lineNumber;return u<0&&(u+=t,n--),{index:e.start,line:n,column:u}},s.prototype.finalize=function(e,t){if(this.config.range&&(t.range=[e.index,this.lastMarker.index]),this.config.loc&&(t.loc={start:{line:e.line,column:e.column},end:{line:this.lastMarker.line,column:this.lastMarker.column}},this.config.source&&(t.loc.source=this.config.source)),this.delegate){var u={start:{line:e.line,column:e.column,offset:e.index},end:{line:this.lastMarker.line,column:this.lastMarker.column,offset:this.lastMarker.index}};this.delegate(t,u)}return t},s.prototype.expect=function(e){var t=this.nextToken();(t.type!==7||t.value!==e)&&this.throwUnexpectedToken(t)},s.prototype.expectCommaSeparator=function(){if(this.config.tolerant){var e=this.lookahead;e.type===7&&e.value===","?this.nextToken():e.type===7&&e.value===";"?(this.nextToken(),this.tolerateUnexpectedToken(e)):this.tolerateUnexpectedToken(e,D.Messages.UnexpectedToken)}else this.expect(",")},s.prototype.expectKeyword=function(e){var t=this.nextToken();(t.type!==4||t.value!==e)&&this.throwUnexpectedToken(t)},s.prototype.match=function(e){return this.lookahead.type===7&&this.lookahead.value===e},s.prototype.matchKeyword=function(e){return this.lookahead.type===4&&this.lookahead.value===e},s.prototype.matchContextualKeyword=function(e){return this.lookahead.type===3&&this.lookahead.value===e},s.prototype.matchAssign=function(){if(this.lookahead.type!==7)return!1;var e=this.lookahead.value;return e==="="||e==="*="||e==="**="||e==="/="||e==="%="||e==="+="||e==="-="||e==="<<="||e===">>="||e===">>>="||e==="&="||e==="^="||e==="|="},s.prototype.isolateCoverGrammar=function(e){var t=this.context.isBindingElement,u=this.context.isAssignmentTarget,n=this.context.firstCoverInitializedNameError;this.context.isBindingElement=!0,this.context.isAssignmentTarget=!0,this.context.firstCoverInitializedNameError=null;var C=e.call(this);return this.context.firstCoverInitializedNameError!==null&&this.throwUnexpectedToken(this.context.firstCoverInitializedNameError),this.context.isBindingElement=t,this.context.isAssignmentTarget=u,this.context.firstCoverInitializedNameError=n,C},s.prototype.inheritCoverGrammar=function(e){var t=this.context.isBindingElement,u=this.context.isAssignmentTarget,n=this.context.firstCoverInitializedNameError;this.context.isBindingElement=!0,this.context.isAssignmentTarget=!0,this.context.firstCoverInitializedNameError=null;var C=e.call(this);return this.context.isBindingElement=this.context.isBindingElement&&t,this.context.isAssignmentTarget=this.context.isAssignmentTarget&&u,this.context.firstCoverInitializedNameError=n||this.context.firstCoverInitializedNameError,C},s.prototype.consumeSemicolon=function(){this.match(";")?this.nextToken():this.hasLineTerminator||(this.lookahead.type!==2&&!this.match("}")&&this.throwUnexpectedToken(this.lookahead),this.lastMarker.index=this.startMarker.index,this.lastMarker.line=this.startMarker.line,this.lastMarker.column=this.startMarker.column)},s.prototype.parsePrimaryExpression=function(){var e=this.createNode(),t,u,n;switch(this.lookahead.type){case 3:(this.context.isModule||this.context.await)&&this.lookahead.value==="await"&&this.tolerateUnexpectedToken(this.lookahead),t=this.matchAsyncFunction()?this.parseFunctionExpression():this.finalize(e,new l.Identifier(this.nextToken().value));break;case 6:case 8:this.context.strict&&this.lookahead.octal&&this.tolerateUnexpectedToken(this.lookahead,D.Messages.StrictOctalLiteral),this.context.isAssignmentTarget=!1,this.context.isBindingElement=!1,u=this.nextToken(),n=this.getTokenRaw(u),t=this.finalize(e,new l.Literal(u.value,n));break;case 1:this.context.isAssignmentTarget=!1,this.context.isBindingElement=!1,u=this.nextToken(),n=this.getTokenRaw(u),t=this.finalize(e,new l.Literal(u.value==="true",n));break;case 5:this.context.isAssignmentTarget=!1,this.context.isBindingElement=!1,u=this.nextToken(),n=this.getTokenRaw(u),t=this.finalize(e,new l.Literal(null,n));break;case 10:t=this.parseTemplateLiteral();break;case 7:switch(this.lookahead.value){case"(":this.context.isBindingElement=!1,t=this.inheritCoverGrammar(this.parseGroupExpression);break;case"[":t=this.inheritCoverGrammar(this.parseArrayInitializer);break;case"{":t=this.inheritCoverGrammar(this.parseObjectInitializer);break;case"/":case"/=":this.context.isAssignmentTarget=!1,this.context.isBindingElement=!1,this.scanner.index=this.startMarker.index,u=this.nextRegexToken(),n=this.getTokenRaw(u),t=this.finalize(e,new l.RegexLiteral(u.regex,n,u.pattern,u.flags));break;default:t=this.throwUnexpectedToken(this.nextToken())}break;case 4:!this.context.strict&&this.context.allowYield&&this.matchKeyword("yield")?t=this.parseIdentifierName():!this.context.strict&&this.matchKeyword("let")?t=this.finalize(e,new l.Identifier(this.nextToken().value)):(this.context.isAssignmentTarget=!1,this.context.isBindingElement=!1,this.matchKeyword("function")?t=this.parseFunctionExpression():this.matchKeyword("this")?(this.nextToken(),t=this.finalize(e,new l.ThisExpression)):this.matchKeyword("class")?t=this.parseClassExpression():t=this.throwUnexpectedToken(this.nextToken()));break;default:t=this.throwUnexpectedToken(this.nextToken())}return t},s.prototype.parseSpreadElement=function(){var e=this.createNode();this.expect("...");var t=this.inheritCoverGrammar(this.parseAssignmentExpression);return this.finalize(e,new l.SpreadElement(t))},s.prototype.parseArrayInitializer=function(){var e=this.createNode(),t=[];for(this.expect("[");!this.match("]");)if(this.match(","))this.nextToken(),t.push(null);else if(this.match("...")){var u=this.parseSpreadElement();this.match("]")||(this.context.isAssignmentTarget=!1,this.context.isBindingElement=!1,this.expect(",")),t.push(u)}else t.push(this.inheritCoverGrammar(this.parseAssignmentExpression)),this.match("]")||this.expect(",");return this.expect("]"),this.finalize(e,new l.ArrayExpression(t))},s.prototype.parsePropertyMethod=function(e){this.context.isAssignmentTarget=!1,this.context.isBindingElement=!1;var t=this.context.strict,u=this.context.allowStrictDirective;this.context.allowStrictDirective=e.simple;var n=this.isolateCoverGrammar(this.parseFunctionSourceElements);return this.context.strict&&e.firstRestricted&&this.tolerateUnexpectedToken(e.firstRestricted,e.message),this.context.strict&&e.stricted&&this.tolerateUnexpectedToken(e.stricted,e.message),this.context.strict=t,this.context.allowStrictDirective=u,n},s.prototype.parsePropertyMethodFunction=function(){var e=!1,t=this.createNode(),u=this.context.allowYield;this.context.allowYield=!0;var n=this.parseFormalParameters(),C=this.parsePropertyMethod(n);return this.context.allowYield=u,this.finalize(t,new l.FunctionExpression(null,n.params,C,e))},s.prototype.parsePropertyMethodAsyncFunction=function(){var e=this.createNode(),t=this.context.allowYield,u=this.context.await;this.context.allowYield=!1,this.context.await=!0;var n=this.parseFormalParameters(),C=this.parsePropertyMethod(n);return this.context.allowYield=t,this.context.await=u,this.finalize(e,new l.AsyncFunctionExpression(null,n.params,C))},s.prototype.parseObjectPropertyKey=function(){var e=this.createNode(),t=this.nextToken(),u;switch(t.type){case 8:case 6:this.context.strict&&t.octal&&this.tolerateUnexpectedToken(t,D.Messages.StrictOctalLiteral);var n=this.getTokenRaw(t);u=this.finalize(e,new l.Literal(t.value,n));break;case 3:case 1:case 5:case 4:u=this.finalize(e,new l.Identifier(t.value));break;case 7:t.value==="["?(u=this.isolateCoverGrammar(this.parseAssignmentExpression),this.expect("]")):u=this.throwUnexpectedToken(t);break;default:u=this.throwUnexpectedToken(t)}return u},s.prototype.isPropertyKey=function(e,t){return e.type===F.Syntax.Identifier&&e.name===t||e.type===F.Syntax.Literal&&e.value===t},s.prototype.parseObjectProperty=function(e){var t=this.createNode(),u=this.lookahead,n,C=null,x=null,k=!1,y=!1,B=!1,M=!1;if(u.type===3){var T=u.value;this.nextToken(),k=this.match("["),M=!this.hasLineTerminator&&T==="async"&&!this.match(":")&&!this.match("(")&&!this.match("*")&&!this.match(","),C=M?this.parseObjectPropertyKey():this.finalize(t,new l.Identifier(T))}else this.match("*")?this.nextToken():(k=this.match("["),C=this.parseObjectPropertyKey());var P=this.qualifiedPropertyName(this.lookahead);if(u.type===3&&!M&&u.value==="get"&&P)n="get",k=this.match("["),C=this.parseObjectPropertyKey(),this.context.allowYield=!1,x=this.parseGetterMethod();else if(u.type===3&&!M&&u.value==="set"&&P)n="set",k=this.match("["),C=this.parseObjectPropertyKey(),x=this.parseSetterMethod();else if(u.type===7&&u.value==="*"&&P)n="init",k=this.match("["),C=this.parseObjectPropertyKey(),x=this.parseGeneratorMethod(),y=!0;else if(C||this.throwUnexpectedToken(this.lookahead),n="init",this.match(":")&&!M)!k&&this.isPropertyKey(C,"__proto__")&&(e.value&&this.tolerateError(D.Messages.DuplicateProtoProperty),e.value=!0),this.nextToken(),x=this.inheritCoverGrammar(this.parseAssignmentExpression);else if(this.match("("))x=M?this.parsePropertyMethodAsyncFunction():this.parsePropertyMethodFunction(),y=!0;else if(u.type===3){var T=this.finalize(t,new l.Identifier(u.value));if(this.match("=")){this.context.firstCoverInitializedNameError=this.lookahead,this.nextToken(),B=!0;var X=this.isolateCoverGrammar(this.parseAssignmentExpression);x=this.finalize(t,new l.AssignmentPattern(T,X))}else B=!0,x=T}else this.throwUnexpectedToken(this.nextToken());return this.finalize(t,new l.Property(n,C,k,x,y,B))},s.prototype.parseObjectInitializer=function(){var e=this.createNode();this.expect("{");for(var t=[],u={value:!1};!this.match("}");)t.push(this.parseObjectProperty(u)),this.match("}")||this.expectCommaSeparator();return this.expect("}"),this.finalize(e,new l.ObjectExpression(t))},s.prototype.parseTemplateHead=function(){a.assert(this.lookahead.head,"Template literal must start with a template head");var e=this.createNode(),t=this.nextToken(),u=t.value,n=t.cooked;return this.finalize(e,new l.TemplateElement({raw:u,cooked:n},t.tail))},s.prototype.parseTemplateElement=function(){this.lookahead.type!==10&&this.throwUnexpectedToken();var e=this.createNode(),t=this.nextToken(),u=t.value,n=t.cooked;return this.finalize(e,new l.TemplateElement({raw:u,cooked:n},t.tail))},s.prototype.parseTemplateLiteral=function(){var e=this.createNode(),t=[],u=[],n=this.parseTemplateHead();for(u.push(n);!n.tail;)t.push(this.parseExpression()),n=this.parseTemplateElement(),u.push(n);return this.finalize(e,new l.TemplateLiteral(u,t))},s.prototype.reinterpretExpressionAsPattern=function(e){switch(e.type){case F.Syntax.Identifier:case F.Syntax.MemberExpression:case F.Syntax.RestElement:case F.Syntax.AssignmentPattern:break;case F.Syntax.SpreadElement:e.type=F.Syntax.RestElement,this.reinterpretExpressionAsPattern(e.argument);break;case F.Syntax.ArrayExpression:e.type=F.Syntax.ArrayPattern;for(var t=0;t<e.elements.length;t++)e.elements[t]!==null&&this.reinterpretExpressionAsPattern(e.elements[t]);break;case F.Syntax.ObjectExpression:e.type=F.Syntax.ObjectPattern;for(var t=0;t<e.properties.length;t++)this.reinterpretExpressionAsPattern(e.properties[t].value);break;case F.Syntax.AssignmentExpression:e.type=F.Syntax.AssignmentPattern,delete e.operator,this.reinterpretExpressionAsPattern(e.left);break;default:break}},s.prototype.parseGroupExpression=function(){var e;if(this.expect("("),this.match(")"))this.nextToken(),this.match("=>")||this.expect("=>"),e={type:p,params:[],async:!1};else{var t=this.lookahead,u=[];if(this.match("..."))e=this.parseRestElement(u),this.expect(")"),this.match("=>")||this.expect("=>"),e={type:p,params:[e],async:!1};else{var n=!1;if(this.context.isBindingElement=!0,e=this.inheritCoverGrammar(this.parseAssignmentExpression),this.match(",")){var C=[];for(this.context.isAssignmentTarget=!1,C.push(e);this.lookahead.type!==2&&this.match(",");){if(this.nextToken(),this.match(")")){this.nextToken();for(var x=0;x<C.length;x++)this.reinterpretExpressionAsPattern(C[x]);n=!0,e={type:p,params:C,async:!1}}else if(this.match("...")){this.context.isBindingElement||this.throwUnexpectedToken(this.lookahead),C.push(this.parseRestElement(u)),this.expect(")"),this.match("=>")||this.expect("=>"),this.context.isBindingElement=!1;for(var x=0;x<C.length;x++)this.reinterpretExpressionAsPattern(C[x]);n=!0,e={type:p,params:C,async:!1}}else C.push(this.inheritCoverGrammar(this.parseAssignmentExpression));if(n)break}n||(e=this.finalize(this.startNode(t),new l.SequenceExpression(C)))}if(!n){if(this.expect(")"),this.match("=>")&&(e.type===F.Syntax.Identifier&&e.name==="yield"&&(n=!0,e={type:p,params:[e],async:!1}),!n)){if(this.context.isBindingElement||this.throwUnexpectedToken(this.lookahead),e.type===F.Syntax.SequenceExpression)for(var x=0;x<e.expressions.length;x++)this.reinterpretExpressionAsPattern(e.expressions[x]);else this.reinterpretExpressionAsPattern(e);var k=e.type===F.Syntax.SequenceExpression?e.expressions:[e];e={type:p,params:k,async:!1}}this.context.isBindingElement=!1}}}return e},s.prototype.parseArguments=function(){this.expect("(");var e=[];if(!this.match(")"))for(;;){var t=this.match("...")?this.parseSpreadElement():this.isolateCoverGrammar(this.parseAssignmentExpression);if(e.push(t),this.match(")")||(this.expectCommaSeparator(),this.match(")")))break}return this.expect(")"),e},s.prototype.isIdentifierName=function(e){return e.type===3||e.type===4||e.type===1||e.type===5},s.prototype.parseIdentifierName=function(){var e=this.createNode(),t=this.nextToken();return this.isIdentifierName(t)||this.throwUnexpectedToken(t),this.finalize(e,new l.Identifier(t.value))},s.prototype.parseNewExpression=function(){var e=this.createNode(),t=this.parseIdentifierName();a.assert(t.name==="new","New expression must start with `new`");var u;if(this.match("."))if(this.nextToken(),this.lookahead.type===3&&this.context.inFunctionBody&&this.lookahead.value==="target"){var n=this.parseIdentifierName();u=new l.MetaProperty(t,n)}else this.throwUnexpectedToken(this.lookahead);else{var C=this.isolateCoverGrammar(this.parseLeftHandSideExpression),x=this.match("(")?this.parseArguments():[];u=new l.NewExpression(C,x),this.context.isAssignmentTarget=!1,this.context.isBindingElement=!1}return this.finalize(e,u)},s.prototype.parseAsyncArgument=function(){var e=this.parseAssignmentExpression();return this.context.firstCoverInitializedNameError=null,e},s.prototype.parseAsyncArguments=function(){this.expect("(");var e=[];if(!this.match(")"))for(;;){var t=this.match("...")?this.parseSpreadElement():this.isolateCoverGrammar(this.parseAsyncArgument);if(e.push(t),this.match(")")||(this.expectCommaSeparator(),this.match(")")))break}return this.expect(")"),e},s.prototype.parseLeftHandSideExpressionAllowCall=function(){var e=this.lookahead,t=this.matchContextualKeyword("async"),u=this.context.allowIn;this.context.allowIn=!0;var n;for(this.matchKeyword("super")&&this.context.inFunctionBody?(n=this.createNode(),this.nextToken(),n=this.finalize(n,new l.Super),!this.match("(")&&!this.match(".")&&!this.match("[")&&this.throwUnexpectedToken(this.lookahead)):n=this.inheritCoverGrammar(this.matchKeyword("new")?this.parseNewExpression:this.parsePrimaryExpression);;)if(this.match(".")){this.context.isBindingElement=!1,this.context.isAssignmentTarget=!0,this.expect(".");var C=this.parseIdentifierName();n=this.finalize(this.startNode(e),new l.StaticMemberExpression(n,C))}else if(this.match("(")){var x=t&&e.lineNumber===this.lookahead.lineNumber;this.context.isBindingElement=!1,this.context.isAssignmentTarget=!1;var k=x?this.parseAsyncArguments():this.parseArguments();if(n=this.finalize(this.startNode(e),new l.CallExpression(n,k)),x&&this.match("=>")){for(var y=0;y<k.length;++y)this.reinterpretExpressionAsPattern(k[y]);n={type:p,params:k,async:!0}}}else if(this.match("[")){this.context.isBindingElement=!1,this.context.isAssignmentTarget=!0,this.expect("[");var C=this.isolateCoverGrammar(this.parseExpression);this.expect("]"),n=this.finalize(this.startNode(e),new l.ComputedMemberExpression(n,C))}else if(this.lookahead.type===10&&this.lookahead.head){var B=this.parseTemplateLiteral();n=this.finalize(this.startNode(e),new l.TaggedTemplateExpression(n,B))}else break;return this.context.allowIn=u,n},s.prototype.parseSuper=function(){var e=this.createNode();return this.expectKeyword("super"),!this.match("[")&&!this.match(".")&&this.throwUnexpectedToken(this.lookahead),this.finalize(e,new l.Super)},s.prototype.parseLeftHandSideExpression=function(){a.assert(this.context.allowIn,"callee of new expression always allow in keyword.");for(var e=this.startNode(this.lookahead),t=this.matchKeyword("super")&&this.context.inFunctionBody?this.parseSuper():this.inheritCoverGrammar(this.matchKeyword("new")?this.parseNewExpression:this.parsePrimaryExpression);;)if(this.match("[")){this.context.isBindingElement=!1,this.context.isAssignmentTarget=!0,this.expect("[");var u=this.isolateCoverGrammar(this.parseExpression);this.expect("]"),t=this.finalize(e,new l.ComputedMemberExpression(t,u))}else if(this.match(".")){this.context.isBindingElement=!1,this.context.isAssignmentTarget=!0,this.expect(".");var u=this.parseIdentifierName();t=this.finalize(e,new l.StaticMemberExpression(t,u))}else if(this.lookahead.type===10&&this.lookahead.head){var n=this.parseTemplateLiteral();t=this.finalize(e,new l.TaggedTemplateExpression(t,n))}else break;return t},s.prototype.parseUpdateExpression=function(){var e,t=this.lookahead;if(this.match("++")||this.match("--")){var u=this.startNode(t),n=this.nextToken();e=this.inheritCoverGrammar(this.parseUnaryExpression),this.context.strict&&e.type===F.Syntax.Identifier&&this.scanner.isRestrictedWord(e.name)&&this.tolerateError(D.Messages.StrictLHSPrefix),this.context.isAssignmentTarget||this.tolerateError(D.Messages.InvalidLHSInAssignment);var C=!0;e=this.finalize(u,new l.UpdateExpression(n.value,e,C)),this.context.isAssignmentTarget=!1,this.context.isBindingElement=!1}else if(e=this.inheritCoverGrammar(this.parseLeftHandSideExpressionAllowCall),!this.hasLineTerminator&&this.lookahead.type===7&&(this.match("++")||this.match("--"))){this.context.strict&&e.type===F.Syntax.Identifier&&this.scanner.isRestrictedWord(e.name)&&this.tolerateError(D.Messages.StrictLHSPostfix),this.context.isAssignmentTarget||this.tolerateError(D.Messages.InvalidLHSInAssignment),this.context.isAssignmentTarget=!1,this.context.isBindingElement=!1;var x=this.nextToken().value,C=!1;e=this.finalize(this.startNode(t),new l.UpdateExpression(x,e,C))}return e},s.prototype.parseAwaitExpression=function(){var e=this.createNode();this.nextToken();var t=this.parseUnaryExpression();return this.finalize(e,new l.AwaitExpression(t))},s.prototype.parseUnaryExpression=function(){var e;if(this.match("+")||this.match("-")||this.match("~")||this.match("!")||this.matchKeyword("delete")||this.matchKeyword("void")||this.matchKeyword("typeof")){var t=this.startNode(this.lookahead),u=this.nextToken();e=this.inheritCoverGrammar(this.parseUnaryExpression),e=this.finalize(t,new l.UnaryExpression(u.value,e)),this.context.strict&&e.operator==="delete"&&e.argument.type===F.Syntax.Identifier&&this.tolerateError(D.Messages.StrictDelete),this.context.isAssignmentTarget=!1,this.context.isBindingElement=!1}else this.context.await&&this.matchContextualKeyword("await")?e=this.parseAwaitExpression():e=this.parseUpdateExpression();return e},s.prototype.parseExponentiationExpression=function(){var e=this.lookahead,t=this.inheritCoverGrammar(this.parseUnaryExpression);if(t.type!==F.Syntax.UnaryExpression&&this.match("**")){this.nextToken(),this.context.isAssignmentTarget=!1,this.context.isBindingElement=!1;var u=t,n=this.isolateCoverGrammar(this.parseExponentiationExpression);t=this.finalize(this.startNode(e),new l.BinaryExpression("**",u,n))}return t},s.prototype.binaryPrecedence=function(e){var t=e.value,u;return e.type===7?u=this.operatorPrecedence[t]||0:e.type===4?u=t==="instanceof"||this.context.allowIn&&t==="in"?7:0:u=0,u},s.prototype.parseBinaryExpression=function(){var e=this.lookahead,t=this.inheritCoverGrammar(this.parseExponentiationExpression),u=this.lookahead,n=this.binaryPrecedence(u);if(n>0){this.nextToken(),this.context.isAssignmentTarget=!1,this.context.isBindingElement=!1;for(var C=[e,this.lookahead],x=t,k=this.isolateCoverGrammar(this.parseExponentiationExpression),y=[x,u.value,k],B=[n];n=this.binaryPrecedence(this.lookahead),!(n<=0);){for(;y.length>2&&n<=B[B.length-1];){k=y.pop();var M=y.pop();B.pop(),x=y.pop(),C.pop();var T=this.startNode(C[C.length-1]);y.push(this.finalize(T,new l.BinaryExpression(M,x,k)))}y.push(this.nextToken().value),B.push(n),C.push(this.lookahead),y.push(this.isolateCoverGrammar(this.parseExponentiationExpression))}var P=y.length-1;t=y[P];for(var X=C.pop();P>1;){var j=C.pop(),U=X&&X.lineStart,T=this.startNode(j,U),M=y[P-1];t=this.finalize(T,new l.BinaryExpression(M,y[P-2],t)),P-=2,X=j}}return t},s.prototype.parseConditionalExpression=function(){var e=this.lookahead,t=this.inheritCoverGrammar(this.parseBinaryExpression);if(this.match("?")){this.nextToken();var u=this.context.allowIn;this.context.allowIn=!0;var n=this.isolateCoverGrammar(this.parseAssignmentExpression);this.context.allowIn=u,this.expect(":");var C=this.isolateCoverGrammar(this.parseAssignmentExpression);t=this.finalize(this.startNode(e),new l.ConditionalExpression(t,n,C)),this.context.isAssignmentTarget=!1,this.context.isBindingElement=!1}return t},s.prototype.checkPatternParam=function(e,t){switch(t.type){case F.Syntax.Identifier:this.validateParam(e,t,t.name);break;case F.Syntax.RestElement:this.checkPatternParam(e,t.argument);break;case F.Syntax.AssignmentPattern:this.checkPatternParam(e,t.left);break;case F.Syntax.ArrayPattern:for(var u=0;u<t.elements.length;u++)t.elements[u]!==null&&this.checkPatternParam(e,t.elements[u]);break;case F.Syntax.ObjectPattern:for(var u=0;u<t.properties.length;u++)this.checkPatternParam(e,t.properties[u].value);break;default:break}e.simple=e.simple&&t instanceof l.Identifier},s.prototype.reinterpretAsCoverFormalsList=function(e){var t=[e],u,n=!1;switch(e.type){case F.Syntax.Identifier:break;case p:t=e.params,n=e.async;break;default:return null}u={simple:!0,paramSet:{}};for(var C=0;C<t.length;++C){var x=t[C];x.type===F.Syntax.AssignmentPattern?x.right.type===F.Syntax.YieldExpression&&(x.right.argument&&this.throwUnexpectedToken(this.lookahead),x.right.type=F.Syntax.Identifier,x.right.name="yield",delete x.right.argument,delete x.right.delegate):n&&x.type===F.Syntax.Identifier&&x.name==="await"&&this.throwUnexpectedToken(this.lookahead),this.checkPatternParam(u,x),t[C]=x}if(this.context.strict||!this.context.allowYield)for(var C=0;C<t.length;++C){var x=t[C];x.type===F.Syntax.YieldExpression&&this.throwUnexpectedToken(this.lookahead)}if(u.message===D.Messages.StrictParamDupe){var k=this.context.strict?u.stricted:u.firstRestricted;this.throwUnexpectedToken(k,u.message)}return{simple:u.simple,params:t,stricted:u.stricted,firstRestricted:u.firstRestricted,message:u.message}},s.prototype.parseAssignmentExpression=function(){var e;if(!this.context.allowYield&&this.matchKeyword("yield"))e=this.parseYieldExpression();else{var t=this.lookahead,u=t;if(e=this.parseConditionalExpression(),u.type===3&&u.lineNumber===this.lookahead.lineNumber&&u.value==="async"&&(this.lookahead.type===3||this.matchKeyword("yield"))){var n=this.parsePrimaryExpression();this.reinterpretExpressionAsPattern(n),e={type:p,params:[n],async:!0}}if(e.type===p||this.match("=>")){this.context.isAssignmentTarget=!1,this.context.isBindingElement=!1;var C=e.async,x=this.reinterpretAsCoverFormalsList(e);if(x){this.hasLineTerminator&&this.tolerateUnexpectedToken(this.lookahead),this.context.firstCoverInitializedNameError=null;var k=this.context.strict,y=this.context.allowStrictDirective;this.context.allowStrictDirective=x.simple;var B=this.context.allowYield,M=this.context.await;this.context.allowYield=!0,this.context.await=C;var T=this.startNode(t);this.expect("=>");var P=void 0;if(this.match("{")){var X=this.context.allowIn;this.context.allowIn=!0,P=this.parseFunctionSourceElements(),this.context.allowIn=X}else P=this.isolateCoverGrammar(this.parseAssignmentExpression);var j=P.type!==F.Syntax.BlockStatement;this.context.strict&&x.firstRestricted&&this.throwUnexpectedToken(x.firstRestricted,x.message),this.context.strict&&x.stricted&&this.tolerateUnexpectedToken(x.stricted,x.message),e=C?this.finalize(T,new l.AsyncArrowFunctionExpression(x.params,P,j)):this.finalize(T,new l.ArrowFunctionExpression(x.params,P,j)),this.context.strict=k,this.context.allowStrictDirective=y,this.context.allowYield=B,this.context.await=M}}else if(this.matchAssign()){if(this.context.isAssignmentTarget||this.tolerateError(D.Messages.InvalidLHSInAssignment),this.context.strict&&e.type===F.Syntax.Identifier){var U=e;this.scanner.isRestrictedWord(U.name)&&this.tolerateUnexpectedToken(u,D.Messages.StrictLHSAssignment),this.scanner.isStrictModeReservedWord(U.name)&&this.tolerateUnexpectedToken(u,D.Messages.StrictReservedWord)}this.match("=")?this.reinterpretExpressionAsPattern(e):(this.context.isAssignmentTarget=!1,this.context.isBindingElement=!1),u=this.nextToken();var L=u.value,W=this.isolateCoverGrammar(this.parseAssignmentExpression);e=this.finalize(this.startNode(t),new l.AssignmentExpression(L,e,W)),this.context.firstCoverInitializedNameError=null}}return e},s.prototype.parseExpression=function(){var e=this.lookahead,t=this.isolateCoverGrammar(this.parseAssignmentExpression);if(this.match(",")){var u=[];for(u.push(t);this.lookahead.type!==2&&this.match(",");)this.nextToken(),u.push(this.isolateCoverGrammar(this.parseAssignmentExpression));t=this.finalize(this.startNode(e),new l.SequenceExpression(u))}return t},s.prototype.parseStatementListItem=function(){var e;if(this.context.isAssignmentTarget=!0,this.context.isBindingElement=!0,this.lookahead.type===4)switch(this.lookahead.value){case"export":this.context.isModule||this.tolerateUnexpectedToken(this.lookahead,D.Messages.IllegalExportDeclaration),e=this.parseExportDeclaration();break;case"import":this.context.isModule||this.tolerateUnexpectedToken(this.lookahead,D.Messages.IllegalImportDeclaration),e=this.parseImportDeclaration();break;case"const":e=this.parseLexicalDeclaration({inFor:!1});break;case"function":e=this.parseFunctionDeclaration();break;case"class":e=this.parseClassDeclaration();break;case"let":e=this.isLexicalDeclaration()?this.parseLexicalDeclaration({inFor:!1}):this.parseStatement();break;default:e=this.parseStatement();break}else e=this.parseStatement();return e},s.prototype.parseBlock=function(){var e=this.createNode();this.expect("{");for(var t=[];!this.match("}");)t.push(this.parseStatementListItem());return this.expect("}"),this.finalize(e,new l.BlockStatement(t))},s.prototype.parseLexicalBinding=function(e,t){var u=this.createNode(),n=[],C=this.parsePattern(n,e);this.context.strict&&C.type===F.Syntax.Identifier&&this.scanner.isRestrictedWord(C.name)&&this.tolerateError(D.Messages.StrictVarName);var x=null;return e==="const"?!this.matchKeyword("in")&&!this.matchContextualKeyword("of")&&(this.match("=")?(this.nextToken(),x=this.isolateCoverGrammar(this.parseAssignmentExpression)):this.throwError(D.Messages.DeclarationMissingInitializer,"const")):(!t.inFor&&C.type!==F.Syntax.Identifier||this.match("="))&&(this.expect("="),x=this.isolateCoverGrammar(this.parseAssignmentExpression)),this.finalize(u,new l.VariableDeclarator(C,x))},s.prototype.parseBindingList=function(e,t){for(var u=[this.parseLexicalBinding(e,t)];this.match(",");)this.nextToken(),u.push(this.parseLexicalBinding(e,t));return u},s.prototype.isLexicalDeclaration=function(){var e=this.scanner.saveState();this.scanner.scanComments();var t=this.scanner.lex();return this.scanner.restoreState(e),t.type===3||t.type===7&&t.value==="["||t.type===7&&t.value==="{"||t.type===4&&t.value==="let"||t.type===4&&t.value==="yield"},s.prototype.parseLexicalDeclaration=function(e){var t=this.createNode(),u=this.nextToken().value;a.assert(u==="let"||u==="const","Lexical declaration must be either let or const");var n=this.parseBindingList(u,e);return this.consumeSemicolon(),this.finalize(t,new l.VariableDeclaration(n,u))},s.prototype.parseBindingRestElement=function(e,t){var u=this.createNode();this.expect("...");var n=this.parsePattern(e,t);return this.finalize(u,new l.RestElement(n))},s.prototype.parseArrayPattern=function(e,t){var u=this.createNode();this.expect("[");for(var n=[];!this.match("]");)if(this.match(","))this.nextToken(),n.push(null);else{if(this.match("...")){n.push(this.parseBindingRestElement(e,t));break}else n.push(this.parsePatternWithDefault(e,t));this.match("]")||this.expect(",")}return this.expect("]"),this.finalize(u,new l.ArrayPattern(n))},s.prototype.parsePropertyPattern=function(e,t){var u=this.createNode(),n=!1,C=!1,x=!1,k,y;if(this.lookahead.type===3){var B=this.lookahead;k=this.parseVariableIdentifier();var M=this.finalize(u,new l.Identifier(B.value));if(this.match("=")){e.push(B),C=!0,this.nextToken();var T=this.parseAssignmentExpression();y=this.finalize(this.startNode(B),new l.AssignmentPattern(M,T))}else this.match(":")?(this.expect(":"),y=this.parsePatternWithDefault(e,t)):(e.push(B),C=!0,y=M)}else n=this.match("["),k=this.parseObjectPropertyKey(),this.expect(":"),y=this.parsePatternWithDefault(e,t);return this.finalize(u,new l.Property("init",k,n,y,x,C))},s.prototype.parseObjectPattern=function(e,t){var u=this.createNode(),n=[];for(this.expect("{");!this.match("}");)n.push(this.parsePropertyPattern(e,t)),this.match("}")||this.expect(",");return this.expect("}"),this.finalize(u,new l.ObjectPattern(n))},s.prototype.parsePattern=function(e,t){var u;return this.match("[")?u=this.parseArrayPattern(e,t):this.match("{")?u=this.parseObjectPattern(e,t):(this.matchKeyword("let")&&(t==="const"||t==="let")&&this.tolerateUnexpectedToken(this.lookahead,D.Messages.LetInLexicalBinding),e.push(this.lookahead),u=this.parseVariableIdentifier(t)),u},s.prototype.parsePatternWithDefault=function(e,t){var u=this.lookahead,n=this.parsePattern(e,t);if(this.match("=")){this.nextToken();var C=this.context.allowYield;this.context.allowYield=!0;var x=this.isolateCoverGrammar(this.parseAssignmentExpression);this.context.allowYield=C,n=this.finalize(this.startNode(u),new l.AssignmentPattern(n,x))}return n},s.prototype.parseVariableIdentifier=function(e){var t=this.createNode(),u=this.nextToken();return u.type===4&&u.value==="yield"?this.context.strict?this.tolerateUnexpectedToken(u,D.Messages.StrictReservedWord):this.context.allowYield||this.throwUnexpectedToken(u):u.type!==3?this.context.strict&&u.type===4&&this.scanner.isStrictModeReservedWord(u.value)?this.tolerateUnexpectedToken(u,D.Messages.StrictReservedWord):(this.context.strict||u.value!=="let"||e!=="var")&&this.throwUnexpectedToken(u):(this.context.isModule||this.context.await)&&u.type===3&&u.value==="await"&&this.tolerateUnexpectedToken(u),this.finalize(t,new l.Identifier(u.value))},s.prototype.parseVariableDeclaration=function(e){var t=this.createNode(),u=[],n=this.parsePattern(u,"var");this.context.strict&&n.type===F.Syntax.Identifier&&this.scanner.isRestrictedWord(n.name)&&this.tolerateError(D.Messages.StrictVarName);var C=null;return this.match("=")?(this.nextToken(),C=this.isolateCoverGrammar(this.parseAssignmentExpression)):n.type!==F.Syntax.Identifier&&!e.inFor&&this.expect("="),this.finalize(t,new l.VariableDeclarator(n,C))},s.prototype.parseVariableDeclarationList=function(e){var t={inFor:e.inFor},u=[];for(u.push(this.parseVariableDeclaration(t));this.match(",");)this.nextToken(),u.push(this.parseVariableDeclaration(t));return u},s.prototype.parseVariableStatement=function(){var e=this.createNode();this.expectKeyword("var");var t=this.parseVariableDeclarationList({inFor:!1});return this.consumeSemicolon(),this.finalize(e,new l.VariableDeclaration(t,"var"))},s.prototype.parseEmptyStatement=function(){var e=this.createNode();return this.expect(";"),this.finalize(e,new l.EmptyStatement)},s.prototype.parseExpressionStatement=function(){var e=this.createNode(),t=this.parseExpression();return this.consumeSemicolon(),this.finalize(e,new l.ExpressionStatement(t))},s.prototype.parseIfClause=function(){return this.context.strict&&this.matchKeyword("function")&&this.tolerateError(D.Messages.StrictFunction),this.parseStatement()},s.prototype.parseIfStatement=function(){var e=this.createNode(),t,u=null;this.expectKeyword("if"),this.expect("(");var n=this.parseExpression();return!this.match(")")&&this.config.tolerant?(this.tolerateUnexpectedToken(this.nextToken()),t=this.finalize(this.createNode(),new l.EmptyStatement)):(this.expect(")"),t=this.parseIfClause(),this.matchKeyword("else")&&(this.nextToken(),u=this.parseIfClause())),this.finalize(e,new l.IfStatement(n,t,u))},s.prototype.parseDoWhileStatement=function(){var e=this.createNode();this.expectKeyword("do");var t=this.context.inIteration;this.context.inIteration=!0;var u=this.parseStatement();this.context.inIteration=t,this.expectKeyword("while"),this.expect("(");var n=this.parseExpression();return!this.match(")")&&this.config.tolerant?this.tolerateUnexpectedToken(this.nextToken()):(this.expect(")"),this.match(";")&&this.nextToken()),this.finalize(e,new l.DoWhileStatement(u,n))},s.prototype.parseWhileStatement=function(){var e=this.createNode(),t;this.expectKeyword("while"),this.expect("(");var u=this.parseExpression();if(!this.match(")")&&this.config.tolerant)this.tolerateUnexpectedToken(this.nextToken()),t=this.finalize(this.createNode(),new l.EmptyStatement);else{this.expect(")");var n=this.context.inIteration;this.context.inIteration=!0,t=this.parseStatement(),this.context.inIteration=n}return this.finalize(e,new l.WhileStatement(u,t))},s.prototype.parseForStatement=function(){var e=null,t=null,u=null,n=!0,C,x,k=this.createNode();if(this.expectKeyword("for"),this.expect("("),this.match(";"))this.nextToken();else if(this.matchKeyword("var")){e=this.createNode(),this.nextToken();var y=this.context.allowIn;this.context.allowIn=!1;var B=this.parseVariableDeclarationList({inFor:!0});if(this.context.allowIn=y,B.length===1&&this.matchKeyword("in")){var M=B[0];M.init&&(M.id.type===F.Syntax.ArrayPattern||M.id.type===F.Syntax.ObjectPattern||this.context.strict)&&this.tolerateError(D.Messages.ForInOfLoopInitializer,"for-in"),e=this.finalize(e,new l.VariableDeclaration(B,"var")),this.nextToken(),C=e,x=this.parseExpression(),e=null}else B.length===1&&B[0].init===null&&this.matchContextualKeyword("of")?(e=this.finalize(e,new l.VariableDeclaration(B,"var")),this.nextToken(),C=e,x=this.parseAssignmentExpression(),e=null,n=!1):(e=this.finalize(e,new l.VariableDeclaration(B,"var")),this.expect(";"))}else if(this.matchKeyword("const")||this.matchKeyword("let")){e=this.createNode();var T=this.nextToken().value;if(!this.context.strict&&this.lookahead.value==="in")e=this.finalize(e,new l.Identifier(T)),this.nextToken(),C=e,x=this.parseExpression(),e=null;else{var y=this.context.allowIn;this.context.allowIn=!1;var B=this.parseBindingList(T,{inFor:!0});this.context.allowIn=y,B.length===1&&B[0].init===null&&this.matchKeyword("in")?(e=this.finalize(e,new l.VariableDeclaration(B,T)),this.nextToken(),C=e,x=this.parseExpression(),e=null):B.length===1&&B[0].init===null&&this.matchContextualKeyword("of")?(e=this.finalize(e,new l.VariableDeclaration(B,T)),this.nextToken(),C=e,x=this.parseAssignmentExpression(),e=null,n=!1):(this.consumeSemicolon(),e=this.finalize(e,new l.VariableDeclaration(B,T)))}}else{var P=this.lookahead,y=this.context.allowIn;if(this.context.allowIn=!1,e=this.inheritCoverGrammar(this.parseAssignmentExpression),this.context.allowIn=y,this.matchKeyword("in"))(!this.context.isAssignmentTarget||e.type===F.Syntax.AssignmentExpression)&&this.tolerateError(D.Messages.InvalidLHSInForIn),this.nextToken(),this.reinterpretExpressionAsPattern(e),C=e,x=this.parseExpression(),e=null;else if(this.matchContextualKeyword("of"))(!this.context.isAssignmentTarget||e.type===F.Syntax.AssignmentExpression)&&this.tolerateError(D.Messages.InvalidLHSInForLoop),this.nextToken(),this.reinterpretExpressionAsPattern(e),C=e,x=this.parseAssignmentExpression(),e=null,n=!1;else{if(this.match(",")){for(var X=[e];this.match(",");)this.nextToken(),X.push(this.isolateCoverGrammar(this.parseAssignmentExpression));e=this.finalize(this.startNode(P),new l.SequenceExpression(X))}this.expect(";")}}typeof C>"u"&&(this.match(";")||(t=this.parseExpression()),this.expect(";"),this.match(")")||(u=this.parseExpression()));var j;if(!this.match(")")&&this.config.tolerant)this.tolerateUnexpectedToken(this.nextToken()),j=this.finalize(this.createNode(),new l.EmptyStatement);else{this.expect(")");var U=this.context.inIteration;this.context.inIteration=!0,j=this.isolateCoverGrammar(this.parseStatement),this.context.inIteration=U}return typeof C>"u"?this.finalize(k,new l.ForStatement(e,t,u,j)):n?this.finalize(k,new l.ForInStatement(C,x,j)):this.finalize(k,new l.ForOfStatement(C,x,j))},s.prototype.parseContinueStatement=function(){var e=this.createNode();this.expectKeyword("continue");var t=null;if(this.lookahead.type===3&&!this.hasLineTerminator){var u=this.parseVariableIdentifier();t=u;var n="$"+u.name;Object.prototype.hasOwnProperty.call(this.context.labelSet,n)||this.throwError(D.Messages.UnknownLabel,u.name)}return this.consumeSemicolon(),t===null&&!this.context.inIteration&&this.throwError(D.Messages.IllegalContinue),this.finalize(e,new l.ContinueStatement(t))},s.prototype.parseBreakStatement=function(){var e=this.createNode();this.expectKeyword("break");var t=null;if(this.lookahead.type===3&&!this.hasLineTerminator){var u=this.parseVariableIdentifier(),n="$"+u.name;Object.prototype.hasOwnProperty.call(this.context.labelSet,n)||this.throwError(D.Messages.UnknownLabel,u.name),t=u}return this.consumeSemicolon(),t===null&&!this.context.inIteration&&!this.context.inSwitch&&this.throwError(D.Messages.IllegalBreak),this.finalize(e,new l.BreakStatement(t))},s.prototype.parseReturnStatement=function(){this.context.inFunctionBody||this.tolerateError(D.Messages.IllegalReturn);var e=this.createNode();this.expectKeyword("return");var t=!this.match(";")&&!this.match("}")&&!this.hasLineTerminator&&this.lookahead.type!==2||this.lookahead.type===8||this.lookahead.type===10,u=t?this.parseExpression():null;return this.consumeSemicolon(),this.finalize(e,new l.ReturnStatement(u))},s.prototype.parseWithStatement=function(){this.context.strict&&this.tolerateError(D.Messages.StrictModeWith);var e=this.createNode(),t;this.expectKeyword("with"),this.expect("(");var u=this.parseExpression();return!this.match(")")&&this.config.tolerant?(this.tolerateUnexpectedToken(this.nextToken()),t=this.finalize(this.createNode(),new l.EmptyStatement)):(this.expect(")"),t=this.parseStatement()),this.finalize(e,new l.WithStatement(u,t))},s.prototype.parseSwitchCase=function(){var e=this.createNode(),t;this.matchKeyword("default")?(this.nextToken(),t=null):(this.expectKeyword("case"),t=this.parseExpression()),this.expect(":");for(var u=[];!(this.match("}")||this.matchKeyword("default")||this.matchKeyword("case"));)u.push(this.parseStatementListItem());return this.finalize(e,new l.SwitchCase(t,u))},s.prototype.parseSwitchStatement=function(){var e=this.createNode();this.expectKeyword("switch"),this.expect("(");var t=this.parseExpression();this.expect(")");var u=this.context.inSwitch;this.context.inSwitch=!0;var n=[],C=!1;for(this.expect("{");!this.match("}");){var x=this.parseSwitchCase();x.test===null&&(C&&this.throwError(D.Messages.MultipleDefaultsInSwitch),C=!0),n.push(x)}return this.expect("}"),this.context.inSwitch=u,this.finalize(e,new l.SwitchStatement(t,n))},s.prototype.parseLabelledStatement=function(){var e=this.createNode(),t=this.parseExpression(),u;if(t.type===F.Syntax.Identifier&&this.match(":")){this.nextToken();var n=t,C="$"+n.name;Object.prototype.hasOwnProperty.call(this.context.labelSet,C)&&this.throwError(D.Messages.Redeclaration,"Label",n.name),this.context.labelSet[C]=!0;var x=void 0;if(this.matchKeyword("class"))this.tolerateUnexpectedToken(this.lookahead),x=this.parseClassDeclaration();else if(this.matchKeyword("function")){var k=this.lookahead,y=this.parseFunctionDeclaration();this.context.strict?this.tolerateUnexpectedToken(k,D.Messages.StrictFunction):y.generator&&this.tolerateUnexpectedToken(k,D.Messages.GeneratorInLegacyContext),x=y}else x=this.parseStatement();delete this.context.labelSet[C],u=new l.LabeledStatement(n,x)}else this.consumeSemicolon(),u=new l.ExpressionStatement(t);return this.finalize(e,u)},s.prototype.parseThrowStatement=function(){var e=this.createNode();this.expectKeyword("throw"),this.hasLineTerminator&&this.throwError(D.Messages.NewlineAfterThrow);var t=this.parseExpression();return this.consumeSemicolon(),this.finalize(e,new l.ThrowStatement(t))},s.prototype.parseCatchClause=function(){var e=this.createNode();this.expectKeyword("catch"),this.expect("("),this.match(")")&&this.throwUnexpectedToken(this.lookahead);for(var t=[],u=this.parsePattern(t),n={},C=0;C<t.length;C++){var x="$"+t[C].value;Object.prototype.hasOwnProperty.call(n,x)&&this.tolerateError(D.Messages.DuplicateBinding,t[C].value),n[x]=!0}this.context.strict&&u.type===F.Syntax.Identifier&&this.scanner.isRestrictedWord(u.name)&&this.tolerateError(D.Messages.StrictCatchVariable),this.expect(")");var k=this.parseBlock();return this.finalize(e,new l.CatchClause(u,k))},s.prototype.parseFinallyClause=function(){return this.expectKeyword("finally"),this.parseBlock()},s.prototype.parseTryStatement=function(){var e=this.createNode();this.expectKeyword("try");var t=this.parseBlock(),u=this.matchKeyword("catch")?this.parseCatchClause():null,n=this.matchKeyword("finally")?this.parseFinallyClause():null;return!u&&!n&&this.throwError(D.Messages.NoCatchOrFinally),this.finalize(e,new l.TryStatement(t,u,n))},s.prototype.parseDebuggerStatement=function(){var e=this.createNode();return this.expectKeyword("debugger"),this.consumeSemicolon(),this.finalize(e,new l.DebuggerStatement)},s.prototype.parseStatement=function(){var e;switch(this.lookahead.type){case 1:case 5:case 6:case 8:case 10:case 9:e=this.parseExpressionStatement();break;case 7:var t=this.lookahead.value;t==="{"?e=this.parseBlock():t==="("?e=this.parseExpressionStatement():t===";"?e=this.parseEmptyStatement():e=this.parseExpressionStatement();break;case 3:e=this.matchAsyncFunction()?this.parseFunctionDeclaration():this.parseLabelledStatement();break;case 4:switch(this.lookahead.value){case"break":e=this.parseBreakStatement();break;case"continue":e=this.parseContinueStatement();break;case"debugger":e=this.parseDebuggerStatement();break;case"do":e=this.parseDoWhileStatement();break;case"for":e=this.parseForStatement();break;case"function":e=this.parseFunctionDeclaration();break;case"if":e=this.parseIfStatement();break;case"return":e=this.parseReturnStatement();break;case"switch":e=this.parseSwitchStatement();break;case"throw":e=this.parseThrowStatement();break;case"try":e=this.parseTryStatement();break;case"var":e=this.parseVariableStatement();break;case"while":e=this.parseWhileStatement();break;case"with":e=this.parseWithStatement();break;default:e=this.parseExpressionStatement();break}break;default:e=this.throwUnexpectedToken(this.lookahead)}return e},s.prototype.parseFunctionSourceElements=function(){var e=this.createNode();this.expect("{");var t=this.parseDirectivePrologues(),u=this.context.labelSet,n=this.context.inIteration,C=this.context.inSwitch,x=this.context.inFunctionBody;for(this.context.labelSet={},this.context.inIteration=!1,this.context.inSwitch=!1,this.context.inFunctionBody=!0;this.lookahead.type!==2&&!this.match("}");)t.push(this.parseStatementListItem());return this.expect("}"),this.context.labelSet=u,this.context.inIteration=n,this.context.inSwitch=C,this.context.inFunctionBody=x,this.finalize(e,new l.BlockStatement(t))},s.prototype.validateParam=function(e,t,u){var n="$"+u;this.context.strict?(this.scanner.isRestrictedWord(u)&&(e.stricted=t,e.message=D.Messages.StrictParamName),Object.prototype.hasOwnProperty.call(e.paramSet,n)&&(e.stricted=t,e.message=D.Messages.StrictParamDupe)):e.firstRestricted||(this.scanner.isRestrictedWord(u)?(e.firstRestricted=t,e.message=D.Messages.StrictParamName):this.scanner.isStrictModeReservedWord(u)?(e.firstRestricted=t,e.message=D.Messages.StrictReservedWord):Object.prototype.hasOwnProperty.call(e.paramSet,n)&&(e.stricted=t,e.message=D.Messages.StrictParamDupe)),typeof Object.defineProperty=="function"?Object.defineProperty(e.paramSet,n,{value:!0,enumerable:!0,writable:!0,configurable:!0}):e.paramSet[n]=!0},s.prototype.parseRestElement=function(e){var t=this.createNode();this.expect("...");var u=this.parsePattern(e);return this.match("=")&&this.throwError(D.Messages.DefaultRestParameter),this.match(")")||this.throwError(D.Messages.ParameterAfterRestParameter),this.finalize(t,new l.RestElement(u))},s.prototype.parseFormalParameter=function(e){for(var t=[],u=this.match("...")?this.parseRestElement(t):this.parsePatternWithDefault(t),n=0;n<t.length;n++)this.validateParam(e,t[n],t[n].value);e.simple=e.simple&&u instanceof l.Identifier,e.params.push(u)},s.prototype.parseFormalParameters=function(e){var t;if(t={simple:!0,params:[],firstRestricted:e},this.expect("("),!this.match(")"))for(t.paramSet={};this.lookahead.type!==2&&(this.parseFormalParameter(t),!(this.match(")")||(this.expect(","),this.match(")")))););return this.expect(")"),{simple:t.simple,params:t.params,stricted:t.stricted,firstRestricted:t.firstRestricted,message:t.message}},s.prototype.matchAsyncFunction=function(){var e=this.matchContextualKeyword("async");if(e){var t=this.scanner.saveState();this.scanner.scanComments();var u=this.scanner.lex();this.scanner.restoreState(t),e=t.lineNumber===u.lineNumber&&u.type===4&&u.value==="function"}return e},s.prototype.parseFunctionDeclaration=function(e){var t=this.createNode(),u=this.matchContextualKeyword("async");u&&this.nextToken(),this.expectKeyword("function");var n=u?!1:this.match("*");n&&this.nextToken();var C,x=null,k=null;if(!e||!this.match("(")){var y=this.lookahead;x=this.parseVariableIdentifier(),this.context.strict?this.scanner.isRestrictedWord(y.value)&&this.tolerateUnexpectedToken(y,D.Messages.StrictFunctionName):this.scanner.isRestrictedWord(y.value)?(k=y,C=D.Messages.StrictFunctionName):this.scanner.isStrictModeReservedWord(y.value)&&(k=y,C=D.Messages.StrictReservedWord)}var B=this.context.await,M=this.context.allowYield;this.context.await=u,this.context.allowYield=!n;var T=this.parseFormalParameters(k),P=T.params,X=T.stricted;k=T.firstRestricted,T.message&&(C=T.message);var j=this.context.strict,U=this.context.allowStrictDirective;this.context.allowStrictDirective=T.simple;var L=this.parseFunctionSourceElements();return this.context.strict&&k&&this.throwUnexpectedToken(k,C),this.context.strict&&X&&this.tolerateUnexpectedToken(X,C),this.context.strict=j,this.context.allowStrictDirective=U,this.context.await=B,this.context.allowYield=M,u?this.finalize(t,new l.AsyncFunctionDeclaration(x,P,L)):this.finalize(t,new l.FunctionDeclaration(x,P,L,n))},s.prototype.parseFunctionExpression=function(){var e=this.createNode(),t=this.matchContextualKeyword("async");t&&this.nextToken(),this.expectKeyword("function");var u=t?!1:this.match("*");u&&this.nextToken();var n,C=null,x,k=this.context.await,y=this.context.allowYield;if(this.context.await=t,this.context.allowYield=!u,!this.match("(")){var B=this.lookahead;C=!this.context.strict&&!u&&this.matchKeyword("yield")?this.parseIdentifierName():this.parseVariableIdentifier(),this.context.strict?this.scanner.isRestrictedWord(B.value)&&this.tolerateUnexpectedToken(B,D.Messages.StrictFunctionName):this.scanner.isRestrictedWord(B.value)?(x=B,n=D.Messages.StrictFunctionName):this.scanner.isStrictModeReservedWord(B.value)&&(x=B,n=D.Messages.StrictReservedWord)}var M=this.parseFormalParameters(x),T=M.params,P=M.stricted;x=M.firstRestricted,M.message&&(n=M.message);var X=this.context.strict,j=this.context.allowStrictDirective;this.context.allowStrictDirective=M.simple;var U=this.parseFunctionSourceElements();return this.context.strict&&x&&this.throwUnexpectedToken(x,n),this.context.strict&&P&&this.tolerateUnexpectedToken(P,n),this.context.strict=X,this.context.allowStrictDirective=j,this.context.await=k,this.context.allowYield=y,t?this.finalize(e,new l.AsyncFunctionExpression(C,T,U)):this.finalize(e,new l.FunctionExpression(C,T,U,u))},s.prototype.parseDirective=function(){var e=this.lookahead,t=this.createNode(),u=this.parseExpression(),n=u.type===F.Syntax.Literal?this.getTokenRaw(e).slice(1,-1):null;return this.consumeSemicolon(),this.finalize(t,n?new l.Directive(u,n):new l.ExpressionStatement(u))},s.prototype.parseDirectivePrologues=function(){for(var e=null,t=[];;){var u=this.lookahead;if(u.type!==8)break;var n=this.parseDirective();t.push(n);var C=n.directive;if(typeof C!="string")break;C==="use strict"?(this.context.strict=!0,e&&this.tolerateUnexpectedToken(e,D.Messages.StrictOctalLiteral),this.context.allowStrictDirective||this.tolerateUnexpectedToken(u,D.Messages.IllegalLanguageModeDirective)):!e&&u.octal&&(e=u)}return t},s.prototype.qualifiedPropertyName=function(e){switch(e.type){case 3:case 8:case 1:case 5:case 6:case 4:return!0;case 7:return e.value==="[";default:break}return!1},s.prototype.parseGetterMethod=function(){var e=this.createNode(),t=!1,u=this.context.allowYield;this.context.allowYield=!t;var n=this.parseFormalParameters();n.params.length>0&&this.tolerateError(D.Messages.BadGetterArity);var C=this.parsePropertyMethod(n);return this.context.allowYield=u,this.finalize(e,new l.FunctionExpression(null,n.params,C,t))},s.prototype.parseSetterMethod=function(){var e=this.createNode(),t=!1,u=this.context.allowYield;this.context.allowYield=!t;var n=this.parseFormalParameters();n.params.length!==1?this.tolerateError(D.Messages.BadSetterArity):n.params[0]instanceof l.RestElement&&this.tolerateError(D.Messages.BadSetterRestParameter);var C=this.parsePropertyMethod(n);return this.context.allowYield=u,this.finalize(e,new l.FunctionExpression(null,n.params,C,t))},s.prototype.parseGeneratorMethod=function(){var e=this.createNode(),t=!0,u=this.context.allowYield;this.context.allowYield=!0;var n=this.parseFormalParameters();this.context.allowYield=!1;var C=this.parsePropertyMethod(n);return this.context.allowYield=u,this.finalize(e,new l.FunctionExpression(null,n.params,C,t))},s.prototype.isStartOfExpression=function(){var e=!0,t=this.lookahead.value;switch(this.lookahead.type){case 7:e=t==="["||t==="("||t==="{"||t==="+"||t==="-"||t==="!"||t==="~"||t==="++"||t==="--"||t==="/"||t==="/=";break;case 4:e=t==="class"||t==="delete"||t==="function"||t==="let"||t==="new"||t==="super"||t==="this"||t==="typeof"||t==="void"||t==="yield";break;default:break}return e},s.prototype.parseYieldExpression=function(){var e=this.createNode();this.expectKeyword("yield");var t=null,u=!1;if(!this.hasLineTerminator){var n=this.context.allowYield;this.context.allowYield=!1,u=this.match("*"),u?(this.nextToken(),t=this.parseAssignmentExpression()):this.isStartOfExpression()&&(t=this.parseAssignmentExpression()),this.context.allowYield=n}return this.finalize(e,new l.YieldExpression(t,u))},s.prototype.parseClassElement=function(e){var t=this.lookahead,u=this.createNode(),n="",C=null,x=null,k=!1,y=!1,B=!1,M=!1;if(this.match("*"))this.nextToken();else{k=this.match("["),C=this.parseObjectPropertyKey();var T=C;if(T.name==="static"&&(this.qualifiedPropertyName(this.lookahead)||this.match("*"))&&(t=this.lookahead,B=!0,k=this.match("["),this.match("*")?this.nextToken():C=this.parseObjectPropertyKey()),t.type===3&&!this.hasLineTerminator&&t.value==="async"){var P=this.lookahead.value;P!==":"&&P!=="("&&P!=="*"&&(M=!0,t=this.lookahead,C=this.parseObjectPropertyKey(),t.type===3&&t.value==="constructor"&&this.tolerateUnexpectedToken(t,D.Messages.ConstructorIsAsync))}}var X=this.qualifiedPropertyName(this.lookahead);return t.type===3?t.value==="get"&&X?(n="get",k=this.match("["),C=this.parseObjectPropertyKey(),this.context.allowYield=!1,x=this.parseGetterMethod()):t.value==="set"&&X&&(n="set",k=this.match("["),C=this.parseObjectPropertyKey(),x=this.parseSetterMethod()):t.type===7&&t.value==="*"&&X&&(n="init",k=this.match("["),C=this.parseObjectPropertyKey(),x=this.parseGeneratorMethod(),y=!0),!n&&C&&this.match("(")&&(n="init",x=M?this.parsePropertyMethodAsyncFunction():this.parsePropertyMethodFunction(),y=!0),n||this.throwUnexpectedToken(this.lookahead),n==="init"&&(n="method"),k||(B&&this.isPropertyKey(C,"prototype")&&this.throwUnexpectedToken(t,D.Messages.StaticPrototype),!B&&this.isPropertyKey(C,"constructor")&&((n!=="method"||!y||x&&x.generator)&&this.throwUnexpectedToken(t,D.Messages.ConstructorSpecialMethod),e.value?this.throwUnexpectedToken(t,D.Messages.DuplicateConstructor):e.value=!0,n="constructor")),this.finalize(u,new l.MethodDefinition(C,k,x,n,B))},s.prototype.parseClassElementList=function(){var e=[],t={value:!1};for(this.expect("{");!this.match("}");)this.match(";")?this.nextToken():e.push(this.parseClassElement(t));return this.expect("}"),e},s.prototype.parseClassBody=function(){var e=this.createNode(),t=this.parseClassElementList();return this.finalize(e,new l.ClassBody(t))},s.prototype.parseClassDeclaration=function(e){var t=this.createNode(),u=this.context.strict;this.context.strict=!0,this.expectKeyword("class");var n=e&&this.lookahead.type!==3?null:this.parseVariableIdentifier(),C=null;this.matchKeyword("extends")&&(this.nextToken(),C=this.isolateCoverGrammar(this.parseLeftHandSideExpressionAllowCall));var x=this.parseClassBody();return this.context.strict=u,this.finalize(t,new l.ClassDeclaration(n,C,x))},s.prototype.parseClassExpression=function(){var e=this.createNode(),t=this.context.strict;this.context.strict=!0,this.expectKeyword("class");var u=this.lookahead.type===3?this.parseVariableIdentifier():null,n=null;this.matchKeyword("extends")&&(this.nextToken(),n=this.isolateCoverGrammar(this.parseLeftHandSideExpressionAllowCall));var C=this.parseClassBody();return this.context.strict=t,this.finalize(e,new l.ClassExpression(u,n,C))},s.prototype.parseModule=function(){this.context.strict=!0,this.context.isModule=!0,this.scanner.isModule=!0;for(var e=this.createNode(),t=this.parseDirectivePrologues();this.lookahead.type!==2;)t.push(this.parseStatementListItem());return this.finalize(e,new l.Module(t))},s.prototype.parseScript=function(){for(var e=this.createNode(),t=this.parseDirectivePrologues();this.lookahead.type!==2;)t.push(this.parseStatementListItem());return this.finalize(e,new l.Script(t))},s.prototype.parseModuleSpecifier=function(){var e=this.createNode();this.lookahead.type!==8&&this.throwError(D.Messages.InvalidModuleSpecifier);var t=this.nextToken(),u=this.getTokenRaw(t);return this.finalize(e,new l.Literal(t.value,u))},s.prototype.parseImportSpecifier=function(){var e=this.createNode(),t,u;return this.lookahead.type===3?(t=this.parseVariableIdentifier(),u=t,this.matchContextualKeyword("as")&&(this.nextToken(),u=this.parseVariableIdentifier())):(t=this.parseIdentifierName(),u=t,this.matchContextualKeyword("as")?(this.nextToken(),u=this.parseVariableIdentifier()):this.throwUnexpectedToken(this.nextToken())),this.finalize(e,new l.ImportSpecifier(u,t))},s.prototype.parseNamedImports=function(){this.expect("{");for(var e=[];!this.match("}");)e.push(this.parseImportSpecifier()),this.match("}")||this.expect(",");return this.expect("}"),e},s.prototype.parseImportDefaultSpecifier=function(){var e=this.createNode(),t=this.parseIdentifierName();return this.finalize(e,new l.ImportDefaultSpecifier(t))},s.prototype.parseImportNamespaceSpecifier=function(){var e=this.createNode();this.expect("*"),this.matchContextualKeyword("as")||this.throwError(D.Messages.NoAsAfterImportNamespace),this.nextToken();var t=this.parseIdentifierName();return this.finalize(e,new l.ImportNamespaceSpecifier(t))},s.prototype.parseImportDeclaration=function(){this.context.inFunctionBody&&this.throwError(D.Messages.IllegalImportDeclaration);var e=this.createNode();this.expectKeyword("import");var t,u=[];if(this.lookahead.type===8)t=this.parseModuleSpecifier();else{if(this.match("{")?u=u.concat(this.parseNamedImports()):this.match("*")?u.push(this.parseImportNamespaceSpecifier()):this.isIdentifierName(this.lookahead)&&!this.matchKeyword("default")?(u.push(this.parseImportDefaultSpecifier()),this.match(",")&&(this.nextToken(),this.match("*")?u.push(this.parseImportNamespaceSpecifier()):this.match("{")?u=u.concat(this.parseNamedImports()):this.throwUnexpectedToken(this.lookahead))):this.throwUnexpectedToken(this.nextToken()),!this.matchContextualKeyword("from")){var n=this.lookahead.value?D.Messages.UnexpectedToken:D.Messages.MissingFromClause;this.throwError(n,this.lookahead.value)}this.nextToken(),t=this.parseModuleSpecifier()}return this.consumeSemicolon(),this.finalize(e,new l.ImportDeclaration(u,t))},s.prototype.parseExportSpecifier=function(){var e=this.createNode(),t=this.parseIdentifierName(),u=t;return this.matchContextualKeyword("as")&&(this.nextToken(),u=this.parseIdentifierName()),this.finalize(e,new l.ExportSpecifier(t,u))},s.prototype.parseExportDeclaration=function(){this.context.inFunctionBody&&this.throwError(D.Messages.IllegalExportDeclaration);var e=this.createNode();this.expectKeyword("export");var t;if(this.matchKeyword("default"))if(this.nextToken(),this.matchKeyword("function")){var u=this.parseFunctionDeclaration(!0);t=this.finalize(e,new l.ExportDefaultDeclaration(u))}else if(this.matchKeyword("class")){var u=this.parseClassDeclaration(!0);t=this.finalize(e,new l.ExportDefaultDeclaration(u))}else if(this.matchContextualKeyword("async")){var u=this.matchAsyncFunction()?this.parseFunctionDeclaration(!0):this.parseAssignmentExpression();t=this.finalize(e,new l.ExportDefaultDeclaration(u))}else{this.matchContextualKeyword("from")&&this.throwError(D.Messages.UnexpectedToken,this.lookahead.value);var u=this.match("{")?this.parseObjectInitializer():this.match("[")?this.parseArrayInitializer():this.parseAssignmentExpression();this.consumeSemicolon(),t=this.finalize(e,new l.ExportDefaultDeclaration(u))}else if(this.match("*")){if(this.nextToken(),!this.matchContextualKeyword("from")){var n=this.lookahead.value?D.Messages.UnexpectedToken:D.Messages.MissingFromClause;this.throwError(n,this.lookahead.value)}this.nextToken();var C=this.parseModuleSpecifier();this.consumeSemicolon(),t=this.finalize(e,new l.ExportAllDeclaration(C))}else if(this.lookahead.type===4){var u=void 0;switch(this.lookahead.value){case"let":case"const":u=this.parseLexicalDeclaration({inFor:!1});break;case"var":case"class":case"function":u=this.parseStatementListItem();break;default:this.throwUnexpectedToken(this.lookahead)}t=this.finalize(e,new l.ExportNamedDeclaration(u,[],null))}else if(this.matchAsyncFunction()){var u=this.parseFunctionDeclaration();t=this.finalize(e,new l.ExportNamedDeclaration(u,[],null))}else{var x=[],k=null,y=!1;for(this.expect("{");!this.match("}");)y=y||this.matchKeyword("default"),x.push(this.parseExportSpecifier()),this.match("}")||this.expect(",");if(this.expect("}"),this.matchContextualKeyword("from"))this.nextToken(),k=this.parseModuleSpecifier(),this.consumeSemicolon();else if(y){var n=this.lookahead.value?D.Messages.UnexpectedToken:D.Messages.MissingFromClause;this.throwError(n,this.lookahead.value)}else this.consumeSemicolon();t=this.finalize(e,new l.ExportNamedDeclaration(null,x,k))}return t},s}();i.Parser=E},function(m,i){"use strict";Object.defineProperty(i,"__esModule",{value:!0});function f(a,d){if(!a)throw new Error("ASSERT: "+d)}i.assert=f},function(m,i){"use strict";Object.defineProperty(i,"__esModule",{value:!0});var f=function(){function a(){this.errors=[],this.tolerant=!1}return a.prototype.recordError=function(d){this.errors.push(d)},a.prototype.tolerate=function(d){if(this.tolerant)this.recordError(d);else throw d},a.prototype.constructError=function(d,D){var l=new Error(d);try{throw l}catch(g){Object.create&&Object.defineProperty&&(l=Object.create(g),Object.defineProperty(l,"column",{value:D}))}return l},a.prototype.createError=function(d,D,l,g){var F="Line "+D+": "+g,v=this.constructError(F,l);return v.index=d,v.lineNumber=D,v.description=g,v},a.prototype.throwError=function(d,D,l,g){throw this.createError(d,D,l,g)},a.prototype.tolerateError=function(d,D,l,g){var F=this.createError(d,D,l,g);if(this.tolerant)this.recordError(F);else throw F},a}();i.ErrorHandler=f},function(m,i){"use strict";Object.defineProperty(i,"__esModule",{value:!0}),i.Messages={BadGetterArity:"Getter must not have any formal parameters",BadSetterArity:"Setter must have exactly one formal parameter",BadSetterRestParameter:"Setter function argument must not be a rest parameter",ConstructorIsAsync:"Class constructor may not be an async method",ConstructorSpecialMethod:"Class constructor may not be an accessor",DeclarationMissingInitializer:"Missing initializer in %0 declaration",DefaultRestParameter:"Unexpected token =",DuplicateBinding:"Duplicate binding %0",DuplicateConstructor:"A class may only have one constructor",DuplicateProtoProperty:"Duplicate __proto__ fields are not allowed in object literals",ForInOfLoopInitializer:"%0 loop variable declaration may not have an initializer",GeneratorInLegacyContext:"Generator declarations are not allowed in legacy contexts",IllegalBreak:"Illegal break statement",IllegalContinue:"Illegal continue statement",IllegalExportDeclaration:"Unexpected token",IllegalImportDeclaration:"Unexpected token",IllegalLanguageModeDirective:"Illegal 'use strict' directive in function with non-simple parameter list",IllegalReturn:"Illegal return statement",InvalidEscapedReservedWord:"Keyword must not contain escaped characters",InvalidHexEscapeSequence:"Invalid hexadecimal escape sequence",InvalidLHSInAssignment:"Invalid left-hand side in assignment",InvalidLHSInForIn:"Invalid left-hand side in for-in",InvalidLHSInForLoop:"Invalid left-hand side in for-loop",InvalidModuleSpecifier:"Unexpected token",InvalidRegExp:"Invalid regular expression",LetInLexicalBinding:"let is disallowed as a lexically bound name",MissingFromClause:"Unexpected token",MultipleDefaultsInSwitch:"More than one default clause in switch statement",NewlineAfterThrow:"Illegal newline after throw",NoAsAfterImportNamespace:"Unexpected token",NoCatchOrFinally:"Missing catch or finally after try",ParameterAfterRestParameter:"Rest parameter must be last formal parameter",Redeclaration:"%0 '%1' has already been declared",StaticPrototype:"Classes may not have static property named prototype",StrictCatchVariable:"Catch variable may not be eval or arguments in strict mode",StrictDelete:"Delete of an unqualified identifier in strict mode.",StrictFunction:"In strict mode code, functions can only be declared at top level or inside a block",StrictFunctionName:"Function name may not be eval or arguments in strict mode",StrictLHSAssignment:"Assignment to eval or arguments is not allowed in strict mode",StrictLHSPostfix:"Postfix increment/decrement may not have eval or arguments operand in strict mode",StrictLHSPrefix:"Prefix increment/decrement may not have eval or arguments operand in strict mode",StrictModeWith:"Strict mode code may not include a with statement",StrictOctalLiteral:"Octal literals are not allowed in strict mode.",StrictParamDupe:"Strict mode function may not have duplicate parameter names",StrictParamName:"Parameter name eval or arguments is not allowed in strict mode",StrictReservedWord:"Use of future reserved word in strict mode",StrictVarName:"Variable name may not be eval or arguments in strict mode",TemplateOctalLiteral:"Octal literals are not allowed in template strings.",UnexpectedEOS:"Unexpected end of input",UnexpectedIdentifier:"Unexpected identifier",UnexpectedNumber:"Unexpected number",UnexpectedReserved:"Unexpected reserved word",UnexpectedString:"Unexpected string",UnexpectedTemplate:"Unexpected quasi %0",UnexpectedToken:"Unexpected token %0",UnexpectedTokenIllegal:"Unexpected token ILLEGAL",UnknownLabel:"Undefined label '%0'",UnterminatedRegExp:"Invalid regular expression: missing /"}},function(m,i,f){"use strict";Object.defineProperty(i,"__esModule",{value:!0});var a=f(9),d=f(4),D=f(11);function l(v){return"0123456789abcdef".indexOf(v.toLowerCase())}function g(v){return"01234567".indexOf(v)}var F=function(){function v(p,E){this.source=p,this.errorHandler=E,this.trackComment=!1,this.isModule=!1,this.length=p.length,this.index=0,this.lineNumber=p.length>0?1:0,this.lineStart=0,this.curlyStack=[]}return v.prototype.saveState=function(){return{index:this.index,lineNumber:this.lineNumber,lineStart:this.lineStart}},v.prototype.restoreState=function(p){this.index=p.index,this.lineNumber=p.lineNumber,this.lineStart=p.lineStart},v.prototype.eof=function(){return this.index>=this.length},v.prototype.throwUnexpectedToken=function(p){return p===void 0&&(p=D.Messages.UnexpectedTokenIllegal),this.errorHandler.throwError(this.index,this.lineNumber,this.index-this.lineStart+1,p)},v.prototype.tolerateUnexpectedToken=function(p){p===void 0&&(p=D.Messages.UnexpectedTokenIllegal),this.errorHandler.tolerateError(this.index,this.lineNumber,this.index-this.lineStart+1,p)},v.prototype.skipSingleLineComment=function(p){var E=[],s,e;for(this.trackComment&&(E=[],s=this.index-p,e={start:{line:this.lineNumber,column:this.index-this.lineStart-p},end:{}});!this.eof();){var t=this.source.charCodeAt(this.index);if(++this.index,d.Character.isLineTerminator(t)){if(this.trackComment){e.end={line:this.lineNumber,column:this.index-this.lineStart-1};var u={multiLine:!1,slice:[s+p,this.index-1],range:[s,this.index-1],loc:e};E.push(u)}return t===13&&this.source.charCodeAt(this.index)===10&&++this.index,++this.lineNumber,this.lineStart=this.index,E}}if(this.trackComment){e.end={line:this.lineNumber,column:this.index-this.lineStart};var u={multiLine:!1,slice:[s+p,this.index],range:[s,this.index],loc:e};E.push(u)}return E},v.prototype.skipMultiLineComment=function(){var p=[],E,s;for(this.trackComment&&(p=[],E=this.index-2,s={start:{line:this.lineNumber,column:this.index-this.lineStart-2},end:{}});!this.eof();){var e=this.source.charCodeAt(this.index);if(d.Character.isLineTerminator(e))e===13&&this.source.charCodeAt(this.index+1)===10&&++this.index,++this.lineNumber,++this.index,this.lineStart=this.index;else if(e===42){if(this.source.charCodeAt(this.index+1)===47){if(this.index+=2,this.trackComment){s.end={line:this.lineNumber,column:this.index-this.lineStart};var t={multiLine:!0,slice:[E+2,this.index-2],range:[E,this.index],loc:s};p.push(t)}return p}++this.index}else++this.index}if(this.trackComment){s.end={line:this.lineNumber,column:this.index-this.lineStart};var t={multiLine:!0,slice:[E+2,this.index],range:[E,this.index],loc:s};p.push(t)}return this.tolerateUnexpectedToken(),p},v.prototype.scanComments=function(){var p;this.trackComment&&(p=[]);for(var E=this.index===0;!this.eof();){var s=this.source.charCodeAt(this.index);if(d.Character.isWhiteSpace(s))++this.index;else if(d.Character.isLineTerminator(s))++this.index,s===13&&this.source.charCodeAt(this.index)===10&&++this.index,++this.lineNumber,this.lineStart=this.index,E=!0;else if(s===47)if(s=this.source.charCodeAt(this.index+1),s===47){this.index+=2;var e=this.skipSingleLineComment(2);this.trackComment&&(p=p.concat(e)),E=!0}else if(s===42){this.index+=2;var e=this.skipMultiLineComment();this.trackComment&&(p=p.concat(e))}else break;else if(E&&s===45)if(this.source.charCodeAt(this.index+1)===45&&this.source.charCodeAt(this.index+2)===62){this.index+=3;var e=this.skipSingleLineComment(3);this.trackComment&&(p=p.concat(e))}else break;else if(s===60&&!this.isModule)if(this.source.slice(this.index+1,this.index+4)==="!--"){this.index+=4;var e=this.skipSingleLineComment(4);this.trackComment&&(p=p.concat(e))}else break;else break}return p},v.prototype.isFutureReservedWord=function(p){switch(p){case"enum":case"export":case"import":case"super":return!0;default:return!1}},v.prototype.isStrictModeReservedWord=function(p){switch(p){case"implements":case"interface":case"package":case"private":case"protected":case"public":case"static":case"yield":case"let":return!0;default:return!1}},v.prototype.isRestrictedWord=function(p){return p==="eval"||p==="arguments"},v.prototype.isKeyword=function(p){switch(p.length){case 2:return p==="if"||p==="in"||p==="do";case 3:return p==="var"||p==="for"||p==="new"||p==="try"||p==="let";case 4:return p==="this"||p==="else"||p==="case"||p==="void"||p==="with"||p==="enum";case 5:return p==="while"||p==="break"||p==="catch"||p==="throw"||p==="const"||p==="yield"||p==="class"||p==="super";case 6:return p==="return"||p==="typeof"||p==="delete"||p==="switch"||p==="export"||p==="import";case 7:return p==="default"||p==="finally"||p==="extends";case 8:return p==="function"||p==="continue"||p==="debugger";case 10:return p==="instanceof";default:return!1}},v.prototype.codePointAt=function(p){var E=this.source.charCodeAt(p);if(E>=55296&&E<=56319){var s=this.source.charCodeAt(p+1);if(s>=56320&&s<=57343){var e=E;E=(e-55296)*1024+s-56320+65536}}return E},v.prototype.scanHexEscape=function(p){for(var E=p==="u"?4:2,s=0,e=0;e<E;++e)if(!this.eof()&&d.Character.isHexDigit(this.source.charCodeAt(this.index)))s=s*16+l(this.source[this.index++]);else return null;return String.fromCharCode(s)},v.prototype.scanUnicodeCodePointEscape=function(){var p=this.source[this.index],E=0;for(p==="}"&&this.throwUnexpectedToken();!this.eof()&&(p=this.source[this.index++],!!d.Character.isHexDigit(p.charCodeAt(0)));)E=E*16+l(p);return(E>1114111||p!=="}")&&this.throwUnexpectedToken(),d.Character.fromCodePoint(E)},v.prototype.getIdentifier=function(){for(var p=this.index++;!this.eof();){var E=this.source.charCodeAt(this.index);if(E===92)return this.index=p,this.getComplexIdentifier();if(E>=55296&&E<57343)return this.index=p,this.getComplexIdentifier();if(d.Character.isIdentifierPart(E))++this.index;else break}return this.source.slice(p,this.index)},v.prototype.getComplexIdentifier=function(){var p=this.codePointAt(this.index),E=d.Character.fromCodePoint(p);this.index+=E.length;var s;for(p===92&&(this.source.charCodeAt(this.index)!==117&&this.throwUnexpectedToken(),++this.index,this.source[this.index]==="{"?(++this.index,s=this.scanUnicodeCodePointEscape()):(s=this.scanHexEscape("u"),(s===null||s==="\\"||!d.Character.isIdentifierStart(s.charCodeAt(0)))&&this.throwUnexpectedToken()),E=s);!this.eof()&&(p=this.codePointAt(this.index),!!d.Character.isIdentifierPart(p));)s=d.Character.fromCodePoint(p),E+=s,this.index+=s.length,p===92&&(E=E.substr(0,E.length-1),this.source.charCodeAt(this.index)!==117&&this.throwUnexpectedToken(),++this.index,this.source[this.index]==="{"?(++this.index,s=this.scanUnicodeCodePointEscape()):(s=this.scanHexEscape("u"),(s===null||s==="\\"||!d.Character.isIdentifierPart(s.charCodeAt(0)))&&this.throwUnexpectedToken()),E+=s);return E},v.prototype.octalToDecimal=function(p){var E=p!=="0",s=g(p);return!this.eof()&&d.Character.isOctalDigit(this.source.charCodeAt(this.index))&&(E=!0,s=s*8+g(this.source[this.index++]),"0123".indexOf(p)>=0&&!this.eof()&&d.Character.isOctalDigit(this.source.charCodeAt(this.index))&&(s=s*8+g(this.source[this.index++]))),{code:s,octal:E}},v.prototype.scanIdentifier=function(){var p,E=this.index,s=this.source.charCodeAt(E)===92?this.getComplexIdentifier():this.getIdentifier();if(s.length===1?p=3:this.isKeyword(s)?p=4:s==="null"?p=5:s==="true"||s==="false"?p=1:p=3,p!==3&&E+s.length!==this.index){var e=this.index;this.index=E,this.tolerateUnexpectedToken(D.Messages.InvalidEscapedReservedWord),this.index=e}return{type:p,value:s,lineNumber:this.lineNumber,lineStart:this.lineStart,start:E,end:this.index}},v.prototype.scanPunctuator=function(){var p=this.index,E=this.source[this.index];switch(E){case"(":case"{":E==="{"&&this.curlyStack.push("{"),++this.index;break;case".":++this.index,this.source[this.index]==="."&&this.source[this.index+1]==="."&&(this.index+=2,E="...");break;case"}":++this.index,this.curlyStack.pop();break;case")":case";":case",":case"[":case"]":case":":case"?":case"~":++this.index;break;default:E=this.source.substr(this.index,4),E===">>>="?this.index+=4:(E=E.substr(0,3),E==="==="||E==="!=="||E===">>>"||E==="<<="||E===">>="||E==="**="?this.index+=3:(E=E.substr(0,2),E==="&&"||E==="||"||E==="=="||E==="!="||E==="+="||E==="-="||E==="*="||E==="/="||E==="++"||E==="--"||E==="<<"||E===">>"||E==="&="||E==="|="||E==="^="||E==="%="||E==="<="||E===">="||E==="=>"||E==="**"?this.index+=2:(E=this.source[this.index],"<>=!+-*%&|^/".indexOf(E)>=0&&++this.index)))}return this.index===p&&this.throwUnexpectedToken(),{type:7,value:E,lineNumber:this.lineNumber,lineStart:this.lineStart,start:p,end:this.index}},v.prototype.scanHexLiteral=function(p){for(var E="";!this.eof()&&d.Character.isHexDigit(this.source.charCodeAt(this.index));)E+=this.source[this.index++];return E.length===0&&this.throwUnexpectedToken(),d.Character.isIdentifierStart(this.source.charCodeAt(this.index))&&this.throwUnexpectedToken(),{type:6,value:parseInt("0x"+E,16),lineNumber:this.lineNumber,lineStart:this.lineStart,start:p,end:this.index}},v.prototype.scanBinaryLiteral=function(p){for(var E="",s;!this.eof()&&(s=this.source[this.index],!(s!=="0"&&s!=="1"));)E+=this.source[this.index++];return E.length===0&&this.throwUnexpectedToken(),this.eof()||(s=this.source.charCodeAt(this.index),(d.Character.isIdentifierStart(s)||d.Character.isDecimalDigit(s))&&this.throwUnexpectedToken()),{type:6,value:parseInt(E,2),lineNumber:this.lineNumber,lineStart:this.lineStart,start:p,end:this.index}},v.prototype.scanOctalLiteral=function(p,E){var s="",e=!1;for(d.Character.isOctalDigit(p.charCodeAt(0))?(e=!0,s="0"+this.source[this.index++]):++this.index;!this.eof()&&d.Character.isOctalDigit(this.source.charCodeAt(this.index));)s+=this.source[this.index++];return!e&&s.length===0&&this.throwUnexpectedToken(),(d.Character.isIdentifierStart(this.source.charCodeAt(this.index))||d.Character.isDecimalDigit(this.source.charCodeAt(this.index)))&&this.throwUnexpectedToken(),{type:6,value:parseInt(s,8),octal:e,lineNumber:this.lineNumber,lineStart:this.lineStart,start:E,end:this.index}},v.prototype.isImplicitOctalLiteral=function(){for(var p=this.index+1;p<this.length;++p){var E=this.source[p];if(E==="8"||E==="9")return!1;if(!d.Character.isOctalDigit(E.charCodeAt(0)))return!0}return!0},v.prototype.scanNumericLiteral=function(){var p=this.index,E=this.source[p];a.assert(d.Character.isDecimalDigit(E.charCodeAt(0))||E===".","Numeric literal must start with a decimal digit or a decimal point");var s="";if(E!=="."){if(s=this.source[this.index++],E=this.source[this.index],s==="0"){if(E==="x"||E==="X")return++this.index,this.scanHexLiteral(p);if(E==="b"||E==="B")return++this.index,this.scanBinaryLiteral(p);if(E==="o"||E==="O")return this.scanOctalLiteral(E,p);if(E&&d.Character.isOctalDigit(E.charCodeAt(0))&&this.isImplicitOctalLiteral())return this.scanOctalLiteral(E,p)}for(;d.Character.isDecimalDigit(this.source.charCodeAt(this.index));)s+=this.source[this.index++];E=this.source[this.index]}if(E==="."){for(s+=this.source[this.index++];d.Character.isDecimalDigit(this.source.charCodeAt(this.index));)s+=this.source[this.index++];E=this.source[this.index]}if(E==="e"||E==="E")if(s+=this.source[this.index++],E=this.source[this.index],(E==="+"||E==="-")&&(s+=this.source[this.index++]),d.Character.isDecimalDigit(this.source.charCodeAt(this.index)))for(;d.Character.isDecimalDigit(this.source.charCodeAt(this.index));)s+=this.source[this.index++];else this.throwUnexpectedToken();return d.Character.isIdentifierStart(this.source.charCodeAt(this.index))&&this.throwUnexpectedToken(),{type:6,value:parseFloat(s),lineNumber:this.lineNumber,lineStart:this.lineStart,start:p,end:this.index}},v.prototype.scanStringLiteral=function(){var p=this.index,E=this.source[p];a.assert(E==="'"||E==='"',"String literal must starts with a quote"),++this.index;for(var s=!1,e="";!this.eof();){var t=this.source[this.index++];if(t===E){E="";break}else if(t==="\\")if(t=this.source[this.index++],!t||!d.Character.isLineTerminator(t.charCodeAt(0)))switch(t){case"u":if(this.source[this.index]==="{")++this.index,e+=this.scanUnicodeCodePointEscape();else{var u=this.scanHexEscape(t);u===null&&this.throwUnexpectedToken(),e+=u}break;case"x":var n=this.scanHexEscape(t);n===null&&this.throwUnexpectedToken(D.Messages.InvalidHexEscapeSequence),e+=n;break;case"n":e+=`
`;break;case"r":e+="\r";break;case"t":e+="	";break;case"b":e+="\b";break;case"f":e+="\f";break;case"v":e+="\v";break;case"8":case"9":e+=t,this.tolerateUnexpectedToken();break;default:if(t&&d.Character.isOctalDigit(t.charCodeAt(0))){var C=this.octalToDecimal(t);s=C.octal||s,e+=String.fromCharCode(C.code)}else e+=t;break}else++this.lineNumber,t==="\r"&&this.source[this.index]===`
`&&++this.index,this.lineStart=this.index;else{if(d.Character.isLineTerminator(t.charCodeAt(0)))break;e+=t}}return E!==""&&(this.index=p,this.throwUnexpectedToken()),{type:8,value:e,octal:s,lineNumber:this.lineNumber,lineStart:this.lineStart,start:p,end:this.index}},v.prototype.scanTemplate=function(){var p="",E=!1,s=this.index,e=this.source[s]==="`",t=!1,u=2;for(++this.index;!this.eof();){var n=this.source[this.index++];if(n==="`"){u=1,t=!0,E=!0;break}else if(n==="$"){if(this.source[this.index]==="{"){this.curlyStack.push("${"),++this.index,E=!0;break}p+=n}else if(n==="\\")if(n=this.source[this.index++],d.Character.isLineTerminator(n.charCodeAt(0)))++this.lineNumber,n==="\r"&&this.source[this.index]===`
`&&++this.index,this.lineStart=this.index;else switch(n){case"n":p+=`
`;break;case"r":p+="\r";break;case"t":p+="	";break;case"u":if(this.source[this.index]==="{")++this.index,p+=this.scanUnicodeCodePointEscape();else{var C=this.index,x=this.scanHexEscape(n);x!==null?p+=x:(this.index=C,p+=n)}break;case"x":var k=this.scanHexEscape(n);k===null&&this.throwUnexpectedToken(D.Messages.InvalidHexEscapeSequence),p+=k;break;case"b":p+="\b";break;case"f":p+="\f";break;case"v":p+="\v";break;default:n==="0"?(d.Character.isDecimalDigit(this.source.charCodeAt(this.index))&&this.throwUnexpectedToken(D.Messages.TemplateOctalLiteral),p+="\0"):d.Character.isOctalDigit(n.charCodeAt(0))?this.throwUnexpectedToken(D.Messages.TemplateOctalLiteral):p+=n;break}else d.Character.isLineTerminator(n.charCodeAt(0))?(++this.lineNumber,n==="\r"&&this.source[this.index]===`
`&&++this.index,this.lineStart=this.index,p+=`
`):p+=n}return E||this.throwUnexpectedToken(),e||this.curlyStack.pop(),{type:10,value:this.source.slice(s+1,this.index-u),cooked:p,head:e,tail:t,lineNumber:this.lineNumber,lineStart:this.lineStart,start:s,end:this.index}},v.prototype.testRegExp=function(p,E){var s="\uFFFF",e=p,t=this;E.indexOf("u")>=0&&(e=e.replace(/\\u\{([0-9a-fA-F]+)\}|\\u([a-fA-F0-9]{4})/g,function(u,n,C){var x=parseInt(n||C,16);return x>1114111&&t.throwUnexpectedToken(D.Messages.InvalidRegExp),x<=65535?String.fromCharCode(x):s}).replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g,s));try{RegExp(e)}catch{this.throwUnexpectedToken(D.Messages.InvalidRegExp)}try{return new RegExp(p,E)}catch{return null}},v.prototype.scanRegExpBody=function(){var p=this.source[this.index];a.assert(p==="/","Regular expression literal must start with a slash");for(var E=this.source[this.index++],s=!1,e=!1;!this.eof();)if(p=this.source[this.index++],E+=p,p==="\\")p=this.source[this.index++],d.Character.isLineTerminator(p.charCodeAt(0))&&this.throwUnexpectedToken(D.Messages.UnterminatedRegExp),E+=p;else if(d.Character.isLineTerminator(p.charCodeAt(0)))this.throwUnexpectedToken(D.Messages.UnterminatedRegExp);else if(s)p==="]"&&(s=!1);else if(p==="/"){e=!0;break}else p==="["&&(s=!0);return e||this.throwUnexpectedToken(D.Messages.UnterminatedRegExp),E.substr(1,E.length-2)},v.prototype.scanRegExpFlags=function(){for(var p="",E="";!this.eof();){var s=this.source[this.index];if(!d.Character.isIdentifierPart(s.charCodeAt(0)))break;if(++this.index,s==="\\"&&!this.eof())if(s=this.source[this.index],s==="u"){++this.index;var e=this.index,t=this.scanHexEscape("u");if(t!==null)for(E+=t,p+="\\u";e<this.index;++e)p+=this.source[e];else this.index=e,E+="u",p+="\\u";this.tolerateUnexpectedToken()}else p+="\\",this.tolerateUnexpectedToken();else E+=s,p+=s}return E},v.prototype.scanRegExp=function(){var p=this.index,E=this.scanRegExpBody(),s=this.scanRegExpFlags(),e=this.testRegExp(E,s);return{type:9,value:"",pattern:E,flags:s,regex:e,lineNumber:this.lineNumber,lineStart:this.lineStart,start:p,end:this.index}},v.prototype.lex=function(){if(this.eof())return{type:2,value:"",lineNumber:this.lineNumber,lineStart:this.lineStart,start:this.index,end:this.index};var p=this.source.charCodeAt(this.index);return d.Character.isIdentifierStart(p)?this.scanIdentifier():p===40||p===41||p===59?this.scanPunctuator():p===39||p===34?this.scanStringLiteral():p===46?d.Character.isDecimalDigit(this.source.charCodeAt(this.index+1))?this.scanNumericLiteral():this.scanPunctuator():d.Character.isDecimalDigit(p)?this.scanNumericLiteral():p===96||p===125&&this.curlyStack[this.curlyStack.length-1]==="${"?this.scanTemplate():p>=55296&&p<57343&&d.Character.isIdentifierStart(this.codePointAt(this.index))?this.scanIdentifier():this.scanPunctuator()},v}();i.Scanner=F},function(m,i){"use strict";Object.defineProperty(i,"__esModule",{value:!0}),i.TokenName={},i.TokenName[1]="Boolean",i.TokenName[2]="<end>",i.TokenName[3]="Identifier",i.TokenName[4]="Keyword",i.TokenName[5]="Null",i.TokenName[6]="Numeric",i.TokenName[7]="Punctuator",i.TokenName[8]="String",i.TokenName[9]="RegularExpression",i.TokenName[10]="Template"},function(m,i){"use strict";Object.defineProperty(i,"__esModule",{value:!0}),i.XHTMLEntities={quot:'"',amp:"&",apos:"'",gt:">",nbsp:"\xA0",iexcl:"\xA1",cent:"\xA2",pound:"\xA3",curren:"\xA4",yen:"\xA5",brvbar:"\xA6",sect:"\xA7",uml:"\xA8",copy:"\xA9",ordf:"\xAA",laquo:"\xAB",not:"\xAC",shy:"\xAD",reg:"\xAE",macr:"\xAF",deg:"\xB0",plusmn:"\xB1",sup2:"\xB2",sup3:"\xB3",acute:"\xB4",micro:"\xB5",para:"\xB6",middot:"\xB7",cedil:"\xB8",sup1:"\xB9",ordm:"\xBA",raquo:"\xBB",frac14:"\xBC",frac12:"\xBD",frac34:"\xBE",iquest:"\xBF",Agrave:"\xC0",Aacute:"\xC1",Acirc:"\xC2",Atilde:"\xC3",Auml:"\xC4",Aring:"\xC5",AElig:"\xC6",Ccedil:"\xC7",Egrave:"\xC8",Eacute:"\xC9",Ecirc:"\xCA",Euml:"\xCB",Igrave:"\xCC",Iacute:"\xCD",Icirc:"\xCE",Iuml:"\xCF",ETH:"\xD0",Ntilde:"\xD1",Ograve:"\xD2",Oacute:"\xD3",Ocirc:"\xD4",Otilde:"\xD5",Ouml:"\xD6",times:"\xD7",Oslash:"\xD8",Ugrave:"\xD9",Uacute:"\xDA",Ucirc:"\xDB",Uuml:"\xDC",Yacute:"\xDD",THORN:"\xDE",szlig:"\xDF",agrave:"\xE0",aacute:"\xE1",acirc:"\xE2",atilde:"\xE3",auml:"\xE4",aring:"\xE5",aelig:"\xE6",ccedil:"\xE7",egrave:"\xE8",eacute:"\xE9",ecirc:"\xEA",euml:"\xEB",igrave:"\xEC",iacute:"\xED",icirc:"\xEE",iuml:"\xEF",eth:"\xF0",ntilde:"\xF1",ograve:"\xF2",oacute:"\xF3",ocirc:"\xF4",otilde:"\xF5",ouml:"\xF6",divide:"\xF7",oslash:"\xF8",ugrave:"\xF9",uacute:"\xFA",ucirc:"\xFB",uuml:"\xFC",yacute:"\xFD",thorn:"\xFE",yuml:"\xFF",OElig:"\u0152",oelig:"\u0153",Scaron:"\u0160",scaron:"\u0161",Yuml:"\u0178",fnof:"\u0192",circ:"\u02C6",tilde:"\u02DC",Alpha:"\u0391",Beta:"\u0392",Gamma:"\u0393",Delta:"\u0394",Epsilon:"\u0395",Zeta:"\u0396",Eta:"\u0397",Theta:"\u0398",Iota:"\u0399",Kappa:"\u039A",Lambda:"\u039B",Mu:"\u039C",Nu:"\u039D",Xi:"\u039E",Omicron:"\u039F",Pi:"\u03A0",Rho:"\u03A1",Sigma:"\u03A3",Tau:"\u03A4",Upsilon:"\u03A5",Phi:"\u03A6",Chi:"\u03A7",Psi:"\u03A8",Omega:"\u03A9",alpha:"\u03B1",beta:"\u03B2",gamma:"\u03B3",delta:"\u03B4",epsilon:"\u03B5",zeta:"\u03B6",eta:"\u03B7",theta:"\u03B8",iota:"\u03B9",kappa:"\u03BA",lambda:"\u03BB",mu:"\u03BC",nu:"\u03BD",xi:"\u03BE",omicron:"\u03BF",pi:"\u03C0",rho:"\u03C1",sigmaf:"\u03C2",sigma:"\u03C3",tau:"\u03C4",upsilon:"\u03C5",phi:"\u03C6",chi:"\u03C7",psi:"\u03C8",omega:"\u03C9",thetasym:"\u03D1",upsih:"\u03D2",piv:"\u03D6",ensp:"\u2002",emsp:"\u2003",thinsp:"\u2009",zwnj:"\u200C",zwj:"\u200D",lrm:"\u200E",rlm:"\u200F",ndash:"\u2013",mdash:"\u2014",lsquo:"\u2018",rsquo:"\u2019",sbquo:"\u201A",ldquo:"\u201C",rdquo:"\u201D",bdquo:"\u201E",dagger:"\u2020",Dagger:"\u2021",bull:"\u2022",hellip:"\u2026",permil:"\u2030",prime:"\u2032",Prime:"\u2033",lsaquo:"\u2039",rsaquo:"\u203A",oline:"\u203E",frasl:"\u2044",euro:"\u20AC",image:"\u2111",weierp:"\u2118",real:"\u211C",trade:"\u2122",alefsym:"\u2135",larr:"\u2190",uarr:"\u2191",rarr:"\u2192",darr:"\u2193",harr:"\u2194",crarr:"\u21B5",lArr:"\u21D0",uArr:"\u21D1",rArr:"\u21D2",dArr:"\u21D3",hArr:"\u21D4",forall:"\u2200",part:"\u2202",exist:"\u2203",empty:"\u2205",nabla:"\u2207",isin:"\u2208",notin:"\u2209",ni:"\u220B",prod:"\u220F",sum:"\u2211",minus:"\u2212",lowast:"\u2217",radic:"\u221A",prop:"\u221D",infin:"\u221E",ang:"\u2220",and:"\u2227",or:"\u2228",cap:"\u2229",cup:"\u222A",int:"\u222B",there4:"\u2234",sim:"\u223C",cong:"\u2245",asymp:"\u2248",ne:"\u2260",equiv:"\u2261",le:"\u2264",ge:"\u2265",sub:"\u2282",sup:"\u2283",nsub:"\u2284",sube:"\u2286",supe:"\u2287",oplus:"\u2295",otimes:"\u2297",perp:"\u22A5",sdot:"\u22C5",lceil:"\u2308",rceil:"\u2309",lfloor:"\u230A",rfloor:"\u230B",loz:"\u25CA",spades:"\u2660",clubs:"\u2663",hearts:"\u2665",diams:"\u2666",lang:"\u27E8",rang:"\u27E9"}},function(m,i,f){"use strict";Object.defineProperty(i,"__esModule",{value:!0});var a=f(10),d=f(12),D=f(13),l=function(){function F(){this.values=[],this.curly=this.paren=-1}return F.prototype.beforeFunctionExpression=function(v){return["(","{","[","in","typeof","instanceof","new","return","case","delete","throw","void","=","+=","-=","*=","**=","/=","%=","<<=",">>=",">>>=","&=","|=","^=",",","+","-","*","**","/","%","++","--","<<",">>",">>>","&","|","^","!","~","&&","||","?",":","===","==",">=","<=","<",">","!=","!=="].indexOf(v)>=0},F.prototype.isRegexStart=function(){var v=this.values[this.values.length-1],p=v!==null;switch(v){case"this":case"]":p=!1;break;case")":var E=this.values[this.paren-1];p=E==="if"||E==="while"||E==="for"||E==="with";break;case"}":if(p=!1,this.values[this.curly-3]==="function"){var s=this.values[this.curly-4];p=s?!this.beforeFunctionExpression(s):!1}else if(this.values[this.curly-4]==="function"){var s=this.values[this.curly-5];p=s?!this.beforeFunctionExpression(s):!0}break;default:break}return p},F.prototype.push=function(v){v.type===7||v.type===4?(v.value==="{"?this.curly=this.values.length:v.value==="("&&(this.paren=this.values.length),this.values.push(v.value)):this.values.push(null)},F}(),g=function(){function F(v,p){this.errorHandler=new a.ErrorHandler,this.errorHandler.tolerant=p?typeof p.tolerant=="boolean"&&p.tolerant:!1,this.scanner=new d.Scanner(v,this.errorHandler),this.scanner.trackComment=p?typeof p.comment=="boolean"&&p.comment:!1,this.trackRange=p?typeof p.range=="boolean"&&p.range:!1,this.trackLoc=p?typeof p.loc=="boolean"&&p.loc:!1,this.buffer=[],this.reader=new l}return F.prototype.errors=function(){return this.errorHandler.errors},F.prototype.getNextToken=function(){if(this.buffer.length===0){var v=this.scanner.scanComments();if(this.scanner.trackComment)for(var p=0;p<v.length;++p){var E=v[p],s=this.scanner.source.slice(E.slice[0],E.slice[1]),e={type:E.multiLine?"BlockComment":"LineComment",value:s};this.trackRange&&(e.range=E.range),this.trackLoc&&(e.loc=E.loc),this.buffer.push(e)}if(!this.scanner.eof()){var t=void 0;this.trackLoc&&(t={start:{line:this.scanner.lineNumber,column:this.scanner.index-this.scanner.lineStart},end:{}});var u=this.scanner.source[this.scanner.index]==="/"&&this.reader.isRegexStart(),n=u?this.scanner.scanRegExp():this.scanner.lex();this.reader.push(n);var C={type:D.TokenName[n.type],value:this.scanner.source.slice(n.start,n.end)};if(this.trackRange&&(C.range=[n.start,n.end]),this.trackLoc&&(t.end={line:this.scanner.lineNumber,column:this.scanner.index-this.scanner.lineStart},C.loc=t),n.type===9){var x=n.pattern,k=n.flags;C.regex={pattern:x,flags:k}}this.buffer.push(C)}}return this.buffer.shift()},F}();i.Tokenizer=g}])})});var Nt=re(Mt=>{(function m(i){"use strict";var f,a,d,D,l,g;function F(y){var B={},M,T;for(M in y)y.hasOwnProperty(M)&&(T=y[M],typeof T=="object"&&T!==null?B[M]=F(T):B[M]=T);return B}function v(y,B){var M,T,P,X;for(T=y.length,P=0;T;)M=T>>>1,X=P+M,B(y[X])?T=M:(P=X+1,T-=M+1);return P}f={AssignmentExpression:"AssignmentExpression",AssignmentPattern:"AssignmentPattern",ArrayExpression:"ArrayExpression",ArrayPattern:"ArrayPattern",ArrowFunctionExpression:"ArrowFunctionExpression",AwaitExpression:"AwaitExpression",BlockStatement:"BlockStatement",BinaryExpression:"BinaryExpression",BreakStatement:"BreakStatement",CallExpression:"CallExpression",CatchClause:"CatchClause",ChainExpression:"ChainExpression",ClassBody:"ClassBody",ClassDeclaration:"ClassDeclaration",ClassExpression:"ClassExpression",ComprehensionBlock:"ComprehensionBlock",ComprehensionExpression:"ComprehensionExpression",ConditionalExpression:"ConditionalExpression",ContinueStatement:"ContinueStatement",DebuggerStatement:"DebuggerStatement",DirectiveStatement:"DirectiveStatement",DoWhileStatement:"DoWhileStatement",EmptyStatement:"EmptyStatement",ExportAllDeclaration:"ExportAllDeclaration",ExportDefaultDeclaration:"ExportDefaultDeclaration",ExportNamedDeclaration:"ExportNamedDeclaration",ExportSpecifier:"ExportSpecifier",ExpressionStatement:"ExpressionStatement",ForStatement:"ForStatement",ForInStatement:"ForInStatement",ForOfStatement:"ForOfStatement",FunctionDeclaration:"FunctionDeclaration",FunctionExpression:"FunctionExpression",GeneratorExpression:"GeneratorExpression",Identifier:"Identifier",IfStatement:"IfStatement",ImportExpression:"ImportExpression",ImportDeclaration:"ImportDeclaration",ImportDefaultSpecifier:"ImportDefaultSpecifier",ImportNamespaceSpecifier:"ImportNamespaceSpecifier",ImportSpecifier:"ImportSpecifier",Literal:"Literal",LabeledStatement:"LabeledStatement",LogicalExpression:"LogicalExpression",MemberExpression:"MemberExpression",MetaProperty:"MetaProperty",MethodDefinition:"MethodDefinition",ModuleSpecifier:"ModuleSpecifier",NewExpression:"NewExpression",ObjectExpression:"ObjectExpression",ObjectPattern:"ObjectPattern",PrivateIdentifier:"PrivateIdentifier",Program:"Program",Property:"Property",PropertyDefinition:"PropertyDefinition",RestElement:"RestElement",ReturnStatement:"ReturnStatement",SequenceExpression:"SequenceExpression",SpreadElement:"SpreadElement",Super:"Super",SwitchStatement:"SwitchStatement",SwitchCase:"SwitchCase",TaggedTemplateExpression:"TaggedTemplateExpression",TemplateElement:"TemplateElement",TemplateLiteral:"TemplateLiteral",ThisExpression:"ThisExpression",ThrowStatement:"ThrowStatement",TryStatement:"TryStatement",UnaryExpression:"UnaryExpression",UpdateExpression:"UpdateExpression",VariableDeclaration:"VariableDeclaration",VariableDeclarator:"VariableDeclarator",WhileStatement:"WhileStatement",WithStatement:"WithStatement",YieldExpression:"YieldExpression"},d={AssignmentExpression:["left","right"],AssignmentPattern:["left","right"],ArrayExpression:["elements"],ArrayPattern:["elements"],ArrowFunctionExpression:["params","body"],AwaitExpression:["argument"],BlockStatement:["body"],BinaryExpression:["left","right"],BreakStatement:["label"],CallExpression:["callee","arguments"],CatchClause:["param","body"],ChainExpression:["expression"],ClassBody:["body"],ClassDeclaration:["id","superClass","body"],ClassExpression:["id","superClass","body"],ComprehensionBlock:["left","right"],ComprehensionExpression:["blocks","filter","body"],ConditionalExpression:["test","consequent","alternate"],ContinueStatement:["label"],DebuggerStatement:[],DirectiveStatement:[],DoWhileStatement:["body","test"],EmptyStatement:[],ExportAllDeclaration:["source"],ExportDefaultDeclaration:["declaration"],ExportNamedDeclaration:["declaration","specifiers","source"],ExportSpecifier:["exported","local"],ExpressionStatement:["expression"],ForStatement:["init","test","update","body"],ForInStatement:["left","right","body"],ForOfStatement:["left","right","body"],FunctionDeclaration:["id","params","body"],FunctionExpression:["id","params","body"],GeneratorExpression:["blocks","filter","body"],Identifier:[],IfStatement:["test","consequent","alternate"],ImportExpression:["source"],ImportDeclaration:["specifiers","source"],ImportDefaultSpecifier:["local"],ImportNamespaceSpecifier:["local"],ImportSpecifier:["imported","local"],Literal:[],LabeledStatement:["label","body"],LogicalExpression:["left","right"],MemberExpression:["object","property"],MetaProperty:["meta","property"],MethodDefinition:["key","value"],ModuleSpecifier:[],NewExpression:["callee","arguments"],ObjectExpression:["properties"],ObjectPattern:["properties"],PrivateIdentifier:[],Program:["body"],Property:["key","value"],PropertyDefinition:["key","value"],RestElement:["argument"],ReturnStatement:["argument"],SequenceExpression:["expressions"],SpreadElement:["argument"],Super:[],SwitchStatement:["discriminant","cases"],SwitchCase:["test","consequent"],TaggedTemplateExpression:["tag","quasi"],TemplateElement:[],TemplateLiteral:["quasis","expressions"],ThisExpression:[],ThrowStatement:["argument"],TryStatement:["block","handler","finalizer"],UnaryExpression:["argument"],UpdateExpression:["argument"],VariableDeclaration:["declarations"],VariableDeclarator:["id","init"],WhileStatement:["test","body"],WithStatement:["object","body"],YieldExpression:["argument"]},D={},l={},g={},a={Break:D,Skip:l,Remove:g};function p(y,B){this.parent=y,this.key=B}p.prototype.replace=function(B){this.parent[this.key]=B},p.prototype.remove=function(){return Array.isArray(this.parent)?(this.parent.splice(this.key,1),!0):(this.replace(null),!1)};function E(y,B,M,T){this.node=y,this.path=B,this.wrap=M,this.ref=T}function s(){}s.prototype.path=function(){var B,M,T,P,X,j;function U(L,W){if(Array.isArray(W))for(T=0,P=W.length;T<P;++T)L.push(W[T]);else L.push(W)}if(!this.__current.path)return null;for(X=[],B=2,M=this.__leavelist.length;B<M;++B)j=this.__leavelist[B],U(X,j.path);return U(X,this.__current.path),X},s.prototype.type=function(){var y=this.current();return y.type||this.__current.wrap},s.prototype.parents=function(){var B,M,T;for(T=[],B=1,M=this.__leavelist.length;B<M;++B)T.push(this.__leavelist[B].node);return T},s.prototype.current=function(){return this.__current.node},s.prototype.__execute=function(B,M){var T,P;return P=void 0,T=this.__current,this.__current=M,this.__state=null,B&&(P=B.call(this,M.node,this.__leavelist[this.__leavelist.length-1].node)),this.__current=T,P},s.prototype.notify=function(B){this.__state=B},s.prototype.skip=function(){this.notify(l)},s.prototype.break=function(){this.notify(D)},s.prototype.remove=function(){this.notify(g)},s.prototype.__initialize=function(y,B){this.visitor=B,this.root=y,this.__worklist=[],this.__leavelist=[],this.__current=null,this.__state=null,this.__fallback=null,B.fallback==="iteration"?this.__fallback=Object.keys:typeof B.fallback=="function"&&(this.__fallback=B.fallback),this.__keys=d,B.keys&&(this.__keys=Object.assign(Object.create(this.__keys),B.keys))};function e(y){return y==null?!1:typeof y=="object"&&typeof y.type=="string"}function t(y,B){return(y===f.ObjectExpression||y===f.ObjectPattern)&&B==="properties"}function u(y,B){for(var M=y.length-1;M>=0;--M)if(y[M].node===B)return!0;return!1}s.prototype.traverse=function(B,M){var T,P,X,j,U,L,W,$,Z,H,K,De;for(this.__initialize(B,M),De={},T=this.__worklist,P=this.__leavelist,T.push(new E(B,null,null,null)),P.push(new E(null,null,null,null));T.length;){if(X=T.pop(),X===De){if(X=P.pop(),L=this.__execute(M.leave,X),this.__state===D||L===D)return;continue}if(X.node){if(L=this.__execute(M.enter,X),this.__state===D||L===D)return;if(T.push(De),P.push(X),this.__state===l||L===l)continue;if(j=X.node,U=j.type||X.wrap,H=this.__keys[U],!H)if(this.__fallback)H=this.__fallback(j);else throw new Error("Unknown node type "+U+".");for($=H.length;($-=1)>=0;)if(W=H[$],K=j[W],!!K){if(Array.isArray(K)){for(Z=K.length;(Z-=1)>=0;)if(K[Z]&&!u(P,K[Z])){if(t(U,H[$]))X=new E(K[Z],[W,Z],"Property",null);else if(e(K[Z]))X=new E(K[Z],[W,Z],null,null);else continue;T.push(X)}}else if(e(K)){if(u(P,K))continue;T.push(new E(K,W,null,null))}}}}},s.prototype.replace=function(B,M){var T,P,X,j,U,L,W,$,Z,H,K,De,me;function Se(O){var xe,Ie,Ee,Y;if(O.ref.remove()){for(Ie=O.ref.key,Y=O.ref.parent,xe=T.length;xe--;)if(Ee=T[xe],Ee.ref&&Ee.ref.parent===Y){if(Ee.ref.key<Ie)break;--Ee.ref.key}}}for(this.__initialize(B,M),K={},T=this.__worklist,P=this.__leavelist,De={root:B},L=new E(B,null,null,new p(De,"root")),T.push(L),P.push(L);T.length;){if(L=T.pop(),L===K){if(L=P.pop(),U=this.__execute(M.leave,L),U!==void 0&&U!==D&&U!==l&&U!==g&&L.ref.replace(U),(this.__state===g||U===g)&&Se(L),this.__state===D||U===D)return De.root;continue}if(U=this.__execute(M.enter,L),U!==void 0&&U!==D&&U!==l&&U!==g&&(L.ref.replace(U),L.node=U),(this.__state===g||U===g)&&(Se(L),L.node=null),this.__state===D||U===D)return De.root;if(X=L.node,!!X&&(T.push(K),P.push(L),!(this.__state===l||U===l))){if(j=X.type||L.wrap,Z=this.__keys[j],!Z)if(this.__fallback)Z=this.__fallback(X);else throw new Error("Unknown node type "+j+".");for(W=Z.length;(W-=1)>=0;)if(me=Z[W],H=X[me],!!H)if(Array.isArray(H)){for($=H.length;($-=1)>=0;)if(H[$]){if(t(j,Z[W]))L=new E(H[$],[me,$],"Property",new p(H,$));else if(e(H[$]))L=new E(H[$],[me,$],null,new p(H,$));else continue;T.push(L)}}else e(H)&&T.push(new E(H,me,null,new p(X,me)))}}return De.root};function n(y,B){var M=new s;return M.traverse(y,B)}function C(y,B){var M=new s;return M.replace(y,B)}function x(y,B){var M;return M=v(B,function(P){return P.range[0]>y.range[0]}),y.extendedRange=[y.range[0],y.range[1]],M!==B.length&&(y.extendedRange[1]=B[M].range[0]),M-=1,M>=0&&(y.extendedRange[0]=B[M].range[1]),y}function k(y,B,M){var T=[],P,X,j,U;if(!y.range)throw new Error("attachComments needs range information");if(!M.length){if(B.length){for(j=0,X=B.length;j<X;j+=1)P=F(B[j]),P.extendedRange=[0,y.range[0]],T.push(P);y.leadingComments=T}return y}for(j=0,X=B.length;j<X;j+=1)T.push(x(F(B[j]),M));return U=0,n(y,{enter:function(L){for(var W;U<T.length&&(W=T[U],!(W.extendedRange[1]>L.range[0]));)W.extendedRange[1]===L.range[0]?(L.leadingComments||(L.leadingComments=[]),L.leadingComments.push(W),T.splice(U,1)):U+=1;if(U===T.length)return a.Break;if(T[U].extendedRange[0]>L.range[1])return a.Skip}}),U=0,n(y,{leave:function(L){for(var W;U<T.length&&(W=T[U],!(L.range[1]<W.extendedRange[0]));)L.range[1]===W.extendedRange[0]?(L.trailingComments||(L.trailingComments=[]),L.trailingComments.push(W),T.splice(U,1)):U+=1;if(U===T.length)return a.Break;if(T[U].extendedRange[0]>L.range[1])return a.Skip}}),y}return i.Syntax=f,i.traverse=n,i.replace=C,i.attachComments=k,i.VisitorKeys=d,i.VisitorOption=a,i.Controller=s,i.cloneEnvironment=function(){return m({})},i})(Mt)});var Pt=re((ji,_t)=>{(function(){"use strict";function m(l){if(l==null)return!1;switch(l.type){case"ArrayExpression":case"AssignmentExpression":case"BinaryExpression":case"CallExpression":case"ConditionalExpression":case"FunctionExpression":case"Identifier":case"Literal":case"LogicalExpression":case"MemberExpression":case"NewExpression":case"ObjectExpression":case"SequenceExpression":case"ThisExpression":case"UnaryExpression":case"UpdateExpression":return!0}return!1}function i(l){if(l==null)return!1;switch(l.type){case"DoWhileStatement":case"ForInStatement":case"ForStatement":case"WhileStatement":return!0}return!1}function f(l){if(l==null)return!1;switch(l.type){case"BlockStatement":case"BreakStatement":case"ContinueStatement":case"DebuggerStatement":case"DoWhileStatement":case"EmptyStatement":case"ExpressionStatement":case"ForInStatement":case"ForStatement":case"IfStatement":case"LabeledStatement":case"ReturnStatement":case"SwitchStatement":case"ThrowStatement":case"TryStatement":case"VariableDeclaration":case"WhileStatement":case"WithStatement":return!0}return!1}function a(l){return f(l)||l!=null&&l.type==="FunctionDeclaration"}function d(l){switch(l.type){case"IfStatement":return l.alternate!=null?l.alternate:l.consequent;case"LabeledStatement":case"ForStatement":case"ForInStatement":case"WhileStatement":case"WithStatement":return l.body}return null}function D(l){var g;if(l.type!=="IfStatement"||l.alternate==null)return!1;g=l.consequent;do{if(g.type==="IfStatement"&&g.alternate==null)return!0;g=d(g)}while(g);return!1}_t.exports={isExpression:m,isStatement:f,isIterationStatement:i,isSourceElement:a,isProblematicIfStatement:D,trailingStatement:d}})()});var dt=re((qi,Lt)=>{(function(){"use strict";var m,i,f,a,d,D;i={NonAsciiIdentifierStart:/[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B4\u08B6-\u08BD\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C88\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AE\uA7B0-\uA7B7\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]/,NonAsciiIdentifierPart:/[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u08A0-\u08B4\u08B6-\u08BD\u08D4-\u08E1\u08E3-\u0963\u0966-\u096F\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0AF9\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C00-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58-\u0C5A\u0C60-\u0C63\u0C66-\u0C6F\u0C80-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D01-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D54-\u0D57\u0D5F-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19D9\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1AB0-\u1ABD\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1C80-\u1C88\u1CD0-\u1CD2\u1CD4-\u1CF6\u1CF8\u1CF9\u1D00-\u1DF5\u1DFB-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u200C\u200D\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u2E2F\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099\u309A\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AE\uA7B0-\uA7B7\uA7F7-\uA827\uA840-\uA873\uA880-\uA8C5\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA8FD\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uA9E0-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE2F\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]/},m={NonAsciiIdentifierStart:/[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B4\u08B6-\u08BD\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C88\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309B-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AE\uA7B0-\uA7B7\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF30-\uDF4A\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD804[\uDC03-\uDC37\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDF00-\uDF19]|\uD806[\uDCA0-\uDCDF\uDCFF\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC72-\uDC8F]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50\uDF93-\uDF9F\uDFE0]|\uD821[\uDC00-\uDFEC]|\uD822[\uDC00-\uDEF2]|\uD82C[\uDC00\uDC01]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD83A[\uDC00-\uDCC4\uDD00-\uDD43]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1]|\uD87E[\uDC00-\uDE1D]/,NonAsciiIdentifierPart:/[\xAA\xB5\xB7\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u08A0-\u08B4\u08B6-\u08BD\u08D4-\u08E1\u08E3-\u0963\u0966-\u096F\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0AF9\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C00-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58-\u0C5A\u0C60-\u0C63\u0C66-\u0C6F\u0C80-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D01-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D54-\u0D57\u0D5F-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1369-\u1371\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19DA\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1AB0-\u1ABD\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1C80-\u1C88\u1CD0-\u1CD2\u1CD4-\u1CF6\u1CF8\u1CF9\u1D00-\u1DF5\u1DFB-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u200C\u200D\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AE\uA7B0-\uA7B7\uA7F7-\uA827\uA840-\uA873\uA880-\uA8C5\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA8FD\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uA9E0-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE2F\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDDFD\uDE80-\uDE9C\uDEA0-\uDED0\uDEE0\uDF00-\uDF1F\uDF30-\uDF4A\uDF50-\uDF7A\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCA0-\uDCA9\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00-\uDE03\uDE05\uDE06\uDE0C-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE38-\uDE3A\uDE3F\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE6\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD804[\uDC00-\uDC46\uDC66-\uDC6F\uDC7F-\uDCBA\uDCD0-\uDCE8\uDCF0-\uDCF9\uDD00-\uDD34\uDD36-\uDD3F\uDD50-\uDD73\uDD76\uDD80-\uDDC4\uDDCA-\uDDCC\uDDD0-\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE37\uDE3E\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEEA\uDEF0-\uDEF9\uDF00-\uDF03\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3C-\uDF44\uDF47\uDF48\uDF4B-\uDF4D\uDF50\uDF57\uDF5D-\uDF63\uDF66-\uDF6C\uDF70-\uDF74]|\uD805[\uDC00-\uDC4A\uDC50-\uDC59\uDC80-\uDCC5\uDCC7\uDCD0-\uDCD9\uDD80-\uDDB5\uDDB8-\uDDC0\uDDD8-\uDDDD\uDE00-\uDE40\uDE44\uDE50-\uDE59\uDE80-\uDEB7\uDEC0-\uDEC9\uDF00-\uDF19\uDF1D-\uDF2B\uDF30-\uDF39]|\uD806[\uDCA0-\uDCE9\uDCFF\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC36\uDC38-\uDC40\uDC50-\uDC59\uDC72-\uDC8F\uDC92-\uDCA7\uDCA9-\uDCB6]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE60-\uDE69\uDED0-\uDEED\uDEF0-\uDEF4\uDF00-\uDF36\uDF40-\uDF43\uDF50-\uDF59\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50-\uDF7E\uDF8F-\uDF9F\uDFE0]|\uD821[\uDC00-\uDFEC]|\uD822[\uDC00-\uDEF2]|\uD82C[\uDC00\uDC01]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99\uDC9D\uDC9E]|\uD834[\uDD65-\uDD69\uDD6D-\uDD72\uDD7B-\uDD82\uDD85-\uDD8B\uDDAA-\uDDAD\uDE42-\uDE44]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB\uDFCE-\uDFFF]|\uD836[\uDE00-\uDE36\uDE3B-\uDE6C\uDE75\uDE84\uDE9B-\uDE9F\uDEA1-\uDEAF]|\uD838[\uDC00-\uDC06\uDC08-\uDC18\uDC1B-\uDC21\uDC23\uDC24\uDC26-\uDC2A]|\uD83A[\uDC00-\uDCC4\uDCD0-\uDCD6\uDD00-\uDD4A\uDD50-\uDD59]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1]|\uD87E[\uDC00-\uDE1D]|\uDB40[\uDD00-\uDDEF]/};function l(n){return 48<=n&&n<=57}function g(n){return 48<=n&&n<=57||97<=n&&n<=102||65<=n&&n<=70}function F(n){return n>=48&&n<=55}f=[5760,8192,8193,8194,8195,8196,8197,8198,8199,8200,8201,8202,8239,8287,12288,65279];function v(n){return n===32||n===9||n===11||n===12||n===160||n>=5760&&f.indexOf(n)>=0}function p(n){return n===10||n===13||n===8232||n===8233}function E(n){if(n<=65535)return String.fromCharCode(n);var C=String.fromCharCode(Math.floor((n-65536)/1024)+55296),x=String.fromCharCode((n-65536)%1024+56320);return C+x}for(a=new Array(128),D=0;D<128;++D)a[D]=D>=97&&D<=122||D>=65&&D<=90||D===36||D===95;for(d=new Array(128),D=0;D<128;++D)d[D]=D>=97&&D<=122||D>=65&&D<=90||D>=48&&D<=57||D===36||D===95;function s(n){return n<128?a[n]:i.NonAsciiIdentifierStart.test(E(n))}function e(n){return n<128?d[n]:i.NonAsciiIdentifierPart.test(E(n))}function t(n){return n<128?a[n]:m.NonAsciiIdentifierStart.test(E(n))}function u(n){return n<128?d[n]:m.NonAsciiIdentifierPart.test(E(n))}Lt.exports={isDecimalDigit:l,isHexDigit:g,isOctalDigit:F,isWhiteSpace:v,isLineTerminator:p,isIdentifierStartES5:s,isIdentifierPartES5:e,isIdentifierStartES6:t,isIdentifierPartES6:u}})()});var Rt=re((Wi,Ot)=>{(function(){"use strict";var m=dt();function i(s){switch(s){case"implements":case"interface":case"package":case"private":case"protected":case"public":case"static":case"let":return!0;default:return!1}}function f(s,e){return!e&&s==="yield"?!1:a(s,e)}function a(s,e){if(e&&i(s))return!0;switch(s.length){case 2:return s==="if"||s==="in"||s==="do";case 3:return s==="var"||s==="for"||s==="new"||s==="try";case 4:return s==="this"||s==="else"||s==="case"||s==="void"||s==="with"||s==="enum";case 5:return s==="while"||s==="break"||s==="catch"||s==="throw"||s==="const"||s==="yield"||s==="class"||s==="super";case 6:return s==="return"||s==="typeof"||s==="delete"||s==="switch"||s==="export"||s==="import";case 7:return s==="default"||s==="finally"||s==="extends";case 8:return s==="function"||s==="continue"||s==="debugger";case 10:return s==="instanceof";default:return!1}}function d(s,e){return s==="null"||s==="true"||s==="false"||f(s,e)}function D(s,e){return s==="null"||s==="true"||s==="false"||a(s,e)}function l(s){return s==="eval"||s==="arguments"}function g(s){var e,t,u;if(s.length===0||(u=s.charCodeAt(0),!m.isIdentifierStartES5(u)))return!1;for(e=1,t=s.length;e<t;++e)if(u=s.charCodeAt(e),!m.isIdentifierPartES5(u))return!1;return!0}function F(s,e){return(s-55296)*1024+(e-56320)+65536}function v(s){var e,t,u,n,C;if(s.length===0)return!1;for(C=m.isIdentifierStartES6,e=0,t=s.length;e<t;++e){if(u=s.charCodeAt(e),55296<=u&&u<=56319){if(++e,e>=t||(n=s.charCodeAt(e),!(56320<=n&&n<=57343)))return!1;u=F(u,n)}if(!C(u))return!1;C=m.isIdentifierPartES6}return!0}function p(s,e){return g(s)&&!d(s,e)}function E(s,e){return v(s)&&!D(s,e)}Ot.exports={isKeywordES5:f,isKeywordES6:a,isReservedWordES5:d,isReservedWordES6:D,isRestrictedWord:l,isIdentifierNameES5:g,isIdentifierNameES6:v,isIdentifierES5:p,isIdentifierES6:E}})()});var Xt=re(Ye=>{(function(){"use strict";Ye.ast=Pt(),Ye.code=dt(),Ye.keyword=Rt()})()});var zt=re(mt=>{var Ut="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("");mt.encode=function(m){if(0<=m&&m<Ut.length)return Ut[m];throw new TypeError("Must be between 0 and 63: "+m)};mt.decode=function(m){var i=65,f=90,a=97,d=122,D=48,l=57,g=43,F=47,v=26,p=52;return i<=m&&m<=f?m-i:a<=m&&m<=d?m-a+v:D<=m&&m<=l?m-D+p:m==g?62:m==F?63:-1}});var Et=re(At=>{var Jt=zt(),Ct=5,jt=1<<Ct,qt=jt-1,Wt=jt;function Ci(m){return m<0?(-m<<1)+1:(m<<1)+0}function Ai(m){var i=(m&1)===1,f=m>>1;return i?-f:f}At.encode=function(i){var f="",a,d=Ci(i);do a=d&qt,d>>>=Ct,d>0&&(a|=Wt),f+=Jt.encode(a);while(d>0);return f};At.decode=function(i,f,a){var d=i.length,D=0,l=0,g,F;do{if(f>=d)throw new Error("Expected more digits in base 64 VLQ value.");if(F=Jt.decode(i.charCodeAt(f++)),F===-1)throw new Error("Invalid base64 digit: "+i.charAt(f-1));g=!!(F&Wt),F&=qt,D=D+(F<<l),l+=Ct}while(g);a.value=Ai(D),a.rest=f}});var Oe=re(he=>{function Ei(m,i,f){if(i in m)return m[i];if(arguments.length===3)return f;throw new Error('"'+i+'" is a required argument.')}he.getArg=Ei;var Kt=/^(?:([\w+\-.]+):)?\/\/(?:(\w+:\w+)@)?([\w.-]*)(?::(\d+))?(.*)$/,Fi=/^data:.+\,.+$/;function ze(m){var i=m.match(Kt);return i?{scheme:i[1],auth:i[2],host:i[3],port:i[4],path:i[5]}:null}he.urlParse=ze;function Pe(m){var i="";return m.scheme&&(i+=m.scheme+":"),i+="//",m.auth&&(i+=m.auth+"@"),m.host&&(i+=m.host),m.port&&(i+=":"+m.port),m.path&&(i+=m.path),i}he.urlGenerate=Pe;function Ft(m){var i=m,f=ze(m);if(f){if(!f.path)return m;i=f.path}for(var a=he.isAbsolute(i),d=i.split(/\/+/),D,l=0,g=d.length-1;g>=0;g--)D=d[g],D==="."?d.splice(g,1):D===".."?l++:l>0&&(D===""?(d.splice(g+1,l),l=0):(d.splice(g,2),l--));return i=d.join("/"),i===""&&(i=a?"/":"."),f?(f.path=i,Pe(f)):i}he.normalize=Ft;function Gt(m,i){m===""&&(m="."),i===""&&(i=".");var f=ze(i),a=ze(m);if(a&&(m=a.path||"/"),f&&!f.scheme)return a&&(f.scheme=a.scheme),Pe(f);if(f||i.match(Fi))return i;if(a&&!a.host&&!a.path)return a.host=i,Pe(a);var d=i.charAt(0)==="/"?i:Ft(m.replace(/\/+$/,"")+"/"+i);return a?(a.path=d,Pe(a)):d}he.join=Gt;he.isAbsolute=function(m){return m.charAt(0)==="/"||Kt.test(m)};function xi(m,i){m===""&&(m="."),m=m.replace(/\/$/,"");for(var f=0;i.indexOf(m+"/")!==0;){var a=m.lastIndexOf("/");if(a<0||(m=m.slice(0,a),m.match(/^([^\/]+:\/)?\/*$/)))return i;++f}return Array(f+1).join("../")+i.substr(m.length+1)}he.relative=xi;var Vt=function(){var m=Object.create(null);return!("__proto__"in m)}();function Ht(m){return m}function gi(m){return Yt(m)?"$"+m:m}he.toSetString=Vt?Ht:gi;function vi(m){return Yt(m)?m.slice(1):m}he.fromSetString=Vt?Ht:vi;function Yt(m){if(!m)return!1;var i=m.length;if(i<9||m.charCodeAt(i-1)!==95||m.charCodeAt(i-2)!==95||m.charCodeAt(i-3)!==111||m.charCodeAt(i-4)!==116||m.charCodeAt(i-5)!==111||m.charCodeAt(i-6)!==114||m.charCodeAt(i-7)!==112||m.charCodeAt(i-8)!==95||m.charCodeAt(i-9)!==95)return!1;for(var f=i-10;f>=0;f--)if(m.charCodeAt(f)!==36)return!1;return!0}function yi(m,i,f){var a=Le(m.source,i.source);return a!==0||(a=m.originalLine-i.originalLine,a!==0)||(a=m.originalColumn-i.originalColumn,a!==0||f)||(a=m.generatedColumn-i.generatedColumn,a!==0)||(a=m.generatedLine-i.generatedLine,a!==0)?a:Le(m.name,i.name)}he.compareByOriginalPositions=yi;function Si(m,i,f){var a=m.generatedLine-i.generatedLine;return a!==0||(a=m.generatedColumn-i.generatedColumn,a!==0||f)||(a=Le(m.source,i.source),a!==0)||(a=m.originalLine-i.originalLine,a!==0)||(a=m.originalColumn-i.originalColumn,a!==0)?a:Le(m.name,i.name)}he.compareByGeneratedPositionsDeflated=Si;function Le(m,i){return m===i?0:m===null?1:i===null?-1:m>i?1:-1}function Bi(m,i){var f=m.generatedLine-i.generatedLine;return f!==0||(f=m.generatedColumn-i.generatedColumn,f!==0)||(f=Le(m.source,i.source),f!==0)||(f=m.originalLine-i.originalLine,f!==0)||(f=m.originalColumn-i.originalColumn,f!==0)?f:Le(m.name,i.name)}he.compareByGeneratedPositionsInflated=Bi;function wi(m){return JSON.parse(m.replace(/^\)]}'[^\n]*\n/,""))}he.parseSourceMapInput=wi;function bi(m,i,f){if(i=i||"",m&&(m[m.length-1]!=="/"&&i[0]!=="/"&&(m+="/"),i=m+i),f){var a=ze(f);if(!a)throw new Error("sourceMapURL could not be parsed");if(a.path){var d=a.path.lastIndexOf("/");d>=0&&(a.path=a.path.substring(0,d+1))}i=Gt(Pe(a),i)}return Ft(i)}he.computeSourceURL=bi});var vt=re($t=>{var xt=Oe(),gt=Object.prototype.hasOwnProperty,ke=typeof Map<"u";function ve(){this._array=[],this._set=ke?new Map:Object.create(null)}ve.fromArray=function(i,f){for(var a=new ve,d=0,D=i.length;d<D;d++)a.add(i[d],f);return a};ve.prototype.size=function(){return ke?this._set.size:Object.getOwnPropertyNames(this._set).length};ve.prototype.add=function(i,f){var a=ke?i:xt.toSetString(i),d=ke?this.has(i):gt.call(this._set,a),D=this._array.length;(!d||f)&&this._array.push(i),d||(ke?this._set.set(i,D):this._set[a]=D)};ve.prototype.has=function(i){if(ke)return this._set.has(i);var f=xt.toSetString(i);return gt.call(this._set,f)};ve.prototype.indexOf=function(i){if(ke){var f=this._set.get(i);if(f>=0)return f}else{var a=xt.toSetString(i);if(gt.call(this._set,a))return this._set[a]}throw new Error('"'+i+'" is not in the set.')};ve.prototype.at=function(i){if(i>=0&&i<this._array.length)return this._array[i];throw new Error("No element indexed by "+i)};ve.prototype.toArray=function(){return this._array.slice()};$t.ArraySet=ve});var ei=re(Zt=>{var Qt=Oe();function ki(m,i){var f=m.generatedLine,a=i.generatedLine,d=m.generatedColumn,D=i.generatedColumn;return a>f||a==f&&D>=d||Qt.compareByGeneratedPositionsInflated(m,i)<=0}function $e(){this._array=[],this._sorted=!0,this._last={generatedLine:-1,generatedColumn:0}}$e.prototype.unsortedForEach=function(i,f){this._array.forEach(i,f)};$e.prototype.add=function(i){ki(this._last,i)?(this._last=i,this._array.push(i)):(this._sorted=!1,this._array.push(i))};$e.prototype.toArray=function(){return this._sorted||(this._array.sort(Qt.compareByGeneratedPositionsInflated),this._sorted=!0),this._array};Zt.MappingList=$e});var yt=re(ti=>{var Je=Et(),ue=Oe(),Qe=vt().ArraySet,Ti=ei().MappingList;function de(m){m||(m={}),this._file=ue.getArg(m,"file",null),this._sourceRoot=ue.getArg(m,"sourceRoot",null),this._skipValidation=ue.getArg(m,"skipValidation",!1),this._sources=new Qe,this._names=new Qe,this._mappings=new Ti,this._sourcesContents=null}de.prototype._version=3;de.fromSourceMap=function(i){var f=i.sourceRoot,a=new de({file:i.file,sourceRoot:f});return i.eachMapping(function(d){var D={generated:{line:d.generatedLine,column:d.generatedColumn}};d.source!=null&&(D.source=d.source,f!=null&&(D.source=ue.relative(f,D.source)),D.original={line:d.originalLine,column:d.originalColumn},d.name!=null&&(D.name=d.name)),a.addMapping(D)}),i.sources.forEach(function(d){var D=d;f!==null&&(D=ue.relative(f,d)),a._sources.has(D)||a._sources.add(D);var l=i.sourceContentFor(d);l!=null&&a.setSourceContent(d,l)}),a};de.prototype.addMapping=function(i){var f=ue.getArg(i,"generated"),a=ue.getArg(i,"original",null),d=ue.getArg(i,"source",null),D=ue.getArg(i,"name",null);this._skipValidation||this._validateMapping(f,a,d,D),d!=null&&(d=String(d),this._sources.has(d)||this._sources.add(d)),D!=null&&(D=String(D),this._names.has(D)||this._names.add(D)),this._mappings.add({generatedLine:f.line,generatedColumn:f.column,originalLine:a!=null&&a.line,originalColumn:a!=null&&a.column,source:d,name:D})};de.prototype.setSourceContent=function(i,f){var a=i;this._sourceRoot!=null&&(a=ue.relative(this._sourceRoot,a)),f!=null?(this._sourcesContents||(this._sourcesContents=Object.create(null)),this._sourcesContents[ue.toSetString(a)]=f):this._sourcesContents&&(delete this._sourcesContents[ue.toSetString(a)],Object.keys(this._sourcesContents).length===0&&(this._sourcesContents=null))};de.prototype.applySourceMap=function(i,f,a){var d=f;if(f==null){if(i.file==null)throw new Error(`SourceMapGenerator.prototype.applySourceMap requires either an explicit source file, or the source map's "file" property. Both were omitted.`);d=i.file}var D=this._sourceRoot;D!=null&&(d=ue.relative(D,d));var l=new Qe,g=new Qe;this._mappings.unsortedForEach(function(F){if(F.source===d&&F.originalLine!=null){var v=i.originalPositionFor({line:F.originalLine,column:F.originalColumn});v.source!=null&&(F.source=v.source,a!=null&&(F.source=ue.join(a,F.source)),D!=null&&(F.source=ue.relative(D,F.source)),F.originalLine=v.line,F.originalColumn=v.column,v.name!=null&&(F.name=v.name))}var p=F.source;p!=null&&!l.has(p)&&l.add(p);var E=F.name;E!=null&&!g.has(E)&&g.add(E)},this),this._sources=l,this._names=g,i.sources.forEach(function(F){var v=i.sourceContentFor(F);v!=null&&(a!=null&&(F=ue.join(a,F)),D!=null&&(F=ue.relative(D,F)),this.setSourceContent(F,v))},this)};de.prototype._validateMapping=function(i,f,a,d){if(f&&typeof f.line!="number"&&typeof f.column!="number")throw new Error("original.line and original.column are not numbers -- you probably meant to omit the original mapping entirely and only map the generated position. If so, pass null for the original mapping instead of an object with empty or null values.");if(!(i&&"line"in i&&"column"in i&&i.line>0&&i.column>=0&&!f&&!a&&!d)){if(i&&"line"in i&&"column"in i&&f&&"line"in f&&"column"in f&&i.line>0&&i.column>=0&&f.line>0&&f.column>=0&&a)return;throw new Error("Invalid mapping: "+JSON.stringify({generated:i,source:a,original:f,name:d}))}};de.prototype._serializeMappings=function(){for(var i=0,f=1,a=0,d=0,D=0,l=0,g="",F,v,p,E,s=this._mappings.toArray(),e=0,t=s.length;e<t;e++){if(v=s[e],F="",v.generatedLine!==f)for(i=0;v.generatedLine!==f;)F+=";",f++;else if(e>0){if(!ue.compareByGeneratedPositionsInflated(v,s[e-1]))continue;F+=","}F+=Je.encode(v.generatedColumn-i),i=v.generatedColumn,v.source!=null&&(E=this._sources.indexOf(v.source),F+=Je.encode(E-l),l=E,F+=Je.encode(v.originalLine-1-d),d=v.originalLine-1,F+=Je.encode(v.originalColumn-a),a=v.originalColumn,v.name!=null&&(p=this._names.indexOf(v.name),F+=Je.encode(p-D),D=p)),g+=F}return g};de.prototype._generateSourcesContent=function(i,f){return i.map(function(a){if(!this._sourcesContents)return null;f!=null&&(a=ue.relative(f,a));var d=ue.toSetString(a);return Object.prototype.hasOwnProperty.call(this._sourcesContents,d)?this._sourcesContents[d]:null},this)};de.prototype.toJSON=function(){var i={version:this._version,sources:this._sources.toArray(),names:this._names.toArray(),mappings:this._serializeMappings()};return this._file!=null&&(i.file=this._file),this._sourceRoot!=null&&(i.sourceRoot=this._sourceRoot),this._sourcesContents&&(i.sourcesContent=this._generateSourcesContent(i.sources,i.sourceRoot)),i};de.prototype.toString=function(){return JSON.stringify(this.toJSON())};ti.SourceMapGenerator=de});var ii=re(Te=>{Te.GREATEST_LOWER_BOUND=1;Te.LEAST_UPPER_BOUND=2;function St(m,i,f,a,d,D){var l=Math.floor((i-m)/2)+m,g=d(f,a[l],!0);return g===0?l:g>0?i-l>1?St(l,i,f,a,d,D):D==Te.LEAST_UPPER_BOUND?i<a.length?i:-1:l:l-m>1?St(m,l,f,a,d,D):D==Te.LEAST_UPPER_BOUND?l:m<0?-1:m}Te.search=function(i,f,a,d){if(f.length===0)return-1;var D=St(-1,f.length,i,f,a,d||Te.GREATEST_LOWER_BOUND);if(D<0)return-1;for(;D-1>=0&&a(f[D],f[D-1],!0)===0;)--D;return D}});var ui=re(ri=>{function Bt(m,i,f){var a=m[i];m[i]=m[f],m[f]=a}function Ii(m,i){return Math.round(m+Math.random()*(i-m))}function wt(m,i,f,a){if(f<a){var d=Ii(f,a),D=f-1;Bt(m,d,a);for(var l=m[a],g=f;g<a;g++)i(m[g],l)<=0&&(D+=1,Bt(m,D,g));Bt(m,D+1,g);var F=D+1;wt(m,i,f,F-1),wt(m,i,F+1,a)}}ri.quickSort=function(m,i){wt(m,i,0,m.length-1)}});var si=re(Ze=>{var z=Oe(),bt=ii(),Re=vt().ArraySet,Mi=Et(),je=ui().quickSort;function Q(m,i){var f=m;return typeof m=="string"&&(f=z.parseSourceMapInput(m)),f.sections!=null?new Ae(f,i):new le(f,i)}Q.fromSourceMap=function(m,i){return le.fromSourceMap(m,i)};Q.prototype._version=3;Q.prototype.__generatedMappings=null;Object.defineProperty(Q.prototype,"_generatedMappings",{configurable:!0,enumerable:!0,get:function(){return this.__generatedMappings||this._parseMappings(this._mappings,this.sourceRoot),this.__generatedMappings}});Q.prototype.__originalMappings=null;Object.defineProperty(Q.prototype,"_originalMappings",{configurable:!0,enumerable:!0,get:function(){return this.__originalMappings||this._parseMappings(this._mappings,this.sourceRoot),this.__originalMappings}});Q.prototype._charIsMappingSeparator=function(i,f){var a=i.charAt(f);return a===";"||a===","};Q.prototype._parseMappings=function(i,f){throw new Error("Subclasses must implement _parseMappings")};Q.GENERATED_ORDER=1;Q.ORIGINAL_ORDER=2;Q.GREATEST_LOWER_BOUND=1;Q.LEAST_UPPER_BOUND=2;Q.prototype.eachMapping=function(i,f,a){var d=f||null,D=a||Q.GENERATED_ORDER,l;switch(D){case Q.GENERATED_ORDER:l=this._generatedMappings;break;case Q.ORIGINAL_ORDER:l=this._originalMappings;break;default:throw new Error("Unknown order of iteration.")}var g=this.sourceRoot;l.map(function(F){var v=F.source===null?null:this._sources.at(F.source);return v=z.computeSourceURL(g,v,this._sourceMapURL),{source:v,generatedLine:F.generatedLine,generatedColumn:F.generatedColumn,originalLine:F.originalLine,originalColumn:F.originalColumn,name:F.name===null?null:this._names.at(F.name)}},this).forEach(i,d)};Q.prototype.allGeneratedPositionsFor=function(i){var f=z.getArg(i,"line"),a={source:z.getArg(i,"source"),originalLine:f,originalColumn:z.getArg(i,"column",0)};if(a.source=this._findSourceIndex(a.source),a.source<0)return[];var d=[],D=this._findMapping(a,this._originalMappings,"originalLine","originalColumn",z.compareByOriginalPositions,bt.LEAST_UPPER_BOUND);if(D>=0){var l=this._originalMappings[D];if(i.column===void 0)for(var g=l.originalLine;l&&l.originalLine===g;)d.push({line:z.getArg(l,"generatedLine",null),column:z.getArg(l,"generatedColumn",null),lastColumn:z.getArg(l,"lastGeneratedColumn",null)}),l=this._originalMappings[++D];else for(var F=l.originalColumn;l&&l.originalLine===f&&l.originalColumn==F;)d.push({line:z.getArg(l,"generatedLine",null),column:z.getArg(l,"generatedColumn",null),lastColumn:z.getArg(l,"lastGeneratedColumn",null)}),l=this._originalMappings[++D]}return d};Ze.SourceMapConsumer=Q;function le(m,i){var f=m;typeof m=="string"&&(f=z.parseSourceMapInput(m));var a=z.getArg(f,"version"),d=z.getArg(f,"sources"),D=z.getArg(f,"names",[]),l=z.getArg(f,"sourceRoot",null),g=z.getArg(f,"sourcesContent",null),F=z.getArg(f,"mappings"),v=z.getArg(f,"file",null);if(a!=this._version)throw new Error("Unsupported version: "+a);l&&(l=z.normalize(l)),d=d.map(String).map(z.normalize).map(function(p){return l&&z.isAbsolute(l)&&z.isAbsolute(p)?z.relative(l,p):p}),this._names=Re.fromArray(D.map(String),!0),this._sources=Re.fromArray(d,!0),this._absoluteSources=this._sources.toArray().map(function(p){return z.computeSourceURL(l,p,i)}),this.sourceRoot=l,this.sourcesContent=g,this._mappings=F,this._sourceMapURL=i,this.file=v}le.prototype=Object.create(Q.prototype);le.prototype.consumer=Q;le.prototype._findSourceIndex=function(m){var i=m;if(this.sourceRoot!=null&&(i=z.relative(this.sourceRoot,i)),this._sources.has(i))return this._sources.indexOf(i);var f;for(f=0;f<this._absoluteSources.length;++f)if(this._absoluteSources[f]==m)return f;return-1};le.fromSourceMap=function(i,f){var a=Object.create(le.prototype),d=a._names=Re.fromArray(i._names.toArray(),!0),D=a._sources=Re.fromArray(i._sources.toArray(),!0);a.sourceRoot=i._sourceRoot,a.sourcesContent=i._generateSourcesContent(a._sources.toArray(),a.sourceRoot),a.file=i._file,a._sourceMapURL=f,a._absoluteSources=a._sources.toArray().map(function(e){return z.computeSourceURL(a.sourceRoot,e,f)});for(var l=i._mappings.toArray().slice(),g=a.__generatedMappings=[],F=a.__originalMappings=[],v=0,p=l.length;v<p;v++){var E=l[v],s=new ni;s.generatedLine=E.generatedLine,s.generatedColumn=E.generatedColumn,E.source&&(s.source=D.indexOf(E.source),s.originalLine=E.originalLine,s.originalColumn=E.originalColumn,E.name&&(s.name=d.indexOf(E.name)),F.push(s)),g.push(s)}return je(a.__originalMappings,z.compareByOriginalPositions),a};le.prototype._version=3;Object.defineProperty(le.prototype,"sources",{get:function(){return this._absoluteSources.slice()}});function ni(){this.generatedLine=0,this.generatedColumn=0,this.source=null,this.originalLine=null,this.originalColumn=null,this.name=null}le.prototype._parseMappings=function(i,f){for(var a=1,d=0,D=0,l=0,g=0,F=0,v=i.length,p=0,E={},s={},e=[],t=[],u,n,C,x,k;p<v;)if(i.charAt(p)===";")a++,p++,d=0;else if(i.charAt(p)===",")p++;else{for(u=new ni,u.generatedLine=a,x=p;x<v&&!this._charIsMappingSeparator(i,x);x++);if(n=i.slice(p,x),C=E[n],C)p+=n.length;else{for(C=[];p<x;)Mi.decode(i,p,s),k=s.value,p=s.rest,C.push(k);if(C.length===2)throw new Error("Found a source, but no line and column");if(C.length===3)throw new Error("Found a source and line, but no column");E[n]=C}u.generatedColumn=d+C[0],d=u.generatedColumn,C.length>1&&(u.source=g+C[1],g+=C[1],u.originalLine=D+C[2],D=u.originalLine,u.originalLine+=1,u.originalColumn=l+C[3],l=u.originalColumn,C.length>4&&(u.name=F+C[4],F+=C[4])),t.push(u),typeof u.originalLine=="number"&&e.push(u)}je(t,z.compareByGeneratedPositionsDeflated),this.__generatedMappings=t,je(e,z.compareByOriginalPositions),this.__originalMappings=e};le.prototype._findMapping=function(i,f,a,d,D,l){if(i[a]<=0)throw new TypeError("Line must be greater than or equal to 1, got "+i[a]);if(i[d]<0)throw new TypeError("Column must be greater than or equal to 0, got "+i[d]);return bt.search(i,f,D,l)};le.prototype.computeColumnSpans=function(){for(var i=0;i<this._generatedMappings.length;++i){var f=this._generatedMappings[i];if(i+1<this._generatedMappings.length){var a=this._generatedMappings[i+1];if(f.generatedLine===a.generatedLine){f.lastGeneratedColumn=a.generatedColumn-1;continue}}f.lastGeneratedColumn=1/0}};le.prototype.originalPositionFor=function(i){var f={generatedLine:z.getArg(i,"line"),generatedColumn:z.getArg(i,"column")},a=this._findMapping(f,this._generatedMappings,"generatedLine","generatedColumn",z.compareByGeneratedPositionsDeflated,z.getArg(i,"bias",Q.GREATEST_LOWER_BOUND));if(a>=0){var d=this._generatedMappings[a];if(d.generatedLine===f.generatedLine){var D=z.getArg(d,"source",null);D!==null&&(D=this._sources.at(D),D=z.computeSourceURL(this.sourceRoot,D,this._sourceMapURL));var l=z.getArg(d,"name",null);return l!==null&&(l=this._names.at(l)),{source:D,line:z.getArg(d,"originalLine",null),column:z.getArg(d,"originalColumn",null),name:l}}}return{source:null,line:null,column:null,name:null}};le.prototype.hasContentsOfAllSources=function(){return this.sourcesContent?this.sourcesContent.length>=this._sources.size()&&!this.sourcesContent.some(function(i){return i==null}):!1};le.prototype.sourceContentFor=function(i,f){if(!this.sourcesContent)return null;var a=this._findSourceIndex(i);if(a>=0)return this.sourcesContent[a];var d=i;this.sourceRoot!=null&&(d=z.relative(this.sourceRoot,d));var D;if(this.sourceRoot!=null&&(D=z.urlParse(this.sourceRoot))){var l=d.replace(/^file:\/\//,"");if(D.scheme=="file"&&this._sources.has(l))return this.sourcesContent[this._sources.indexOf(l)];if((!D.path||D.path=="/")&&this._sources.has("/"+d))return this.sourcesContent[this._sources.indexOf("/"+d)]}if(f)return null;throw new Error('"'+d+'" is not in the SourceMap.')};le.prototype.generatedPositionFor=function(i){var f=z.getArg(i,"source");if(f=this._findSourceIndex(f),f<0)return{line:null,column:null,lastColumn:null};var a={source:f,originalLine:z.getArg(i,"line"),originalColumn:z.getArg(i,"column")},d=this._findMapping(a,this._originalMappings,"originalLine","originalColumn",z.compareByOriginalPositions,z.getArg(i,"bias",Q.GREATEST_LOWER_BOUND));if(d>=0){var D=this._originalMappings[d];if(D.source===a.source)return{line:z.getArg(D,"generatedLine",null),column:z.getArg(D,"generatedColumn",null),lastColumn:z.getArg(D,"lastGeneratedColumn",null)}}return{line:null,column:null,lastColumn:null}};Ze.BasicSourceMapConsumer=le;function Ae(m,i){var f=m;typeof m=="string"&&(f=z.parseSourceMapInput(m));var a=z.getArg(f,"version"),d=z.getArg(f,"sections");if(a!=this._version)throw new Error("Unsupported version: "+a);this._sources=new Re,this._names=new Re;var D={line:-1,column:0};this._sections=d.map(function(l){if(l.url)throw new Error("Support for url field in sections not implemented.");var g=z.getArg(l,"offset"),F=z.getArg(g,"line"),v=z.getArg(g,"column");if(F<D.line||F===D.line&&v<D.column)throw new Error("Section offsets must be ordered and non-overlapping.");return D=g,{generatedOffset:{generatedLine:F+1,generatedColumn:v+1},consumer:new Q(z.getArg(l,"map"),i)}})}Ae.prototype=Object.create(Q.prototype);Ae.prototype.constructor=Q;Ae.prototype._version=3;Object.defineProperty(Ae.prototype,"sources",{get:function(){for(var m=[],i=0;i<this._sections.length;i++)for(var f=0;f<this._sections[i].consumer.sources.length;f++)m.push(this._sections[i].consumer.sources[f]);return m}});Ae.prototype.originalPositionFor=function(i){var f={generatedLine:z.getArg(i,"line"),generatedColumn:z.getArg(i,"column")},a=bt.search(f,this._sections,function(D,l){var g=D.generatedLine-l.generatedOffset.generatedLine;return g||D.generatedColumn-l.generatedOffset.generatedColumn}),d=this._sections[a];return d?d.consumer.originalPositionFor({line:f.generatedLine-(d.generatedOffset.generatedLine-1),column:f.generatedColumn-(d.generatedOffset.generatedLine===f.generatedLine?d.generatedOffset.generatedColumn-1:0),bias:i.bias}):{source:null,line:null,column:null,name:null}};Ae.prototype.hasContentsOfAllSources=function(){return this._sections.every(function(i){return i.consumer.hasContentsOfAllSources()})};Ae.prototype.sourceContentFor=function(i,f){for(var a=0;a<this._sections.length;a++){var d=this._sections[a],D=d.consumer.sourceContentFor(i,!0);if(D)return D}if(f)return null;throw new Error('"'+i+'" is not in the SourceMap.')};Ae.prototype.generatedPositionFor=function(i){for(var f=0;f<this._sections.length;f++){var a=this._sections[f];if(a.consumer._findSourceIndex(z.getArg(i,"source"))!==-1){var d=a.consumer.generatedPositionFor(i);if(d){var D={line:d.line+(a.generatedOffset.generatedLine-1),column:d.column+(a.generatedOffset.generatedLine===d.line?a.generatedOffset.generatedColumn-1:0)};return D}}}return{line:null,column:null}};Ae.prototype._parseMappings=function(i,f){this.__generatedMappings=[],this.__originalMappings=[];for(var a=0;a<this._sections.length;a++)for(var d=this._sections[a],D=d.consumer._generatedMappings,l=0;l<D.length;l++){var g=D[l],F=d.consumer._sources.at(g.source);F=z.computeSourceURL(d.consumer.sourceRoot,F,this._sourceMapURL),this._sources.add(F),F=this._sources.indexOf(F);var v=null;g.name&&(v=d.consumer._names.at(g.name),this._names.add(v),v=this._names.indexOf(v));var p={source:F,generatedLine:g.generatedLine+(d.generatedOffset.generatedLine-1),generatedColumn:g.generatedColumn+(d.generatedOffset.generatedLine===g.generatedLine?d.generatedOffset.generatedColumn-1:0),originalLine:g.originalLine,originalColumn:g.originalColumn,name:v};this.__generatedMappings.push(p),typeof p.originalLine=="number"&&this.__originalMappings.push(p)}je(this.__generatedMappings,z.compareByGeneratedPositionsDeflated),je(this.__originalMappings,z.compareByOriginalPositions)};Ze.IndexedSourceMapConsumer=Ae});var oi=re(ai=>{var Ni=yt().SourceMapGenerator,et=Oe(),_i=/(\r?\n)/,Pi=10,Xe="$$$isSourceNode$$$";function pe(m,i,f,a,d){this.children=[],this.sourceContents={},this.line=m??null,this.column=i??null,this.source=f??null,this.name=d??null,this[Xe]=!0,a!=null&&this.add(a)}pe.fromStringWithSourceMap=function(i,f,a){var d=new pe,D=i.split(_i),l=0,g=function(){var s=t(),e=t()||"";return s+e;function t(){return l<D.length?D[l++]:void 0}},F=1,v=0,p=null;return f.eachMapping(function(s){if(p!==null)if(F<s.generatedLine)E(p,g()),F++,v=0;else{var e=D[l]||"",t=e.substr(0,s.generatedColumn-v);D[l]=e.substr(s.generatedColumn-v),v=s.generatedColumn,E(p,t),p=s;return}for(;F<s.generatedLine;)d.add(g()),F++;if(v<s.generatedColumn){var e=D[l]||"";d.add(e.substr(0,s.generatedColumn)),D[l]=e.substr(s.generatedColumn),v=s.generatedColumn}p=s},this),l<D.length&&(p&&E(p,g()),d.add(D.splice(l).join(""))),f.sources.forEach(function(s){var e=f.sourceContentFor(s);e!=null&&(a!=null&&(s=et.join(a,s)),d.setSourceContent(s,e))}),d;function E(s,e){if(s===null||s.source===void 0)d.add(e);else{var t=a?et.join(a,s.source):s.source;d.add(new pe(s.originalLine,s.originalColumn,t,e,s.name))}}};pe.prototype.add=function(i){if(Array.isArray(i))i.forEach(function(f){this.add(f)},this);else if(i[Xe]||typeof i=="string")i&&this.children.push(i);else throw new TypeError("Expected a SourceNode, string, or an array of SourceNodes and strings. Got "+i);return this};pe.prototype.prepend=function(i){if(Array.isArray(i))for(var f=i.length-1;f>=0;f--)this.prepend(i[f]);else if(i[Xe]||typeof i=="string")this.children.unshift(i);else throw new TypeError("Expected a SourceNode, string, or an array of SourceNodes and strings. Got "+i);return this};pe.prototype.walk=function(i){for(var f,a=0,d=this.children.length;a<d;a++)f=this.children[a],f[Xe]?f.walk(i):f!==""&&i(f,{source:this.source,line:this.line,column:this.column,name:this.name})};pe.prototype.join=function(i){var f,a,d=this.children.length;if(d>0){for(f=[],a=0;a<d-1;a++)f.push(this.children[a]),f.push(i);f.push(this.children[a]),this.children=f}return this};pe.prototype.replaceRight=function(i,f){var a=this.children[this.children.length-1];return a[Xe]?a.replaceRight(i,f):typeof a=="string"?this.children[this.children.length-1]=a.replace(i,f):this.children.push("".replace(i,f)),this};pe.prototype.setSourceContent=function(i,f){this.sourceContents[et.toSetString(i)]=f};pe.prototype.walkSourceContents=function(i){for(var f=0,a=this.children.length;f<a;f++)this.children[f][Xe]&&this.children[f].walkSourceContents(i);for(var d=Object.keys(this.sourceContents),f=0,a=d.length;f<a;f++)i(et.fromSetString(d[f]),this.sourceContents[d[f]])};pe.prototype.toString=function(){var i="";return this.walk(function(f){i+=f}),i};pe.prototype.toStringWithSourceMap=function(i){var f={code:"",line:1,column:0},a=new Ni(i),d=!1,D=null,l=null,g=null,F=null;return this.walk(function(v,p){f.code+=v,p.source!==null&&p.line!==null&&p.column!==null?((D!==p.source||l!==p.line||g!==p.column||F!==p.name)&&a.addMapping({source:p.source,original:{line:p.line,column:p.column},generated:{line:f.line,column:f.column},name:p.name}),D=p.source,l=p.line,g=p.column,F=p.name,d=!0):d&&(a.addMapping({generated:{line:f.line,column:f.column}}),D=null,d=!1);for(var E=0,s=v.length;E<s;E++)v.charCodeAt(E)===Pi?(f.line++,f.column=0,E+1===s?(D=null,d=!1):d&&a.addMapping({source:p.source,original:{line:p.line,column:p.column},generated:{line:f.line,column:f.column},name:p.name})):f.column++}),this.walkSourceContents(function(v,p){a.setSourceContent(v,p)}),{code:f.code,map:a}};ai.SourceNode=pe});var li=re(tt=>{tt.SourceMapGenerator=yt().SourceMapGenerator;tt.SourceMapConsumer=si().SourceMapConsumer;tt.SourceNode=oi().SourceNode});var hi=re((ur,Li)=>{Li.exports={name:"escodegen",description:"ECMAScript code generator",homepage:"http://github.com/estools/escodegen",main:"escodegen.js",bin:{esgenerate:"./bin/esgenerate.js",escodegen:"./bin/escodegen.js"},files:["LICENSE.BSD","README.md","bin","escodegen.js","package.json"],version:"2.1.0",engines:{node:">=6.0"},maintainers:[{name:"Yusuke Suzuki",email:"utatane.tea@gmail.com",web:"http://github.com/Constellation"}],repository:{type:"git",url:"http://github.com/estools/escodegen.git"},dependencies:{estraverse:"^5.2.0",esutils:"^2.0.2",esprima:"^4.0.1"},optionalDependencies:{"source-map":"~0.6.1"},devDependencies:{acorn:"^8.0.4",bluebird:"^3.4.7","bower-registry-client":"^1.0.0",chai:"^4.2.0","chai-exclude":"^2.0.2","commonjs-everywhere":"^0.9.7",gulp:"^4.0.2","gulp-eslint":"^6.0.0","gulp-mocha":"^7.0.2",minimist:"^1.2.5",optionator:"^0.9.1",semver:"^7.3.4"},license:"BSD-2-Clause",scripts:{test:"gulp travis","unit-test":"gulp test",lint:"gulp lint",release:"node tools/release.js","build-min":"./node_modules/.bin/cjsify -ma path: tools/entry-point.js > escodegen.browser.min.js",build:"./node_modules/.bin/cjsify -a path: tools/entry-point.js > escodegen.browser.js"}}});var ci=re(ye=>{(function(){"use strict";var m,i,f,a,d,D,l,g,F,v,p,E,s,e,t,u,n,C,x,k,y,B,M,T,P,X;d=Nt(),D=Xt(),m=d.Syntax;function j(r){return te.Expression.hasOwnProperty(r.type)}function U(r){return te.Statement.hasOwnProperty(r.type)}i={Sequence:0,Yield:1,Assignment:1,Conditional:2,ArrowFunction:2,Coalesce:3,LogicalOR:4,LogicalAND:5,BitwiseOR:6,BitwiseXOR:7,BitwiseAND:8,Equality:9,Relational:10,BitwiseSHIFT:11,Additive:12,Multiplicative:13,Exponentiation:14,Await:15,Unary:15,Postfix:16,OptionalChaining:17,Call:18,New:19,TaggedTemplate:20,Member:21,Primary:22},f={"??":i.Coalesce,"||":i.LogicalOR,"&&":i.LogicalAND,"|":i.BitwiseOR,"^":i.BitwiseXOR,"&":i.BitwiseAND,"==":i.Equality,"!=":i.Equality,"===":i.Equality,"!==":i.Equality,is:i.Equality,isnt:i.Equality,"<":i.Relational,">":i.Relational,"<=":i.Relational,">=":i.Relational,in:i.Relational,instanceof:i.Relational,"<<":i.BitwiseSHIFT,">>":i.BitwiseSHIFT,">>>":i.BitwiseSHIFT,"+":i.Additive,"-":i.Additive,"*":i.Multiplicative,"%":i.Multiplicative,"/":i.Multiplicative,"**":i.Exponentiation};var L=1,W=2,$=4,Z=8,H=16,K=32,De=64,me=W|$,Se=L|W,O=L|W|$,xe=L,Ie=$,Ee=L|$,Y=L,fe=L|K,Me=0,it=L|H,rt=L|Z;function qe(){return{indent:null,base:null,parse:null,comment:!1,format:{indent:{style:"    ",base:0,adjustMultilineComment:!1},newline:`
`,space:" ",json:!1,renumber:!1,hexadecimal:!1,quotes:"single",escapeless:!1,compact:!1,parentheses:!0,semicolons:!0,safeConcatenation:!1,preserveBlankLines:!1},moz:{comprehensionExpressionStartsWithAssignment:!1,starlessGenerator:!1},sourceMap:null,sourceMapRoot:null,sourceMapWithCode:!1,directive:!1,raw:!0,verbatim:null,sourceCode:null}}function ge(r,h){var o="";for(h|=0;h>0;h>>>=1,r+=r)h&1&&(o+=r);return o}function ut(r){return/[\r\n]/g.test(r)}function ne(r){var h=r.length;return h&&D.code.isLineTerminator(r.charCodeAt(h-1))}function We(r,h){var o;for(o in h)h.hasOwnProperty(o)&&(r[o]=h[o]);return r}function Ne(r,h){var o,c;function A(b){return typeof b=="object"&&b instanceof Object&&!(b instanceof RegExp)}for(o in h)h.hasOwnProperty(o)&&(c=h[o],A(c)?A(r[o])?Ne(r[o],c):r[o]=Ne({},c):r[o]=c);return r}function nt(r){var h,o,c,A,b;if(r!==r)throw new Error("Numeric literal whose value is NaN");if(r<0||r===0&&1/r<0)throw new Error("Numeric literal whose value is negative");if(r===1/0)return F?"null":v?"1e400":"1e+400";if(h=""+r,!v||h.length<3)return h;for(o=h.indexOf("."),!F&&h.charCodeAt(0)===48&&o===1&&(o=0,h=h.slice(1)),c=h,h=h.replace("e+","e"),A=0,(b=c.indexOf("e"))>0&&(A=+c.slice(b+1),c=c.slice(0,b)),o>=0&&(A-=c.length-o-1,c=+(c.slice(0,o)+c.slice(o+1))+""),b=0;c.charCodeAt(c.length+b-1)===48;)--b;return b!==0&&(A-=b,c=c.slice(0,b)),A!==0&&(c+="e"+A),(c.length<h.length||p&&r>1e12&&Math.floor(r)===r&&(c="0x"+r.toString(16)).length<h.length)&&+c===r&&(h=c),h}function Ke(r,h){return(r&-2)===8232?(h?"u":"\\u")+(r===8232?"2028":"2029"):r===10||r===13?(h?"":"\\")+(r===10?"n":"r"):String.fromCharCode(r)}function st(r){var h,o,c,A,b,I,N,R;if(o=r.toString(),r.source){if(h=o.match(/\/([^/]*)$/),!h)return o;for(c=h[1],o="",N=!1,R=!1,A=0,b=r.source.length;A<b;++A)I=r.source.charCodeAt(A),R?(o+=Ke(I,R),R=!1):(N?I===93&&(N=!1):I===47?o+="\\":I===91&&(N=!0),o+=Ke(I,R),R=I===92);return"/"+o+"/"+c}return o}function at(r,h){var o;return r===8?"\\b":r===12?"\\f":r===9?"\\t":(o=r.toString(16).toUpperCase(),F||r>255?"\\u"+"0000".slice(o.length)+o:r===0&&!D.code.isDecimalDigit(h)?"\\0":r===11?"\\x0B":"\\x"+"00".slice(o.length)+o)}function ot(r){if(r===92)return"\\\\";if(r===10)return"\\n";if(r===13)return"\\r";if(r===8232)return"\\u2028";if(r===8233)return"\\u2029";throw new Error("Incorrectly classified character")}function lt(r){var h,o,c,A;for(A=E==="double"?'"':"'",h=0,o=r.length;h<o;++h)if(c=r.charCodeAt(h),c===39){A='"';break}else if(c===34){A="'";break}else c===92&&++h;return A+r+A}function ht(r){var h="",o,c,A,b=0,I=0,N,R;for(o=0,c=r.length;o<c;++o){if(A=r.charCodeAt(o),A===39)++b;else if(A===34)++I;else if(A===47&&F)h+="\\";else if(D.code.isLineTerminator(A)||A===92){h+=ot(A);continue}else if(!D.code.isIdentifierPartES5(A)&&(F&&A<32||!F&&!s&&(A<32||A>126))){h+=at(A,r.charCodeAt(o+1));continue}h+=String.fromCharCode(A)}if(N=!(E==="double"||E==="auto"&&I<b),R=N?"'":'"',!(N?b:I))return R+h+R;for(r=h,h=R,o=0,c=r.length;o<c;++o)A=r.charCodeAt(o),(A===39&&N||A===34&&!N)&&(h+="\\"),h+=String.fromCharCode(A);return h+R}function Ge(r){var h,o,c,A="";for(h=0,o=r.length;h<o;++h)c=r[h],A+=Array.isArray(c)?Ge(c):c;return A}function V(r,h){if(!B)return Array.isArray(r)?Ge(r):r;if(h==null){if(r instanceof a)return r;h={}}return h.loc==null?new a(null,null,B,r,h.name||null):new a(h.loc.start.line,h.loc.start.column,B===!0?h.loc.source||null:B,r,h.name||null)}function se(){return t||" "}function J(r,h){var o,c,A,b;return o=V(r).toString(),o.length===0?[h]:(c=V(h).toString(),c.length===0?[r]:(A=o.charCodeAt(o.length-1),b=c.charCodeAt(0),(A===43||A===45)&&A===b||D.code.isIdentifierPartES5(A)&&D.code.isIdentifierPartES5(b)||A===47&&b===105?[r,se(),h]:D.code.isWhiteSpace(A)||D.code.isLineTerminator(A)||D.code.isWhiteSpace(b)||D.code.isLineTerminator(b)?[r,h]:[r,t,h]))}function oe(r){return[l,r]}function ee(r){var h;h=l,l+=g,r(l),l=h}function ct(r){var h;for(h=r.length-1;h>=0&&!D.code.isLineTerminator(r.charCodeAt(h));--h);return r.length-1-h}function Dt(r,h){var o,c,A,b,I,N,R,G;for(o=r.split(/\r\n|[\r\n]/),N=Number.MAX_VALUE,c=1,A=o.length;c<A;++c){for(b=o[c],I=0;I<b.length&&D.code.isWhiteSpace(b.charCodeAt(I));)++I;N>I&&(N=I)}for(typeof h<"u"?(R=l,o[1][N]==="*"&&(h+=" "),l=h):(N&1&&--N,R=l),c=1,A=o.length;c<A;++c)G=V(oe(o[c].slice(N))),o[c]=B?G.join(""):G;return l=R,o.join(`
`)}function Ce(r,h){if(r.type==="Line"){if(ne(r.value))return"//"+r.value;var o="//"+r.value;return T||(o+=`
`),o}return k.format.indent.adjustMultilineComment&&/[\n\r]/.test(r.value)?Dt("/*"+r.value+"*/",h):"/*"+r.value+"*/"}function Ve(r,h){var o,c,A,b,I,N,R,G,ae,be,_e,kt,Tt,Fe;if(r.leadingComments&&r.leadingComments.length>0){if(b=h,T){for(A=r.leadingComments[0],h=[],G=A.extendedRange,ae=A.range,_e=M.substring(G[0],ae[0]),Fe=(_e.match(/\n/g)||[]).length,Fe>0?(h.push(ge(`
`,Fe)),h.push(oe(Ce(A)))):(h.push(_e),h.push(Ce(A))),be=ae,o=1,c=r.leadingComments.length;o<c;o++)A=r.leadingComments[o],ae=A.range,kt=M.substring(be[1],ae[0]),Fe=(kt.match(/\n/g)||[]).length,h.push(ge(`
`,Fe)),h.push(oe(Ce(A))),be=ae;Tt=M.substring(ae[1],G[1]),Fe=(Tt.match(/\n/g)||[]).length,h.push(ge(`
`,Fe))}else for(A=r.leadingComments[0],h=[],C&&r.type===m.Program&&r.body.length===0&&h.push(`
`),h.push(Ce(A)),ne(V(h).toString())||h.push(`
`),o=1,c=r.leadingComments.length;o<c;++o)A=r.leadingComments[o],R=[Ce(A)],ne(V(R).toString())||R.push(`
`),h.push(oe(R));h.push(oe(b))}if(r.trailingComments)if(T)A=r.trailingComments[0],G=A.extendedRange,ae=A.range,_e=M.substring(G[0],ae[0]),Fe=(_e.match(/\n/g)||[]).length,Fe>0?(h.push(ge(`
`,Fe)),h.push(oe(Ce(A)))):(h.push(_e),h.push(Ce(A)));else for(I=!ne(V(h).toString()),N=ge(" ",ct(V([l,h,g]).toString())),o=0,c=r.trailingComments.length;o<c;++o)A=r.trailingComments[o],I?(o===0?h=[h,g]:h=[h,N],h.push(Ce(A,N))):h=[h,oe(Ce(A))],o!==c-1&&!ne(V(h).toString())&&(h=[h,`
`]);return h}function Be(r,h,o){var c,A=0;for(c=r;c<h;c++)M[c]===`
`&&A++;for(c=1;c<A;c++)o.push(e)}function ie(r,h,o){return h<o?["(",r,")"]:r}function He(r){var h,o,c;for(c=r.split(/\r\n|\n/),h=1,o=c.length;h<o;h++)c[h]=e+l+c[h];return c}function pt(r,h){var o,c,A;return o=r[k.verbatim],typeof o=="string"?c=ie(He(o),i.Sequence,h):(c=He(o.content),A=o.precedence!=null?o.precedence:i.Sequence,c=ie(c,A,h)),V(c,r)}function te(){}te.prototype.maybeBlock=function(r,h){var o,c,A=this;return c=!k.comment||!r.leadingComments,r.type===m.BlockStatement&&c?[t,this.generateStatement(r,h)]:r.type===m.EmptyStatement&&c?";":(ee(function(){o=[e,oe(A.generateStatement(r,h))]}),o)},te.prototype.maybeBlockSuffix=function(r,h){var o=ne(V(h).toString());return r.type===m.BlockStatement&&(!k.comment||!r.leadingComments)&&!o?[h,t]:o?[h,l]:[h,e,l]};function ce(r){return V(r.name,r)}function we(r,h){return r.async?"async"+(h?se():t):""}function S(r){var h=r.generator&&!k.moz.starlessGenerator;return h?"*"+t:""}function w(r){var h=r.value,o="";return h.async&&(o+=we(h,!r.computed)),h.generator&&(o+=S(h)?"*":""),o}te.prototype.generatePattern=function(r,h,o){return r.type===m.Identifier?ce(r):this.generateExpression(r,h,o)},te.prototype.generateFunctionParams=function(r){var h,o,c,A;if(A=!1,r.type===m.ArrowFunctionExpression&&!r.rest&&(!r.defaults||r.defaults.length===0)&&r.params.length===1&&r.params[0].type===m.Identifier)c=[we(r,!0),ce(r.params[0])];else{for(c=r.type===m.ArrowFunctionExpression?[we(r,!1)]:[],c.push("("),r.defaults&&(A=!0),h=0,o=r.params.length;h<o;++h)A&&r.defaults[h]?c.push(this.generateAssignment(r.params[h],r.defaults[h],"=",i.Assignment,O)):c.push(this.generatePattern(r.params[h],i.Assignment,O)),h+1<o&&c.push(","+t);r.rest&&(r.params.length&&c.push(","+t),c.push("..."),c.push(ce(r.rest))),c.push(")")}return c},te.prototype.generateFunctionBody=function(r){var h,o;return h=this.generateFunctionParams(r),r.type===m.ArrowFunctionExpression&&(h.push(t),h.push("=>")),r.expression?(h.push(t),o=this.generateExpression(r.body,i.Assignment,O),o.toString().charAt(0)==="{"&&(o=["(",o,")"]),h.push(o)):h.push(this.maybeBlock(r.body,rt)),h},te.prototype.generateIterationForStatement=function(r,h,o){var c=["for"+(h.await?se()+"await":"")+t+"("],A=this;return ee(function(){h.left.type===m.VariableDeclaration?ee(function(){c.push(h.left.kind+se()),c.push(A.generateStatement(h.left.declarations[0],Me))}):c.push(A.generateExpression(h.left,i.Call,O)),c=J(c,r),c=[J(c,A.generateExpression(h.right,i.Assignment,O)),")"]}),c.push(this.maybeBlock(h.body,o)),c},te.prototype.generatePropertyKey=function(r,h){var o=[];return h&&o.push("["),o.push(this.generateExpression(r,i.Assignment,O)),h&&o.push("]"),o},te.prototype.generateAssignment=function(r,h,o,c,A){return i.Assignment<c&&(A|=L),ie([this.generateExpression(r,i.Call,A),t+o+t,this.generateExpression(h,i.Assignment,A)],i.Assignment,c)},te.prototype.semicolon=function(r){return!n&&r&K?"":";"},te.Statement={BlockStatement:function(r,h){var o,c,A=["{",e],b=this;return ee(function(){r.body.length===0&&T&&(o=r.range,o[1]-o[0]>2&&(c=M.substring(o[0]+1,o[1]-1),c[0]===`
`&&(A=["{"]),A.push(c)));var I,N,R,G;for(G=Y,h&Z&&(G|=H),I=0,N=r.body.length;I<N;++I)T&&(I===0&&(r.body[0].leadingComments&&(o=r.body[0].leadingComments[0].extendedRange,c=M.substring(o[0],o[1]),c[0]===`
`&&(A=["{"])),r.body[0].leadingComments||Be(r.range[0],r.body[0].range[0],A)),I>0&&!r.body[I-1].trailingComments&&!r.body[I].leadingComments&&Be(r.body[I-1].range[1],r.body[I].range[0],A)),I===N-1&&(G|=K),r.body[I].leadingComments&&T?R=b.generateStatement(r.body[I],G):R=oe(b.generateStatement(r.body[I],G)),A.push(R),ne(V(R).toString())||T&&I<N-1&&r.body[I+1].leadingComments||A.push(e),T&&I===N-1&&(r.body[I].trailingComments||Be(r.body[I].range[1],r.range[1],A))}),A.push(oe("}")),A},BreakStatement:function(r,h){return r.label?"break "+r.label.name+this.semicolon(h):"break"+this.semicolon(h)},ContinueStatement:function(r,h){return r.label?"continue "+r.label.name+this.semicolon(h):"continue"+this.semicolon(h)},ClassBody:function(r,h){var o=["{",e],c=this;return ee(function(A){var b,I;for(b=0,I=r.body.length;b<I;++b)o.push(A),o.push(c.generateExpression(r.body[b],i.Sequence,O)),b+1<I&&o.push(e)}),ne(V(o).toString())||o.push(e),o.push(l),o.push("}"),o},ClassDeclaration:function(r,h){var o,c;return o=["class"],r.id&&(o=J(o,this.generateExpression(r.id,i.Sequence,O))),r.superClass&&(c=J("extends",this.generateExpression(r.superClass,i.Unary,O)),o=J(o,c)),o.push(t),o.push(this.generateStatement(r.body,fe)),o},DirectiveStatement:function(r,h){return k.raw&&r.raw?r.raw+this.semicolon(h):lt(r.directive)+this.semicolon(h)},DoWhileStatement:function(r,h){var o=J("do",this.maybeBlock(r.body,Y));return o=this.maybeBlockSuffix(r.body,o),J(o,["while"+t+"(",this.generateExpression(r.test,i.Sequence,O),")"+this.semicolon(h)])},CatchClause:function(r,h){var o,c=this;return ee(function(){var A;r.param?(o=["catch"+t+"(",c.generateExpression(r.param,i.Sequence,O),")"],r.guard&&(A=c.generateExpression(r.guard,i.Sequence,O),o.splice(2,0," if ",A))):o=["catch"]}),o.push(this.maybeBlock(r.body,Y)),o},DebuggerStatement:function(r,h){return"debugger"+this.semicolon(h)},EmptyStatement:function(r,h){return";"},ExportDefaultDeclaration:function(r,h){var o=["export"],c;return c=h&K?fe:Y,o=J(o,"default"),U(r.declaration)?o=J(o,this.generateStatement(r.declaration,c)):o=J(o,this.generateExpression(r.declaration,i.Assignment,O)+this.semicolon(h)),o},ExportNamedDeclaration:function(r,h){var o=["export"],c,A=this;return c=h&K?fe:Y,r.declaration?J(o,this.generateStatement(r.declaration,c)):(r.specifiers&&(r.specifiers.length===0?o=J(o,"{"+t+"}"):r.specifiers[0].type===m.ExportBatchSpecifier?o=J(o,this.generateExpression(r.specifiers[0],i.Sequence,O)):(o=J(o,"{"),ee(function(b){var I,N;for(o.push(e),I=0,N=r.specifiers.length;I<N;++I)o.push(b),o.push(A.generateExpression(r.specifiers[I],i.Sequence,O)),I+1<N&&o.push(","+e)}),ne(V(o).toString())||o.push(e),o.push(l+"}")),r.source?o=J(o,["from"+t,this.generateExpression(r.source,i.Sequence,O),this.semicolon(h)]):o.push(this.semicolon(h))),o)},ExportAllDeclaration:function(r,h){return["export"+t,"*"+t,"from"+t,this.generateExpression(r.source,i.Sequence,O),this.semicolon(h)]},ExpressionStatement:function(r,h){var o,c;function A(N){var R;return N.slice(0,5)!=="class"?!1:(R=N.charCodeAt(5),R===123||D.code.isWhiteSpace(R)||D.code.isLineTerminator(R))}function b(N){var R;return N.slice(0,8)!=="function"?!1:(R=N.charCodeAt(8),R===40||D.code.isWhiteSpace(R)||R===42||D.code.isLineTerminator(R))}function I(N){var R,G,ae;if(N.slice(0,5)!=="async"||!D.code.isWhiteSpace(N.charCodeAt(5)))return!1;for(G=6,ae=N.length;G<ae&&D.code.isWhiteSpace(N.charCodeAt(G));++G);return G===ae||N.slice(G,G+8)!=="function"?!1:(R=N.charCodeAt(G+8),R===40||D.code.isWhiteSpace(R)||R===42||D.code.isLineTerminator(R))}return o=[this.generateExpression(r.expression,i.Sequence,O)],c=V(o).toString(),c.charCodeAt(0)===123||A(c)||b(c)||I(c)||x&&h&H&&r.expression.type===m.Literal&&typeof r.expression.value=="string"?o=["(",o,")"+this.semicolon(h)]:o.push(this.semicolon(h)),o},ImportDeclaration:function(r,h){var o,c,A=this;return r.specifiers.length===0?["import",t,this.generateExpression(r.source,i.Sequence,O),this.semicolon(h)]:(o=["import"],c=0,r.specifiers[c].type===m.ImportDefaultSpecifier&&(o=J(o,[this.generateExpression(r.specifiers[c],i.Sequence,O)]),++c),r.specifiers[c]&&(c!==0&&o.push(","),r.specifiers[c].type===m.ImportNamespaceSpecifier?o=J(o,[t,this.generateExpression(r.specifiers[c],i.Sequence,O)]):(o.push(t+"{"),r.specifiers.length-c===1?(o.push(t),o.push(this.generateExpression(r.specifiers[c],i.Sequence,O)),o.push(t+"}"+t)):(ee(function(b){var I,N;for(o.push(e),I=c,N=r.specifiers.length;I<N;++I)o.push(b),o.push(A.generateExpression(r.specifiers[I],i.Sequence,O)),I+1<N&&o.push(","+e)}),ne(V(o).toString())||o.push(e),o.push(l+"}"+t)))),o=J(o,["from"+t,this.generateExpression(r.source,i.Sequence,O),this.semicolon(h)]),o)},VariableDeclarator:function(r,h){var o=h&L?O:me;return r.init?[this.generateExpression(r.id,i.Assignment,o),t,"=",t,this.generateExpression(r.init,i.Assignment,o)]:this.generatePattern(r.id,i.Assignment,o)},VariableDeclaration:function(r,h){var o,c,A,b,I,N=this;o=[r.kind],I=h&L?Y:Me;function R(){for(b=r.declarations[0],k.comment&&b.leadingComments?(o.push(`
`),o.push(oe(N.generateStatement(b,I)))):(o.push(se()),o.push(N.generateStatement(b,I))),c=1,A=r.declarations.length;c<A;++c)b=r.declarations[c],k.comment&&b.leadingComments?(o.push(","+e),o.push(oe(N.generateStatement(b,I)))):(o.push(","+t),o.push(N.generateStatement(b,I)))}return r.declarations.length>1?ee(R):R(),o.push(this.semicolon(h)),o},ThrowStatement:function(r,h){return[J("throw",this.generateExpression(r.argument,i.Sequence,O)),this.semicolon(h)]},TryStatement:function(r,h){var o,c,A,b;if(o=["try",this.maybeBlock(r.block,Y)],o=this.maybeBlockSuffix(r.block,o),r.handlers)for(c=0,A=r.handlers.length;c<A;++c)o=J(o,this.generateStatement(r.handlers[c],Y)),(r.finalizer||c+1!==A)&&(o=this.maybeBlockSuffix(r.handlers[c].body,o));else{for(b=r.guardedHandlers||[],c=0,A=b.length;c<A;++c)o=J(o,this.generateStatement(b[c],Y)),(r.finalizer||c+1!==A)&&(o=this.maybeBlockSuffix(b[c].body,o));if(r.handler)if(Array.isArray(r.handler))for(c=0,A=r.handler.length;c<A;++c)o=J(o,this.generateStatement(r.handler[c],Y)),(r.finalizer||c+1!==A)&&(o=this.maybeBlockSuffix(r.handler[c].body,o));else o=J(o,this.generateStatement(r.handler,Y)),r.finalizer&&(o=this.maybeBlockSuffix(r.handler.body,o))}return r.finalizer&&(o=J(o,["finally",this.maybeBlock(r.finalizer,Y)])),o},SwitchStatement:function(r,h){var o,c,A,b,I,N=this;if(ee(function(){o=["switch"+t+"(",N.generateExpression(r.discriminant,i.Sequence,O),")"+t+"{"+e]}),r.cases)for(I=Y,A=0,b=r.cases.length;A<b;++A)A===b-1&&(I|=K),c=oe(this.generateStatement(r.cases[A],I)),o.push(c),ne(V(c).toString())||o.push(e);return o.push(oe("}")),o},SwitchCase:function(r,h){var o,c,A,b,I,N=this;return ee(function(){for(r.test?o=[J("case",N.generateExpression(r.test,i.Sequence,O)),":"]:o=["default:"],A=0,b=r.consequent.length,b&&r.consequent[0].type===m.BlockStatement&&(c=N.maybeBlock(r.consequent[0],Y),o.push(c),A=1),A!==b&&!ne(V(o).toString())&&o.push(e),I=Y;A<b;++A)A===b-1&&h&K&&(I|=K),c=oe(N.generateStatement(r.consequent[A],I)),o.push(c),A+1!==b&&!ne(V(c).toString())&&o.push(e)}),o},IfStatement:function(r,h){var o,c,A,b=this;return ee(function(){o=["if"+t+"(",b.generateExpression(r.test,i.Sequence,O),")"]}),A=h&K,c=Y,A&&(c|=K),r.alternate?(o.push(this.maybeBlock(r.consequent,Y)),o=this.maybeBlockSuffix(r.consequent,o),r.alternate.type===m.IfStatement?o=J(o,["else ",this.generateStatement(r.alternate,c)]):o=J(o,J("else",this.maybeBlock(r.alternate,c)))):o.push(this.maybeBlock(r.consequent,c)),o},ForStatement:function(r,h){var o,c=this;return ee(function(){o=["for"+t+"("],r.init?r.init.type===m.VariableDeclaration?o.push(c.generateStatement(r.init,Me)):(o.push(c.generateExpression(r.init,i.Sequence,me)),o.push(";")):o.push(";"),r.test&&(o.push(t),o.push(c.generateExpression(r.test,i.Sequence,O))),o.push(";"),r.update&&(o.push(t),o.push(c.generateExpression(r.update,i.Sequence,O))),o.push(")")}),o.push(this.maybeBlock(r.body,h&K?fe:Y)),o},ForInStatement:function(r,h){return this.generateIterationForStatement("in",r,h&K?fe:Y)},ForOfStatement:function(r,h){return this.generateIterationForStatement("of",r,h&K?fe:Y)},LabeledStatement:function(r,h){return[r.label.name+":",this.maybeBlock(r.body,h&K?fe:Y)]},Program:function(r,h){var o,c,A,b,I;for(b=r.body.length,o=[C&&b>0?`
`:""],I=it,A=0;A<b;++A)!C&&A===b-1&&(I|=K),T&&(A===0&&(r.body[0].leadingComments||Be(r.range[0],r.body[A].range[0],o)),A>0&&!r.body[A-1].trailingComments&&!r.body[A].leadingComments&&Be(r.body[A-1].range[1],r.body[A].range[0],o)),c=oe(this.generateStatement(r.body[A],I)),o.push(c),A+1<b&&!ne(V(c).toString())&&(T&&r.body[A+1].leadingComments||o.push(e)),T&&A===b-1&&(r.body[A].trailingComments||Be(r.body[A].range[1],r.range[1],o));return o},FunctionDeclaration:function(r,h){return[we(r,!0),"function",S(r)||se(),r.id?ce(r.id):"",this.generateFunctionBody(r)]},ReturnStatement:function(r,h){return r.argument?[J("return",this.generateExpression(r.argument,i.Sequence,O)),this.semicolon(h)]:["return"+this.semicolon(h)]},WhileStatement:function(r,h){var o,c=this;return ee(function(){o=["while"+t+"(",c.generateExpression(r.test,i.Sequence,O),")"]}),o.push(this.maybeBlock(r.body,h&K?fe:Y)),o},WithStatement:function(r,h){var o,c=this;return ee(function(){o=["with"+t+"(",c.generateExpression(r.object,i.Sequence,O),")"]}),o.push(this.maybeBlock(r.body,h&K?fe:Y)),o}},We(te.prototype,te.Statement),te.Expression={SequenceExpression:function(r,h,o){var c,A,b;for(i.Sequence<h&&(o|=L),c=[],A=0,b=r.expressions.length;A<b;++A)c.push(this.generateExpression(r.expressions[A],i.Assignment,o)),A+1<b&&c.push(","+t);return ie(c,i.Sequence,h)},AssignmentExpression:function(r,h,o){return this.generateAssignment(r.left,r.right,r.operator,h,o)},ArrowFunctionExpression:function(r,h,o){return ie(this.generateFunctionBody(r),i.ArrowFunction,h)},ConditionalExpression:function(r,h,o){return i.Conditional<h&&(o|=L),ie([this.generateExpression(r.test,i.Coalesce,o),t+"?"+t,this.generateExpression(r.consequent,i.Assignment,o),t+":"+t,this.generateExpression(r.alternate,i.Assignment,o)],i.Conditional,h)},LogicalExpression:function(r,h,o){return r.operator==="??"&&(o|=De),this.BinaryExpression(r,h,o)},BinaryExpression:function(r,h,o){var c,A,b,I,N,R;return I=f[r.operator],A=r.operator==="**"?i.Postfix:I,b=r.operator==="**"?I:I+1,I<h&&(o|=L),N=this.generateExpression(r.left,A,o),R=N.toString(),R.charCodeAt(R.length-1)===47&&D.code.isIdentifierPartES5(r.operator.charCodeAt(0))?c=[N,se(),r.operator]:c=J(N,r.operator),N=this.generateExpression(r.right,b,o),r.operator==="/"&&N.toString().charAt(0)==="/"||r.operator.slice(-1)==="<"&&N.toString().slice(0,3)==="!--"?(c.push(se()),c.push(N)):c=J(c,N),r.operator==="in"&&!(o&L)?["(",c,")"]:(r.operator==="||"||r.operator==="&&")&&o&De?["(",c,")"]:ie(c,I,h)},CallExpression:function(r,h,o){var c,A,b;for(c=[this.generateExpression(r.callee,i.Call,Se)],r.optional&&c.push("?."),c.push("("),A=0,b=r.arguments.length;A<b;++A)c.push(this.generateExpression(r.arguments[A],i.Assignment,O)),A+1<b&&c.push(","+t);return c.push(")"),o&W?ie(c,i.Call,h):["(",c,")"]},ChainExpression:function(r,h,o){i.OptionalChaining<h&&(o|=W);var c=this.generateExpression(r.expression,i.OptionalChaining,o);return ie(c,i.OptionalChaining,h)},NewExpression:function(r,h,o){var c,A,b,I,N;if(A=r.arguments.length,N=o&$&&!u&&A===0?Ee:xe,c=J("new",this.generateExpression(r.callee,i.New,N)),!(o&$)||u||A>0){for(c.push("("),b=0,I=A;b<I;++b)c.push(this.generateExpression(r.arguments[b],i.Assignment,O)),b+1<I&&c.push(","+t);c.push(")")}return ie(c,i.New,h)},MemberExpression:function(r,h,o){var c,A;return c=[this.generateExpression(r.object,i.Call,o&W?Se:xe)],r.computed?(r.optional&&c.push("?."),c.push("["),c.push(this.generateExpression(r.property,i.Sequence,o&W?O:Ee)),c.push("]")):(!r.optional&&r.object.type===m.Literal&&typeof r.object.value=="number"&&(A=V(c).toString(),A.indexOf(".")<0&&!/[eExX]/.test(A)&&D.code.isDecimalDigit(A.charCodeAt(A.length-1))&&!(A.length>=2&&A.charCodeAt(0)===48)&&c.push(" ")),c.push(r.optional?"?.":"."),c.push(ce(r.property))),ie(c,i.Member,h)},MetaProperty:function(r,h,o){var c;return c=[],c.push(typeof r.meta=="string"?r.meta:ce(r.meta)),c.push("."),c.push(typeof r.property=="string"?r.property:ce(r.property)),ie(c,i.Member,h)},UnaryExpression:function(r,h,o){var c,A,b,I,N;return A=this.generateExpression(r.argument,i.Unary,O),t===""?c=J(r.operator,A):(c=[r.operator],r.operator.length>2?c=J(c,A):(I=V(c).toString(),N=I.charCodeAt(I.length-1),b=A.toString().charCodeAt(0),((N===43||N===45)&&N===b||D.code.isIdentifierPartES5(N)&&D.code.isIdentifierPartES5(b))&&c.push(se()),c.push(A))),ie(c,i.Unary,h)},YieldExpression:function(r,h,o){var c;return r.delegate?c="yield*":c="yield",r.argument&&(c=J(c,this.generateExpression(r.argument,i.Yield,O))),ie(c,i.Yield,h)},AwaitExpression:function(r,h,o){var c=J(r.all?"await*":"await",this.generateExpression(r.argument,i.Await,O));return ie(c,i.Await,h)},UpdateExpression:function(r,h,o){return r.prefix?ie([r.operator,this.generateExpression(r.argument,i.Unary,O)],i.Unary,h):ie([this.generateExpression(r.argument,i.Postfix,O),r.operator],i.Postfix,h)},FunctionExpression:function(r,h,o){var c=[we(r,!0),"function"];return r.id?(c.push(S(r)||se()),c.push(ce(r.id))):c.push(S(r)||t),c.push(this.generateFunctionBody(r)),c},ArrayPattern:function(r,h,o){return this.ArrayExpression(r,h,o,!0)},ArrayExpression:function(r,h,o,c){var A,b,I=this;return r.elements.length?(b=c?!1:r.elements.length>1,A=["[",b?e:""],ee(function(N){var R,G;for(R=0,G=r.elements.length;R<G;++R)r.elements[R]?(A.push(b?N:""),A.push(I.generateExpression(r.elements[R],i.Assignment,O))):(b&&A.push(N),R+1===G&&A.push(",")),R+1<G&&A.push(","+(b?e:t))}),b&&!ne(V(A).toString())&&A.push(e),A.push(b?l:""),A.push("]"),A):"[]"},RestElement:function(r,h,o){return"..."+this.generatePattern(r.argument)},ClassExpression:function(r,h,o){var c,A;return c=["class"],r.id&&(c=J(c,this.generateExpression(r.id,i.Sequence,O))),r.superClass&&(A=J("extends",this.generateExpression(r.superClass,i.Unary,O)),c=J(c,A)),c.push(t),c.push(this.generateStatement(r.body,fe)),c},MethodDefinition:function(r,h,o){var c,A;return r.static?c=["static"+t]:c=[],r.kind==="get"||r.kind==="set"?A=[J(r.kind,this.generatePropertyKey(r.key,r.computed)),this.generateFunctionBody(r.value)]:A=[w(r),this.generatePropertyKey(r.key,r.computed),this.generateFunctionBody(r.value)],J(c,A)},Property:function(r,h,o){return r.kind==="get"||r.kind==="set"?[r.kind,se(),this.generatePropertyKey(r.key,r.computed),this.generateFunctionBody(r.value)]:r.shorthand?r.value.type==="AssignmentPattern"?this.AssignmentPattern(r.value,i.Sequence,O):this.generatePropertyKey(r.key,r.computed):r.method?[w(r),this.generatePropertyKey(r.key,r.computed),this.generateFunctionBody(r.value)]:[this.generatePropertyKey(r.key,r.computed),":"+t,this.generateExpression(r.value,i.Assignment,O)]},ObjectExpression:function(r,h,o){var c,A,b,I=this;return r.properties.length?(c=r.properties.length>1,ee(function(){b=I.generateExpression(r.properties[0],i.Sequence,O)}),!c&&!ut(V(b).toString())?["{",t,b,t,"}"]:(ee(function(N){var R,G;if(A=["{",e,N,b],c)for(A.push(","+e),R=1,G=r.properties.length;R<G;++R)A.push(N),A.push(I.generateExpression(r.properties[R],i.Sequence,O)),R+1<G&&A.push(","+e)}),ne(V(A).toString())||A.push(e),A.push(l),A.push("}"),A)):"{}"},AssignmentPattern:function(r,h,o){return this.generateAssignment(r.left,r.right,"=",h,o)},ObjectPattern:function(r,h,o){var c,A,b,I,N,R=this;if(!r.properties.length)return"{}";if(I=!1,r.properties.length===1)N=r.properties[0],N.type===m.Property&&N.value.type!==m.Identifier&&(I=!0);else for(A=0,b=r.properties.length;A<b;++A)if(N=r.properties[A],N.type===m.Property&&!N.shorthand){I=!0;break}return c=["{",I?e:""],ee(function(G){var ae,be;for(ae=0,be=r.properties.length;ae<be;++ae)c.push(I?G:""),c.push(R.generateExpression(r.properties[ae],i.Sequence,O)),ae+1<be&&c.push(","+(I?e:t))}),I&&!ne(V(c).toString())&&c.push(e),c.push(I?l:""),c.push("}"),c},ThisExpression:function(r,h,o){return"this"},Super:function(r,h,o){return"super"},Identifier:function(r,h,o){return ce(r)},ImportDefaultSpecifier:function(r,h,o){return ce(r.id||r.local)},ImportNamespaceSpecifier:function(r,h,o){var c=["*"],A=r.id||r.local;return A&&c.push(t+"as"+se()+ce(A)),c},ImportSpecifier:function(r,h,o){var c=r.imported,A=[c.name],b=r.local;return b&&b.name!==c.name&&A.push(se()+"as"+se()+ce(b)),A},ExportSpecifier:function(r,h,o){var c=r.local,A=[c.name],b=r.exported;return b&&b.name!==c.name&&A.push(se()+"as"+se()+ce(b)),A},Literal:function(r,h,o){var c;if(r.hasOwnProperty("raw")&&y&&k.raw)try{if(c=y(r.raw).body[0].expression,c.type===m.Literal&&c.value===r.value)return r.raw}catch{}return r.regex?"/"+r.regex.pattern+"/"+r.regex.flags:typeof r.value=="bigint"?r.value.toString()+"n":r.bigint?r.bigint+"n":r.value===null?"null":typeof r.value=="string"?ht(r.value):typeof r.value=="number"?nt(r.value):typeof r.value=="boolean"?r.value?"true":"false":st(r.value)},GeneratorExpression:function(r,h,o){return this.ComprehensionExpression(r,h,o)},ComprehensionExpression:function(r,h,o){var c,A,b,I,N=this;return c=r.type===m.GeneratorExpression?["("]:["["],k.moz.comprehensionExpressionStartsWithAssignment&&(I=this.generateExpression(r.body,i.Assignment,O),c.push(I)),r.blocks&&ee(function(){for(A=0,b=r.blocks.length;A<b;++A)I=N.generateExpression(r.blocks[A],i.Sequence,O),A>0||k.moz.comprehensionExpressionStartsWithAssignment?c=J(c,I):c.push(I)}),r.filter&&(c=J(c,"if"+t),I=this.generateExpression(r.filter,i.Sequence,O),c=J(c,["(",I,")"])),k.moz.comprehensionExpressionStartsWithAssignment||(I=this.generateExpression(r.body,i.Assignment,O),c=J(c,I)),c.push(r.type===m.GeneratorExpression?")":"]"),c},ComprehensionBlock:function(r,h,o){var c;return r.left.type===m.VariableDeclaration?c=[r.left.kind,se(),this.generateStatement(r.left.declarations[0],Me)]:c=this.generateExpression(r.left,i.Call,O),c=J(c,r.of?"of":"in"),c=J(c,this.generateExpression(r.right,i.Sequence,O)),["for"+t+"(",c,")"]},SpreadElement:function(r,h,o){return["...",this.generateExpression(r.argument,i.Assignment,O)]},TaggedTemplateExpression:function(r,h,o){var c=Se;o&W||(c=xe);var A=[this.generateExpression(r.tag,i.Call,c),this.generateExpression(r.quasi,i.Primary,Ie)];return ie(A,i.TaggedTemplate,h)},TemplateElement:function(r,h,o){return r.value.raw},TemplateLiteral:function(r,h,o){var c,A,b;for(c=["`"],A=0,b=r.quasis.length;A<b;++A)c.push(this.generateExpression(r.quasis[A],i.Primary,O)),A+1<b&&(c.push("${"+t),c.push(this.generateExpression(r.expressions[A],i.Sequence,O)),c.push(t+"}"));return c.push("`"),c},ModuleSpecifier:function(r,h,o){return this.Literal(r,h,o)},ImportExpression:function(r,h,o){return ie(["import(",this.generateExpression(r.source,i.Assignment,O),")"],i.Call,h)}},We(te.prototype,te.Expression),te.prototype.generateExpression=function(r,h,o){var c,A;return A=r.type||m.Property,k.verbatim&&r.hasOwnProperty(k.verbatim)?pt(r,h):(c=this[A](r,h,o),k.comment&&(c=Ve(r,c)),V(c,r))},te.prototype.generateStatement=function(r,h){var o,c;return o=this[r.type](r,h),k.comment&&(o=Ve(r,o)),c=V(o).toString(),r.type===m.Program&&!C&&e===""&&c.charAt(c.length-1)===`
`&&(o=B?V(o).replaceRight(/\s+$/,""):c.replace(/\s+$/,"")),V(o,r)};function _(r){var h;if(h=new te,U(r))return h.generateStatement(r,Y);if(j(r))return h.generateExpression(r,i.Sequence,O);throw new Error("Unknown node type: "+r.type)}function q(r,h){var o=qe(),c,A;return h!=null?(typeof h.indent=="string"&&(o.format.indent.style=h.indent),typeof h.base=="number"&&(o.format.indent.base=h.base),h=Ne(o,h),g=h.format.indent.style,typeof h.base=="string"?l=h.base:l=ge(g,h.format.indent.base)):(h=o,g=h.format.indent.style,l=ge(g,h.format.indent.base)),F=h.format.json,v=h.format.renumber,p=F?!1:h.format.hexadecimal,E=F?"double":h.format.quotes,s=h.format.escapeless,e=h.format.newline,t=h.format.space,h.format.compact&&(e=t=g=l=""),u=h.format.parentheses,n=h.format.semicolons,C=h.format.safeConcatenation,x=h.directive,y=F?null:h.parse,B=h.sourceMap,M=h.sourceCode,T=h.format.preserveBlankLines&&M!==null,k=h,B&&(ye.browser?a=global.sourceMap.SourceNode:a=li().SourceNode),c=_(r),B?(A=c.toStringWithSourceMap({file:h.file,sourceRoot:h.sourceMapRoot}),h.sourceContent&&A.map.setSourceContent(h.sourceMap,h.sourceContent),h.sourceMapWithCode?A:A.map.toString()):(A={code:c.toString(),map:null},h.sourceMapWithCode?A:A.code)}P={indent:{style:"",base:0},renumber:!0,hexadecimal:!0,quotes:"auto",escapeless:!0,compact:!0,parentheses:!1,semicolons:!1},X=qe().format,ye.version=hi().version,ye.generate=q,ye.attachComments=d.attachComments,ye.Precedence=Ne({},i),ye.browser=!1,ye.FORMAT_MINIFY=P,ye.FORMAT_DEFAULTS=X})()});var fi=re((sr,pi)=>{var Oi=ci().generate;pi.exports=function(m,i,f){f||(f={});var a=!f.allowAccessToMethodsOnFunctions;i||(i={});var d={},D=function l(g,F){if(g.type==="Literal")return g.value;if(g.type==="UnaryExpression"){var v=l(g.argument,F);return g.operator==="+"?+v:g.operator==="-"?-v:g.operator==="~"?~v:g.operator==="!"?!v:d}else if(g.type==="ArrayExpression"){for(var p=[],E=0,s=g.elements.length;E<s;E++){var e=l(g.elements[E],F);if(e===d)return d;p.push(e)}return p}else if(g.type==="ObjectExpression"){for(var t={},E=0;E<g.properties.length;E++){var u=g.properties[E],n=u.value===null?u.value:l(u.value,F);if(n===d)return d;t[u.key.value||u.key.name]=n}return t}else if(g.type==="BinaryExpression"||g.type==="LogicalExpression"){var C=g.operator;if(C==="&&"){var s=l(g.left);if(s===d)return d;if(!s)return s;var x=l(g.right);return x===d?d:x}else if(C==="||"){var s=l(g.left);if(s===d)return d;if(s)return s;var x=l(g.right);return x===d?d:x}var s=l(g.left,F);if(s===d)return d;var x=l(g.right,F);return x===d?d:C==="=="?s==x:C==="==="?s===x:C==="!="?s!=x:C==="!=="?s!==x:C==="+"?s+x:C==="-"?s-x:C==="*"?s*x:C==="/"?s/x:C==="%"?s%x:C==="<"?s<x:C==="<="?s<=x:C===">"?s>x:C===">="?s>=x:C==="|"?s|x:C==="&"?s&x:C==="^"?s^x:d}else{if(g.type==="Identifier")return{}.hasOwnProperty.call(i,g.name)?i[g.name]:d;if(g.type==="ThisExpression")return{}.hasOwnProperty.call(i,"this")?i.this:d;if(g.type==="CallExpression"){var k=l(g.callee,F);if(k===d||typeof k!="function")return d;var y=g.callee.object?l(g.callee.object,F):d;y===d&&(y=null);for(var B=[],E=0,s=g.arguments.length;E<s;E++){var e=l(g.arguments[E],F);if(e===d)return d;B.push(e)}return F?void 0:k.apply(y,B)}else if(g.type==="MemberExpression"){var t=l(g.object,F);if(t===d||typeof t=="function"&&a)return d;if(g.property.type==="Identifier"&&!g.computed)return Di(g.property.name)?d:t[g.property.name];var u=l(g.property,F);return u===null||u===d||Di(u)?d:t[u]}else if(g.type==="ConditionalExpression"){var v=l(g.test,F);return v===d?d:v?l(g.consequent):l(g.alternate,F)}else if(g.type==="ExpressionStatement"){var v=l(g.expression,F);return v===d?d:v}else{if(g.type==="ReturnStatement")return l(g.argument,F);if(g.type==="FunctionExpression"){var M=g.body.body,T={};Object.keys(i).forEach(function(H){T[H]=i[H]});for(var E=0;E<g.params.length;E++){var P=g.params[E];if(P.type=="Identifier")i[P.name]=null;else return d}for(var E in M)if(l(M[E],!0)===d)return d;i=T;var X=Object.keys(i),j=X.map(function(H){return i[H]});return Function(X.join(", "),"return "+Oi(g)).apply(null,j)}else if(g.type==="TemplateLiteral"){for(var U="",E=0;E<g.expressions.length;E++)U+=l(g.quasis[E],F),U+=l(g.expressions[E],F);return U+=l(g.quasis[E],F),U}else if(g.type==="TaggedTemplateExpression"){var L=l(g.tag,F),W=g.quasi,$=W.quasis.map(l),Z=W.expressions.map(l);return L.apply(null,[$].concat(Z))}else return g.type==="TemplateElement"?g.value.cooked:d}}}(m);return D===d?void 0:D};function Di(m){return m==="constructor"||m==="__proto__"}});var Ui=re((ar,mi)=>{var{parse:Ri}=It(),Xi=fi();function di(m,i={}){let f=Ri(m).body[0].expression,a={Infinity:1/0,NaN:NaN,undefined:void 0,isFinite,isNaN,parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,escape,unescape,Object,Boolean,Symbol,Error,Number,BigInt,Math,Date,String,RegExp,Array,Map,Set,JSON,deleteOp:(d,D)=>{delete d[D]},inOp:(d,D)=>d in D,instanceofOp:(d,D)=>d instanceof D,newOp:d=>new d,typeofOp:d=>typeof d,...i};return Xi(f,a)}typeof window<"u"&&(window.evalExpr=di);mi.exports=di});return Ui();})();
      }
    });
  }
})();