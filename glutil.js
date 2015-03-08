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
loadObjFromUrl:function(url, handlers){
 var xhr=new XMLHttpRequest();
 var urlstr=url;
 xhr.onload = function(){
  if(xhr.status<300){
   var rt="";
   try {
    rt=xhr.responseText;
   } catch(e){};
   var obj=GLUtil.loadObj(rt);
   if(handlers.onload && obj){
    handlers.onload(urlstr, obj);
   }
   if(handlers.onerror && !obj)
    handlers.onerror(urlstr);
  } else {
   // object load failed
   if(handlers.onerror)
    handlers.onerror(urlstr);
  }
 }
 xhr.onerror=function(){
   if(handlers.onerror)
    handlers.onerror(urlstr);
 }
 xhr.open("get", url, true);
 xhr.send();
},
loadObj:function(str){
 function pushVertex(verts,faces,look,
   v1,v2,v3,n1,n2,n3,u1,u2){
   var lookBack=faces.length-Math.min(20,faces.length);
   lookBack=Math.max(lookBack,look);
   // check if a recently added vertex already has the given
   // values
   for(var i=faces.length-1;i>=lookBack;i--){
    var vi=faces[i]*8;
    if(verts[vi]==v1 && verts[vi+1]==v2 && verts[vi+2]==v3 &&
        verts[vi+3]==n1 && verts[vi+4]==n2 && verts[vi+5]==n3 &&
        verts[vi+6]==u1 && verts[vi+7]==u2){
     // found it
     faces.push(faces[i]);
     return;
    }
   }
   var ret=verts.length/8;
   verts.push(v1,v2,v3,n1,n2,n3,u1,u2);
   faces.push(ret);
 }
 var number="(-?(?:\\d+\\.?\\d*|\\d*\\.\\d+)(?:[Ee][\\+\\-]?\\d+)?)"
 var nonnegInteger="(\\d+)"
 var vertexOnly=new RegExp("^"+nonnegInteger+"($|\\s+)")
 var vertexNormalOnly=new RegExp("^"+nonnegInteger+"\\/\\/"+nonnegInteger+"($|\\s+)")
 var vertexUVOnly=new RegExp("^"+nonnegInteger+"\\/"+
   nonnegInteger+"($|\\s+)")
 var vertexUVNormal=new RegExp("^"+nonnegInteger+"\\/"+nonnegInteger+
   "\\/"+nonnegInteger+"($|\\s+)")
 var vertexLine=new RegExp("^v\\s+"+number+"\\s+"+number+"\\s+"+number+"\\s*$")
 var uvLine=new RegExp("^vt\\s+"+number+"\\s+"+number+"\\s*$")
 var groupLine=new RegExp("^g\\s+.*$")
 var usemtlLine=new RegExp("^usemtl\\s+([^\\:\\s]+)$")
 var normalLine=new RegExp("^vn\\s+"+number+"\\s+"+number+"\\s+"+number+"\\s*")
 var faceStart=new RegExp("^f\\s+")
 var lines=str.split(/\r?\n/)
 var vertices=[];
 var resolvedVertices=[];
 var normals=[];
 var uvs=[];
 var faces=[];
 var currentFaces=[];
 var lookBack=0;
 var vertexKind=-1;
 for(var i=0;i<lines.length;i++){
  var line=lines[i];
  // skip empty lines
  if(line.length==0)continue;
  // skip comments
  if(line.charAt(0)=="#")continue;
  while(line.charAt(line.length-1)=="\\" &&
    i+1<line.length){
    // The line continues on the next line
   line=line.substr(0,line.length-1);
   line+=" "+lines[i+1];
   i++;
  }
  if(line.charAt(line.length-1)=="\\"){
   line=line.substr(0,line.length-1);
  }
  var e=vertexLine.exec(line)
  if(e){
    vertices.push([parseFloat(e[1]),parseFloat(e[2]),parseFloat(e[3])]);
    continue;
  }
  e=normalLine.exec(line)
  if(e){
    normals.push([parseFloat(e[1]),parseFloat(e[2]),parseFloat(e[3])]);
    continue;
  }
  e=uvLine.exec(line)
  if(e){
    uvs.push([parseFloat(e[1]),parseFloat(e[2])]);
    continue;
  }
  e=faceStart.exec(line)
  if(e){
    var oldline=line;
    line=line.substr(e[0].length);
    var faceCount=0;
    while(line.length>0){
     if(faceCount>=4 && (/\d+/).exec(line)){
      throw new Error("more than 4 vertices in one face not supported: "+oldline)
     }
     e=vertexOnly.exec(line)
     if(e){
      if(vertexKind!=0){
       vertexKind=0;
       lookBack=faces.length;
      }
      var vtx=parseInt(e[1],10)-1;
      pushVertex(resolvedVertices, faces, lookBack,
        vertices[vtx][0],vertices[vtx][1],vertices[vtx][2],0,0,0,0,0);
      currentFaces[faceCount]=faces[faces.length-1];
      line=line.substr(e[0].length);
      continue;
     }
     e=vertexNormalOnly.exec(line)
     if(e){
      if(vertexKind!=1){
       vertexKind=1;
       lookBack=faces.length;
      }
      var vtx=parseInt(e[1],10)-1;
      var norm=parseInt(e[2],10)-1;
      pushVertex(resolvedVertices, faces, lookBack,
        vertices[vtx][0],vertices[vtx][1],vertices[vtx][2],
        normals[norm][0],normals[norm][1],normals[norm][2],0,0);
      currentFaces[faceCount]=faces[faces.length-1];
      line=line.substr(e[0].length);
      continue;
     }
     e=vertexUVOnly.exec(line)
     if(e){
      if(vertexKind!=2){
       vertexKind=2;
       lookBack=faces.length;
      }
      var vtx=parseInt(e[1],10)-1;
      var uv=parseInt(e[2],10)-1;
      pushVertex(resolvedVertices, faces, lookBack,
        vertices[vtx][0],vertices[vtx][1],vertices[vtx][2],
        0,0,0,uvs[uv][0],uvs[uv][1],0,0);
      currentFaces[faceCount]=faces[faces.length-1];
      line=line.substr(e[0].length);
      continue;
     }
     e=vertexUVNormal.exec(line)
     if(e){
      if(vertexKind!=3){
       vertexKind=3;
       lookBack=faces.length;
      }
      var vtx=parseInt(e[1],10)-1;
      var uv=parseInt(e[2],10)-1;
      var norm=parseInt(e[3],10)-1;
      pushVertex(resolvedVertices, faces, lookBack,
        vertices[vtx][0],vertices[vtx][1],vertices[vtx][2],
        normals[norm][0],normals[norm][1],normals[norm][2],
        uvs[uv][0],uvs[uv][1]);
      currentFaces[faceCount]=faces[faces.length-1];
      line=line.substr(e[0].length);
      continue;
     }
     faceCount++;
     if(faceCount==4){
      // Add the second triangle in the quad
      faces[faces.length-1]=currentFaces[2];
      faces.push(currentFaces[1]);
      faces.push(currentFaces[3]);
     }
     throw new Error("unsupported face: "+oldline)
    }
    continue;
  }
  e=groupLine.exec(line)
  if(e){
    continue;
  }
  e=usemtlLine.exec(line)
  if(e){
    continue;
  }
  throw new Error("unsupported line: "+line)
 }
 if(normals.length==0){
  GLUtil.recalcNormals(vertices,8);
 }
 return new Mesh(resolvedVertices,faces,Mesh.VEC3DNORMALUV);
}
};

