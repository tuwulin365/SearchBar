function post(address,parameters){
  var form=document.createElement("form");
  form.action=address;
  form.method="post";
  parameters=parameters.split("&");
  for(var i=0;i<parameters.length;i++){
    parameters[i]=(parameters[i]+"=").split("=");
    if(parameters[i][0].length>0){
      var input=document.createElement("input");
      input.type="hidden";
      input.name=decodeURIComponent(parameters[i][0]);
      input.value=decodeURIComponent(parameters[i][1]);
      form.appendChild(input);
    }
  }
  window.setTimeout(function(){
    document.body.appendChild(form);
    form.submit();
  },0);
}
function init(){
  var address=null;
  var parameters=null;
  var parts=(window.location.href+"?").split("?")[1].split("&");
  for(var i=0;i<parts.length;i++){
    parts[i]=(parts[i]+"=").split("=");
    if(parts[i][0]=="address"){
      address=decodeURIComponent(parts[i][1]);
    }
    else if(parts[i][0]=="parameters"){
      parameters=decodeURIComponent(parts[i][1]);
    }
  }
  if(address!==null&&parameters!==null){
    post(address,parameters);
  }
}
window.addEventListener("load",init);