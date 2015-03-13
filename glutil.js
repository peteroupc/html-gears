/*
Written by Peter O. in 2015.

Any copyright is dedicated to the Public Domain.
http://creativecommons.org/publicdomain/zero/1.0/
If you like this, you should donate to Peter O.
at: http://upokecenter.dreamhosters.com/articles/donate-now-2/
*/
var GLUtil={
renderLoop:function(func){
  func();
  var selfRefFunc=function(){
   func();
   GLUtil.callRequestFrame(selfRefFunc);
  };
  GLUtil.callRequestFrame(selfRefFunc);
},
get3DOr2DContext:function(canvasElement){
  if(!canvasElement)return null;
  var context=null;
  var options={antialias:true};
  try { context=canvasElement.getContext("webgl", options);
  } catch(e) { context=null; }
  if(!context){
    try { context=canvasElement.getContext("experimental-webgl", options);
    } catch(e) { context=null; }
  }
  if(!context){
    try { context=canvasElement.getContext("moz-webgl", options);
    } catch(e) { context=null; }
  }
  if(!context){
    try { context=canvasElement.getContext("webkit-3d", options);
    } catch(e) { context=null; }
  }
  if(!context){
    try { context=canvasElement.getContext("2d", options);
    } catch(e) { context=null; }
  }
  if(GLUtil.is3DContext(context)){
   context.getExtension("OES_element_index_uint");
   context.getExtension("EXT_texture_filter_anisotropic");
  }
  return context;
},
get3DContext:function(canvasElement,err){
  if(!canvasElement)return null;
  var c=GLUtil.get3DOr2DContext(canvasElement);
  var errmsg=null;
  if(!c && window.WebGLShader){
    errmsg="Failed to initialize graphics support required by this page.";
  } else if(window.WebGLShader && !GLUtil.is3DContext(c)){
    errmsg="This page requires WebGL, but it failed to start. Your computer might not support WebGL.";
  } else if(!c || !GLUtil.is3DContext(c)){
    errmsg="This page requires a WebGL-supporting browser.";
  }
  if(errmsg){
   (err || window.alert)(errmsg);
   return null;
  }
  return c;
},
is3DContext:function(context){
 return context && ("compileShader" in context);
},
callRequestFrame:function(func){
 var raf=window.requestAnimationFrame || window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
 if(raf){
  raf(func);
 } else {
  window.setTimeout(func,17);
 }
},
getPromiseResults:function(promises,
   progressResolve, progressReject){
 // Utility function that returns a promise that
 // resolves after the given list of promises finishes
 // its work.  The result will be an object with
 // two keys:
 // successes - contains a list of results from the
 // promises that succeeded
 // failures - contains a list of results from the
 // promises that failed
 // --- Parameters:
 // promises - an array containing promise objects
 // progressResolve - a function called as each
 //  individual promise is resolved; optional
 // progressReject - a function called as each
 //  individual promise is rejected; optional
 if(!promises || promises.length==0){
  return Promise.resolve({
    successes:[], failures:[]});
 }
 return new Promise(function(resolve, reject){
  var ret={successes:[], failures:[]};
  var totalPromises=promises.length;
  var count=0;
  for(var i=0;i<totalPromises;i++){
   var promise=promises[i];
   promise.then(function(result){
    ret.successes.push(result);
    if(progressResolve)progressResolve(result);
    count++;
    if(count==totalPromises){ resolve(ret); }
   }, function(result){
    ret.failures.push(result);
    if(progressReject)progressReject(result);
    count++;
    if(count==totalPromises){ resolve(ret); }
   });
  }
 });
},
createCube:function(){
 // Position X, Y, Z, normal NX, NY, NZ, texture U, V
 var vertices=[-1.0,-1.0,1.0,1.0,0.0,0.0,1.0,1.0,-1.0,1.0,1.0,1.0,0.0,0.0,1.0,0.0,-1.0,1.0,-1.0,1.0,0.0,0.0,0.0,0.0,-1.0,-1.0,-1.0,1.0,0.0,0.0,0.0,1.0,1.0,-1.0,-1.0,-1.0,0.0,0.0,1.0,1.0,1.0,1.0,-1.0,-1.0,0.0,0.0,1.0,0.0,1.0,1.0,1.0,-1.0,0.0,0.0,0.0,0.0,1.0,-1.0,1.0,-1.0,0.0,0.0,0.0,1.0,1.0,-1.0,-1.0,0.0,1.0,0.0,1.0,1.0,1.0,-1.0,1.0,0.0,1.0,0.0,1.0,0.0,-1.0,-1.0,1.0,0.0,1.0,0.0,0.0,0.0,-1.0,-1.0,-1.0,0.0,1.0,0.0,0.0,1.0,1.0,1.0,1.0,0.0,-1.0,0.0,1.0,1.0,1.0,1.0,-1.0,0.0,-1.0,0.0,1.0,0.0,-1.0,1.0,-1.0,0.0,-1.0,0.0,0.0,0.0,-1.0,1.0,1.0,0.0,-1.0,0.0,0.0,1.0,-1.0,-1.0,-1.0,0.0,0.0,1.0,1.0,1.0,-1.0,1.0,-1.0,0.0,0.0,1.0,1.0,0.0,1.0,1.0,-1.0,0.0,0.0,1.0,0.0,0.0,1.0,-1.0,-1.0,0.0,0.0,1.0,0.0,1.0,1.0,-1.0,1.0,0.0,0.0,-1.0,1.0,1.0,1.0,1.0,1.0,0.0,0.0,-1.0,1.0,0.0,-1.0,1.0,1.0,0.0,0.0,-1.0,0.0,0.0,-1.0,-1.0,1.0,0.0,0.0,-1.0,0.0,1.0]
 var faces=[0,1,2,0,2,3,4,5,6,4,6,7,8,9,10,8,10,11,12,13,14,12,14,15,16,17,18,16,18,19,20,21,22,20,22,23]
 return new Mesh(vertices,faces,Mesh.VEC3DNORMALUV);
},
createSphere:function(radius,div){
var radius = 1.0;
var x, y, z;
function hasSamePoints(v,a,b,c){
 return (
   (v[a]==v[b] && v[a+1]==v[b+1] && v[a+2]==v[b+2]) ||
   (v[c]==v[b] && v[c+1]==v[b+1] && v[c+2]==v[b+2]) ||
   (v[a]==v[c] && v[a+1]==v[c+1] && v[a+2]==v[c+2]));
}
if(typeof radius=="undefined")radius=1.0;
if(typeof div=="undefined")div=6;
if(div<=0)throw new Error("div must be 1 or more")
var divisions=1<<div;
var da=(180.0/divisions);
var aCache=[];
var adaCache=[];
var bCache=[];
var tris=[];
var vertices=[];
var newStrip;
for (var i=divisions-1;i>=0;i--) {
 var a=-90.0+(180.0*i/divisions);
 if(i==0){
  aCache[0]=0; // cos(-90deg)
  aCache[1]=-1; // sin(-90deg)
 } else {
  var rada=Math.PI/180*a;
  var ca=Math.cos(rada);
  var sa=Math.sin(rada);
  aCache[i*2]=ca;
  aCache[i*2+1]=sa;
 }
 if(i==divisions-1){
  adaCache[i*2]=0; // cos(90deg)
  adaCache[i*2+1]=1; // sin(90deg)
 } else {
  adaCache[i*2]=aCache[i*2+2];
  adaCache[i*2+1]=aCache[i*2+3];
 }
}
bCache[0]=1; // cos(0deg)
bCache[1]=0; // sin(0deg)
for (var i=1;i<divisions*2;i++) {
 var b=(360.0*i/divisions);
 var radb=Math.PI/180*b;
 var cb=Math.cos(radb);
 var sb=Math.sin(radb);
 bCache.push(cb,sb);
}
for (var i=0;i<divisions;i++) {
newStrip=true;
var ca=aCache[i*2];
var sa=aCache[i*2+1];
var cada=adaCache[i*2];
var sada=adaCache[i*2+1];
var ty1=i*1.0/divisions;
var ty2=(i+1)*1.0/divisions;
var oldtx1=0;
var oldtx2=0;
for (var j=0;j<divisions*2;j++) {
var cb=bCache[j*2];
var sb=bCache[j*2+1];
var tx1=tx2;
var tx2=(divisions-j)*1.0/(divisions);
tx2-=0.25;
if(tx2<0)tx2+=1;
x = -cb * ca;
y = sa;
z = sb * ca;
// set position and normal
vertices.push(radius*x,radius*y,radius*z,-x,-y,-z,0,0);
x = -cb * cada;
y = sada;
z = sb * cada;
vertices.push(radius*x,radius*y,radius*z,-x,-y,-z,0,0);
if(!newStrip){
  var index=(vertices.length/8)-4;
  var start=index*8;
  var startTex=start+6;
  // set texture coordinates
  vertices[startTex]=tx1;
  vertices[startTex+1]=ty1;
  vertices[startTex+8]=tx1;
  vertices[startTex+9]=ty2;
  vertices[startTex+16]=tx2;
  vertices[startTex+17]=ty2;
  vertices[startTex+24]=tx2;
  vertices[startTex+25]=ty1;
  if(i==0 || i==divisions-1){
    // if this is a polar zone it's possible for two vertices
    // of a triangle to be the same, so prune triangles
    // that have at least two matching vertices
   if(!hasSamePoints(vertices,start,start+8,start+16)){
    tris.push(index,index+1,index+2);
   }
   if(!hasSamePoints(vertices,start+8,start+16,start+24)){
    tris.push(index+2,index+1,index+3);
   }
  } else {
   tris.push(index,index+1,index+2,index+2,index+1,index+3);
  }
}
newStrip=false;
}
}
return new Mesh(vertices,tris,Mesh.VEC3DNORMALUV);
},
loadFileFromUrl:function(url){
 var urlstr=url;
 return new Promise(function(resolve, reject){
   var xhr=new XMLHttpRequest();
   xhr.onreadystatechange=function(e){
    var t=e.target;
    if(t.readyState==4){
     if(t.status>=200 && t.status<300){
      var resp=t.response
      if(!resp)resp=t.responseText
      resolve({url: urlstr, text: resp+""});
     } else {
      reject({url: urlstr});
     }
    }
   };
   xhr.open("get", url, true);
   xhr.send();
 });
}
};