var ShaderProgram=function(context, vertexShader, fragmentShader){
 var disableLighting=false;
 if(vertexShader==null){
  vertexShader=ShaderProgram.getDefaultVertex(disableLighting);
 }
 if(fragmentShader==null){
  fragmentShader=ShaderProgram.getDefaultFragment(disableLighting);
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
ShaderProgram.getDefaultVertex=function(disableShading){
var shader="" +
"attribute vec3 position;\n" +
"attribute vec3 normal;\n" +
"attribute vec2 textureUV;\n" +
"attribute vec3 colorAttr;\n" +
"uniform mat4 world;\n" +
"uniform mat4 view;\n" +
"uniform mat4 projection;\n"+
"varying vec2 textureUVVar;\n"+
"varying vec3 colorAttrVar;\n";
if(!disableShading){
 shader+="uniform mat4 viewInverse; /* internal */\n" +
 "uniform mat3 worldInverseTrans3; /* internal */\n" +
 "uniform float alpha;\n"+
 "uniform vec4 lightPosition;\n" + // source light direction
 "uniform vec3 sa;\n" + // source light ambient color
 "uniform vec3 ma;\n" + // material ambient color (-1 to 1 each component).
 "uniform vec3 sd;\n" + // source light diffuse color
 "uniform vec3 md;\n" + // material diffuse color (0-1 each component). Is multiplied by texture/solid color.
 "uniform vec3 ss;\n" + // source light specular color
 "uniform vec3 ms;\n" + // material specular color (0-1 each comp.).  Affects how intense highlights are.
 "uniform float mshin;\n" + // material shininess
 "varying vec3 ambientAndSpecularVar;\n" +
 "varying vec3 diffuseVar;\n";
}
shader+="void main(){\n" +
"vec4 positionVec4=vec4(position,1.0);\n";
if(!disableShading){
 shader+="vec4 worldPosition=world*positionVec4;\n" +
"vec3 sdir;\n"+
"float attenuation;\n"+
"if(lightPosition.w == 0.0){\n" +
" sdir=normalize(vec3(lightPosition));\n" +
" attenuation=1.0;\n" +
"} else {\n"+
" vec3 vertexToLight=vec3(lightPosition-worldPosition);\n"+
" float dist=length(vertexToLight);\n"+
" sdir=normalize(vertexToLight);\n" +
" attenuation=1.0/(1.0*dist);\n" +
"}\n"+
"vec3 transformedNormal=normalize(worldInverseTrans3*normal);\n" +
"float diffInt=dot(transformedNormal,sdir);" +
"vec3 viewPosition=normalize(vec3(viewInverse*vec4(0,0,0,1)-worldPosition));\n" +
"vec3 ambientAndSpecular=sa*ma;\n" +
"if(diffInt>=0.0){\n" +
"   // specular reflection\n" +
"   ambientAndSpecular+=(ss*ms*pow(max(dot(reflect(-sdir,transformedNormal)," +
"      viewPosition),0.0),mshin));\n" +
"}\n"+
"diffuseVar=sd*md*max(0.0,dot(transformedNormal,sdir))*attenuation;\n" +
"ambientAndSpecularVar=ambientAndSpecular;\n";
}
shader+="colorAttrVar=colorAttr;\n";
shader+="textureUVVar=textureUV;\n";
shader+="gl_Position=projection*view*world*positionVec4;\n" +
"}";
return shader;
};
ShaderProgram.getDefaultFragment=function(disableShading){
var shader="" +
"precision highp float;\n";
if(disableShading){
shader+="uniform vec3 md;\n"; // solid color instead of material diffuse
}
shader+="uniform sampler2D sampler;\n" + // texture sampler
"uniform float useTexture;\n" + // use texture sampler rather than solid color if 1
"uniform float useColorAttr;\n" + // use color attribute if 1
"varying vec2 textureUVVar;\n"+
"varying vec3 colorAttrVar;\n";
if(!disableShading){
 shader+="varying vec3 ambientAndSpecularVar;\n" +
 "varying vec3 diffuseVar;\n";
}
shader+="void main(){\n";
shader+=" vec4 baseColor;\n";
if(!disableShading){
shader+=" baseColor=vec4(1.0,1.0,1.0,1.0)*(1.0-useTexture);\n";
} else {
shader+=" baseColor=vec4(md,1.0)*(1.0-useTexture);\n";
}
shader+=" baseColor+=texture2D(sampler,textureUVVar)*useTexture;\n"+
" baseColor=baseColor*(1.0-useColorAttr) +\n"+
"  vec4(colorAttrVar,1.0)*useColorAttr;\n";
if(!disableShading){
shader+=" vec3 phong=ambientAndSpecularVar+diffuseVar*baseColor.rgb;\n" +
" gl_FragColor=vec4(phong,baseColor.a);\n";
} else {
shader+=" gl_FragColor=baseColor;\n";
}
shader+="}";
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
 this.kind=Materials.PARAMS;
 this.shininess=(shininess==null) ? 1 : Math.min(Math.max(0,shininess),128);
 this.ambient=ambient||[0.2,0.2,0.2];
 this.diffuse=diffuse||[0.8,0.8,0.8];
 this.specular=specular||[0,0,0];
}
MaterialShade.prototype.bind=function(program){
 program.setUniforms({
 "useTexture":0,
 "mshin":this.shininess,
 "ma":this.ambient,
 "md":this.diffuse,
 "ms":this.specular
 });
}

function Mesh(vertices,faces,format){
 this.vertices=vertices;
 this.faces=faces;
 this.format=format;
}
// These Shape constants will be removed
Shape.VEC2D=2;
Shape.VEC3D=3;
Shape.VEC3DNORMALUV=6;
Shape.VEC3DNORMAL=5;
Shape.VEC3DCOLOR=7;
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
  for(var i=0;i<vertices.length;i+=3){
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
  if(this.format==Mesh.VEC3NORMAL){
   Mesh._recalcNormals(this.vertices,this.faces,6);
  } else if(this.format==Mesh.VEC3NORMALUV){
   Mesh._recalcNormals(this.vertices,this.faces,8);
  } else {
   throw new Error("not supported");
  }
};

(function(){
var Materials=function(context){
 this.textures={}
 this.context=context;
}
Materials.TEXTURE = 1;
Materials.PARAMS = 2;
Materials.prototype.getColor=function(r,g,b){
 if(typeof r=="number" && typeof g=="number" &&
    typeof b=="number"){
   return new MaterialShade([r,g,b],[r,g,b]);
 }
 // treat r as a 3-element RGB array
 return new MaterialShade(r,r);
}
Materials.prototype.getMaterialParams=function(am,di,sp,sh){
 return new MaterialShade(am,di,sp,sh);
}
Materials.prototype.getTexture=function(name, loadHandler){
 // Get cached texture
 if(this.textures[name] && this.textures.hasOwnProperty(name)){
   var ret=new Texture(this.textures[name]);
   if(loadHandler)loadHandler(ret.texture);
   return ret;
 }
 // Load new texture and cache it
 var tex=new TextureImage(this.context,name, loadHandler);
 this.textures[name]=tex;
 return new Texture(tex);
}
var Texture=function(texture){
 this.texture=texture;
 this.material=new MaterialShade();
 this.kind=Materials.TEXTURE;
}
Texture.prototype.setParams=function(material){
 this.material=material;
 return this;
}
var TextureImage=function(context, name, loadHandler){
  this.texture=null;
  this.context=context;
  this.name=name;
  var thisObj=this;
  var image=new Image();
  image.onload=function(e) {
    thisObj.texture=Texture.fromImage(context,image);
    if(loadHandler)loadHandler(thisObj);
    image.onload=null;
  };
  image.src=name;
}
Texture.fromImage=function(context,image){
  function isPowerOfTwo(a){
   if(Math.floor(a)!=a || a<=0)return false;
   while(a>1 && (a&1)==0){
    a>>=1;
   }
   return (a==1);
  }
  var texture=context.createTexture();
  context.pixelStorei(context.UNPACK_FLIP_Y_WEBGL, true);
  context.bindTexture(context.TEXTURE_2D, texture);
  context.texParameteri(context.TEXTURE_2D,
    context.TEXTURE_MAG_FILTER, context.LINEAR);
  context.texImage2D(context.TEXTURE_2D, 0,
    context.RGBA, context.RGBA, context.UNSIGNED_BYTE, image);
  if(isPowerOfTwo(image.width) && isPowerOfTwo(image.height)){
   // Enable mipmaps if texture's dimensions are powers of two
   context.texParameteri(context.TEXTURE_2D,
     context.TEXTURE_MIN_FILTER, context.LINEAR_MIPMAP_LINEAR);
   context.generateMipmap(context.TEXTURE_2D);
  } else {
   context.texParameteri(context.TEXTURE_2D,
     context.TEXTURE_MIN_FILTER, context.LINEAR);
   // Other textures require this wrap mode
   context.texParameteri(context.TEXTURE_2D,
     context.TEXTURE_WRAP_S, context.CLAMP_TO_EDGE);
   context.texParameteri(context.TEXTURE_2D,
     context.TEXTURE_WRAP_T, context.CLAMP_TO_EDGE);
  }
  context.bindTexture(context.TEXTURE_2D, null);
  return texture;
}
// Material binding
Texture.prototype.bind=function(program){
 this.texture.bind(program);
 if(this.material){
   program.setUniforms({
  "mshin":this.material.shininess,
  "ma":this.material.ambient,
  "md":this.material.diffuse,
  "ms":this.material.specular
  });
 }
}
TextureImage.prototype.bind=function(program){
   if (this.texture!==null) {
      var uniforms={};
      uniforms["useTexture"]=1;
      program.setUniforms(uniforms);
      this.context.activeTexture(this.context.TEXTURE0);
      this.context.bindTexture(this.context.TEXTURE_2D,
        this.texture);
    }
}
window["Materials"]=Materials;
})(window);

function Scene3D(context){
 this.context=context;
 this.context.viewport(0,0,
    this.context.canvas.width*1.0,this.context.canvas.height*1.0);
 this.program=new ShaderProgram(context);
 this.shapes=[];
 this.clearColor=[0,0,0,1];
 this.materials=new Materials(context);
 this.context.enable(context.BLEND);
 //this.context.enable(context.CULL_FACE);
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
 var program=new ShaderProgram(this.context,
   ShaderProgram.getDefaultVertex(true),
   ShaderProgram.getDefaultFragment(true));
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
  this.clearColor=[r,g,b,(typeof a=="undefined") ? 1.0 : a];
  return this._setClearColor();
}
Scene3D.prototype.getColor=function(r,g,b,a){
 return this.materials.getColor(r,g,b,a);
}
Scene3D.prototype.getMaterialParams=function(am,di,sp,sh){
 return this.materials.getMaterialParams(am,di,sp,sh);
}
Scene3D.prototype.getTexture=function(name){
 return this.materials.getTexture(name);
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
Shape.prototype.setColor=function(color){
 this.material=new MaterialShade(color,color);
 return this;
}
Shape.prototype.setMaterial=function(material){
 this.material=material;
 return this;
}
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
