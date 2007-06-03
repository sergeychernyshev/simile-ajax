

/* platform.js */



SimileAjax.Platform.os={
isMac:false,
isWin:false,
isWin32:false,
isUnix:false
};
SimileAjax.Platform.browser={
isIE:false,
isNetscape:false,
isMozilla:false,
isFirefox:false,
isOpera:false,
isSafari:false,

majorVersion:0,
minorVersion:0
};

(function(){
var an=navigator.appName.toLowerCase();
var ua=navigator.userAgent.toLowerCase();


SimileAjax.Platform.os.isMac=(ua.indexOf('mac')!=-1);
SimileAjax.Platform.os.isWin=(ua.indexOf('win')!=-1);
SimileAjax.Platform.os.isWin32=SimileAjax.Platform.isWin&&(
ua.indexOf('95')!=-1||
ua.indexOf('98')!=-1||
ua.indexOf('nt')!=-1||
ua.indexOf('win32')!=-1||
ua.indexOf('32bit')!=-1
);
SimileAjax.Platform.os.isUnix=(ua.indexOf('x11')!=-1);


SimileAjax.Platform.browser.isIE=(an.indexOf("microsoft")!=-1);
SimileAjax.Platform.browser.isNetscape=(an.indexOf("netscape")!=-1);
SimileAjax.Platform.browser.isMozilla=(ua.indexOf("mozilla")!=-1);
SimileAjax.Platform.browser.isFirefox=(ua.indexOf("firefox")!=-1);
SimileAjax.Platform.browser.isOpera=(an.indexOf("opera")!=-1);
SimileAjax.Platform.browser.isSafari=(an.indexOf("safari")!=-1);

var parseVersionString=function(s){
var a=s.split(".");
SimileAjax.Platform.browser.majorVersion=parseInt(a[0]);
SimileAjax.Platform.browser.minorVersion=parseInt(a[1]);
};
var indexOf=function(s,sub,start){
var i=s.indexOf(sub,start);
return i>=0?i:s.length;
};

if(SimileAjax.Platform.browser.isMozilla){
var offset=ua.indexOf("mozilla/");
if(offset>=0){
parseVersionString(ua.substring(offset+8,indexOf(ua," ",offset)));
}
}
if(SimileAjax.Platform.browser.isIE){
var offset=ua.indexOf("msie ");
if(offset>=0){
parseVersionString(ua.substring(offset+5,indexOf(ua,";",offset)));
}
}
if(SimileAjax.Platform.browser.isNetscape){
var offset=ua.indexOf("rv:");
if(offset>=0){
parseVersionString(ua.substring(offset+3,indexOf(ua,")",offset)));
}
}
if(SimileAjax.Platform.browser.isFirefox){
var offset=ua.indexOf("firefox/");
if(offset>=0){
parseVersionString(ua.substring(offset+8,indexOf(ua," ",offset)));
}
}

if(!("localeCompare"in String.prototype)){
String.prototype.localeCompare=function(s){
if(this<s)return-1;
else if(this>s)return 1;
else return 0;
};
}
})();

SimileAjax.Platform.getDefaultLocale=function(){
return SimileAjax.Platform.clientLocale;
};

/* ajax.js */



SimileAjax.ListenerQueue=function(wildcardHandlerName){
this._listeners=[];
this._wildcardHandlerName=wildcardHandlerName;
};

SimileAjax.ListenerQueue.prototype.add=function(listener){
this._listeners.push(listener);
};

SimileAjax.ListenerQueue.prototype.remove=function(listener){
var listeners=this._listeners;
for(var i=0;i<listeners.length;i++){
if(listeners[i]==listener){
listeners.splice(i,1);
break;
}
}
};

SimileAjax.ListenerQueue.prototype.fire=function(handlerName,args){
var listeners=[].concat(this._listeners);
for(var i=0;i<listeners.length;i++){
var listener=listeners[i];
if(handlerName in listener){
try{
listener[handlerName].apply(listener,args);
}catch(e){
SimileAjax.Debug.exception("Error firing event of name "+handlerName,e);
}
}else if(this._wildcardHandlerName!=null&&
this._wildcardHandlerName in listener){
try{
listener[this._wildcardHandlerName].apply(listener,[handlerName]);
}catch(e){
SimileAjax.Debug.exception("Error firing event of name "+handlerName+" to wildcard handler",e);
}
}
}
};



/* date-time.js */



SimileAjax.DateTime=new Object();

SimileAjax.DateTime._dateRegexp=new RegExp(
"^(-?)([0-9]{4})("+[
"(-?([0-9]{2})(-?([0-9]{2}))?)",
"(-?([0-9]{3}))",
"(-?W([0-9]{2})(-?([1-7]))?)"
].join("|")+")?$"
);
SimileAjax.DateTime._timezoneRegexp=new RegExp(
"Z|(([-+])([0-9]{2})(:?([0-9]{2}))?)$"
);
SimileAjax.DateTime._timeRegexp=new RegExp(
"^([0-9]{2})(:?([0-9]{2})(:?([0-9]{2})(\.([0-9]+))?)?)?$"
);

SimileAjax.DateTime.setIso8601Date=function(dateObject,string){


var d=string.match(SimileAjax.DateTime._dateRegexp);
if(!d){
throw new Error("Invalid date string: "+string);
}

var sign=(d[1]=="-")?-1:1;
var year=sign*d[2];
var month=d[5];
var date=d[7];
var dayofyear=d[9];
var week=d[11];
var dayofweek=(d[13])?d[13]:1;

dateObject.setUTCFullYear(year);
if(dayofyear){
dateObject.setUTCMonth(0);
dateObject.setUTCDate(Number(dayofyear));
}else if(week){
dateObject.setUTCMonth(0);
dateObject.setUTCDate(1);
var gd=dateObject.getUTCDay();
var day=(gd)?gd:7;
var offset=Number(dayofweek)+(7*Number(week));

if(day<=4){
dateObject.setUTCDate(offset+1-day);
}else{
dateObject.setUTCDate(offset+8-day);
}
}else{
if(month){
dateObject.setUTCDate(1);
dateObject.setUTCMonth(month-1);
}
if(date){
dateObject.setUTCDate(date);
}
}

return dateObject;
};

SimileAjax.DateTime.setIso8601Time=function(dateObject,string){


var d=string.match(SimileAjax.DateTime._timeRegexp);
if(!d){
SimileAjax.Debug.warn("Invalid time string: "+string);
return false;
}
var hours=d[1];
var mins=Number((d[3])?d[3]:0);
var secs=(d[5])?d[5]:0;
var ms=d[7]?(Number("0."+d[7])*1000):0;

dateObject.setUTCHours(hours);
dateObject.setUTCMinutes(mins);
dateObject.setUTCSeconds(secs);
dateObject.setUTCMilliseconds(ms);

return dateObject;
};

SimileAjax.DateTime.timezoneOffset=new Date().getTimezoneOffset();

SimileAjax.DateTime.setIso8601=function(dateObject,string){


var offset=SimileAjax.DateTime.timezoneOffset;

var comps=(string.indexOf("T")==-1)?string.split(" "):string.split("T");

SimileAjax.DateTime.setIso8601Date(dateObject,comps[0]);
if(comps.length==2){

var d=comps[1].match(SimileAjax.DateTime._timezoneRegexp);
if(d){
if(d[0]=='Z'){
offset=0;
}else{
offset=(Number(d[3])*60)+Number(d[5]);
offset*=((d[2]=='-')?1:-1);
}
comps[1]=comps[1].substr(0,comps[1].length-d[0].length);
}

SimileAjax.DateTime.setIso8601Time(dateObject,comps[1]);
}
dateObject.setTime(dateObject.getTime()+offset*60000);

return dateObject;
};

SimileAjax.DateTime.parseIso8601DateTime=function(string){
try{
return SimileAjax.DateTime.setIso8601(new Date(0),string);
}catch(e){
return null;
}
};


/* debug.js */



SimileAjax.Debug={
silent:false
};

SimileAjax.Debug.log=function(msg){
var f;
if("console"in window&&"log"in window.console){
f=function(msg2){
console.log(msg2);
}
}else{
f=function(msg2){
if(!SimileAjax.Debug.silent){
alert(msg2);
}
}
}
SimileAjax.Debug.log=f;
f(msg);
};

SimileAjax.Debug.warn=function(msg){
var f;
if("console"in window&&"warn"in window.console){
f=function(msg2){
console.warn(msg2);
}
}else{
f=function(msg2){
if(!SimileAjax.Debug.silent){
alert(msg2);
}
}
}
SimileAjax.Debug.warn=f;
f(msg);
};

SimileAjax.Debug.exception=function(e,msg){
var f,params=SimileAjax.parseURLParameters();
if(params.errors=="throw"||SimileAjax.params.errors=="throw"){
f=function(e2,msg2){
throw(e2);
};
}else if("console"in window&&"error"in window.console){
f=function(e2,msg2){
if(msg2!=null){
console.error(msg2+" %o",e2);
}else{
console.error(e2);
}
throw(e2);
};
}else{
f=function(e2,msg2){
if(!SimileAjax.Debug.silent){
alert("Caught exception: "+msg2+"\n\nDetails: "+("description"in e2?e2.description:e2));
}
throw(e2);
};
}
SimileAjax.Debug.exception=f;
f(e,msg);
};

SimileAjax.Debug.objectToString=function(o){
return SimileAjax.Debug._objectToString(o,"");
};

SimileAjax.Debug._objectToString=function(o,indent){
var indent2=indent+" ";
if(typeof o=="object"){
var s="{";
for(n in o){
s+=indent2+n+": "+SimileAjax.Debug._objectToString(o[n],indent2)+"\n";
}
s+=indent+"}";
return s;
}else if(typeof o=="array"){
var s="[";
for(var n=0;n<o.length;n++){
s+=SimileAjax.Debug._objectToString(o[n],indent2)+"\n";
}
s+=indent+"]";
return s;
}else{
return o;
}
};


/* dom.js */



SimileAjax.DOM=new Object();

SimileAjax.DOM.registerEventWithObject=function(elmt,eventName,obj,handlerName){
SimileAjax.DOM.registerEvent(elmt,eventName,function(elmt2,evt,target){
return obj[handlerName].call(obj,elmt2,evt,target);
});
};

SimileAjax.DOM.registerEvent=function(elmt,eventName,handler){
var handler2=function(evt){
evt=(evt)?evt:((event)?event:null);
if(evt){
var target=(evt.target)?
evt.target:((evt.srcElement)?evt.srcElement:null);
if(target){
target=(target.nodeType==1||target.nodeType==9)?
target:target.parentNode;
}

return handler(elmt,evt,target);
}
return true;
}

if(SimileAjax.Platform.browser.isIE){
elmt.attachEvent("on"+eventName,handler2);
}else{
elmt.addEventListener(eventName,handler2,false);
}
};

SimileAjax.DOM.getPageCoordinates=function(elmt){
var left=0;
var top=0;

if(elmt.nodeType!=1){
elmt=elmt.parentNode;
}

var elmt2=elmt;
while(elmt2!=null){
left+=elmt2.offsetLeft;
top+=elmt2.offsetTop;
elmt2=elmt2.offsetParent;
}

var body=document.body;
while(elmt!=body){
if("scrollLeft"in elmt){
left-=elmt.scrollLeft;
top-=elmt.scrollTop;
}
elmt=elmt.parentNode;
}

return{left:left,top:top};
};

SimileAjax.DOM.getEventRelativeCoordinates=function(evt,elmt){
if(SimileAjax.Platform.browser.isIE){
return{
x:evt.offsetX,
y:evt.offsetY
};
}else{
var coords=SimileAjax.DOM.getPageCoordinates(elmt);
return{
x:evt.pageX-coords.left,
y:evt.pageY-coords.top
};
}
};

SimileAjax.DOM.getEventPageCoordinates=function(evt){
if(SimileAjax.Platform.browser.isIE){
return{
x:evt.clientX+document.body.scrollLeft,
y:evt.clientY+document.body.scrollTop
};
}else{
return{
x:evt.pageX,
y:evt.pageY
};
}
};