(function(exports){

var hlsToRgb=function(hls) {
 "use strict";
var hueval=hls[0]*1.0;//[0-360)
 var lum=hls[1]*1.0;//[0-255]
 var sat=hls[2]*1.0;//[0-255]
 lum=(lum<0 ? 0 : (lum>255 ? 255 : lum));
 sat=(sat<0 ? 0 : (sat>255 ? 255 : sat));
 if(sat===0){
  return [lum,lum,lum];
 }
 var b=0;
 if (lum<=127.5){
  b=(lum*(255.0+sat))/255.0;
 } else {
  b=lum*sat;
  b=b/255.0;
  b=lum+sat-b;
 }
 var a=(lum*2)-b;
 var r,g,bl;
 if(hueval<0||hueval>=360)hueval=(((hueval%360)+360)%360);
 var hue=hueval+120;
 if(hue>=360)hue-=360;
 if (hue<60) r=(a+(b-a)*hue/60);
 else if (hue<180) r=b;
 else if (hue<240) r=(a+(b-a)*(240-hue)/60);
 else r=a;
 hue=hueval;
 if (hue<60) g=(a+(b-a)*hue/60);
 else if (hue<180) g=b;
 else if (hue<240) g=(a+(b-a)*(240-hue)/60);
 else g=a;
 hue=hueval-120;
 if(hue<0)hue+=360;
 if (hue<60) bl=(a+(b-a)*hue/60);
 else if (hue<180) bl=b;
 else if (hue<240) bl=(a+(b-a)*(240-hue)/60);
 else bl=a;
 return [(r<0 ? 0 : (r>255 ? 255 : r)),
   (g<0 ? 0 : (g>255 ? 255 : g)),
   (bl<0 ? 0 : (bl>255 ? 255 : bl))];
}
// Converts a representation of a color to its RGB form
// Returns a 4-item array containing the intensity of red,
// green, blue, and alpha (each from 0-255)
// Returns null if the color can't be converted
exports["colorToRgba"]=function(x){
 "use strict";
 function parsePercent(x){ var c; return ((c=parseFloat(x))<0 ? 0 : (c>100 ? 100 : c))*255/100; }
 function parseAlpha(x){ var c; return ((c=parseFloat(x))<0 ? 0 : (c>1 ? 1 : c))*255; }
 function parseByte(x){ var c; return ((c=parseInt(x,10))<0 ? 0 : (c>255 ? 255 : c)); }
 function parseHue(x){ var r1=parseFloat(e[1]);if(r1<0||r1>=360)r1=(((r1%360)+360)%360); return r1; }
var e=null;
 if(!x)return null;
 var b,c,r1,r2,r3,r4,rgb;
 if((e=(/^#([A-Fa-f0-9]{2})([A-Fa-f0-9]{2})([A-Fa-f0-9]{2})$/.exec(x)))!==null){
  return [parseInt(e[1],16),parseInt(e[2],16),parseInt(e[3],16),255];
 } else if((e=(/^rgb\(\s*([\+\-]?\d+(?:\.\d+)?%)\s*,\s*([\+\-]?\d+(?:\.\d+)?%)\s*,\s*([\+\-]?\d+(?:\.\d+)?%)\s*\)$/.exec(x)))!==null){
  return [parsePercent(e[1]),parsePercent(e[2]),parsePercent(e[3]),255];
 } else if((e=(/^rgb\(\s*([\+\-]?\d+)\s*,\s*([\+\-]?\d+)\s*,\s*([\+\-]?\d+)\s*\)$/.exec(x)))!==null){
  return [parseByte(e[1]),parseByte(e[2]),parseByte(e[3]),255];
 } else if((e=(/^rgba\(\s*([\+\-]?\d+(?:\.\d+)?%)\s*,\s*([\+\-]?\d+(?:\.\d+)?%)\s*,\s*([\+\-]?\d+(?:\.\d+)?%)\s*,\s*([\+\-]?\d+(?:\.\d+)?)\s*\)$/.exec(x)))!==null){
  return [parsePercent(e[1]),parsePercent(e[2]),parsePercent(e[3]),parseAlpha(e[4])];
 } else if((e=(/^rgba\(\s*([\+\-]?\d+)\s*,\s*([\+\-]?\d+)\s*,\s*([\+\-]?\d+)\s*,\s*([\+\-]?\d+(?:\.\d+)?)\s*\)$/.exec(x)))!==null){
  return [parseByte(e[1]),parseByte(e[2]),parseByte(e[3]),parseAlpha(e[4])];
 } else if((e=(/^#([A-Fa-f0-9]{1})([A-Fa-f0-9]{1})([A-Fa-f0-9]{1})$/.exec(x)))!==null){
  var a=parseInt(e[1],16); b=parseInt(e[2],16); c=parseInt(e[3],16);
  return [a+(a<<4),b+(b<<4),c+(c<<4),255];
 } else if((e=(/^hsl\(\s*([\+\-]?\d+(?:\.\d+)?)\s*,\s*([\+\-]?\d+(?:\.\d+)?)%\s*,\s*([\+\-]?\d+(?:\.\d+)?)%\s*\)$/.exec(x)))!==null){
  rgb=hlsToRgb([parseHue(e[1]),parsePercent(e[3]),parsePercent(e[2])]);
  return [rgb[0],rgb[1],rgb[2],255];
 } else if((e=(/^hsla\(\s*([\+\-]?\d+(?:\.\d+)?)\s*,\s*([\+\-]?\d+(?:\.\d+)?)%\s*,\s*([\+\-]?\d+(?:\.\d+)?)%\s*,\s*([\+\-]?\d+(?:\.\d+)?)\s*\)$/.exec(x)))!==null){
  rgb=hlsToRgb([parseHue(e[1]),parsePercent(e[3]),parsePercent(e[2])]);
  return [rgb[0],rgb[1],rgb[2],parseAlpha(e[4])];
 } else {
  setUpNamedColors();
  x=x.toLowerCase();
  if(x.indexOf("grey")>=0)x=x.replace("grey","gray");// support "grey" variants
  var ret=namedColors[x];
  if(typeof ret==="string")return exports["colorToRgba"](ret);
  if(x==="transparent")return [0,0,0,0];
  return null;
 }
}
exports["toGLColor"]=function(r,g,b,a){
 if(r==null)return [0,0,0,0];
 if(typeof r=="string"){
   var rgba=exports["colorToRgba"](r) || [0,0,0,0];
   var mul=1.0/255;
   rgba[0]*=mul;
   rgba[1]*=mul;
   rgba[2]*=mul;
   rgba[3]*=mul;
   return rgba;
 }
 if(typeof r=="number" &&
     typeof g=="number" && typeof b=="number"){
   return [r,g,b,(typeof a!="number") ? 1.0 : a];
 } else {
   return r || [0,0,0,0];
 }
}

var namedColors=null;
var setUpNamedColors=function(){
  "use strict";
if(!namedColors){
    var nc=("aliceblue,f0f8ff,antiquewhite,faebd7,aqua,00ffff,aquamarine,7fffd4,azure,f0ffff,beige,f5f5dc,bisque,ffe4c4,black,000000,blanchedalmond,ffebcd,blue,0000ff,"+
"blueviolet,8a2be2,brown,a52a2a,burlywood,deb887,cadetblue,5f9ea0,chartreuse,7fff00,chocolate,d2691e,coral,ff7f50,cornflowerblue,6495ed,cornsilk,fff8dc,"+
"crimson,dc143c,cyan,00ffff,darkblue,00008b,darkcyan,008b8b,darkgoldenrod,b8860b,darkgray,a9a9a9,darkgreen,006400,darkkhaki,bdb76b,darkmagenta,8b008b,"+
"darkolivegreen,556b2f,darkorange,ff8c00,darkorchid,9932cc,darkred,8b0000,darksalmon,e9967a,darkseagreen,8fbc8f,darkslateblue,483d8b,darkslategray,2f4f4f,"+
"darkturquoise,00ced1,darkviolet,9400d3,deeppink,ff1493,deepskyblue,00bfff,dimgray,696969,dodgerblue,1e90ff,firebrick,b22222,floralwhite,fffaf0,forestgreen,"+
"228b22,fuchsia,ff00ff,gainsboro,dcdcdc,ghostwhite,f8f8ff,gold,ffd700,goldenrod,daa520,gray,808080,green,008000,greenyellow,adff2f,honeydew,f0fff0,hotpink,"+
"ff69b4,indianred,cd5c5c,indigo,4b0082,ivory,fffff0,khaki,f0e68c,lavender,e6e6fa,lavenderblush,fff0f5,lawngreen,7cfc00,lemonchiffon,fffacd,lightblue,add8e6,"+
"lightcoral,f08080,lightcyan,e0ffff,lightgoldenrodyellow,fafad2,lightgray,d3d3d3,lightgreen,90ee90,lightpink,ffb6c1,lightsalmon,ffa07a,lightseagreen,20b2aa,"+
"lightskyblue,87cefa,lightslategray,778899,lightsteelblue,b0c4de,lightyellow,ffffe0,lime,00ff00,limegreen,32cd32,linen,faf0e6,magenta,ff00ff,maroon,800000,"+
"mediumaquamarine,66cdaa,mediumblue,0000cd,mediumorchid,ba55d3,mediumpurple,9370d8,mediumseagreen,3cb371,mediumslateblue,7b68ee,mediumspringgreen,"+
"00fa9a,mediumturquoise,48d1cc,mediumvioletred,c71585,midnightblue,191970,mintcream,f5fffa,mistyrose,ffe4e1,moccasin,ffe4b5,navajowhite,ffdead,navy,"+
"000080,oldlace,fdf5e6,olive,808000,olivedrab,6b8e23,orange,ffa500,orangered,ff4500,orchid,da70d6,palegoldenrod,eee8aa,palegreen,98fb98,paleturquoise,"+
"afeeee,palevioletred,d87093,papayawhip,ffefd5,peachpuff,ffdab9,peru,cd853f,pink,ffc0cb,plum,dda0dd,powderblue,b0e0e6,purple,800080,rebeccapurple,663399,red,ff0000,rosybrown,"+
"bc8f8f,royalblue,4169e1,saddlebrown,8b4513,salmon,fa8072,sandybrown,f4a460,seagreen,2e8b57,seashell,fff5ee,sienna,a0522d,silver,c0c0c0,skyblue,87ceeb,"+
"slateblue,6a5acd,slategray,708090,snow,fffafa,springgreen,00ff7f,steelblue,4682b4,tan,d2b48c,teal,008080,thistle,d8bfd8,tomato,ff6347,turquoise,40e0d0,violet,"+
"ee82ee,wheat,f5deb3,white,ffffff,whitesmoke,f5f5f5,yellow,ffff00,yellowgreen,9acd32").split(",");
    namedColors={};
    for(var i=0;i<nc.length;i+=2){
     namedColors[nc[i]]="#"+nc[i+1];
    }
  }
};
})(GLUtil);

var ShaderProgram=function(context, vertexShader, fragmentShader){
 if(vertexShader==null){
  vertexShader=ShaderProgram.getDefaultVertex();
 }
 if(fragmentShader==null){
  fragmentShader=ShaderProgram.getDefaultFragment();
 }
 this.program=ShaderProgram._compileShaders(context,vertexShader,fragmentShader);
 this.attributes={};
 this.context=context;
 this.actives={};
 this.uniformTypes={};
 if(this.program!=null){
  this.attributes=[];
  var name=null;
  var ret={}
  var count= context.getProgramParameter(this.program, context.ACTIVE_ATTRIBUTES);
  for (var i = 0; i < count; ++i) {
   var attributeInfo=context.getActiveAttrib(this.program, i);
   if(attributeInfo!==null){
    name=attributeInfo.name;
    var attr=context.getAttribLocation(this.program, name);
    if(attr>=0){
     this.attributes.push(attr);
     ret[name]=attr;
    }
   }
  }
  count = context.getProgramParameter(this.program, context.ACTIVE_UNIFORMS);
  for (var i = 0; i < count; ++i) {
   var uniformInfo=context.getActiveUniform(this.program, i);
   if(uniformInfo!==null){
    name = uniformInfo.name;
    ret[name] = context.getUniformLocation(this.program, name);
    this.uniformTypes[name] = uniformInfo.type;
   }
  }
  this.actives=ret;
 }
}
ShaderProgram.prototype.getContext=function(){
 return this.context;
}
ShaderProgram.prototype.get=function(name){
 return (!this.actives.hasOwnProperty(name)) ?
   null : this.actives[name];
}
ShaderProgram.prototype.use=function(){
 this.context.useProgram(this.program);
 return this;
}
ShaderProgram.prototype.setUniforms=function(uniforms){
  for(var i in uniforms){
    if(uniforms.hasOwnProperty(i)){
      v=uniforms[i];
      var uniform=this.get(i);
      if(uniform===null)continue;
      //console.log("setting "+i+": "+v);
      if(v.length==3){
       this.context.uniform3f(uniform, v[0],v[1],v[2]);
      } else if(v.length==4){
       this.context.uniform4f(uniform, v[0],v[1],v[2],v[3]);
      } else if(v.length==16){
       this.context.uniformMatrix4fv(uniform,false,v);
      } else if(v.length==9){
       this.context.uniformMatrix3fv(uniform,false,v);
      } else {
       if(this.uniformTypes[i]==this.context.FLOAT){
        this.context.uniform1f(uniform, (typeof v=="number") ? v : v[0]);
       } else {
        this.context.uniform1i(uniform, (typeof v=="number") ? v : v[0]);
       }
      }
    }
  }
  return this;
}
ShaderProgram._compileShaders=function(context, vertexShader, fragmentShader){
  function compileShader(context, kind, text){
    var shader=context.createShader(kind);
    context.shaderSource(shader, text);
    context.compileShader(shader);
    if (!context.getShaderParameter(shader, context.COMPILE_STATUS)) {
      console.log(text);
	  	console.log((kind==context.VERTEX_SHADER ? "vertex: " : "fragment: ")+
        context.getShaderInfoLog(shader));
	  	return null;
	  }
   return shader;
  }
  var vs=(!vertexShader || vertexShader.length==0) ? null :
    compileShader(context,context.VERTEX_SHADER,vertexShader);
  var fs=(!fragmentShader || fragmentShader.length==0) ? null :
    compileShader(context,context.FRAGMENT_SHADER,fragmentShader);
  var program = null;
  if(vs!==null && fs!==null){
   program = context.createProgram();
   context.attachShader(program, vs);
   context.attachShader(program, fs);
 	 context.linkProgram(program);
   if (!context.getProgramParameter(program, context.LINK_STATUS)) {
		console.log("link: "+context.getProgramInfoLog(program));
		context.deleteProgram(program);
    program=null;
	 } else {
    context.useProgram(program);
   }
  }
  if(vs!==null)context.deleteShader(vs);
  if(fs!==null)context.deleteShader(fs);
  return program;
};
ShaderProgram.prototype.setLightSource=function(light){
 if(!light)return this;
 this.setUniforms({
 "sa":[light.ambient[0],light.ambient[1],light.ambient[2]],
 "lightPosition":light.position,
 "sd":light.diffuse,
 "ss":light.specular
 });
 return this;
}
ShaderProgram.getDefaultVertex=function(){
var shader="" +
"attribute vec3 position;\n" +
"attribute vec3 normal;\n" +
"attribute vec2 textureUV;\n" +
"attribute vec3 colorAttr;\n" +
"uniform mat4 world;\n" +
"uniform mat4 view;\n" +
"uniform mat4 projection;\n"+
"varying vec2 textureUVVar;\n"+
"varying vec3 colorAttrVar;\n" +
"#ifdef SHADING\n"+
"uniform mat3 worldInverseTrans3; /* internal */\n" +
"varying vec4 worldPositionVar;\n" +
"varying vec3 transformedNormalVar;\n"+
"#endif\n"+
"void main(){\n" +
"vec4 positionVec4=vec4(position,1.0);\n" +
"gl_Position=projection*view*world*positionVec4;\n" +
"colorAttrVar=colorAttr;\n" +
"textureUVVar=textureUV;\n" +
"#ifdef SHADING\n"+
"transformedNormalVar=normalize(worldInverseTrans3*normal);\n" +
"worldPositionVar=world*positionVec4;\n" +
"#endif\n"+
"}";
return shader;
};
ShaderProgram.getDefaultFragment=function(){
var shader="" +
"precision highp float;\n" +
 // if shading is disabled, this is solid color instead of material diffuse
 "uniform vec3 md;\n" + // material diffuse color (0-1 each component). Is multiplied by texture/solid color.
"#ifdef SHADING\n" +
"uniform mat4 viewInverse; /* internal */\n" +
"uniform vec4 lightPosition;\n" + // source light direction
"uniform vec3 sa;\n" + // source light ambient color
 "uniform vec3 ma;\n" + // material ambient color (-1 to 1 each component).
 "uniform vec3 sd;\n" + // source light diffuse color
 "uniform vec3 ss;\n" + // source light specular color
 "uniform vec3 ms;\n" + // material specular color (0-1 each comp.).  Affects how intense highlights are.
 "uniform float mshin;\n" + // material shininess
"#endif\n" +
"uniform sampler2D sampler;\n" + // texture sampler
"uniform float useTexture;\n" + // use texture sampler rather than solid color if 1
"uniform float useColorAttr;\n" + // use color attribute if 1
"varying vec2 textureUVVar;\n"+
"varying vec3 colorAttrVar;\n" +
"#ifdef SHADING\n" +
"varying vec4 worldPositionVar;\n" +
"varying vec3 transformedNormalVar;\n"+
"const vec4 white=vec4(1.0,1.0,1.0,1.0);\n"+
"#endif\n" +
"void main(){\n" +
" vec4 baseColor=mix(\n"+
"#ifdef SHADING\n" +
"   white, /*when useTexture is 0*/\n" +
"#else\n" +
"   vec4(md,1.0), /*when useTexture is 0*/\n" +
"#endif\n" +
"   texture2D(sampler,textureUVVar), /*when useTexture is 1*/\n"+
"  useTexture);\n"+
" baseColor=mix(baseColor, /* when useColorAttr is 0 */\n"+
"  vec4(colorAttrVar,1.0), /* when useColorAttr is 1 */\n" +
"  useColorAttr);\n" +
"#ifdef SHADING\n" +
"vec3 sdir;\n"+
"float attenuation;\n"+
"if(lightPosition.w == 0.0){\n" +
" sdir=normalize(vec3(lightPosition));\n" +
" attenuation=1.0;\n" +
"} else {\n"+
" vec3 vertexToLight=vec3(lightPosition-worldPositionVar);\n"+
" float dist=length(vertexToLight);\n"+
" sdir=normalize(vertexToLight);\n" +
" attenuation=1.0;\n" +
"}\n"+
"float diffInt=dot(transformedNormalVar,sdir);" +
"vec3 viewPosition=normalize(vec3(viewInverse*vec4(0,0,0,1)-worldPositionVar));\n" +
"vec3 phong=sa*ma; /* ambient*/\n" +
"if(diffInt>=0.0){\n" +
"   // specular reflection\n" +
"   phong+=(ss*ms*pow(max(dot(reflect(-sdir,transformedNormalVar)," +
"      viewPosition),0.0),mshin));\n" +
"}\n"+
" // diffuse\n"+
" phong+=sd*md*baseColor.rgb*max(0.0,dot(transformedNormalVar,sdir))*attenuation;\n" +
" baseColor=vec4(phong,baseColor.a);\n" +
"#endif\n" +
" gl_FragColor=baseColor;\n" +
"}";
return shader;
};
function LightSource(position, ambient, diffuse, specular) {
 this.ambient=ambient || [0,0,0,1.0]
 this.position=position ? [position[0],position[1],position[2],1.0] :[0, 0, 1, 0];
 this.diffuse=diffuse||[1,1,1];
 this.specular=specular||[1,1,1];
};
LightSource.directionalLight=function(position,ambient,diffuse,specular){
 var source=new LightSource()
 source.ambient=ambient || [0,0,0,1.0]
 source.position=position ? [position[0],position[1],position[2],0.0] : [0,0,1,0];
 source.diffuse=diffuse||[1,1,1];
 source.specular=specular||[1,1,1];
 return source;
};
LightSource.pointLight=function(position,ambient,diffuse,specular){
 var source=new LightSource()
 source.ambient=ambient || [0,0,0,1.0]
 source.position=position ? [position[0],position[1],position[2],1.0] : [0,0,0,0];
 source.diffuse=diffuse||[1,1,1];
 source.specular=specular||[1,1,1];
 return source
};

function MaterialShade(ambient, diffuse, specular,shininess) {
 // NOTE: A solid color is defined by setting ambient
 // and diffuse to the same value
 this.shininess=(shininess==null) ? 0 : Math.min(Math.max(0,shininess),128);
 this.ambient=ambient||[0.2,0.2,0.2];
 this.diffuse=diffuse||[0.8,0.8,0.8];
 this.specular=specular||[0,0,0];
}
MaterialShade.fromColor=function(r,g,b,a){
 var color=GLUtil["toGLColor"](r,g,b,a);
 return new MaterialShade(color,color);
}
MaterialShade.prototype.bind=function(program){
 program.setUniforms({
 "useTexture":0,
 "mshin":this.shininess,
 "ma":[this.ambient[0], this.ambient[1], this.ambient[2]],
 "md":[this.diffuse[0], this.diffuse[1], this.diffuse[2]],
 "ms":this.specular
 });
}

function Mesh(vertices,faces,format){
 this.vertices=vertices;
 this.faces=faces;
 this.format=format;
}
Mesh.VEC2D=2;
Mesh.VEC3D=3;
Mesh.VEC3DNORMALUV=6;
Mesh.VEC3DNORMAL=5;
Mesh.VEC3DCOLOR=7;
Mesh.prototype.bind=function(context){
 var vertbuffer=context.createBuffer();
 var facebuffer=context.createBuffer();
 context.bindBuffer(context.ARRAY_BUFFER, vertbuffer);
 context.bindBuffer(context.ELEMENT_ARRAY_BUFFER, facebuffer);
 context.bufferData(context.ARRAY_BUFFER,
   new Float32Array(this.vertices), context.STATIC_DRAW);
 var type=context.UNSIGNED_SHORT;
 if(this.vertices.length>=65536 || this.faces.length>=65536){
  type=context.UNSIGNED_INT;
  context.bufferData(context.ELEMENT_ARRAY_BUFFER,
    new Uint32Array(this.faces), context.STATIC_DRAW);
 } else if(this.vertices.length<=256 && this.faces.length<=256){
  type=context.UNSIGNED_BYTE;
  context.bufferData(context.ELEMENT_ARRAY_BUFFER,
    new Uint8Array(this.faces), context.STATIC_DRAW);
 } else {
  context.bufferData(context.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(this.faces), context.STATIC_DRAW);
 }
 return {verts:vertbuffer, faces:facebuffer,
   facesLength: this.faces.length, type:type, format:this.format};
}
Mesh._recalcNormals=function(vertices,faces,stride){
  for(var i=0;i<vertices.length;i+=stride){
    vertices[i+3]=0.0
    vertices[i+4]=0.0
    vertices[i+5]=0.0
  }
  for(var i=0;i<faces.length;i+=3){
    var v1=faces[i]*stride
    var v2=faces[i+1]*stride
    var v3=faces[i+2]*stride
    var n1=[vertices[v2]-vertices[v3],vertices[v2+1]-vertices[v3+1],vertices[v2+2]-vertices[v3+2]]
    var n2=[vertices[v1]-vertices[v3],vertices[v1+1]-vertices[v3+1],vertices[v1+2]-vertices[v3+2]]
    // cross multiply n1 and n2
    var x=n1[1]*n2[2]-n1[2]*n2[1]
    var y=n1[2]*n2[0]-n1[0]*n2[2]
    var z=n1[0]*n2[1]-n1[1]*n2[0]
    // normalize xyz vector
    len=Math.sqrt(x*x+y*y+z*z);
    if(len!=0){
      len=1.0/len;
      x*=len;
      y*=len;
      z*=len;
      // add normalized normal to each vertex of the face
      vertices[v1+3]+=x
      vertices[v1+4]+=y
      vertices[v1+5]+=z
      vertices[v2+3]+=x
      vertices[v2+4]+=y
      vertices[v2+5]+=z
      vertices[v3+3]+=x
      vertices[v3+4]+=y
      vertices[v3+5]+=z
    }
  }
  // Normalize each normal of the vertex
  for(var i=0;i<vertices.length;i+=stride){
    var x=vertices[i+3];
    var y=vertices[i+4];
    var z=vertices[i+5];
    len=Math.sqrt(x*x+y*y+z*z);
    if(len){
      len=1.0/len;
      vertices[i+3]=x*len;
      vertices[i+4]=y*len;
      vertices[i+5]=z*len;
    }
  }
}
Mesh.prototype.recalcNormals=function(){
  if(this.format==Mesh.VEC3DNORMAL){
   Mesh._recalcNormals(this.vertices,this.faces,6);
  } else if(this.format==Mesh.VEC3DNORMALUV){
   Mesh._recalcNormals(this.vertices,this.faces,8);
  } else {
   throw new Error("not supported");
  }
  return this;
};

var Texture=function(name){
 this.textureImage=null;
 this.name=name;
 this.material=new MaterialShade();
}
Texture._fromTextureImage=function(textureImage){
 var tex=new Texture(textureImage.name);
 tex.textureImage=textureImage;
 tex.name=textureImage.name;
 tex.material=new MaterialShade();
 return tex;
}

Texture.loadTexture=function(name, textureCache){
 // Get cached texture
 if(textureCache &&
    textureCache[name] && textureCache.hasOwnProperty(name)){
   var ret=Texture._fromTextureImage(textureCache[name]);
   return Promise.resolve(ret);
 }
 var texImage=new TextureImage(name);
 if(textureCache){
  textureCache[name]=texImage;
 }
 // Load new texture and cache it
 return texImage.loadImage().then(
  function(result){
   return Texture._fromTextureImage(result);
  },
  function(name){
    return Promise.reject(name.name);
  });
}

Texture.loadAndMapTexture=function(name, context, textureCache){
  return Texture.loadTexture(name, textureCache).then(function(result){
    return result.mapToContext(context);
  });
};
Texture.prototype.setParams=function(material){
 this.material=material;
 return this;
}
Texture.prototype.mapToContext=function(context){
 this.textureImage.mapToContext(context);
 return this;
}
Texture.prototype.bind=function(program){
 if(this.textureImage!==null){
  this.textureImage.bind(program);
 } else if(this.name!==null){
  this.textureImage=new TextureImage(this.name);
  this.textureImage.loadImage();
 }
 if(this.material){
   program.setUniforms({
  "useTexture":1.0,
  "mshin":this.material.shininess,
  "ma":[this.material.ambient[0],
    this.material.ambient[1], this.material.ambient[2]],
  "md":[this.material.diffuse[0],
    this.material.diffuse[1], this.material.diffuse[2]],
  "ms":this.material.specular
  });
 }
}
//////////////////////////////////
var TextureImage=function(name){
  this.textureName=null;
  this.name=name;
  this.image=null;
}
TextureImage.prototype.loadImage=function(){
 if(this.image!==null){
  // already loaded
  return Promise.resolve(this);
 }
 var thisImage=this;
 var thisName=this.name;
 return new Promise(function(resolve,reject){
  var image=new Image();
  image.onload=function(e) {
   var target=e.target;
   thisImage.image=target;
   resolve(thisImage);
  }
  image.onerror=function(e){
   reject({name:name});
  }
  image.src=thisName;
 });
}
TextureImage.prototype.mapToContext=function(context){
  if(this.textureName!==null){
   // already loaded
   return this;
  }
  function isPowerOfTwo(a){
   if(Math.floor(a)!=a || a<=0)return false;
   while(a>1 && (a&1)==0){
    a>>=1;
   }
   return (a==1);
  }
  this.textureName=context.createTexture();
  context.pixelStorei(context.UNPACK_FLIP_Y_WEBGL, true);
  context.bindTexture(context.TEXTURE_2D, this.textureName);
  context.texParameteri(context.TEXTURE_2D,
    context.TEXTURE_MAG_FILTER, context.LINEAR);
  context.texImage2D(context.TEXTURE_2D, 0,
    context.RGBA, context.RGBA, context.UNSIGNED_BYTE,
    this.image);
  if(isPowerOfTwo(this.image.width) &&
      isPowerOfTwo(this.image.height)){
   // Enable mipmaps if texture's dimensions are powers of two
   context.texParameteri(context.TEXTURE_2D,
     context.TEXTURE_MIN_FILTER, context.LINEAR_MIPMAP_LINEAR);
   context.generateMipmap(context.TEXTURE_2D);
   context.texParameteri(context.TEXTURE_2D,
     context.TEXTURE_WRAP_S, context.REPEAT);
   context.texParameteri(context.TEXTURE_2D,
     context.TEXTURE_WRAP_T, context.REPEAT);
  } else {
   context.texParameteri(context.TEXTURE_2D,
     context.TEXTURE_MIN_FILTER, context.LINEAR);
   // Other textures require this wrap mode
   context.texParameteri(context.TEXTURE_2D,
     context.TEXTURE_WRAP_S, context.CLAMP_TO_EDGE);
   context.texParameteri(context.TEXTURE_2D,
     context.TEXTURE_WRAP_T, context.CLAMP_TO_EDGE);
  }
  return this;
}
TextureImage.prototype.bind=function(program){
   if(this.image!==null && this.textureName===null){
      // load the image as a texture
      this.mapToContext(program.getContext());
   } else if(this.image===null && this.textureName===null){
      var thisObj=this;
      var prog=program;
      this.loadImage().then(function(e){
        // try again loading the image
        thisObj.bind(program);
      });
      return;
   }
   if (this.textureName!==null) {
      var uniforms={};
      uniforms["useTexture"]=1;
      program.setUniforms(uniforms);
      var ctx=program.getContext()
      ctx.activeTexture(ctx.TEXTURE0);
      ctx.bindTexture(ctx.TEXTURE_2D,
        this.textureName);
    }
}
////////////////////////////////////////

function Scene3D(context){
 this.context=context;
 this.context.viewport(0,0,
    this.context.canvas.width*1.0,this.context.canvas.height*1.0);
 this.lightingEnabled=true;
 this.program=new ShaderProgram(context,
   this._getDefines()+ShaderProgram.getDefaultVertex(),
   this._getDefines()+ShaderProgram.getDefaultFragment());
 this.shapes=[];
 this.clearColor=[0,0,0,1];
 this.textureCache={};
 this.context.enable(context.BLEND);
 this._projectionMatrix=GLMath.mat4identity();
 this._viewMatrix=GLMath.mat4identity();
 this._matrixDirty=true;
 this._invProjectionView=null;
 this._invTransModel3=null;
 this._invView=null;
 this.lightSource=new LightSource();
 this.context.blendFunc(context.SRC_ALPHA,context.ONE_MINUS_SRC_ALPHA);
 this.context.enable(this.context.DEPTH_TEST);
 this.context.depthFunc(this.context.LEQUAL);
 this._setClearColor();
 this.context.clearDepth(999999);
 this.context.clear(
    this.context.COLOR_BUFFER_BIT |
    this.context.DEPTH_BUFFER_BIT);
}
Scene3D.prototype._getDefines=function(){
 var ret="";
 if(this.lightingEnabled)
  ret+="#define SHADING\n"
 return ret;
}
Scene3D.prototype._initProgramData=function(){
  this.program.setUniforms({"sampler":0});
  this.program.setLightSource(this.lightSource);
  // update matrix-related uniforms later
  this._matrixDirty=true;
}
Scene3D.prototype.useProgram=function(program){
 if(!program)throw new Error("invalid program");
 program.use();
 this.program=program;
 this._initProgramData();
 return this;
}
Scene3D.prototype.disableLighting=function(){
 this.lightingEnabled=false;
 var program=new ShaderProgram(this.context,
   this._getDefines()+ShaderProgram.getDefaultVertex(),
   this._getDefines()+ShaderProgram.getDefaultFragment());
 return this.useProgram(program);
}
Scene3D.prototype.getWidth=function(){
 return this.context.canvas.width*1.0;
}
Scene3D.prototype.getHeight=function(){
 return this.context.canvas.height*1.0;
}
Scene3D.prototype.getAspect=function(){
 return this.getWidth()/this.getHeight();
}
Scene3D.prototype.setPerspective=function(fov, aspect, near, far){
 return this.setProjectionMatrix(GLMath.mat4perspective(fov,
   aspect,near,far));
}
Scene3D.prototype.setFrustum=function(left, right, bottom, top, near, far){
 return this.setProjectionMatrix(GLMath.mat4frustum(
   left, right, top, bottom, near, far));
}
Scene3D.prototype.setOrtho=function(left, right, bottom, top, near, far){
 return this.setProjectionMatrix(GLMath.mat4ortho(
   left, right, top, bottom, near, far));
}
Scene3D.prototype._setClearColor=function(){
  this.context.clearColor(this.clearColor[0],this.clearColor[1],
    this.clearColor[2],this.clearColor[3]);
  return this;
}
Scene3D.prototype.setClearColor=function(r,g,b,a){
 this.clearColor=GLUtil["toGLColor"](r,g,b,a);
 return this._setClearColor();
}
Scene3D.prototype.getColor=function(r,g,b,a){
 return MaterialShade.fromColor(r,g,b,a);
}
Scene3D.prototype.getMaterialParams=function(am,di,sp,sh){
 return new MaterialShade(am,di,sp,sh);
}
Scene3D.prototype.loadTexture=function(name){
 // Returns a promise with a Texture object result if it resolves
 return Texture.loadTexture(name, this.textureCache);
}
Scene3D.prototype.loadAndMapTexture=function(name){
 // Returns a promise with a Texture object result if it resolves
 return Texture.loadAndMapTexture(
   name, this.context, this.textureCache);
}
Scene3D.prototype.loadAndMapTextures=function(textureFiles, resolve, reject){
 var promises=[];
 for(var i=0;i<textureFiles.length;i++){
  var objf=textureFiles[i];
  var p=this.loadAndMapTexture(objf);
  promises.push(p);
 }
 return GLUtil.getPromiseResults(promises, resolve, reject);
}
Scene3D.prototype._updateMatrix=function(){
 if(this._matrixDirty){
  var projView=GLMath.mat4multiply(this._projectionMatrix,this._viewMatrix);
  this._invProjectionView=GLMath.mat4invert(projView);
  this._invView=GLMath.mat4invert(this._viewMatrix);
  this.program.setUniforms({
   "view":this._viewMatrix,
   "projection":this._projectionMatrix,
   "viewInverse":this._invView,
  });
  this._matrixDirty=false;
 }
}
Scene3D.prototype.setProjectionMatrix=function(matrix){
 this._projectionMatrix=GLMath.mat4copy(matrix);
 this._matrixDirty=true;
 return this;
}
Scene3D.prototype.setViewMatrix=function(matrix){
 this._viewMatrix=GLMath.mat4copy(matrix);
 this._matrixDirty=true;
 return this;
}
Scene3D.prototype.setLookAt=function(eye, center, up){
 up = up || [0,1,0];
 this._viewMatrix=GLMath.mat4lookat(eye, center, up);
 this._matrixDirty=true;
 return this;
}
Scene3D.prototype.addShape=function(shape){
 this.shapes.push(shape);
 return this;
}
Scene3D.prototype.setLightSource=function(light){
 this.lightSource=light;
 this.program.setLightSource(this.lightSource);
 return this;
}
Scene3D.prototype.render=function(){
  this._updateMatrix();
  this.context.clear(this.context.COLOR_BUFFER_BIT);
  for(var i=0;i<this.shapes.length;i++){
   this.shapes[i].render(this.program);
  }
  this.context.flush();
}

function MultiShape(){
 this.shapes=[];
}
MultiShape.prototype.setScale=function(scale){
 for(var i=0;i<this.shapes.length;i++){
  this.shapes[i].setScale(scale);
 }
}
MultiShape.prototype.render=function(program){
 for(var i=0;i<this.shapes.length;i++){
  this.shapes[i].render(program);
 }
}
MultiShape.prototype.add=function(shape){
 this.shapes.push(shape);
}

function Shape(context,vertfaces){
  if(vertfaces==null)throw new Error("vertfaces is null");
  if(vertfaces.constructor==Mesh){
   this.vertfaces=vertfaces.bind(context);
  } else {
   this.vertfaces=vertfaces;
  }
  this.context=context;
  this.material=new MaterialShade();
  this.scale=[1,1,1];
  this.angle=0;
  this.position=[0,0,0];
  this.vector=[0,0,0];
  this.uniforms=[];
  this.drawLines=false;
  this._matrixDirty=true;
  this._invTransModel3=GLMath.mat3identity();
  this.matrix=GLMath.mat4identity();
}
Shape.prototype.setDrawLines=function(value){
 this.drawLines=value;
 return this;
}
Shape.prototype.setMatrix=function(value){
 this._matrixDirty=false;
 this.matrix=value;
 this._invTransModel3=GLMath.mat4inverseTranspose3(this.matrix);
 return this;
}
Shape.prototype.getDrawLines=function(){
 return this.drawLines;
}
Shape.prototype.setColor=function(r,g,b,a){
 var color=GLUtil["toGLColor"](r,g,b,a);
 this.material=MaterialShade.fromColor(color);
 return this;
}
Shape.prototype.setMaterial=function(material){
 this.material=material;
 return this;
}
Shape.prototype.setScale=function(x,y,z){
  if(x!=null && y==null && z==null){
   this.scale=[x,x,x];
  } else {
   this.scale=[x,y,z];
  }
  this._matrixDirty=true;
  return this;
}
Shape.prototype.setPosition=function(x,y,z){
  this.position=[x,y,z];
  this._matrixDirty=true;
  return this;
}
Shape.prototype.setRotation=function(angle, vector){
  this.angle=angle%360;
  this.vector=vector;
  this._matrixDirty=true;
  return this;
}
Shape.prototype.render=function(program){
  // Set material (texture or color)
  if(this.material){
   this.material.bind(program);
  }
  // Bind vertex attributes
  Shape._bind(this.context,this.vertfaces,
    program.get("position"),
    program.get("normal"),
    program.get("textureUV"),
    program.get("colorAttr"));
  // Set world matrix
  var uniformMatrix=program.get("world");
  var uniforms={};
  if(uniformMatrix!==null){
   if(this._matrixDirty){
    this._updateMatrix();
   }
   uniforms["world"]=this.matrix;
   uniforms["worldInverseTrans3"]=this._invTransModel3;
  }
  uniforms["useColorAttr"]=(this.vertfaces.format==Mesh.VEC3DCOLOR) ?
     1.0 : 0.0;
  program.setUniforms(uniforms);
  // Draw the shape
  this.context.drawElements(
    this.drawLines ? this.context.LINES : this.context.TRIANGLES,
    this.vertfaces.facesLength,
    this.vertfaces.type, 0);
};
///////////////
Shape.prototype._updateMatrix=function(){
  this._matrixDirty=false;
  this.matrix=GLMath.mat4scaled(this.scale);
  if(this.angle!=0){
    this.matrix=GLMath.mat4rotate(this.matrix,this.angle,this.vector);
  }
  this.matrix[12]+=this.position[0];
  this.matrix[13]+=this.position[1];
  this.matrix[14]+=this.position[2];
  this._invTransModel3=GLMath.mat4inverseTranspose3(this.matrix);
}
/////////////
Shape._vertexAttrib=function(context, attrib, size, type, stride, offset){
  if(attrib!==null){
    context.enableVertexAttribArray(attrib);
    context.vertexAttribPointer(attrib,size,type,false,stride,offset);
  }
}
Shape._bind=function(context, vertfaces,
  attribPosition, attribNormal, attribUV,attribColor){
  context.bindBuffer(context.ARRAY_BUFFER, vertfaces.verts);
  context.bindBuffer(context.ELEMENT_ARRAY_BUFFER, vertfaces.faces);
  var format=vertfaces.format;
  if(format==Mesh.VEC3DNORMAL){
   Shape._vertexAttrib(context,attribPosition, 3, context.FLOAT, 6*4, 0);
   Shape._vertexAttrib(context,attribNormal, 3,
    context.FLOAT, 6*4, 3*4);
  } else if(format==Mesh.VEC3DNORMALUV){
   Shape._vertexAttrib(context,attribPosition, 3,
    context.FLOAT, 8*4, 0);
   Shape._vertexAttrib(context,attribNormal, 3,
    context.FLOAT, 8*4, 3*4);
   Shape._vertexAttrib(context,attribUV, 2,
    context.FLOAT, 8*4, 6*4);
  } else if(format==Mesh.VEC3DCOLOR){
   Shape._vertexAttrib(context,attribPosition, 3,
    context.FLOAT, 6*4, 0);
   Shape._vertexAttrib(context,attribColor, 3,
    context.FLOAT, 6*4, 3*4);
  } else if(format==Mesh.VEC2D){
   Shape._vertexAttrib(context,attribPosition, 2,
     context.FLOAT, 2*4, 0);
  } else if(format==Mesh.VEC3D){
   Shape._vertexAttrib(context,attribPosition, 3,
     context.FLOAT, 3*4, 0);
  }
}
