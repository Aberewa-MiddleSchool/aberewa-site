// Joint weights are sampled from each fighter's own painted silhouette.
function unpack(encoded,Type){
  return new Type(Uint8Array.from(atob(encoded),c=>c.charCodeAt(0)).buffer);
}
const fighterMeshes=rodaRigs.map(r=>({
  xy:unpack(r.vertices,Uint16Array),weights:unpack(r.weights,Uint8Array),
  triangles:unpack(r.triangles,Uint16Array)
}));
const meshCanvas=document.createElement('canvas');
meshCanvas.width=meshCanvas.height=512;
const meshGL=meshCanvas.getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:true,preserveDrawingBuffer:true});
function setupMeshGL(gl){
  const program=gl.createProgram();
  for(const [type,source] of [
    [gl.VERTEX_SHADER,'attribute vec2 pos,uv; varying vec2 tex;void main(){tex=uv;gl_Position=vec4(pos.x/256.,-pos.y/256.,0.,1.);}'],
    [gl.FRAGMENT_SHADER,'precision mediump float;varying vec2 tex;uniform sampler2D art;void main(){gl_FragColor=texture2D(art,tex);}']
  ]){
    const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);
    gl.attachShader(program,shader);
  }
  gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))return null;
  gl.useProgram(program);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);
  const pos=gl.getAttribLocation(program,'pos'),uv=gl.getAttribLocation(program,'uv');
  gl.enableVertexAttribArray(pos);gl.enableVertexAttribArray(uv);
  const buffer=gl.createBuffer(), cache=new Map();
  return (id,im,mesh,dst)=>{
    if(!cache.has(id)){
      const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,im);
      const texCoords=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,texCoords);
      gl.bufferData(gl.ARRAY_BUFFER,Float32Array.from(mesh.xy,v=>v/320),gl.STATIC_DRAW);
      const indices=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indices);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,mesh.triangles,gl.STATIC_DRAW);
      cache.set(id,{texture,texCoords,indices});
    }
    const {texture,texCoords,indices}=cache.get(id);
    gl.bindTexture(gl.TEXTURE_2D,texture);gl.bindBuffer(gl.ARRAY_BUFFER,texCoords);
    gl.vertexAttribPointer(uv,2,gl.FLOAT,false,0,0);
    gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,dst,gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indices);
    gl.clear(gl.COLOR_BUFFER_BIT);gl.drawElements(gl.TRIANGLES,mesh.triangles.length,gl.UNSIGNED_SHORT,0);
  };
}
const renderMeshGL=meshGL && setupMeshGL(meshGL);
// Software canvas fallback for devices without WebGL.
function paintTriangles(g,im,mesh,dst){
  const {xy,triangles}=mesh;
  for(let n=0;n<triangles.length;n+=3){
    const i=2*triangles[n],j=2*triangles[n+1],k=2*triangles[n+2];
    const u=xy[j]-xy[i],v=xy[j+1]-xy[i+1],s=xy[k]-xy[i],t=xy[k+1]-xy[i+1];
    const det=u*t-s*v;if(!det)continue;
    const x=dst[j]-dst[i],y=dst[j+1]-dst[i+1],z=dst[k]-dst[i],w=dst[k+1]-dst[i+1];
    const a=(x*t-z*v)/det,b=(y*t-w*v)/det,c=(z*u-x*s)/det,d=(w*u-y*s)/det;
    g.save();g.beginPath();g.moveTo(dst[i],dst[i+1]);g.lineTo(dst[j],dst[j+1]);g.lineTo(dst[k],dst[k+1]);g.closePath();g.clip();
    g.transform(a,b,c,d,dst[i]-a*xy[i]-c*xy[i+1],dst[i+1]-b*xy[i]-d*xy[i+1]);
    g.drawImage(im,0,0);g.restore();
  }
}
function paintSkin(g,id,im,anchors,angles){
  const mesh=fighterMeshes[id],rest=rodaRigs[id].points;
  const transforms=[0,3,0,1,0,5,6,8,4,2].map((index,i)=>{
    const cs=Math.cos(angles[i]),sn=Math.sin(angles[i]),[x,y]=rest[index];
    return [cs,sn,anchors[i][0]-x*cs+y*sn,anchors[i][1]-x*sn-y*cs];
  });
  const dst=mesh.dst ||= new Float32Array(mesh.xy.length);
  for(let i=0;i<dst.length;i+=2){
    const x=mesh.xy[i],y=mesh.xy[i+1];let dx=0,dy=0,total=0;
    for(let b=0;b<10;b++){
      const weight=mesh.weights[i*5+b];if(!weight)continue;
      const [cs,sn,tx,ty]=transforms[b];
      dx+=weight*(x*cs-y*sn+tx);dy+=weight*(x*sn+y*cs+ty);total+=weight;
    }
    dst[i]=dx/total;dst[i+1]=dy/total;
  }
  if(renderMeshGL && !meshGL.isContextLost()){
    renderMeshGL(id,im,mesh,dst);
    g.drawImage(meshCanvas,-256,-256);
  }else paintTriangles(g,im,mesh,dst);
}