SimileAjax.DOM.hittest=function(x,y,except){
return SimileAjax.DOM._hittest(document.body,x,y,except);
};

SimileAjax.DOM._hittest=function(elmt,x,y,except){
var childNodes=elmt.childNodes;
outer:for(var i=0;i<childNodes.length;i++){
var childNode=childNodes[i];
for(var j=0;j<except.length;j++){
if(childNode==except[j]){
continue outer;
}
}

if(childNode.offsetWidth==0&&childNode.offsetHeight==0){

var hitNode=SimileAjax.DOM._hittest(childNode,x,y,except);
if(hitNode!=childNode){
return hitNode;
}
}else{
var top=0;
var left=0;

var node=childNode;
while(node){
top+=node.offsetTop;
left+=node.offsetLeft;
node=node.offsetParent;
}

if(left<=x&&top<=y&&(x-left)<childNode.offsetWidth&&(y-top)<childNode.offsetHeight){
return SimileAjax.DOM._hittest(childNode,x,y,except);
}else if(childNode.nodeType==1&&childNode.tagName=="TR"){

var childNode2=SimileAjax.DOM._hittest(childNode,x,y,except);
if(childNode2!=childNode){
return childNode2;
}
}
}
}
return elmt;
};

SimileAjax.DOM.cancelEvent=function(evt){
evt.returnValue=false;
evt.cancelBubble=true;
if("preventDefault"in evt){
evt.preventDefault();
}
};

SimileAjax.DOM.appendClassName=function(elmt,className){
var classes=elmt.className.split(" ");
for(var i=0;i<classes.length;i++){
if(classes[i]==className){
return;
}
}
classes.push(className);
elmt.className=classes.join(" ");
};

SimileAjax.DOM.createInputElement=function(type){
var div=document.createElement("div");
div.innerHTML="<input type='"+type+"' />";

return div.firstChild;
};

SimileAjax.DOM.createDOMFromTemplate=function(template){
var result={};
result.elmt=SimileAjax.DOM._createDOMFromTemplate(template,result,null);

return result;
};

SimileAjax.DOM._createDOMFromTemplate=function(templateNode,result,parentElmt){
if(templateNode==null){

return null;
}else if(typeof templateNode!="object"){
var node=document.createTextNode(templateNode);
if(parentElmt!=null){
parentElmt.appendChild(node);
}
return node;
}else{
var elmt=null;
if("tag"in templateNode){
var tag=templateNode.tag;
if(parentElmt!=null){
if(tag=="tr"){
elmt=parentElmt.insertRow(parentElmt.rows.length);
}else if(tag=="td"){
elmt=parentElmt.insertCell(parentElmt.cells.length);
}
}
if(elmt==null){
elmt=tag=="input"?
SimileAjax.DOM.createInputElement(templateNode.type):
document.createElement(tag);

if(parentElmt!=null){
parentElmt.appendChild(elmt);
}
}
}else{
elmt=templateNode.elmt;
if(parentElmt!=null){
parentElmt.appendChild(elmt);
}
}

for(var attribute in templateNode){
var value=templateNode[attribute];

if(attribute=="field"){
result[value]=elmt;

}else if(attribute=="className"){
elmt.className=value;
}else if(attribute=="id"){
elmt.id=value;
}else if(attribute=="title"){
elmt.title=value;
}else if(attribute=="type"&&elmt.tagName=="input"){

}else if(attribute=="style"){
for(n in value){
var v=value[n];
if(n=="float"){
n=SimileAjax.Platform.browser.isIE?"styleFloat":"cssFloat";
}
elmt.style[n]=v;
}
}else if(attribute=="children"){
for(var i=0;i<value.length;i++){
SimileAjax.DOM._createDOMFromTemplate(value[i],result,elmt);
}
}else if(attribute!="tag"&&attribute!="elmt"){
elmt.setAttribute(attribute,value);
}
}
return elmt;
}
}

SimileAjax.DOM._cachedParent=null;
SimileAjax.DOM.createElementFromString=function(s){
if(SimileAjax.DOM._cachedParent==null){
SimileAjax.DOM._cachedParent=document.createElement("div");
}
SimileAjax.DOM._cachedParent.innerHTML=s;
return SimileAjax.DOM._cachedParent.firstChild;
};

SimileAjax.DOM.createDOMFromString=function(root,s,fieldElmts){
var elmt=typeof root=="string"?document.createElement(root):root;
elmt.innerHTML=s;

var dom={elmt:elmt};
SimileAjax.DOM._processDOMChildrenConstructedFromString(dom,elmt,fieldElmts!=null?fieldElmts:{});

return dom;
};

SimileAjax.DOM._processDOMConstructedFromString=function(dom,elmt,fieldElmts){
var id=elmt.id;
if(id!=null&&id.length>0){
elmt.removeAttribute("id");
if(id in fieldElmts){
var parentElmt=elmt.parentNode;
parentElmt.insertBefore(fieldElmts[id],elmt);
parentElmt.removeChild(elmt);

dom[id]=fieldElmts[id];
return;
}else{
dom[id]=elmt;
}
}

if(elmt.hasChildNodes()){
SimileAjax.DOM._processDOMChildrenConstructedFromString(dom,elmt,fieldElmts);
}
};

SimileAjax.DOM._processDOMChildrenConstructedFromString=function(dom,elmt,fieldElmts){
var node=elmt.firstChild;
while(node!=null){
var node2=node.nextSibling;
if(node.nodeType==1){
SimileAjax.DOM._processDOMConstructedFromString(dom,node,fieldElmts);
}
node=node2;
}
};


/* graphics.js */



SimileAjax.Graphics=new Object();
SimileAjax.Graphics.pngIsTranslucent=(!SimileAjax.Platform.browser.isIE)||(SimileAjax.Platform.browser.majorVersion>6);


SimileAjax.Graphics._createTranslucentImage1=function(url,verticalAlign){
elmt=document.createElement("img");
elmt.setAttribute("src",url);
if(verticalAlign!=null){
elmt.style.verticalAlign=verticalAlign;
}
return elmt;
};
SimileAjax.Graphics._createTranslucentImage2=function(url,verticalAlign){
elmt=document.createElement("img");
elmt.style.width="1px";
elmt.style.height="1px";
elmt.style.filter="progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+url+"', sizingMethod='image')";
elmt.style.verticalAlign=(verticalAlign!=null)?verticalAlign:"middle";
return elmt;
};

SimileAjax.Graphics.createTranslucentImage=SimileAjax.Graphics.pngIsTranslucent?
SimileAjax.Graphics._createTranslucentImage1:
SimileAjax.Graphics._createTranslucentImage2;

SimileAjax.Graphics._createTranslucentImageHTML1=function(url,verticalAlign){
return"<img src=\""+url+"\""+
(verticalAlign!=null?" style=\"vertical-align: "+verticalAlign+";\"":"")+
" />";
};
SimileAjax.Graphics._createTranslucentImageHTML2=function(url,verticalAlign){
var style=
"width: 1px; height: 1px; "+
"filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+url+"', sizingMethod='image');"+
(verticalAlign!=null?" vertical-align: "+verticalAlign+";":"");

return"<img src='"+url+"' style=\""+style+"\" />";
};

SimileAjax.Graphics.createTranslucentImageHTML=SimileAjax.Graphics.pngIsTranslucent?
SimileAjax.Graphics._createTranslucentImageHTML1:
SimileAjax.Graphics._createTranslucentImageHTML2;

SimileAjax.Graphics.setOpacity=function(elmt,opacity){
if(SimileAjax.Platform.browser.isIE){
elmt.style.filter="progid:DXImageTransform.Microsoft.Alpha(Style=0,Opacity="+opacity+")";
}else{
var o=(opacity/100).toString();
elmt.style.opacity=o;
elmt.style.MozOpacity=o;
}
};


SimileAjax.Graphics._bubbleMargins={
top:33,
bottom:42,
left:33,
right:40
}


SimileAjax.Graphics._arrowOffsets={
top:0,
bottom:9,
left:1,
right:8
}

SimileAjax.Graphics._bubblePadding=15;
SimileAjax.Graphics._bubblePointOffset=6;
SimileAjax.Graphics._halfArrowWidth=18;

SimileAjax.Graphics.createBubbleForPoint=function(pageX,pageY,contentWidth,contentHeight){
function getWindowDims(){
if(typeof window.innerHeight=='number'){
return{w:window.innerWidth,h:window.innerHeight};
}else if(document.documentElement&&document.documentElement.clientHeight){
return{
w:document.documentElement.clientWidth,
h:document.documentElement.clientHeight
};
}else if(document.body&&document.body.clientHeight){
return{
w:document.body.clientWidth,
h:document.body.clientHeight
};
}
}

var close=function(){
if(!bubble._closed){
document.body.removeChild(bubble._div);
bubble._doc=null;
bubble._div=null;
bubble._content=null;
bubble._closed=true;
}
}
var layer=SimileAjax.WindowManager.pushLayer(close,true);
var bubble={
_closed:false,
close:function(){SimileAjax.WindowManager.popLayer(layer);}
};

var dims=getWindowDims();
var docWidth=dims.w;
var docHeight=dims.h;

var margins=SimileAjax.Graphics._bubbleMargins;
contentWidth=parseInt(contentWidth,10);
contentHeight=parseInt(contentHeight,10);
var bubbleWidth=margins.left+contentWidth+margins.right;
var bubbleHeight=margins.top+contentHeight+margins.bottom;

var pngIsTranslucent=SimileAjax.Graphics.pngIsTranslucent;
var urlPrefix=SimileAjax.urlPrefix;

var setImg=function(elmt,url,width,height){
elmt.style.position="absolute";
elmt.style.width=width+"px";
elmt.style.height=height+"px";
if(pngIsTranslucent){
elmt.style.background="url("+url+")";
}else{
elmt.style.filter="progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+url+"', sizingMethod='crop')";
}
}
var div=document.createElement("div");
div.style.width=bubbleWidth+"px";
div.style.height=bubbleHeight+"px";
div.style.position="absolute";
div.style.zIndex=1000;
bubble._div=div;

var divInner=document.createElement("div");
divInner.style.width="100%";
divInner.style.height="100%";
divInner.style.position="relative";
div.appendChild(divInner);

var createImg=function(url,left,top,width,height){
var divImg=document.createElement("div");
divImg.style.left=left+"px";
divImg.style.top=top+"px";
setImg(divImg,url,width,height);
divInner.appendChild(divImg);
}

createImg(urlPrefix+"images/bubble-top-left.png",0,0,margins.left,margins.top);
createImg(urlPrefix+"images/bubble-top.png",margins.left,0,contentWidth,margins.top);
createImg(urlPrefix+"images/bubble-top-right.png",margins.left+contentWidth,0,margins.right,margins.top);

createImg(urlPrefix+"images/bubble-left.png",0,margins.top,margins.left,contentHeight);
createImg(urlPrefix+"images/bubble-right.png",margins.left+contentWidth,margins.top,margins.right,contentHeight);

createImg(urlPrefix+"images/bubble-bottom-left.png",0,margins.top+contentHeight,margins.left,margins.bottom);
createImg(urlPrefix+"images/bubble-bottom.png",margins.left,margins.top+contentHeight,contentWidth,margins.bottom);
createImg(urlPrefix+"images/bubble-bottom-right.png",margins.left+contentWidth,margins.top+contentHeight,margins.right,margins.bottom);

var divClose=document.createElement("div");
divClose.style.left=(bubbleWidth-margins.right+SimileAjax.Graphics._bubblePadding-16-2)+"px";
divClose.style.top=(margins.top-SimileAjax.Graphics._bubblePadding+1)+"px";
divClose.style.cursor="pointer";
setImg(divClose,urlPrefix+"images/close-button.png",16,16);
SimileAjax.WindowManager.registerEventWithObject(divClose,"click",bubble,"close");
divInner.appendChild(divClose);

var divContent=document.createElement("div");
divContent.style.position="absolute";
divContent.style.left=margins.left+"px";
divContent.style.top=margins.top+"px";
divContent.style.width=contentWidth+"px";
divContent.style.height=contentHeight+"px";
divContent.style.overflow="auto";
divContent.style.background="white";
divInner.appendChild(divContent);
bubble.content=divContent;

(function(){
if(pageX-SimileAjax.Graphics._halfArrowWidth-SimileAjax.Graphics._bubblePadding>0&&
pageX+SimileAjax.Graphics._halfArrowWidth+SimileAjax.Graphics._bubblePadding<docWidth){

var left=pageX-Math.round(contentWidth/2)-margins.left;
left=pageX<(docWidth/2)?
Math.max(left,-(margins.left-SimileAjax.Graphics._bubblePadding)):
Math.min(left,docWidth+(margins.right-SimileAjax.Graphics._bubblePadding)-bubbleWidth);

if(pageY-SimileAjax.Graphics._bubblePointOffset-bubbleHeight>0){
var divImg=document.createElement("div");

divImg.style.left=(pageX-SimileAjax.Graphics._halfArrowWidth-left)+"px";
divImg.style.top=(margins.top+contentHeight)+"px";
setImg(divImg,urlPrefix+"images/bubble-bottom-arrow.png",37,margins.bottom);
divInner.appendChild(divImg);

div.style.left=left+"px";
div.style.top=(pageY-SimileAjax.Graphics._bubblePointOffset-bubbleHeight+
SimileAjax.Graphics._arrowOffsets.bottom)+"px";

return;
}else if(pageY+SimileAjax.Graphics._bubblePointOffset+bubbleHeight<docHeight){
var divImg=document.createElement("div");

divImg.style.left=(pageX-SimileAjax.Graphics._halfArrowWidth-left)+"px";
divImg.style.top="0px";
setImg(divImg,urlPrefix+"images/bubble-top-arrow.png",37,margins.top);
divInner.appendChild(divImg);

div.style.left=left+"px";
div.style.top=(pageY+SimileAjax.Graphics._bubblePointOffset-
SimileAjax.Graphics._arrowOffsets.top)+"px";

return;
}
}

var top=pageY-Math.round(contentHeight/2)-margins.top;
top=pageY<(docHeight/2)?
Math.max(top,-(margins.top-SimileAjax.Graphics._bubblePadding)):
Math.min(top,docHeight+(margins.bottom-SimileAjax.Graphics._bubblePadding)-bubbleHeight);

if(pageX-SimileAjax.Graphics._bubblePointOffset-bubbleWidth>0){
var divImg=document.createElement("div");

divImg.style.left=(margins.left+contentWidth)+"px";
divImg.style.top=(pageY-SimileAjax.Graphics._halfArrowWidth-top)+"px";
setImg(divImg,urlPrefix+"images/bubble-right-arrow.png",margins.right,37);
divInner.appendChild(divImg);

div.style.left=(pageX-SimileAjax.Graphics._bubblePointOffset-bubbleWidth+
SimileAjax.Graphics._arrowOffsets.right)+"px";
div.style.top=top+"px";
}else{
var divImg=document.createElement("div");

divImg.style.left="0px";
divImg.style.top=(pageY-SimileAjax.Graphics._halfArrowWidth-top)+"px";
setImg(divImg,urlPrefix+"images/bubble-left-arrow.png",margins.left,37);
divInner.appendChild(divImg);

div.style.left=(pageX+SimileAjax.Graphics._bubblePointOffset-
SimileAjax.Graphics._arrowOffsets.left)+"px";
div.style.top=top+"px";
}
})();

document.body.appendChild(div);

return bubble;
};

