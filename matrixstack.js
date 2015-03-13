/*
Written by Peter O. in 2015.

Any copyright is dedicated to the Public Domain.
http://creativecommons.org/publicdomain/zero/1.0/
If you like this, you should donate to Peter O.
at: http://upokecenter.dreamhosters.com/articles/donate-now-2/
*/
(function (g,f) {
	if (typeof define=="function" && define.amd) {
		define([ "exports" ], f);
	} else if (typeof exports=="object") {
		f(exports);
	} else {
		f(g);
	}
}(this, function (exports) {
	if (exports.MatrixStack) { return; }
/*
MatrixStack is a class that mimics the functionality
of legacy OpenGL matrix stacks.  It also implements most of
the matrix functions found in legacy OpenGL.
*/
function MatrixStack(){
 this.stack=[
  [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]
 ];
}
MatrixStack.prototype.get=function(){
 return this.stack[this.stack.length-1].slice(0,16);
}
MatrixStack.prototype.loadIdentity=function(mat){
 this.stack[this.stack.length-1]=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
 return this;
}
MatrixStack.prototype.loadMatrix=function(mat){
 this.stack[this.stack.length-1]=mat.slice(0,16);
 return this;
}
MatrixStack.prototype.multMatrix=function(mat){
 this.stack[this.stack.length-1]=GLMath.mat4multiply(
  this.stack[this.stack.length-1],mat);
 return this;
}
MatrixStack.prototype.rotate=function(angle, x, y, z){
 this.stack[this.stack.length-1]=GLMath.mat4rotate(
   this.stack[this.stack.length-1], angle, x, y, z);
 return this;
}
MatrixStack.prototype.translate=function(x, y, z){
 this.stack[this.stack.length-1]=GLMath.mat4translate(
  this.stack[this.stack.length-1], x, y, z);
 return this;
}

MatrixStack.prototype.scale=function(x, y, z){
 var mat=this.stack[this.stack.length-1]
 mat[0]*=x
 mat[1]*=x
 mat[2]*=x
 mat[3]*=x
 mat[4]*=y
 mat[5]*=y
 mat[6]*=y
 mat[7]*=y
 mat[8]*=z
 mat[9]*=z
 mat[10]*=z
 mat[11]*=z
 return this;
}
MatrixStack.prototype.pushMatrix=function(){
 this.stack.push(this.stack[this.stack.length-1].slice(0,16))
 return this;
}
MatrixStack.prototype.popMatrix=function(){
 if(this.stack.length>1){
  this.stack.pop();
 }
 return this;
}
MatrixStack.prototype.ortho=function(l,r,b,t,n,f){
var m=this.stack[this.stack.length-1];
var invrl=1.0/(r-l);
var invtb=1.0/(t-b);
var invfn=1.0/(f-n);
var v0 = 2*invrl;
var v1 = 2*invtb;
var v2 = -2*invfn;
var v12 = -(f+n)*invfn;
var v13 = -(l+r)*invrl;
var v14 = -(b+t)*invtb;
var m=this.stack[this.stack.length-1]
this.stack[this.stack.length-1]=[
m[0]*v0, m[1]*v0, m[2]*v0, m[3]*v0,
m[4]*v1, m[5]*v1, m[6]*v1, m[7]*v1,
m[8]*v2, m[9]*v2, m[10]*v2, m[11]*v2,
m[0]*v13+m[12]+m[4]*v14+m[8]*v12,
m[13]+m[1]*v13+m[5]*v14+m[9]*v12,
m[10]*v12+m[14]+m[2]*v13+m[6]*v14,
m[11]*v12+m[15]+m[3]*v13+m[7]*v14]
return this;
}
MatrixStack.prototype.frustum=function(l,r,b,t,n,f){
var m=this.stack[this.stack.length-1];
var invrl=1.0/(r-l);
var invtb=1.0/(t-b);
var invfn=1.0/(f-n);
var v1 = 2*n;
var v11 = invrl*v1;
var v12 = invtb*v1;
var v13 = -(f+n)*invfn;
var v14 = invrl*(l+r);
var v15 = invtb*(b+t);
var v16 = -f*invfn*v1;
var m=this.stack[this.stack.length-1]
this.stack[this.stack.length-1]=[
m[0]*v11, m[1]*v11, m[2]*v11, m[3]*v11,
m[4]*v12, m[5]*v12, m[6]*v12, m[7]*v12,
m[0]*v14+m[4]*v15+m[8]*v13-m[12],
m[1]*v14+m[5]*v15+m[9]*v13-m[13],
m[10]*v13+m[2]*v14+m[6]*v15-m[14],
m[11]*v13+m[3]*v14+m[7]*v15-m[15],
m[8]*v16, m[9]*v16, m[10]*v16, m[11]*v16]
return this;
}
MatrixStack.prototype.lookAt=function(ex, ey, ez, cx, cy, cz, ux, uy, uz){
 return this.multMatrix(GLMath.mat4lookat([ex,ey,ez],[cx,cy,cz],[ux,uy,uz]));
}
MatrixStack.prototype.ortho2d=function(l,r,b,t){
var invrl=1.0/(r-l);
var invtb=1.0/(t-b);
var v0 = 2.0*invrl;
var v1 = 2.0*invtb;
var v8 = -(b+t)*invtb;
var v9 = -(l+r)*invrl;
var m=this.stack[this.stack.length-1]
this.stack[this.stack.length-1]=[
m[0]*v0, m[1]*v0, m[2]*v0, m[3]*v0,
m[4]*v1, m[5]*v1, m[6]*v1, m[7]*v1,
-m[8], -m[9], -m[10], -m[11],
m[0]*v9+m[12]+m[4]*v8,
m[13]+m[1]*v9+m[5]*v8,
m[14]+m[2]*v9+m[6]*v8,
m[15]+m[3]*v9+m[7]*v8]
return this;
}
MatrixStack.prototype.perspective=function(fov, aspect, n, f){
var ftan = 1/Math.tan(fov*Math.PI/360);
var v0 = ftan/aspect;
var invnf=1.0/(n-f)
var v2 = f+n;
var v1 = v2*invnf;
var v3 = 2*f*invnf*n;
var v4 = invnf*v2;
var m=this.stack[this.stack.length-1]
this.stack[this.stack.length-1]=[
m[0]*v0, m[1]*v0, m[2]*v0, m[3]*v0,
ftan*m[4], ftan*m[5], ftan*m[6], ftan*m[7],
 m[8]*v4-m[12], m[9]*v4-m[13],
 m[10]*v4-m[14], m[11]*v4-m[15],
 m[8]*v3, m[9]*v3, m[10]*v3, m[11]*v3]
return this;
}
MatrixStack.prototype.pickMatrix=function(wx,wy,ww,wh,vp){
 var invww=1.0/ww;
 var invwh=1.0/wh;
 wx-=vp[0]
 wy-=vp[1]
 var scaleX=vp[2]*invww;
 var scaleY=vp[3]*invwh;
 return this
   .translate(-wx*2*invww,-wy*2*invwh,0)
   .scale(scaleX*2,-scaleY*2,1)
   .multMatrix([ 0.5, 0, 0, 0, 0, -0.5, 0, 0, 0, 0, 1, 0, 0.5, -0.5, 0, 1 ]);
}
exports.MatrixStack=MatrixStack;
}));
