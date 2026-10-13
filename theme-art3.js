/* Replace only the three known procedural resource textures at upload time.
 * Unity gameplay, draw order, positions, selection, specials and animations
 * remain owned by the existing runtime. The companion C# loads these same PNGs
 * directly on the next full Unity rebuild, making this adapter unnecessary.
 */
(() => {
  'use strict';
  const SIZE=128, BYTES=SIZE*SIZE*4;
  const pixels=(window.GameBullThemePixels||[]).map(encoded=>{
    const str=atob(encoded), out=new Uint8Array(str.length);
    for(let i=0;i<str.length;i++)out[i]=str.charCodeAt(i);
    if(out.length!==BYTES)throw new Error('Invalid theme texture size');
    return out;
  });
  delete window.GameBullThemePixels;
  const base=[[1,.65,.015],[.015,.85,.04],[.95,.035,.015]];
  // These 36 locations avoid all three existing centre pictograms. Geometry,
  // alpha and colour must all match; a general colour filter is never applied.
  const samples=base.map(rgb=>{
    const list=[];
    for(const y of [12,24,36,92,104,116])for(const x of [12,24,36,92,104,116]) {
      const u=(x-63.5)/64,v=(y-63.5)/64;
      const edge=Math.max(Math.abs(u),Math.abs(v),(Math.abs(u)+Math.abs(v))/1.4)/.94;
      let c;
      if(edge>1)c=[0,0,0,0];
      else if(edge>.94)c=rgb.map(n=>n+(1-n)*.65).concat(1);
      else c=rgb.map(n=>n*(edge>.78?.65+v*.3:.72+.12*v)).concat(1);
      list.push([(y*SIZE+x)*4,...c.map(n=>Math.round(n*255))]);
    }
    return list;
  });
  const counts=[0,0,0];
  function resolveRGBA(heap,offset,width,height,format,type) {
    if(width!==SIZE||height!==SIZE||format!==6408||type!==5121||pixels.length!==3||!heap||!Number.isInteger(offset)||offset<0||offset+BYTES>heap.length)return null;
    // All existing octagon corners are fully transparent.
    if(heap[offset+3]!==0||heap[offset+(SIZE-1)*4+3]!==0||heap[offset+(SIZE*(SIZE-1))*4+3]!==0||heap[offset+BYTES-1]!==0)return null;
    for(let kind=0;kind<3;kind++) {
      let match=true;
      for(const [pos,r,g,b,a] of samples[kind]) {
        if(Math.abs(heap[offset+pos]-r)>2||Math.abs(heap[offset+pos+1]-g)>2||Math.abs(heap[offset+pos+2]-b)>2||heap[offset+pos+3]!==a){match=false;break;}
      }
      if(match){counts[kind]++;return pixels[kind];}
    }
    return null;
  }
  window.GameBullThemeArt3=Object.freeze({resolveRGBA,counts});
})();