SimileAjax.Graphics.createMessageBubble=function(doc){
var containerDiv=doc.createElement("div");
if(SimileAjax.Graphics.pngIsTranslucent){
var topDiv=doc.createElement("div");
topDiv.style.height="33px";
topDiv.style.background="url("+SimileAjax.urlPrefix+"images/message-top-left.png) top left no-repeat";
topDiv.style.paddingLeft="44px";
containerDiv.appendChild(topDiv);

var topRightDiv=doc.createElement("div");
topRightDiv.style.height="33px";
topRightDiv.style.background="url("+SimileAjax.urlPrefix+"images/message-top-right.png) top right no-repeat";
topDiv.appendChild(topRightDiv);

var middleDiv=doc.createElement("div");
middleDiv.style.background="url("+SimileAjax.urlPrefix+"images/message-left.png) top left repeat-y";
middleDiv.style.paddingLeft="44px";
containerDiv.appendChild(middleDiv);

var middleRightDiv=doc.createElement("div");
middleRightDiv.style.background="url("+SimileAjax.urlPrefix+"images/message-right.png) top right repeat-y";
middleRightDiv.style.paddingRight="44px";
middleDiv.appendChild(middleRightDiv);

var contentDiv=doc.createElement("div");
middleRightDiv.appendChild(contentDiv);

var bottomDiv=doc.createElement("div");
bottomDiv.style.height="55px";
bottomDiv.style.background="url("+SimileAjax.urlPrefix+"images/message-bottom-left.png) bottom left no-repeat";
bottomDiv.style.paddingLeft="44px";
containerDiv.appendChild(bottomDiv);

var bottomRightDiv=doc.createElement("div");
bottomRightDiv.style.height="55px";
bottomRightDiv.style.background="url("+SimileAjax.urlPrefix+"images/message-bottom-right.png) bottom right no-repeat";
bottomDiv.appendChild(bottomRightDiv);
}else{
containerDiv.style.border="2px solid #7777AA";
containerDiv.style.padding="20px";
containerDiv.style.background="white";
SimileAjax.Graphics.setOpacity(containerDiv,90);

var contentDiv=doc.createElement("div");
containerDiv.appendChild(contentDiv);
}

return{
containerDiv:containerDiv,
contentDiv:contentDiv
};
};



SimileAjax.Graphics.createAnimation=function(f,from,to,duration){
return new SimileAjax.Graphics._Animation(f,from,to,duration);
};

SimileAjax.Graphics._Animation=function(f,from,to,duration){
this.f=f;

this.from=from;
this.to=to;
this.current=from;

this.duration=duration;
this.start=new Date().getTime();
this.timePassed=0;
};

SimileAjax.Graphics._Animation.prototype.run=function(){
var a=this;
window.setTimeout(function(){a.step();},50);
};

SimileAjax.Graphics._Animation.prototype.step=function(){
this.timePassed+=50;

var timePassedFraction=this.timePassed/this.duration;
var parameterFraction=-Math.cos(timePassedFraction*Math.PI)/2+0.5;
var current=parameterFraction*(this.to-this.from)+this.from;

try{
this.f(current,current-this.current);
}catch(e){
}
this.current=current;

if(this.timePassed<this.duration){
this.run();
}else{
this.f(this.to,0);
}
};



SimileAjax.Graphics.createStructuredDataCopyButton=function(image,width,height,createDataFunction){
var div=document.createElement("div");
div.style.position="relative";
div.style.display="inline";
div.style.width=width+"px";
div.style.height=height+"px";
div.style.overflow="hidden";
div.style.margin="2px";

if(SimileAjax.Graphics.pngIsTranslucent){
div.style.background="url("+image+") no-repeat";
}else{
div.style.filter="progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+image+"', sizingMethod='image')";
}

var style;
if(SimileAjax.Platform.browser.isIE){
style="filter:alpha(opacity=0)";
}else{
style="opacity: 0";
}
div.innerHTML="<textarea rows='1' autocomplete='off' value='none' style='"+style+"' />";

var textarea=div.firstChild;
textarea.style.width=width+"px";
textarea.style.height=height+"px";
textarea.onmousedown=function(evt){
evt=(evt)?evt:((event)?event:null);
if(evt.button==2){
textarea.value=createDataFunction();
textarea.select();
}
};

return div;
};


/* history.js */



SimileAjax.History={
maxHistoryLength:10,
historyFile:"__history__.html",
enabled:true,

_initialized:false,
_listeners:new SimileAjax.ListenerQueue(),

_actions:[],
_baseIndex:0,
_currentIndex:0,

_plainDocumentTitle:document.title
};

SimileAjax.History.formatHistoryEntryTitle=function(actionLabel){
return SimileAjax.History._plainDocumentTitle+" {"+actionLabel+"}";
};

SimileAjax.History.initialize=function(){
if(SimileAjax.History._initialized){
return;
}

if(SimileAjax.History.enabled){
var iframe=document.createElement("iframe");
iframe.id="simile-ajax-history";
iframe.style.position="absolute";
iframe.style.width="10px";
iframe.style.height="10px";
iframe.style.top="0px";
iframe.style.left="0px";
iframe.style.visibility="hidden";
iframe.src=SimileAjax.History.historyFile+"?0";

document.body.appendChild(iframe);
SimileAjax.DOM.registerEvent(iframe,"load",SimileAjax.History._handleIFrameOnLoad);

SimileAjax.History._iframe=iframe;
}
SimileAjax.History._initialized=true;
};

SimileAjax.History.addListener=function(listener){
SimileAjax.History.initialize();

SimileAjax.History._listeners.add(listener);
};

SimileAjax.History.removeListener=function(listener){
SimileAjax.History.initialize();

SimileAjax.History._listeners.remove(listener);
};

SimileAjax.History.addAction=function(action){
SimileAjax.History.initialize();

SimileAjax.History._listeners.fire("onBeforePerform",[action]);
window.setTimeout(function(){
try{
action.perform();
SimileAjax.History._listeners.fire("onAfterPerform",[action]);

if(SimileAjax.History.enabled){
SimileAjax.History._actions=SimileAjax.History._actions.slice(
0,SimileAjax.History._currentIndex-SimileAjax.History._baseIndex);

SimileAjax.History._actions.push(action);
SimileAjax.History._currentIndex++;

var diff=SimileAjax.History._actions.length-SimileAjax.History.maxHistoryLength;
if(diff>0){
SimileAjax.History._actions=SimileAjax.History._actions.slice(diff);
SimileAjax.History._baseIndex+=diff;
}

try{
SimileAjax.History._iframe.contentWindow.location.search=
"?"+SimileAjax.History._currentIndex;
}catch(e){

var title=SimileAjax.History.formatHistoryEntryTitle(action.label);
document.title=title;
}
}
}catch(e){
SimileAjax.Debug.exception(e,"Error adding action {"+action.label+"} to history");
}
},0);
};

SimileAjax.History.addLengthyAction=function(perform,undo,label){
SimileAjax.History.addAction({
perform:perform,
undo:undo,
label:label,
uiLayer:SimileAjax.WindowManager.getBaseLayer(),
lengthy:true
});
};

SimileAjax.History._handleIFrameOnLoad=function(){


try{
var q=SimileAjax.History._iframe.contentWindow.location.search;
var c=(q.length==0)?0:Math.max(0,parseInt(q.substr(1)));

var finishUp=function(){
var diff=c-SimileAjax.History._currentIndex;
SimileAjax.History._currentIndex+=diff;
SimileAjax.History._baseIndex+=diff;

SimileAjax.History._iframe.contentWindow.location.search="?"+c;
};

if(c<SimileAjax.History._currentIndex){
SimileAjax.History._listeners.fire("onBeforeUndoSeveral",[]);
window.setTimeout(function(){
while(SimileAjax.History._currentIndex>c&&
SimileAjax.History._currentIndex>SimileAjax.History._baseIndex){

SimileAjax.History._currentIndex--;

var action=SimileAjax.History._actions[SimileAjax.History._currentIndex-SimileAjax.History._baseIndex];

try{
action.undo();
}catch(e){
SimileAjax.Debug.exception(e,"History: Failed to undo action {"+action.label+"}");
}
}

SimileAjax.History._listeners.fire("onAfterUndoSeveral",[]);
finishUp();
},0);
}else if(c>SimileAjax.History._currentIndex){
SimileAjax.History._listeners.fire("onBeforeRedoSeveral",[]);
window.setTimeout(function(){
while(SimileAjax.History._currentIndex<c&&
SimileAjax.History._currentIndex-SimileAjax.History._baseIndex<SimileAjax.History._actions.length){

var action=SimileAjax.History._actions[SimileAjax.History._currentIndex-SimileAjax.History._baseIndex];

try{
action.perform();
}catch(e){
SimileAjax.Debug.exception(e,"History: Failed to redo action {"+action.label+"}");
}

SimileAjax.History._currentIndex++;
}

SimileAjax.History._listeners.fire("onAfterRedoSeveral",[]);
finishUp();
},0);
}else{
var index=SimileAjax.History._currentIndex-SimileAjax.History._baseIndex-1;
var title=(index>=0&&index<SimileAjax.History._actions.length)?
SimileAjax.History.formatHistoryEntryTitle(SimileAjax.History._actions[index].label):
SimileAjax.History._plainDocumentTitle;

SimileAjax.History._iframe.contentWindow.document.title=title;
document.title=title;
}
}catch(e){

}
};

SimileAjax.History.getNextUndoAction=function(){
try{
var index=SimileAjax.History._currentIndex-SimileAjax.History._baseIndex-1;
return SimileAjax.History._actions[index];
}catch(e){
return null;
}
};

SimileAjax.History.getNextRedoAction=function(){
try{
var index=SimileAjax.History._currentIndex-SimileAjax.History._baseIndex;
return SimileAjax.History._actions[index];
}catch(e){
return null;
}
};


/* jquery-1.1.2.js */

eval(function(p,a,c,k,e,d){e=function(c){return(c<a?"":e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--){d[e(c)]=k[c]||e(c)}k=[function(e){return d[e]}];e=function(){return'\\w+'};c=1};while(c--){if(k[c]){p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c])}}return p}('7(1C 1w.6=="T"){1w.T=1w.T;B 6=u(a,c){7(1w==q)v 1p 6(a,c);a=a||17;7(6.1t(a))v 1p 6(17)[6.E.27?"27":"2O"](a);7(1C a=="23"){B m=/^[^<]*(<(.|\\s)+>)[^>]*$/.2Q(a);7(m)a=6.3k([m[1]]);J v 1p 6(c).2o(a)}v q.6r(a.1l==2y&&a||(a.3Y||a.I&&a!=1w&&!a.24&&a[0]!=T&&a[0].24)&&6.3M(a)||[a])};7(1C $!="T")6.2S$=$;B $=6;6.E=6.8p={3Y:"1.1.2",8q:u(){v q.I},I:0,2b:u(1T){v 1T==T?6.3M(q):q[1T]},2r:u(a){B L=6(a);L.6p=q;v L},6r:u(a){q.I=0;[].1g.14(q,a);v q},K:u(E,1E){v 6.K(q,E,1E)},2h:u(1c){B 4c=-1;q.K(u(i){7(q==1c)4c=i});v 4c},1I:u(1Y,O,C){B 1c=1Y;7(1Y.1l==3t)7(O==T)v q.I&&6[C||"1I"](q[0],1Y)||T;J{1c={};1c[1Y]=O}v q.K(u(2h){P(B H 1x 1c)6.1I(C?q.1q:q,H,6.H(q,1c[H],C,2h,H))})},1m:u(1Y,O){v q.1I(1Y,O,"30")},2L:u(e){7(1C e=="23")v q.3u().3r(17.8t(e));B t="";6.K(e||q,u(){6.K(q.2I,u(){7(q.24!=8)t+=q.24!=1?q.60:6.E.2L([q])})});v t},2K:u(){B a=6.3k(1A);v q.K(u(){B b=a[0].3l(U);q.11.2X(b,q);22(b.1b)b=b.1b;b.4C(q)})},3r:u(){v q.3j(1A,U,1,u(a){q.4C(a)})},5i:u(){v q.3j(1A,U,-1,u(a){q.2X(a,q.1b)})},5j:u(){v q.3j(1A,12,1,u(a){q.11.2X(a,q)})},5t:u(){v q.3j(1A,12,-1,u(a){q.11.2X(a,q.2e)})},4g:u(){v q.6p||6([])},2o:u(t){v q.2r(6.31(q,u(a){v 6.2o(t,a)}),t)},4Y:u(4N){v q.2r(6.31(q,u(a){B a=a.3l(4N!=T?4N:U);a.$1H=16;v a}))},1D:u(t){v q.2r(6.1t(t)&&6.2q(q,u(2z,2h){v t.14(2z,[2h])})||6.3z(t,q))},2g:u(t){v q.2r(t.1l==3t&&6.3z(t,q,U)||6.2q(q,u(a){v(t.1l==2y||t.3Y)?6.3y(a,t)<0:a!=t}))},1M:u(t){v q.2r(6.2k(q.2b(),t.1l==3t?6(t).2b():t.I!=T&&(!t.1f||t.1f=="8v")?t:[t]))},4l:u(1s){v 1s?6.1D(1s,q).r.I>0:12},1a:u(1a){v 1a==T?(q.I?q[0].O:16):q.1I("O",1a)},4U:u(1a){v 1a==T?(q.I?q[0].2t:16):q.3u().3r(1a)},3j:u(1E,1P,3Z,E){B 4Y=q.I>1;B a=6.3k(1E);7(3Z<0)a.8w();v q.K(u(){B 1c=q;7(1P&&6.1f(q,"1P")&&6.1f(a[0],"3m"))1c=q.5J("20")[0]||q.4C(17.6n("20"));6.K(a,u(){E.14(1c,[4Y?q.3l(U):q])})})}};6.1z=6.E.1z=u(){B 1O=1A[0],a=1;7(1A.I==1){1O=q;a=0}B H;22(H=1A[a++])P(B i 1x H)1O[i]=H[i];v 1O};6.1z({8x:u(){7(6.2S$)$=6.2S$;v 6},1t:u(E){v!!E&&1C E!="23"&&!E.1f&&1C E[0]=="T"&&/u/i.1n(E+"")},4B:u(D){v D.66&&D.5I&&!D.5I.64},1f:u(D,Y){v D.1f&&D.1f.3K()==Y.3K()},K:u(1c,E,1E){7(1c.I==T)P(B i 1x 1c)E.14(1c[i],1E||[i,1c[i]]);J P(B i=0,6q=1c.I;i<6q;i++)7(E.14(1c[i],1E||[i,1c[i]])===12)3O;v 1c},H:u(D,O,C,2h,H){7(6.1t(O))O=O.3n(D,[2h]);B 6s=/z-?2h|7P-?8A|1d|58|8B-?28/i;v O&&O.1l==3Q&&C=="30"&&!6s.1n(H)?O+"4S":O},19:{1M:u(D,c){6.K(c.3o(/\\s+/),u(i,Q){7(!6.19.2V(D.19,Q))D.19+=(D.19?" ":"")+Q})},2f:u(D,c){D.19=c?6.2q(D.19.3o(/\\s+/),u(Q){v!6.19.2V(c,Q)}).6t(" "):""},2V:u(t,c){t=t.19||t;c=c.1R(/([\\.\\\\\\+\\*\\?\\[\\^\\]\\$\\(\\)\\{\\}\\=\\!\\<\\>\\|\\:])/g,"\\\\$1");v t&&1p 4v("(^|\\\\s)"+c+"(\\\\s|$)").1n(t)}},4d:u(e,o,f){P(B i 1x o){e.1q["1N"+i]=e.1q[i];e.1q[i]=o[i]}f.14(e,[]);P(B i 1x o)e.1q[i]=e.1q["1N"+i]},1m:u(e,p){7(p=="28"||p=="3V"){B 1N={},46,3P,d=["7d","8C","8D","8E"];6.K(d,u(){1N["8F"+q]=0;1N["8G"+q+"8H"]=0});6.4d(e,1N,u(){7(6.1m(e,"1h")!="1Z"){46=e.8I;3P=e.8J}J{e=6(e.3l(U)).2o(":4j").5l("2Z").4g().1m({4n:"1G",45:"8K",1h:"2D",7I:"0",8M:"0"}).5z(e.11)[0];B 3d=6.1m(e.11,"45");7(3d==""||3d=="4b")e.11.1q.45="6x";46=e.6y;3P=e.6z;7(3d==""||3d=="4b")e.11.1q.45="4b";e.11.33(e)}});v p=="28"?46:3P}v 6.30(e,p)},30:u(D,H,53){B L;7(H=="1d"&&6.W.1j)v 6.1I(D.1q,"1d");7(H=="4h"||H=="2v")H=6.W.1j?"3T":"2v";7(!53&&D.1q[H])L=D.1q[H];J 7(17.44&&17.44.4W){7(H=="2v"||H=="3T")H="4h";H=H.1R(/([A-Z])/g,"-$1").4m();B Q=17.44.4W(D,16);7(Q)L=Q.55(H);J 7(H=="1h")L="1Z";J 6.4d(D,{1h:"2D"},u(){B c=17.44.4W(q,"");L=c&&c.55(H)||""})}J 7(D.51){B 56=H.1R(/\\-(\\w)/g,u(m,c){v c.3K()});L=D.51[H]||D.51[56]}v L},3k:u(a){B r=[];6.K(a,u(i,1r){7(!1r)v;7(1r.1l==3Q)1r=1r.6C();7(1C 1r=="23"){B s=6.35(1r),1V=17.6n("1V"),2i=[];B 2K=!s.18("<1u")&&[1,"<42>","</42>"]||(!s.18("<6D")||!s.18("<20")||!s.18("<6E"))&&[1,"<1P>","</1P>"]||!s.18("<3m")&&[2,"<1P><20>","</20></1P>"]||(!s.18("<6F")||!s.18("<6G"))&&[3,"<1P><20><3m>","</3m></20></1P>"]||[0,"",""];1V.2t=2K[1]+s+2K[2];22(2K[0]--)1V=1V.1b;7(6.W.1j){7(!s.18("<1P")&&s.18("<20")<0)2i=1V.1b&&1V.1b.2I;J 7(2K[1]=="<1P>"&&s.18("<20")<0)2i=1V.2I;P(B n=2i.I-1;n>=0;--n)7(6.1f(2i[n],"20")&&!2i[n].2I.I)2i[n].11.33(2i[n])}1r=[];P(B i=0,l=1V.2I.I;i<l;i++)1r.1g(1V.2I[i])}7(1r.I===0&&!6.1f(1r,"3w"))v;7(1r[0]==T||6.1f(1r,"3w"))r.1g(1r);J r=6.2k(r,1r)});v r},1I:u(D,Y,O){B 2j=6.4B(D)?{}:{"P":"6J","6L":"19","4h":6.W.1j?"3T":"2v",2v:6.W.1j?"3T":"2v",2t:"2t",19:"19",O:"O",2W:"2W",2Z:"2Z",89:"6N",2Y:"2Y"};7(Y=="1d"&&6.W.1j&&O!=T){D.58=1;v D.1D=D.1D.1R(/4i\\([^\\)]*\\)/6O,"")+(O==1?"":"4i(1d="+O*6g+")")}J 7(Y=="1d"&&6.W.1j)v D.1D?4T(D.1D.6P(/4i\\(1d=(.*)\\)/)[1])/6g:1;7(Y=="1d"&&6.W.3h&&O==1)O=0.6R;7(2j[Y]){7(O!=T)D[2j[Y]]=O;v D[2j[Y]]}J 7(O==T&&6.W.1j&&6.1f(D,"3w")&&(Y=="81"||Y=="80"))v D.6T(Y).60;J 7(D.66){7(O!=T)D.6V(Y,O);7(6.W.1j&&/5E|3e/.1n(Y)&&!6.4B(D))v D.36(Y,2);v D.36(Y)}J{Y=Y.1R(/-([a-z])/6W,u(z,b){v b.3K()});7(O!=T)D[Y]=O;v D[Y]}},35:u(t){v t.1R(/^\\s+|\\s+$/g,"")},3M:u(a){B r=[];7(a.1l!=2y)P(B i=0,2R=a.I;i<2R;i++)r.1g(a[i]);J r=a.3N(0);v r},3y:u(b,a){P(B i=0,2R=a.I;i<2R;i++)7(a[i]==b)v i;v-1},2k:u(2u,3H){B r=[].3N.3n(2u,0);P(B i=0,5b=3H.I;i<5b;i++)7(6.3y(3H[i],r)==-1)2u.1g(3H[i]);v 2u},2q:u(1U,E,4k){7(1C E=="23")E=1p 4w("a","i","v "+E);B 1i=[];P(B i=0,2z=1U.I;i<2z;i++)7(!4k&&E(1U[i],i)||4k&&!E(1U[i],i))1i.1g(1U[i]);v 1i},31:u(1U,E){7(1C E=="23")E=1p 4w("a","v "+E);B 1i=[],r=[];P(B i=0,2z=1U.I;i<2z;i++){B 1a=E(1U[i],i);7(1a!==16&&1a!=T){7(1a.1l!=2y)1a=[1a];1i=1i.6Z(1a)}}B r=1i.I?[1i[0]]:[];5f:P(B i=1,5e=1i.I;i<5e;i++){P(B j=0;j<i;j++)7(1i[i]==r[j])5F 5f;r.1g(1i[i])}v r}});1p u(){B b=7L.71.4m();6.W={2N:/5D/.1n(b),3f:/3f/.1n(b),1j:/1j/.1n(b)&&!/3f/.1n(b),3h:/3h/.1n(b)&&!/(72|5D)/.1n(b)};6.7H=!6.W.1j||17.74=="75"};6.K({5u:"a.11",4z:"6.4z(a)",76:"6.2a(a,2,\'2e\')",7D:"6.2a(a,2,\'5s\')",78:"6.2B(a.11.1b,a)",79:"6.2B(a.1b)"},u(i,n){6.E[i]=u(a){B L=6.31(q,n);7(a&&1C a=="23")L=6.3z(a,L);v q.2r(L)}});6.K({5z:"3r",7b:"5i",2X:"5j",7e:"5t"},u(i,n){6.E[i]=u(){B a=1A;v q.K(u(){P(B j=0,2R=a.I;j<2R;j++)6(a[j])[n](q)})}});6.K({5l:u(1Y){6.1I(q,1Y,"");q.7g(1Y)},7h:u(c){6.19.1M(q,c)},7i:u(c){6.19.2f(q,c)},7k:u(c){6.19[6.19.2V(q,c)?"2f":"1M"](q,c)},2f:u(a){7(!a||6.1D(a,[q]).r.I)q.11.33(q)},3u:u(){22(q.1b)q.33(q.1b)}},u(i,n){6.E[i]=u(){v q.K(n,1A)}});6.K(["5q","5n","5p","5v"],u(i,n){6.E[n]=u(1T,E){v q.1D(":"+n+"("+1T+")",E)}});6.K(["28","3V"],u(i,n){6.E[n]=u(h){v h==T?(q.I?6.1m(q[0],n):16):q.1m(n,h.1l==3t?h:h+"4S")}});6.1z({1s:{"":"m[2]==\'*\'||6.1f(a,m[2])","#":"a.36(\'2J\')==m[2]",":":{5n:"i<m[3]-0",5p:"i>m[3]-0",2a:"m[3]-0==i",5q:"m[3]-0==i",2u:"i==0",2T:"i==r.I-1",5R:"i%2==0",5S:"i%2","2a-3s":"6.2a(a.11.1b,m[3],\'2e\',a)==a","2u-3s":"6.2a(a.11.1b,1,\'2e\')==a","2T-3s":"6.2a(a.11.7n,1,\'5s\')==a","7p-3s":"6.2B(a.11.1b).I==1",5u:"a.1b",3u:"!a.1b",5v:"6.E.2L.14([a]).18(m[3])>=0",3i:\'a.C!="1G"&&6.1m(a,"1h")!="1Z"&&6.1m(a,"4n")!="1G"\',1G:\'a.C=="1G"||6.1m(a,"1h")=="1Z"||6.1m(a,"4n")=="1G"\',7v:"!a.2W",2W:"a.2W",2Z:"a.2Z",2Y:"a.2Y||6.1I(a,\'2Y\')",2L:"a.C==\'2L\'",4j:"a.C==\'4j\'",5x:"a.C==\'5x\'",4G:"a.C==\'4G\'",5y:"a.C==\'5y\'",4R:"a.C==\'4R\'",5A:"a.C==\'5A\'",5B:"a.C==\'5B\'",3x:\'a.C=="3x"||6.1f(a,"3x")\',5C:"/5C|42|7A|3x/i.1n(a.1f)"},".":"6.19.2V(a,m[2])","@":{"=":"z==m[4]","!=":"z!=m[4]","^=":"z&&!z.18(m[4])","$=":"z&&z.2U(z.I - m[4].I,m[4].I)==m[4]","*=":"z&&z.18(m[4])>=0","":"z",4u:u(m){v["",m[1],m[3],m[2],m[5]]},5P:"z=a[m[3]];7(!z||/5E|3e/.1n(m[3]))z=6.1I(a,m[3]);"},"[":"6.2o(m[2],a).I"},5M:[/^\\[ *(@)([a-2m-3C-]*) *([!*$^=]*) *(\'?"?)(.*?)\\4 *\\]/i,/^(\\[)\\s*(.*?(\\[.*?\\])?[^[]*?)\\s*\\]/,/^(:)([a-2m-3C-]*)\\("?\'?(.*?(\\(.*?\\))?[^(]*?)"?\'?\\)/i,/^([:.#]*)([a-2m-3C*-]*)/i],1Q:[/^(\\/?\\.\\.)/,"a.11",/^(>|\\/)/,"6.2B(a.1b)",/^(\\+)/,"6.2a(a,2,\'2e\')",/^(~)/,u(a){B s=6.2B(a.11.1b);v s.3N(6.3y(a,s)+1)}],3z:u(1s,1U,2g){B 1N,Q=[];22(1s&&1s!=1N){1N=1s;B f=6.1D(1s,1U,2g);1s=f.t.1R(/^\\s*,\\s*/,"");Q=2g?1U=f.r:6.2k(Q,f.r)}v Q},2o:u(t,1B){7(1C t!="23")v[t];7(1B&&!1B.24)1B=16;1B=1B||17;7(!t.18("//")){1B=1B.4H;t=t.2U(2,t.I)}J 7(!t.18("/")){1B=1B.4H;t=t.2U(1,t.I);7(t.18("/")>=1)t=t.2U(t.18("/"),t.I)}B L=[1B],2c=[],2T=16;22(t&&2T!=t){B r=[];2T=t;t=6.35(t).1R(/^\\/\\//i,"");B 3B=12;B 1J=/^[\\/>]\\s*([a-2m-9*-]+)/i;B m=1J.2Q(t);7(m){6.K(L,u(){P(B c=q.1b;c;c=c.2e)7(c.24==1&&(6.1f(c,m[1])||m[1]=="*"))r.1g(c)});L=r;t=t.1R(1J,"");7(t.18(" ")==0)5F;3B=U}J{P(B i=0;i<6.1Q.I;i+=2){B 1J=6.1Q[i];B m=1J.2Q(t);7(m){r=L=6.31(L,6.1t(6.1Q[i+1])?6.1Q[i+1]:u(a){v 40(6.1Q[i+1])});t=6.35(t.1R(1J,""));3B=U;3O}}}7(t&&!3B){7(!t.18(",")){7(L[0]==1B)L.4L();6.2k(2c,L);r=L=[1B];t=" "+t.2U(1,t.I)}J{B 34=/^([a-2m-3C-]+)(#)([a-2m-9\\\\*2S-]*)/i;B m=34.2Q(t);7(m){m=[0,m[2],m[3],m[1]]}J{34=/^([#.]?)([a-2m-9\\\\*2S-]*)/i;m=34.2Q(t)}7(m[1]=="#"&&L[L.I-1].4X){B 2l=L[L.I-1].4X(m[2]);7(6.W.1j&&2l&&2l.2J!=m[2])2l=6(\'[@2J="\'+m[2]+\'"]\',L[L.I-1])[0];L=r=2l&&(!m[3]||6.1f(2l,m[3]))?[2l]:[]}J{7(m[1]==".")B 4r=1p 4v("(^|\\\\s)"+m[2]+"(\\\\s|$)");6.K(L,u(){B 3E=m[1]!=""||m[0]==""?"*":m[2];7(6.1f(q,"7J")&&3E=="*")3E="3g";6.2k(r,m[1]!=""&&L.I!=1?6.4x(q,[],m[1],m[2],4r):q.5J(3E))});7(m[1]=="."&&L.I==1)r=6.2q(r,u(e){v 4r.1n(e.19)});7(m[1]=="#"&&L.I==1){B 5K=r;r=[];6.K(5K,u(){7(q.36("2J")==m[2]){r=[q];v 12}})}L=r}t=t.1R(34,"")}}7(t){B 1a=6.1D(t,r);L=r=1a.r;t=6.35(1a.t)}}7(L&&L[0]==1B)L.4L();6.2k(2c,L);v 2c},1D:u(t,r,2g){22(t&&/^[a-z[({<*:.#]/i.1n(t)){B p=6.5M,m;6.K(p,u(i,1J){m=1J.2Q(t);7(m){t=t.7M(m[0].I);7(6.1s[m[1]].4u)m=6.1s[m[1]].4u(m);v 12}});7(m[1]==":"&&m[2]=="2g")r=6.1D(m[3],r,U).r;J 7(m[1]=="."){B 1J=1p 4v("(^|\\\\s)"+m[2]+"(\\\\s|$)");r=6.2q(r,u(e){v 1J.1n(e.19||"")},2g)}J{B f=6.1s[m[1]];7(1C f!="23")f=6.1s[m[1]][m[2]];40("f = u(a,i){"+(6.1s[m[1]].5P||"")+"v "+f+"}");r=6.2q(r,f,2g)}}v{r:r,t:t}},4x:u(o,r,1Q,Y,1J){P(B s=o.1b;s;s=s.2e)7(s.24==1){B 1M=U;7(1Q==".")1M=s.19&&1J.1n(s.19);J 7(1Q=="#")1M=s.36("2J")==Y;7(1M)r.1g(s);7(1Q=="#"&&r.I)3O;7(s.1b)6.4x(s,r,1Q,Y,1J)}v r},4z:u(D){B 4A=[];B Q=D.11;22(Q&&Q!=17){4A.1g(Q);Q=Q.11}v 4A},2a:u(Q,1i,3Z,D){1i=1i||1;B 1T=0;P(;Q;Q=Q[3Z]){7(Q.24==1)1T++;7(1T==1i||1i=="5R"&&1T%2==0&&1T>1&&Q==D||1i=="5S"&&1T%2==1&&Q==D)v Q}},2B:u(n,D){B r=[];P(;n;n=n.2e){7(n.24==1&&(!D||n!=D))r.1g(n)}v r}});6.G={1M:u(S,C,1o,F){7(6.W.1j&&S.3L!=T)S=1w;7(F)1o.F=F;7(!1o.2A)1o.2A=q.2A++;7(!S.$1H)S.$1H={};B 38=S.$1H[C];7(!38){38=S.$1H[C]={};7(S["39"+C])38[0]=S["39"+C]}38[1o.2A]=1o;S["39"+C]=q.5Y;7(!q.1k[C])q.1k[C]=[];q.1k[C].1g(S)},2A:1,1k:{},2f:u(S,C,1o){7(S.$1H){B i,j,k;7(C&&C.C){1o=C.1o;C=C.C}7(C&&S.$1H[C])7(1o)5U S.$1H[C][1o.2A];J P(i 1x S.$1H[C])5U S.$1H[C][i];J P(j 1x S.$1H)q.2f(S,j);P(k 1x S.$1H[C])7(k){k=U;3O}7(!k)S["39"+C]=16}},1S:u(C,F,S){F=6.3M(F||[]);7(!S)6.K(q.1k[C]||[],u(){6.G.1S(C,F,q)});J{B 1o=S["39"+C],1a,E=6.1t(S[C]);7(1o){F.61(q.2j({C:C,1O:S}));7((1a=1o.14(S,F))!==12)q.4F=U}7(E&&1a!==12)S[C]();q.4F=12}},5Y:u(G){7(1C 6=="T"||6.G.4F)v;G=6.G.2j(G||1w.G||{});B 3R;B c=q.$1H[G.C];B 1E=[].3N.3n(1A,1);1E.61(G);P(B j 1x c){1E[0].1o=c[j];1E[0].F=c[j].F;7(c[j].14(q,1E)===12){G.2n();G.2H();3R=12}}7(6.W.1j)G.1O=G.2n=G.2H=G.1o=G.F=16;v 3R},2j:u(G){7(!G.1O&&G.63)G.1O=G.63;7(G.65==T&&G.67!=T){B e=17.4H,b=17.64;G.65=G.67+(e.68||b.68);G.7Y=G.7Z+(e.6c||b.6c)}7(6.W.2N&&G.1O.24==3){B 3a=G;G=6.1z({},3a);G.1O=3a.1O.11;G.2n=u(){v 3a.2n()};G.2H=u(){v 3a.2H()}}7(!G.2n)G.2n=u(){q.3R=12};7(!G.2H)G.2H=u(){q.82=U};v G}};6.E.1z({3U:u(C,F,E){v q.K(u(){6.G.1M(q,C,E||F,F)})},6u:u(C,F,E){v q.K(u(){6.G.1M(q,C,u(G){6(q).6f(G);v(E||F).14(q,1A)},F)})},6f:u(C,E){v q.K(u(){6.G.2f(q,C,E)})},1S:u(C,F){v q.K(u(){6.G.1S(C,F,q)})},3X:u(){B a=1A;v q.6j(u(e){q.4M=q.4M==0?1:0;e.2n();v a[q.4M].14(q,[e])||12})},83:u(f,g){u 4O(e){B p=(e.C=="41"?e.84:e.85)||e.86;22(p&&p!=q)2G{p=p.11}2w(e){p=q};7(p==q)v 12;v(e.C=="41"?f:g).14(q,[e])}v q.41(4O).6k(4O)},27:u(f){7(6.3W)f.14(17,[6]);J{6.3c.1g(u(){v f.14(q,[6])})}v q}});6.1z({3W:12,3c:[],27:u(){7(!6.3W){6.3W=U;7(6.3c){6.K(6.3c,u(){q.14(17)});6.3c=16}7(6.W.3h||6.W.3f)17.87("6o",6.27,12)}}});1p u(){6.K(("88,8a,2O,8b,8d,52,6j,8e,"+"8f,8g,8h,41,6k,8j,42,"+"4R,8k,8l,8m,2C").3o(","),u(i,o){6.E[o]=u(f){v f?q.3U(o,f):q.1S(o)}});7(6.W.3h||6.W.3f)17.8n("6o",6.27,12);J 7(6.W.1j){17.8o("<8r"+"8s 2J=62 8u=U "+"3e=//:><\\/2d>");B 2d=17.4X("62");7(2d)2d.37=u(){7(q.3D!="1X")v;q.11.33(q);6.27()};2d=16}J 7(6.W.2N)6.50=3L(u(){7(17.3D=="8y"||17.3D=="1X"){4p(6.50);6.50=16;6.27()}},10);6.G.1M(1w,"2O",6.27)};7(6.W.1j)6(1w).6u("52",u(){B 1k=6.G.1k;P(B C 1x 1k){B 4Z=1k[C],i=4Z.I;7(i&&C!=\'52\')6w 6.G.2f(4Z[i-1],C);22(--i)}});6.E.1z({6A:u(V,21,M){q.2O(V,21,M,1)},2O:u(V,21,M,1W){7(6.1t(V))v q.3U("2O",V);M=M||u(){};B C="5d";7(21)7(6.1t(21)){M=21;21=16}J{21=6.3g(21);C="5V"}B 4e=q;6.3v({V:V,C:C,F:21,1W:1W,1X:u(2P,15){7(15=="2M"||!1W&&15=="5L")4e.1I("2t",2P.3G).4V().K(M,[2P.3G,15,2P]);J M.14(4e,[2P.3G,15,2P])}});v q},6B:u(){v 6.3g(q)},4V:u(){v q.2o("2d").K(u(){7(q.3e)6.59(q.3e);J 6.4a(q.2L||q.6H||q.2t||"")}).4g()}});7(!1w.3p)3p=u(){v 1p 6I("6K.6M")};6.K("5m,5Q,5O,5W,5N,5H".3o(","),u(i,o){6.E[o]=u(f){v q.3U(o,f)}});6.1z({2b:u(V,F,M,C,1W){7(6.1t(F)){M=F;F=16}v 6.3v({V:V,F:F,2M:M,4t:C,1W:1W})},6Q:u(V,F,M,C){v 6.2b(V,F,M,C,1)},59:u(V,M){v 6.2b(V,16,M,"2d")},6S:u(V,F,M){v 6.2b(V,F,M,"6m")},6U:u(V,F,M,C){7(6.1t(F)){M=F;F={}}v 6.3v({C:"5V",V:V,F:F,2M:M,4t:C})},6X:u(29){6.3q.29=29},6Y:u(5c){6.1z(6.3q,5c)},3q:{1k:U,C:"5d",29:0,5r:"70/x-73-3w-77",5h:U,48:U,F:16},3S:{},3v:u(s){s=6.1z({},6.3q,s);7(s.F){7(s.5h&&1C s.F!="23")s.F=6.3g(s.F);7(s.C.4m()=="2b"){s.V+=((s.V.18("?")>-1)?"&":"?")+s.F;s.F=16}}7(s.1k&&!6.4E++)6.G.1S("5m");B 4y=12;B N=1p 3p();N.7j(s.C,s.V,s.48);7(s.F)N.3A("7l-7m",s.5r);7(s.1W)N.3A("7o-4K-7q",6.3S[s.V]||"7s, 7t 7w 7x 4o:4o:4o 7z");N.3A("X-7B-7C","3p");7(N.7E)N.3A("7F","7G");7(s.5G)s.5G(N);7(s.1k)6.G.1S("5H",[N,s]);B 37=u(4s){7(N&&(N.3D==4||4s=="29")){4y=U;7(3I){4p(3I);3I=16}B 15;2G{15=6.5Z(N)&&4s!="29"?s.1W&&6.69(N,s.V)?"5L":"2M":"2C";7(15!="2C"){B 3F;2G{3F=N.4P("6b-4K")}2w(e){}7(s.1W&&3F)6.3S[s.V]=3F;B F=6.6i(N,s.4t);7(s.2M)s.2M(F,15);7(s.1k)6.G.1S("5N",[N,s])}J 6.3J(s,N,15)}2w(e){15="2C";6.3J(s,N,15,e)}7(s.1k)6.G.1S("5O",[N,s]);7(s.1k&&!--6.4E)6.G.1S("5Q");7(s.1X)s.1X(N,15);7(s.48)N=16}};B 3I=3L(37,13);7(s.29>0)57(u(){7(N){N.7N();7(!4y)37("29")}},s.29);2G{N.7Q(s.F)}2w(e){6.3J(s,N,16,e)}7(!s.48)37();v N},3J:u(s,N,15,e){7(s.2C)s.2C(N,15,e);7(s.1k)6.G.1S("5W",[N,s,e])},4E:0,5Z:u(r){2G{v!r.15&&7V.7W=="4G:"||(r.15>=5X&&r.15<7X)||r.15==6d||6.W.2N&&r.15==T}2w(e){}v 12},69:u(N,V){2G{B 6e=N.4P("6b-4K");v N.15==6d||6e==6.3S[V]||6.W.2N&&N.15==T}2w(e){}v 12},6i:u(r,C){B 4Q=r.4P("8c-C");B F=!C&&4Q&&4Q.18("N")>=0;F=C=="N"||F?r.8i:r.3G;7(C=="2d")6.4a(F);7(C=="6m")40("F = "+F);7(C=="4U")6("<1V>").4U(F).4V();v F},3g:u(a){B s=[];7(a.1l==2y||a.3Y)6.K(a,u(){s.1g(2x(q.Y)+"="+2x(q.O))});J P(B j 1x a)7(a[j]&&a[j].1l==2y)6.K(a[j],u(){s.1g(2x(j)+"="+2x(q))});J s.1g(2x(j)+"="+2x(a[j]));v s.6t("&")},4a:u(F){7(1w.54)1w.54(F);J 7(6.W.2N)1w.57(F,0);J 40.3n(1w,F)}});6.E.1z({1L:u(R,M){B 1G=q.1D(":1G");R?1G.26({28:"1L",3V:"1L",1d:"1L"},R,M):1G.K(u(){q.1q.1h=q.2E?q.2E:"";7(6.1m(q,"1h")=="1Z")q.1q.1h="2D"});v q},1K:u(R,M){B 3i=q.1D(":3i");R?3i.26({28:"1K",3V:"1K",1d:"1K"},R,M):3i.K(u(){q.2E=q.2E||6.1m(q,"1h");7(q.2E=="1Z")q.2E="2D";q.1q.1h="1Z"});v q},5g:6.E.3X,3X:u(E,4I){B 1E=1A;v 6.1t(E)&&6.1t(4I)?q.5g(E,4I):q.K(u(){6(q)[6(q).4l(":1G")?"1L":"1K"].14(6(q),1E)})},7a:u(R,M){v q.26({28:"1L"},R,M)},7c:u(R,M){v q.26({28:"1K"},R,M)},7f:u(R,M){v q.K(u(){B 5k=6(q).4l(":1G")?"1L":"1K";6(q).26({28:5k},R,M)})},7r:u(R,M){v q.26({1d:"1L"},R,M)},7u:u(R,M){v q.26({1d:"1K"},R,M)},7y:u(R,43,M){v q.26({1d:43},R,M)},26:u(H,R,1v,M){v q.1F(u(){q.2F=6.1z({},H);B 1u=6.R(R,1v,M);P(B p 1x H){B e=1p 6.3b(q,1u,p);7(H[p].1l==3Q)e.2s(e.Q(),H[p]);J e[H[p]](H)}})},1F:u(C,E){7(!E){E=C;C="3b"}v q.K(u(){7(!q.1F)q.1F={};7(!q.1F[C])q.1F[C]=[];q.1F[C].1g(E);7(q.1F[C].I==1)E.14(q)})}});6.1z({R:u(R,1v,E){B 1u=R&&R.1l==7K?R:{1X:E||!E&&1v||6.1t(R)&&R,25:R,1v:E&&1v||1v&&1v.1l!=4w&&1v};1u.25=(1u.25&&1u.25.1l==3Q?1u.25:{7R:7S,7T:5X}[1u.25])||7U;1u.1N=1u.1X;1u.1X=u(){6.6a(q,"3b");7(6.1t(1u.1N))1u.1N.14(q)};v 1u},1v:{},1F:{},6a:u(D,C){C=C||"3b";7(D.1F&&D.1F[C]){D.1F[C].4L();B f=D.1F[C][0];7(f)f.14(D)}},3b:u(D,1e,H){B z=q;B y=D.1q;B 4D=6.1m(D,"1h");y.5T="1G";z.a=u(){7(1e.49)1e.49.14(D,[z.2p]);7(H=="1d")6.1I(y,"1d",z.2p);J 7(6l(z.2p))y[H]=6l(z.2p)+"4S";y.1h="2D"};z.6v=u(){v 4T(6.1m(D,H))};z.Q=u(){B r=4T(6.30(D,H));v r&&r>-8z?r:z.6v()};z.2s=u(4f,43){z.4J=(1p 5o()).5w();z.2p=4f;z.a();z.4q=3L(u(){z.49(4f,43)},13)};z.1L=u(){7(!D.1y)D.1y={};D.1y[H]=q.Q();1e.1L=U;z.2s(0,D.1y[H]);7(H!="1d")y[H]="5a"};z.1K=u(){7(!D.1y)D.1y={};D.1y[H]=q.Q();1e.1K=U;z.2s(D.1y[H],0)};z.3X=u(){7(!D.1y)D.1y={};D.1y[H]=q.Q();7(4D=="1Z"){1e.1L=U;7(H!="1d")y[H]="5a";z.2s(0,D.1y[H])}J{1e.1K=U;z.2s(D.1y[H],0)}};z.49=u(32,47){B t=(1p 5o()).5w();7(t>1e.25+z.4J){4p(z.4q);z.4q=16;z.2p=47;z.a();7(D.2F)D.2F[H]=U;B 2c=U;P(B i 1x D.2F)7(D.2F[i]!==U)2c=12;7(2c){y.5T="";y.1h=4D;7(6.1m(D,"1h")=="1Z")y.1h="2D";7(1e.1K)y.1h="1Z";7(1e.1K||1e.1L)P(B p 1x D.2F)7(p=="1d")6.1I(y,p,D.1y[p]);J y[p]=""}7(2c&&6.1t(1e.1X))1e.1X.14(D)}J{B n=t-q.4J;B p=n/1e.25;z.2p=1e.1v&&6.1v[1e.1v]?6.1v[1e.1v](p,n,32,(47-32),1e.25):((-6h.7O(p*6h.8L)/2)+0.5)*(47-32)+32;z.a()}}}})}',62,545,'||||||jQuery|if|||||||||||||||||||this||||function|return||||||var|type|elem|fn|data|event|prop|length|else|each|ret|callback|xml|value|for|cur|speed|element|undefined|true|url|browser||name|||parentNode|false||apply|status|null|document|indexOf|className|val|firstChild|obj|opacity|options|nodeName|push|display|result|msie|global|constructor|css|test|handler|new|style|arg|expr|isFunction|opt|easing|window|in|orig|extend|arguments|context|typeof|filter|args|queue|hidden|events|attr|re|hide|show|add|old|target|table|token|replace|trigger|num|elems|div|ifModified|complete|key|none|tbody|params|while|string|nodeType|duration|animate|ready|height|timeout|nth|get|done|script|nextSibling|remove|not|index|tb|fix|merge|oid|z0|preventDefault|find|now|grep|pushStack|custom|innerHTML|first|cssFloat|catch|encodeURIComponent|Array|el|guid|sibling|error|block|oldblock|curAnim|try|stopPropagation|childNodes|id|wrap|text|success|safari|load|res|exec|al|_|last|substr|has|disabled|insertBefore|selected|checked|curCSS|map|firstNum|removeChild|re2|trim|getAttribute|onreadystatechange|handlers|on|originalEvent|fx|readyList|parPos|src|opera|param|mozilla|visible|domManip|clean|cloneNode|tr|call|split|XMLHttpRequest|ajaxSettings|append|child|String|empty|ajax|form|button|inArray|multiFilter|setRequestHeader|foundToken|9_|readyState|tag|modRes|responseText|second|ival|handleError|toUpperCase|setInterval|makeArray|slice|break|oWidth|Number|returnValue|lastModified|styleFloat|bind|width|isReady|toggle|jquery|dir|eval|mouseover|select|to|defaultView|position|oHeight|lastNum|async|step|globalEval|static|pos|swap|self|from|end|float|alpha|radio|inv|is|toLowerCase|visibility|00|clearInterval|timer|rec|isTimeout|dataType|_resort|RegExp|Function|getAll|requestDone|parents|matched|isXMLDoc|appendChild|oldDisplay|active|triggered|file|documentElement|fn2|startTime|Modified|shift|lastToggle|deep|handleHover|getResponseHeader|ct|submit|px|parseFloat|html|evalScripts|getComputedStyle|getElementById|clone|els|safariTimer|currentStyle|unload|force|execScript|getPropertyValue|newProp|setTimeout|zoom|getScript|1px|sl|settings|GET|rl|check|_toggle|processData|prepend|before|state|removeAttr|ajaxStart|lt|Date|gt|eq|contentType|previousSibling|after|parent|contains|getTime|checkbox|password|appendTo|image|reset|input|webkit|href|continue|beforeSend|ajaxSend|ownerDocument|getElementsByTagName|tmp|notmodified|parse|ajaxSuccess|ajaxComplete|_prefix|ajaxStop|even|odd|overflow|delete|POST|ajaxError|200|handle|httpSuccess|nodeValue|unshift|__ie_init|srcElement|body|pageX|tagName|clientX|scrollLeft|httpNotModified|dequeue|Last|scrollTop|304|xmlRes|unbind|100|Math|httpData|click|mouseout|parseInt|json|createElement|DOMContentLoaded|prevObject|ol|setArray|exclude|join|one|max|do|relative|clientHeight|clientWidth|loadIfModified|serialize|toString|thead|tfoot|td|th|textContent|ActiveXObject|htmlFor|Microsoft|class|XMLHTTP|readOnly|gi|match|getIfModified|9999|getJSON|getAttributeNode|post|setAttribute|ig|ajaxTimeout|ajaxSetup|concat|application|userAgent|compatible|www|compatMode|CSS1Compat|next|urlencoded|siblings|children|slideDown|prependTo|slideUp|Top|insertAfter|slideToggle|removeAttribute|addClass|removeClass|open|toggleClass|Content|Type|lastChild|If|only|Since|fadeIn|Thu|01|fadeOut|enabled|Jan|1970|fadeTo|GMT|textarea|Requested|With|prev|overrideMimeType|Connection|close|boxModel|right|object|Object|navigator|substring|abort|cos|font|send|slow|600|fast|400|location|protocol|300|pageY|clientY|method|action|cancelBubble|hover|fromElement|toElement|relatedTarget|removeEventListener|blur|readonly|focus|resize|content|scroll|dblclick|mousedown|mouseup|mousemove|responseXML|change|keydown|keypress|keyup|addEventListener|write|prototype|size|scr|ipt|createTextNode|defer|FORM|reverse|noConflict|loaded|10000|weight|line|Bottom|Right|Left|padding|border|Width|offsetHeight|offsetWidth|absolute|PI|left'.split('|'),0,{}))


/* json.js */





SimileAjax.JSON=new Object();

(function(){
var m={
'\b':'\\b',
'\t':'\\t',
'\n':'\\n',
'\f':'\\f',
'\r':'\\r',
'"':'\\"',
'\\':'\\\\'
};
var s={
array:function(x){
var a=['['],b,f,i,l=x.length,v;
for(i=0;i<l;i+=1){
v=x[i];
f=s[typeof v];
if(f){
v=f(v);
if(typeof v=='string'){
if(b){
a[a.length]=',';
}
a[a.length]=v;
b=true;
}
}
}
a[a.length]=']';
return a.join('');
},
'boolean':function(x){
return String(x);
},
'null':function(x){
return"null";
},
number:function(x){
return isFinite(x)?String(x):'null';
},
object:function(x){
if(x){
if(x instanceof Array){
return s.array(x);
}
var a=['{'],b,f,i,v;
for(i in x){
v=x[i];
f=s[typeof v];
if(f){
v=f(v);
if(typeof v=='string'){
if(b){
a[a.length]=',';
}
a.push(s.string(i),':',v);
b=true;
}
}
}
a[a.length]='}';
return a.join('');
}
return'null';
},
string:function(x){
if(/["\\\x00-\x1f]/.test(x)){
x=x.replace(/([\x00-\x1f\\"])/g,function(a,b){
var c=m[b];
if(c){
return c;
}
c=b.charCodeAt();
return'\\u00'+
Math.floor(c/16).toString(16)+
(c%16).toString(16);
});
}
return'"'+x+'"';
}
};

SimileAjax.JSON.toJSONString=function(o){
if(o instanceof Object){
return s.object(o);
}else if(o instanceof Array){
return s.array(o);
}else{
return o.toString();
}
};

SimileAjax.JSON.parseJSON=function(){
try{
return!(/[^,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]/.test(
this.replace(/"(\\.|[^"\\])*"/g,'')))&&
eval('('+this+')');
}catch(e){
return false;
}
};
})();


/* string.js */



String.prototype.trim=function(){
return this.replace(/^\s+|\s+$/,'');
};

String.prototype.startsWith=function(prefix){
return this.length>=prefix.length&&this.substr(0,prefix.length)==prefix;
};

String.prototype.endsWith=function(suffix){
return this.length>=suffix.length&&this.substr(this.length-suffix.length)==suffix;
};

String.substitute=function(s,objects){
var result="";
var start=0;
while(start<s.length-1){
var percent=s.indexOf("%",start);
if(percent<0||percent==s.length-1){
break;
}else if(percent>start&&s.charAt(percent-1)=="\\"){
result+=s.substring(start,percent-1)+"%";
start=percent+1;
}else{
var n=parseInt(s.charAt(percent+1));
if(isNaN(n)||n>=objects.length){
result+=s.substring(start,percent+2);
}else{
result+=s.substring(start,percent)+objects[n].toString();
}
start=percent+2;
}
}

if(start<s.length){
result+=s.substring(start);
}
return result;
};


/* window-manager.js */



SimileAjax.WindowManager={
_initialized:false,
_listeners:[],

_draggedElement:null,
_draggedElementCallback:null,
_dropTargetHighlightElement:null,
_lastCoords:null,
_ghostCoords:null,
_draggingMode:"",
_dragging:false,

_layers:[]
};

SimileAjax.WindowManager.initialize=function(){
if(SimileAjax.WindowManager._initialized){
return;
}

SimileAjax.DOM.registerEvent(document.body,"click",SimileAjax.WindowManager._onBodyClick);
SimileAjax.DOM.registerEvent(document.body,"mousemove",SimileAjax.WindowManager._onBodyMouseMove);
SimileAjax.DOM.registerEvent(document.body,"mouseup",SimileAjax.WindowManager._onBodyMouseUp);
SimileAjax.DOM.registerEvent(document,"keydown",SimileAjax.WindowManager._onBodyKeyDown);
SimileAjax.DOM.registerEvent(document,"keyup",SimileAjax.WindowManager._onBodyKeyUp);

SimileAjax.WindowManager._layers.push({index:0});

SimileAjax.WindowManager._historyListener={
onBeforeUndoSeveral:function(){},
onAfterUndoSeveral:function(){},
onBeforeUndo:function(){},
onAfterUndo:function(){},

onBeforeRedoSeveral:function(){},
onAfterRedoSeveral:function(){},
onBeforeRedo:function(){},
onAfterRedo:function(){}
};
SimileAjax.History.addListener(SimileAjax.WindowManager._historyListener);

SimileAjax.WindowManager._initialized=true;
};

SimileAjax.WindowManager.getBaseLayer=function(){
SimileAjax.WindowManager.initialize();
return SimileAjax.WindowManager._layers[0];
};

SimileAjax.WindowManager.getHighestLayer=function(){
SimileAjax.WindowManager.initialize();
return SimileAjax.WindowManager._layers[SimileAjax.WindowManager._layers.length-1];
};

SimileAjax.WindowManager.registerEventWithObject=function(elmt,eventName,obj,handlerName,layer){
SimileAjax.WindowManager.registerEvent(
elmt,
eventName,
function(elmt2,evt,target){
return obj[handlerName].call(obj,elmt2,evt,target);
},
layer
);
};

SimileAjax.WindowManager.registerEvent=function(elmt,eventName,handler,layer){
if(layer==null){
layer=SimileAjax.WindowManager.getHighestLayer();
}

var handler2=function(elmt,evt,target){
if(SimileAjax.WindowManager._canProcessEventAtLayer(layer)){
SimileAjax.WindowManager._popToLayer(layer.index);
try{
handler(elmt,evt,target);
}catch(e){
SimileAjax.Debug.exception(e);
}
}
SimileAjax.DOM.cancelEvent(evt);
return false;
}

SimileAjax.DOM.registerEvent(elmt,eventName,handler2);
};

SimileAjax.WindowManager.pushLayer=function(f,ephemeral){
var layer={onPop:f,index:SimileAjax.WindowManager._layers.length,ephemeral:(ephemeral)};
SimileAjax.WindowManager._layers.push(layer);

return layer;
};

SimileAjax.WindowManager.popLayer=function(layer){
for(var i=1;i<SimileAjax.WindowManager._layers.length;i++){
if(SimileAjax.WindowManager._layers[i]==layer){
SimileAjax.WindowManager._popToLayer(i-1);
break;
}
}
};

SimileAjax.WindowManager.popAllLayers=function(){
SimileAjax.WindowManager._popToLayer(0);
};

SimileAjax.WindowManager.registerForDragging=function(elmt,callback,layer){
SimileAjax.WindowManager.registerEvent(
elmt,
"mousedown",
function(elmt,evt,target){
SimileAjax.WindowManager._handleMouseDown(elmt,evt,callback);
},
layer
);
};

SimileAjax.WindowManager._popToLayer=function(level){
while(level+1<SimileAjax.WindowManager._layers.length){
try{
var layer=SimileAjax.WindowManager._layers.pop();
if(layer.onPop!=null){
layer.onPop();
}
}catch(e){
}
}
};

SimileAjax.WindowManager._canProcessEventAtLayer=function(layer){
if(layer.index==(SimileAjax.WindowManager._layers.length-1)){
return true;
}
for(var i=layer.index+1;i<SimileAjax.WindowManager._layers.length;i++){
if(!SimileAjax.WindowManager._layers[i].ephemeral){
return false;
}
}
return true;
};

SimileAjax.WindowManager._cancelPopups=function(){
var i=SimileAjax.WindowManager._layers.length-1;
while(i>0&&SimileAjax.WindowManager._layers[i].ephemeral){
i--;
}
SimileAjax.WindowManager._popToLayer(i);
};

SimileAjax.WindowManager._onBodyClick=function(elmt,evt,target){
if(!("eventPhase"in evt)||evt.eventPhase==evt.BUBBLING_PHASE){
SimileAjax.WindowManager._cancelPopups();
}
};

SimileAjax.WindowManager._handleMouseDown=function(elmt,evt,callback){
SimileAjax.WindowManager._draggedElement=elmt;
SimileAjax.WindowManager._draggedElementCallback=callback;
SimileAjax.WindowManager._lastCoords={x:evt.clientX,y:evt.clientY};

SimileAjax.DOM.cancelEvent(evt);
return false;
};

SimileAjax.WindowManager._onBodyKeyDown=function(elmt,evt,target){
if(SimileAjax.WindowManager._dragging){
if(evt.keyCode==27){
SimileAjax.WindowManager._cancelDragging();
}else if((evt.keyCode==17||evt.keyCode==16)&&SimileAjax.WindowManager._draggingMode!="copy"){
SimileAjax.WindowManager._draggingMode="copy";

var img=SimileAjax.Graphics.createTranslucentImage(SimileAjax.urlPrefix+"images/copy.png");
img.style.position="absolute";
img.style.left=(SimileAjax.WindowManager._ghostCoords.left-16)+"px";
img.style.top=(SimileAjax.WindowManager._ghostCoords.top)+"px";
document.body.appendChild(img);

SimileAjax.WindowManager._draggingModeIndicatorElmt=img;
}
}
};

SimileAjax.WindowManager._onBodyKeyUp=function(elmt,evt,target){
if(SimileAjax.WindowManager._dragging){
if(evt.keyCode==17||evt.keyCode==16){
SimileAjax.WindowManager._draggingMode="";
if(SimileAjax.WindowManager._draggingModeIndicatorElmt!=null){
document.body.removeChild(SimileAjax.WindowManager._draggingModeIndicatorElmt);
SimileAjax.WindowManager._draggingModeIndicatorElmt=null;
}
}
}
};

SimileAjax.WindowManager._onBodyMouseMove=function(elmt,evt,target){
if(SimileAjax.WindowManager._draggedElement!=null){
var callback=SimileAjax.WindowManager._draggedElementCallback;

var lastCoords=SimileAjax.WindowManager._lastCoords;
var diffX=evt.clientX-lastCoords.x;
var diffY=evt.clientY-lastCoords.y;

if(!SimileAjax.WindowManager._dragging){
if(Math.abs(diffX)>5||Math.abs(diffY)>5){
try{
if("onDragStart"in callback){
callback.onDragStart();
}

if("ghost"in callback&&callback.ghost){
var draggedElmt=SimileAjax.WindowManager._draggedElement;

SimileAjax.WindowManager._ghostCoords=SimileAjax.DOM.getPageCoordinates(draggedElmt);
SimileAjax.WindowManager._ghostCoords.left+=diffX;
SimileAjax.WindowManager._ghostCoords.top+=diffY;

var ghostElmt=draggedElmt.cloneNode(true);
ghostElmt.style.position="absolute";
ghostElmt.style.left=SimileAjax.WindowManager._ghostCoords.left+"px";
ghostElmt.style.top=SimileAjax.WindowManager._ghostCoords.top+"px";
ghostElmt.style.zIndex=1000;
SimileAjax.Graphics.setOpacity(ghostElmt,50);

document.body.appendChild(ghostElmt);
callback._ghostElmt=ghostElmt;
}

SimileAjax.WindowManager._dragging=true;
SimileAjax.WindowManager._lastCoords={x:evt.clientX,y:evt.clientY};

document.body.focus();
}catch(e){
SimileAjax.Debug.exception("WindowManager: Error handling mouse down",e);
SimileAjax.WindowManager._cancelDragging();
}
}
}else{
try{
SimileAjax.WindowManager._lastCoords={x:evt.clientX,y:evt.clientY};

if("onDragBy"in callback){
callback.onDragBy(diffX,diffY);
}

if("_ghostElmt"in callback){
var ghostElmt=callback._ghostElmt;

SimileAjax.WindowManager._ghostCoords.left+=diffX;
SimileAjax.WindowManager._ghostCoords.top+=diffY;

ghostElmt.style.left=SimileAjax.WindowManager._ghostCoords.left+"px";
ghostElmt.style.top=SimileAjax.WindowManager._ghostCoords.top+"px";
if(SimileAjax.WindowManager._draggingModeIndicatorElmt!=null){
var indicatorElmt=SimileAjax.WindowManager._draggingModeIndicatorElmt;

indicatorElmt.style.left=(SimileAjax.WindowManager._ghostCoords.left-16)+"px";
indicatorElmt.style.top=SimileAjax.WindowManager._ghostCoords.top+"px";
}

if("droppable"in callback&&callback.droppable){
var coords=SimileAjax.DOM.getEventPageCoordinates(evt);
var target=SimileAjax.DOM.hittest(
coords.x,coords.y,
[SimileAjax.WindowManager._ghostElmt,
SimileAjax.WindowManager._dropTargetHighlightElement
]
);
target=SimileAjax.WindowManager._findDropTarget(target);

if(target!=SimileAjax.WindowManager._potentialDropTarget){
if(SimileAjax.WindowManager._dropTargetHighlightElement!=null){
document.body.removeChild(SimileAjax.WindowManager._dropTargetHighlightElement);

SimileAjax.WindowManager._dropTargetHighlightElement=null;
SimileAjax.WindowManager._potentialDropTarget=null;
}

var droppable=false;
if(target!=null){
if((!("canDropOn"in callback)||callback.canDropOn(target))&&
(!("canDrop"in target)||target.canDrop(SimileAjax.WindowManager._draggedElement))){

droppable=true;
}
}

if(droppable){
var border=4;
var targetCoords=SimileAjax.DOM.getPageCoordinates(target);
var highlight=document.createElement("div");
highlight.style.border=border+"px solid yellow";
highlight.style.backgroundColor="yellow";
highlight.style.position="absolute";
highlight.style.left=targetCoords.left+"px";
highlight.style.top=targetCoords.top+"px";
highlight.style.width=(target.offsetWidth-border*2)+"px";
highlight.style.height=(target.offsetHeight-border*2)+"px";
SimileAjax.Graphics.setOpacity(highlight,30);
document.body.appendChild(highlight);

SimileAjax.WindowManager._potentialDropTarget=target;
SimileAjax.WindowManager._dropTargetHighlightElement=highlight;
}
}
}
}
}catch(e){
SimileAjax.Debug.exception("WindowManager: Error handling mouse move",e);
SimileAjax.WindowManager._cancelDragging();
}
}

SimileAjax.DOM.cancelEvent(evt);
return false;
}
};

SimileAjax.WindowManager._onBodyMouseUp=function(elmt,evt,target){
if(SimileAjax.WindowManager._draggedElement!=null){
try{
if(SimileAjax.WindowManager._dragging){
var callback=SimileAjax.WindowManager._draggedElementCallback;
if("onDragEnd"in callback){
callback.onDragEnd();
}
if("droppable"in callback&&callback.droppable){
var dropped=false;

var target=SimileAjax.WindowManager._potentialDropTarget;
if(target!=null){
if((!("canDropOn"in callback)||callback.canDropOn(target))&&
(!("canDrop"in target)||target.canDrop(SimileAjax.WindowManager._draggedElement))){

if("onDropOn"in callback){
callback.onDropOn(target);
}
target.ondrop(SimileAjax.WindowManager._draggedElement,SimileAjax.WindowManager._draggingMode);

dropped=true;
}
}

if(!dropped){

}
}
}
}finally{
SimileAjax.WindowManager._cancelDragging();
}

SimileAjax.DOM.cancelEvent(evt);
return false;
}
};

SimileAjax.WindowManager._cancelDragging=function(){
var callback=SimileAjax.WindowManager._draggedElementCallback;
if("_ghostElmt"in callback){
var ghostElmt=callback._ghostElmt;
document.body.removeChild(ghostElmt);

delete callback._ghostElmt;
}
if(SimileAjax.WindowManager._dropTargetHighlightElement!=null){
document.body.removeChild(SimileAjax.WindowManager._dropTargetHighlightElement);
SimileAjax.WindowManager._dropTargetHighlightElement=null;
}
if(SimileAjax.WindowManager._draggingModeIndicatorElmt!=null){
document.body.removeChild(SimileAjax.WindowManager._draggingModeIndicatorElmt);
SimileAjax.WindowManager._draggingModeIndicatorElmt=null;
}

SimileAjax.WindowManager._draggedElement=null;
SimileAjax.WindowManager._draggedElementCallback=null;
SimileAjax.WindowManager._potentialDropTarget=null;
SimileAjax.WindowManager._dropTargetHighlightElement=null;
SimileAjax.WindowManager._lastCoords=null;
SimileAjax.WindowManager._ghostCoords=null;
SimileAjax.WindowManager._draggingMode="";
SimileAjax.WindowManager._dragging=false;
};

SimileAjax.WindowManager._findDropTarget=function(elmt){
while(elmt!=null){
if("ondrop"in elmt){
break;
}
elmt=elmt.parentNode;
}
return elmt;
};


/* xmlhttp.js */



SimileAjax.XmlHttp=new Object();


SimileAjax.XmlHttp._onReadyStateChange=function(xmlhttp,fError,fDone){
switch(xmlhttp.readyState){





case 4:
try{
if(xmlhttp.status==0
||xmlhttp.status==200
){
if(fDone){
fDone(xmlhttp);
}
}else{
if(fError){
fError(
xmlhttp.statusText,
xmlhttp.status,
xmlhttp
);
}
}
}catch(e){
SimileAjax.Debug.exception("XmlHttp: Error handling onReadyStateChange",e);
}
break;
}
};


SimileAjax.XmlHttp._createRequest=function(){
if(SimileAjax.Platform.browser.isIE){
var programIDs=[
"Msxml2.XMLHTTP",
"Microsoft.XMLHTTP",
"Msxml2.XMLHTTP.4.0"
];
for(var i=0;i<programIDs.length;i++){
try{
var programID=programIDs[i];
var f=function(){
return new ActiveXObject(programID);
};
var o=f();






SimileAjax.XmlHttp._createRequest=f;

return o;
}catch(e){

}
}

}

try{
var f=function(){
return new XMLHttpRequest();
};
var o=f();






SimileAjax.XmlHttp._createRequest=f;

return o;
}catch(e){
throw new Error("Failed to create an XMLHttpRequest object");
}
};


SimileAjax.XmlHttp.get=function(url,fError,fDone){
var xmlhttp=SimileAjax.XmlHttp._createRequest();

xmlhttp.open("GET",url,true);
xmlhttp.onreadystatechange=function(){
SimileAjax.XmlHttp._onReadyStateChange(xmlhttp,fError,fDone);
};
xmlhttp.send(null);
};


SimileAjax.XmlHttp.post=function(url,body,fError,fDone){
var xmlhttp=SimileAjax.XmlHttp._createRequest();

xmlhttp.open("POST",url,true);
xmlhttp.onreadystatechange=function(){
SimileAjax.XmlHttp._onReadyStateChange(xmlhttp,fError,fDone);
};
xmlhttp.send(body);
};

SimileAjax.XmlHttp._forceXML=function(xmlhttp){
try{
xmlhttp.overrideMimeType("text/xml");
}catch(e){
xmlhttp.setrequestheader("Content-Type","text/xml");
}
};