/* Film: "رحلة دمعة اللبان" — every frame is a pure function of t (seconds).
   Logical stage 1280x720, rendered at the canvas size (1920x1080 final). 30 fps timeline. */
const FPS=30, TOTAL=2550, FONT='"Baloo Bhaijaan 2",Tahoma,sans-serif';
const C={ink:'#2D3D31',deep:'#2F5A3E',cream:'#FFF9EE',coral:'#E4643F',plant:'#3B97AC',parts:'#D99A1E',use:'#8C5FBD',imp:'#D24E68',benefit:'#4B9650'};
const SHOT=[[0,225],[225,450],[450,900],[900,1275],[1275,1725],[1725,2175],[2175,2550]];
const DEBUG=new URLSearchParams(location.search).has('debug');

/* easing tokens */
const cl01=v=>Math.max(0,Math.min(1,v));
const E={outExpo:t=>t>=1?1:1-Math.pow(2,-10*t),inExpo:t=>t<=0?0:Math.pow(2,10*t-10),
  inOutQuart:t=>t<.5?8*t*t*t*t:1-Math.pow(-2*t+2,4)/2,outBack:t=>{const c1=1.70158,c3=c1+1;return 1+c3*Math.pow(t-1,3)+c1*Math.pow(t-1,2)},
  outQuint:t=>1-Math.pow(1-t,5)};
function spring(t,zeta=.55,f=1.6){if(t<=0)return 0;const w=2*Math.PI*f;if(zeta>=1)return 1-Math.exp(-w*t)*(1+w*t);const wd=w*Math.sqrt(1-zeta*zeta);return 1-Math.exp(-zeta*w*t)*(Math.cos(wd*t)+(zeta*w/wd)*Math.sin(wd*t))}
const P=(f,a,d)=>cl01((f-a)/d);

/* ---------- text ---------- */
function measure(g,segs,size,w=800){g.font=`${w} ${size}px ${FONT}`;return segs.reduce((s,[t])=>s+g.measureText(t).width,0)}
function txt(g,segs,xr,y,size,w=800){g.save();g.font=`${w} ${size}px ${FONT}`;g.direction='rtl';g.textAlign='right';g.textBaseline='middle';let x=xr;for(const[s,c]of segs){g.fillStyle=c;g.fillText(s,x,y);x-=g.measureText(s).width}g.restore()}
// visibility: pop in with ease-out-back (scale only), opacity never overshoots; exit ease-in, shorter
function vis(f,inF,outF=1e9){const p=P(f,inF,12),q=P(f,outF,8);return{a:cl01((f-inF)/7)*(1-E.inExpo(q)),s:.86+.14*E.outBack(p)*(1-q*.04)}}
function pill(g,segs,xr,y,size,v,o={}){if(v.a<=0)return;const w=measure(g,segs,size,o.w||800),ph=size*1.5,pw=w+size*1.9,x0=xr-pw;
  g.save();g.globalAlpha=v.a;const cx=x0+pw/2;g.translate(cx,y);g.scale(v.s,v.s);g.translate(-cx,-y);
  g.shadowColor='rgba(47,90,62,.25)';g.shadowBlur=18;g.shadowOffsetY=8;g.fillStyle=o.bg||C.cream;g.fill(pathOf(rrp(x0,y-ph/2,pw,ph,ph/2,8)));g.shadowColor='transparent';
  g.fillStyle='rgba(255,255,255,.5)';g.fill(pathOf(rrp(x0+8,y-ph/2+4,pw-16,ph*.28,ph*.14,6)));
  txt(g,segs,xr-size*.95,y+size*.04,size,o.w||800);g.restore();return pw}
const chip=(g,label,col,f,inF,outF)=>pill(g,[[label,'#ffffff']],1222,64,27,vis(f,inF,outF),{bg:col});

/* ---------- assets ---------- */
const SP={};
function drawManqaf(g){tubes(g,[[4,14,20,13,40,12,58,12,9,8]],'#8C5E3B',{streaks:1});clay(g,[[56,6],[84,4],[96,12],[84,20],[56,18]],'#B8BDC4',{sb:4,sy:2,il:.8,raw:false});g.strokeStyle='rgba(255,255,255,.7)';g.lineWidth=1.4;g.beginPath();g.moveTo(62,8);g.lineTo(88,8);g.stroke()}
const CUTS=[[510,335],[638,560],[779,335]];
const GY=610;
function buildFilm(){
  SP.stand=sprite(110,172,55,165,g=>drawTurki(g,{}),1.3);
  SP.walkA=sprite(110,172,55,165,g=>drawTurki(g,{feet:[-5,0],aL:-.45,aR:.05}),1.3);
  SP.walkB=sprite(110,172,55,165,g=>drawTurki(g,{feet:[0,-5],aL:-.05,aR:.45}),1.3);
  SP.cheer=sprite(110,172,55,165,g=>drawTurki(g,{aL:-2.5,aR:2.5,happy:true}),1.3);
  SP.cheer2=sprite(110,172,55,165,g=>drawTurki(g,{aL:-2.2,aR:2.2,happy:true,feet:[-3,-3]}),1.3);
  SP.happy=sprite(110,172,55,165,g=>drawTurki(g,{happy:true,aL:-.5,aR:.5}),1.3);
  SP.ride=sprite(110,172,55,120,g=>drawTurki(g,{ride:true,aL:-.5,aR:.5}),1.2);
  SP.camelA=sprite(200,186,110,176,g=>drawCamel(g,0),1.3);SP.camelB=sprite(200,186,110,176,g=>drawCamel(g,1),1.3);
  SP.tree=sprite(340,316,170,306,g=>drawTree(g,{}));
  SP.treeBig=sprite(340,316,170,306,g=>drawTree(g,{}),1.55);
  SP.treeRoots=sprite(340,424,170,0,g=>drawTree(g,{roots:true}),1.5*1.6);
  SP.rock=sprite(70,56,34,50,g=>drawRock(g,2));SP.bush=sprite(72,56,36,50,g=>drawBush(g,3));
  SP.sign={};for(const t of['وادي دوكة','شصر','سمهرم'])SP.sign[t]=sprite(162,100,40,98,g=>drawSign(g,t),1.2);
  SP.tear=sprite(20,26,10,13,g=>tear(g,10,13,10),1.5);SP.tearW=sprite(20,26,10,13,g=>tear(g,10,13,10,'#FBF8F0'),1.5);
  SP.basket=sprite(122,72,60,66,g=>drawBasket(g),1.3);
  SP.dhow=sprite(240,136,120,124,g=>drawDhow(g),1.2);SP.ruins=sprite(180,120,90,116,g=>drawRuins(g),1.2);
  SP.sun=sprite(100,100,50,50,g=>clay(g,ell(50,50,40,40,0,40),'#F6D977',{shadow:false,il:.7}),1.5);
  SP.moon=sprite(80,80,40,40,g=>{clay(g,ell(40,40,30,30,0,40),'#F4F1E2',{shadow:false,il:.7});g.globalCompositeOperation='destination-out';g.beginPath();g.arc(54,32,26,0,7);g.fill()},1.5);
  SP.cloud=sprite(200,110,100,55,g=>cloud(g,100,55,1),1.5);
  SP.manqaf=sprite(100,26,92,12,g=>drawManqaf(g),1.5);
  SP.burner=sprite(120,156,60,150,g=>drawBurner(g),1.5);SP.cup=sprite(80,156,40,152,g=>drawCup(g),1.5);SP.perfume=sprite(90,156,45,152,g=>drawPerfume(g),1.5);SP.scale=sprite(140,156,70,152,g=>drawScale(g),1.5);
  SP.coin=sprite(24,24,12,12,g=>{clay(g,ell(12,12,9,9,0,24),'#E6C25E',{sb:3,sy:2,il:.8});g.strokeStyle='rgba(150,110,30,.6)';g.lineWidth=1.2;g.beginPath();g.arc(12,12,5,0,7);g.stroke()},1.5);
  // layered landscape: sky (sun/clouds animated separately) + land
  const sky=gy=>layer(g=>{const sk=g.createLinearGradient(0,0,0,gy);sk.addColorStop(0,'#B9D9E3');sk.addColorStop(1,'#E8F1DC');g.fillStyle=sk;g.fillRect(0,0,W,H)});
  const land=(o)=>layer(g=>{const gy=o.gy;domes(g,gy-20,[[60,210,150],[330,190,120],[600,240,140],[900,200,130],[1180,230,150]],['#C3D3BA','#B8CCB2','#C9D7B8'],o.seed);
    domes(g,gy+10,[[-20,200,110],[250,170,90],[520,220,100],[800,180,95],[1080,200,110],[1320,170,90]],['#A7C98E','#98BF82','#B1D095'],o.seed+9);
    clay(g,[[-60,gy],[200,gy-8],[480,gy+4],[760,gy-6],[1040,gy+4],[1340,gy-4],[1340,H+80],[-60,H+80]],'#EAD6A8',{shadow:false,id:.12,il:.5});
    const R=rng(o.seed+77);if(o.deco!==false){for(let i=0;i<7;i++){const x=R()*W,y=gy+20+R()*(H-gy-30);clay(g,ell(x,y,8+R()*12,5+R()*7,0,30,.12,i),R()<.5?'#B6B0C7':'#C8C1D4',{sb:5,sy:3})}
      for(let i=0;i<6;i++){const x=R()*W,y=gy+14+R()*(H-gy-20);for(let j=0;j<3;j++)clay(g,ell(x+j*9-9,y-Math.abs(j-1)*4,7,10,(j-1)*.4,20),'#7DAA56',{sb:3,sy:2})}}});
  SP.sky600=sky(600);SP.land600=land({gy:600,seed:3});SP.land500=land({gy:500,seed:9,deco:false});SP.land650=land({gy:650,seed:11,deco:false});SP.landEnd=land({gy:600,seed:13});
  SP.bigTree=layer(g=>{tubes(g,[[640,760,636,640,640,560,640,470,132,104],[630,476,560,380,470,300,360,170,64,30],[650,476,730,380,820,300,930,170,64,30],
      [380,196,330,140,300,100,240,60,30,16],[900,196,960,140,1000,100,1060,50,30,16],[562,390,540,300,510,240,486,196,26,12],[718,390,740,300,770,240,794,196,26,12],[486,200,480,170,470,140,452,112,12,7],[794,200,800,170,810,140,828,112,12,7]],BARK,{seed:21,streaks:5});
    const r=rng(5);for(let i=0;i<34;i++){const pts=[[640,690],[640,600],[600,420],[560,370],[460,290],[420,230],[700,410],[760,350],[840,280],[880,230]];const p=pts[Math.floor(r()*pts.length)];const x=p[0]+(r()-.5)*70,y=p[1]+(r()-.5)*40;
      if(CUTS.some(([a,b])=>Math.hypot(x-a,y-b)<48))continue;const w=6+r()*8,h=4+r()*4,a=(r()-.5)*1.2;clay(g,ell(x,y,w,h,a,20,.2,i),'#F2EADB',{sb:3,sy:2,grain:.15,il:.7})}
    for(const[x,y,s]of[[240,60,74],[330,110,56],[1060,50,76],[970,110,60],[486,196,54],[794,196,54],[452,108,58],[828,108,58],[150,120,50],[1150,110,52],[380,30,56],[900,30,58],[640,40,60],[560,90,46],[720,90,46]])leafCluster(g,x,y,s,x+y)},2);
  SP.majlis=layer(g=>{g.fillStyle='#EBDDBF';g.fillRect(0,0,W,H);clay(g,rrp(-20,-20,W+40,500,30),'#F1E4C6',{shadow:false,id:.15,il:.5});
    const arch=[];for(let i=0;i<=20;i++){const a=Math.PI+Math.PI*i/20;arch.push([640+Math.cos(a)*130,170+Math.sin(a)*110])}arch.push([770,400],[510,400]);
    clay(g,arch.map(([x,y])=>[x+(x-640)*.12,y+(y<170?-14:14)]),'#C58B5A',{sb:14,sy:6});
    const ap=pathOf(smooth(arch));g.save();g.clip(ap);const sk=g.createLinearGradient(0,60,0,400);sk.addColorStop(0,'#AFD5E2');sk.addColorStop(1,'#E8F0D6');g.fillStyle=sk;g.fillRect(500,40,280,380);
    domes(g,380,[[560,90,60],[700,110,70]],['#A7C98E','#B1D095'],3);g.fillStyle='#EAD6A8';g.fillRect(500,370,280,40);g.drawImage(SP.tree.c,600,226,110,102);g.restore();
    g.save();g.strokeStyle='#A8744C';g.lineWidth=8;g.stroke(ap);g.beginPath();g.moveTo(640,60);g.lineTo(640,400);g.moveTo(510,250);g.lineTo(770,250);g.stroke();g.restore();
    clay(g,[[-20,470],[W+20,470],[W+20,H+20],[-20,H+20]],'#D7BE92',{shadow:false,id:.15,il:.4,raw:true});
    const rug=clay(g,rrp(120,486,1040,232,40),'#B9473A',{sb:14,sy:6});g.save();g.clip(rug.path);g.strokeStyle='#E9B949';g.lineWidth=6;g.strokeRect(146,510,988,240);g.strokeStyle='#2E8B57';g.lineWidth=4;g.strokeRect(160,524,960,240);
    for(let x=180;x<1110;x+=46){g.fillStyle=x%92?'#E9B949':'#F4E9D4';g.beginPath();g.moveTo(x,676);g.lineTo(x+12,662);g.lineTo(x+24,676);g.lineTo(x+12,690);g.fill()}g.restore();
    for(const[x,c]of[[20,'#2E8B57'],[200,'#C8452F'],[880,'#C8452F'],[1060,'#2E8B57']]){felt(g,rrp(x,388,200,92,40),c,{seed:x});g.save();g.fillStyle='#E9B949';for(let k=0;k<6;k++){g.beginPath();g.arc(x+30+k*28,434,4,0,7);g.fill()}g.restore()}},2);
  const strip=(h,fn)=>{const c=document.createElement('canvas');c.width=W*1.5;c.height=h*1.5;const g=c.getContext('2d');g.scale(1.5,1.5);fn(g);return c};
  SP.runFar=strip(380,g=>{g.fillStyle='#BCCDB3';g.fillRect(0,330,W,50);domes(g,380,[[0,210,140],[300,190,110],[640,240,130],[980,200,120],[1280,210,140]],['#C3D3BA','#B8CCB2'],21)});
  SP.runMid=strip(330,g=>{g.fillStyle='#A3C68B';g.fillRect(0,300,W,30);domes(g,330,[[0,190,100],[260,170,80],[560,220,95],[860,180,90],[1280,190,100],[1100,150,70]],['#A7C98E','#98BF82','#B1D095'],22);for(const x of[200,620,1010])g.drawImage(SP.tree.c,x-60,150,120,112)});
  SP.runGround=strip(H-GY+30,g=>clay(g,[[-60,30],[W+60,30],[W+60,H],[-60,H]],'#EAD6A8',{shadow:false,id:.12,il:.5,raw:true}));
}
function clouds(g,f,list){for(const[x,y,s,v]of list)put(g,SP.cloud,x+f/FPS*(v||5),y,{s})}
function turki(g,x,y,f,s=1,mode='idle'){const st=Math.floor(f/FPS*6);s/=1.3;
  if(mode==='cheer')put(g,st%2?SP.cheer:SP.cheer2,x,y-(st%2)*6*s,{s});else if(mode==='happy')put(g,SP.happy,x,y-(st%4===0?2:0),{s});else put(g,SP.stand,x,y-(st%4===0?2:0),{s})}
function cam(g,z,fx=640,fy=360,tx=fx,ty=fy){g.translate(tx,ty);g.scale(z,z);g.translate(-fx,-fy)}

/* ---------- shots ---------- */
function shot1(g,f){ // opening, sunrise + title
  const z=1+.03*f/225;g.save();cam(g,z,640,420);
  g.drawImage(SP.sky600,0,0,W,H);const su=E.inOutQuart(P(f,0,90));put(g,SP.sun,900,lerp(640,150,su),{});
  clouds(g,f,[[250,120,1,6],[760,80,.7,4]]);g.drawImage(SP.land600,0,0,W,H);put(g,SP.treeBig,280,612,{s:.8});g.restore();
  // title words right→left
  const words=[['رحلة',C.deep],['دمعة',C.deep],['اللبان',C.coral]];let x=1170;
  for(let i=0;i<3;i++){const v=vis(f,75+i*6),w=measure(g,[[words[i][0]+' ',0]],104);if(v.a>0){g.save();g.globalAlpha=v.a;const cx=x-w/2,cy=250;g.translate(cx,cy);g.scale(v.s,v.s);g.translate(-cx,-cy);
    g.save();g.shadowColor='rgba(30,60,40,.25)';g.shadowBlur=20;g.shadowOffsetY=10;txt(g,[[words[i][0],'#7fa86b']],x,cy+8,104);g.restore();txt(g,[[words[i][0],words[i][1]]],x,cy,104);g.restore()}x-=w}
  pill(g,[['يوم الزراعة العُماني','#fff']],1170,370,32,vis(f,110),{bg:C.benefit});
}
function shot2(g,f){ // the plant
  g.drawImage(SP.sky600,0,0,W,H);put(g,SP.sun,1090,110,{});clouds(g,f+225,[[250,120,1,6],[760,80,.7,4]]);g.drawImage(SP.land600,0,0,W,H);
  const gp=(f-45)/FPS,sy=f<45?0:spring(gp,.5,1.4),sx=f<45?0:lerp(.7,1,cl01(spring(gp,.7,1.4)));
  if(sy>0)put(g,SP.treeBig,430,612,{sx:sx,sy:Math.max(.001,sy)});
  const wp=E.outQuint(P(f,0,62)),tx=lerp(1400,860,wp);
  if(f<62){const st=Math.floor(f/FPS*8)%2;put(g,st?SP.walkA:SP.walkB,tx,690-(st?5:0),{s:1/1.3})}else turki(g,tx,690,f,1,f>80&&f<130?'cheer':'happy');
  chip(g,'النبات',C.plant,f,70);
  pill(g,[['هذه شجرة ',C.deep],['اللبان',C.coral]],1222,140,46,vis(f,82));
  pill(g,[['تنمو في محافظة ظفار، جنوب سلطنة عُمان',C.ink]],1222,214,32,vis(f,100),{w:700});
}
const PARTS=[{n:'الجذور',a:[236,372],tag:[120,30]},{n:'الجذع',a:[160,268],tag:[-150,0]},{n:'الأغصان',a:[232,198],tag:[130,0]},{n:'الأوراق',a:[288,106],tag:[110,0]},{n:'الأزهار',a:[218,38],tag:[120,-10]},{n:'اللبان',a:[122,198],tag:[-130,-10]}];
const X2=440,Y2=56,K2=1.5,LBL0=40,LBLD=60;
function shot3(g,f){ // parts
  const pp=E.inOutQuart(P(f,420,30)),z=lerp(1,2.6,pp),fx=432,fy=470;
  g.save();cam(g,z,fx,fy,lerp(fx,640,pp),lerp(fy,520,pp));
  g.drawImage(SP.sky600,0,0,W,H);put(g,SP.sun,1180,100,{});clouds(g,f+450,[[880,110,.9,5]]);g.drawImage(SP.land500,0,0,W,H);
  put(g,SP.treeRoots,X2,Y2,{s:1/1.6});
  const la=1-P(f,415,10);
  PARTS.forEach((p,i)=>{const t0=LBL0+i*LBLD;if(f<t0)return;const ax=X2+(p.a[0]-170)*K2,ay=Y2+p.a[1]*K2,ex=ax+p.tag[0],ey=ay+p.tag[1],lp=E.outExpo(P(f,t0,8));
    g.save();g.globalAlpha=la;g.strokeStyle='rgba(47,90,62,.75)';g.lineWidth=2.5;g.setLineDash([4,6]);g.beginPath();g.moveTo(ax,ay);g.lineTo(lerp(ax,ex,lp),lerp(ay,ey,lp));g.stroke();g.setLineDash([]);
    const dp=spring((f-t0)/FPS,.5,2);g.fillStyle=C.coral;g.beginPath();g.arc(ax,ay,6.5*dp,0,7);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(ax,ay,2.6*dp,0,7);g.fill();g.restore();
    const v=vis(f,t0+6);v.a*=la;const w=measure(g,[[p.n,0]],30)+57;pill(g,[[p.n,C.deep]],ex+w/2,ey,30,v)});
  const hop=PARTS.some((p,i)=>{const d=f-(LBL0+i*LBLD+6);return d>=0&&d<14});
  turki(g,1030,690,f,1,f>370?'cheer':hop?'happy':'idle');
  g.restore();
  chip(g,'مكونات النبتة',C.parts,f,10,410);
}
const S4={cut0:50,cutD:12,day0:130,dayD:12,tear0:262,tearD:9,tearDur:22,ntear:9};
function shot4(g,f){ // what is it used for — the harvest
  const z=lerp(1.08,1,E.outQuint(P(f,0,24)));g.save();cam(g,z);
  g.drawImage(SP.sky600,0,0,W,H);
  const dayF=f-S4.day0,inDays=dayF>=0&&dayF<10*S4.dayD;
  if(inDays){const ph=dayF/S4.dayD%1;put(g,SP.sun,lerp(-60,1340,ph),300-Math.sin(ph*Math.PI)*230,{});}
  else put(g,SP.sun,1100,120,{a:f<S4.day0?1:E.outQuint(P(f,S4.day0+10*S4.dayD,15))});
  clouds(g,f+900,[[180,130,.9,5],[1100,90,.7,4]]);g.drawImage(SP.land650,0,0,W,H);
  if(inDays){const ph=dayF/S4.dayD,na=.42*(1-Math.cos(2*Math.PI*ph))/2;g.fillStyle=`rgba(35,45,90,${na})`;g.fillRect(0,0,W,H);
    const mp=(ph+.5)%1;g.save();g.globalAlpha=na/.42;put(g,SP.moon,lerp(-60,1340,mp),280-Math.sin(mp*Math.PI)*200,{});g.restore()}
  g.drawImage(SP.bigTree,0,0,W,H);
  const dry=E.inOutQuart(P(f,S4.day0,10*S4.dayD));
  CUTS.forEach(([x,y],i)=>{const fc=S4.cut0+i*S4.cutD;if(f<fc)return;
    g.save();g.fillStyle='#EADFC6';g.beginPath();g.ellipse(x,y,22*E.outExpo(P(f,fc,5)),10,-.2,0,7);g.fill();g.strokeStyle='rgba(120,90,60,.5)';g.lineWidth=2;g.stroke();g.restore();
    for(let k=0;k<5;k++){const dt=(f-fc)/FPS;if(dt>1)break;const R=rng(i*10+k+1),vx=(R()-.5)*170,vy=-R()*130;g.save();g.globalAlpha=1-dt;g.fillStyle='#F2EADB';g.beginPath();g.ellipse(x+vx*dt,y+vy*dt+300*dt*dt,4,2.5,R()*3,0,7);g.fill();g.restore()}
    const s=E.outQuint(P(f,fc+4,40));if(s>0){put(g,SP.tearW,x,y+6+s*12,{s:(.4+s*.45),a:1-dry});put(g,SP.tear,x,y+6+s*12,{s:(.4+s*.45),a:dry});
      if(dry>.3){put(g,SP.tear,x-15,y+5,{s:.55*dry});put(g,SP.tear,x+15,y+10,{s:.5*dry})}}});
  // manqaf: travels cut to cut, swipes on each
  const mStart=S4.cut0-20,mEnd=S4.cut0+2*S4.cutD+14;
  if(f>=mStart-6&&f<mEnd+10){let px,py,rot=0;const seg=f<S4.cut0?-1:Math.min(2,Math.floor((f-S4.cut0)/S4.cutD));
    if(seg<0){const p=E.outQuint(P(f,mStart-6,26));px=lerp(1300,CUTS[0][0]+30,p);py=lerp(500,CUTS[0][1]-20,p)}
    else{const lp=(f-S4.cut0-seg*S4.cutD)/S4.cutD,a=CUTS[seg],b=CUTS[Math.min(2,seg+1)];const sw=E.outExpo(cl01(lp*2.2));
      if(seg<2&&lp>.45){const mp=E.inOutQuart(cl01((lp-.45)/.55));px=lerp(a[0]-30,b[0]+30,mp);py=lerp(a[1]+20,b[1]-20,mp)}else{px=lerp(a[0]+30,a[0]-30,sw);py=lerp(a[1]-20,a[1]+20,sw);rot=-.5+sw*.6}}
    const out=E.inExpo(P(f,mEnd,10));put(g,SP.manqaf,px+out*600,py-out*200,{rot:rot-.3,s:1/1.5*1.4})}
  // tears hop into the basket
  const bA=E.outQuint(P(f,S4.tear0-24,20));if(bA>0)put(g,SP.basket,640,lerp(780,668,bA),{s:1/1.3});
  let landed=0;
  for(let j=0;j<S4.ntear;j++){const t0=S4.tear0+j*S4.tearD,p=P(f,t0,S4.tearDur);if(f<t0)continue;const[cx,cy]=CUTS[j%3];
    if(p<1){const ex=640+((j%5)-2)*16,ey=628;put(g,SP.tear,lerp(cx,ex,p),lerp(cy,ey,E.inOutQuart(p))-Math.sin(p*Math.PI)*90,{s:.8,rot:p*4})}else landed++}
  for(let i=0;i<landed;i++)put(g,SP.tear,640-36+(i%5)*18,628-Math.floor(i/5)*9-(i%2)*3,{s:.62});
  turki(g,150,700,f,1,(f>S4.tear0+10&&f<S4.tear0+110)?'cheer':'happy');
  g.restore();
  chip(g,'ماذا تُستخدم فيه؟',C.use,f,6);
  pill(g,[['نجرح اللحاء بـ',C.deep],['المِنقف',C.coral]],1222,140,46,vis(f,26,122));
  if(inDays||f>=S4.day0&&f<S4.day0+10*S4.dayD+8){const n=Math.min(10,1+Math.floor(Math.max(0,dayF)/S4.dayD));const v=vis(f,S4.day0,S4.day0+10*S4.dayD);v.s=1;pill(g,[['اليوم '+AR(n),C.deep]],766,150,52,v)}
  pill(g,[['يجفّ الصمغ فيصير ',C.deep],['حبات اللبان',C.coral]],1222,140,46,vis(f,S4.day0+10*S4.dayD+6));
}
// caravan distance (precomputed so any frame renders alone)
const DIST=(()=>{const a=[0];for(let i=1;i<=450;i++){const v=10.5*cl01(i/22)*cl01((385-i)/55);a.push(a[i-1]+v)}return a})();
const dAt=f=>{const i=Math.max(0,Math.min(449,Math.floor(f))),fr=f-i;return lerp(DIST[i],DIST[i+1],fr)};
const CXC=880,DEND=DIST[450],PORT=DEND+190,SIGNS=[[dAt(55),'وادي دوكة'],[dAt(215),'شصر'],[PORT+70,'سمهرم']];
function shot5(g,f){ // importance: the caravan
  const d=dAt(f),moving=f<380;
  g.drawImage(SP.sky600,0,0,W,H);put(g,SP.sun,1100,110,{});clouds(g,f+1275,[[300,120,1,8],[800,80,.7,6]]);
  const tile=(c,k,y)=>{const x=((d*k)%W+W)%W;g.drawImage(c,x-W,y,W,c.height/1.5);g.drawImage(c,x,y,W,c.height/1.5)};
  tile(SP.runFar,.2,170);tile(SP.runMid,.5,300);g.drawImage(SP.runGround,0,GY-30,W,H-GY+30);
  for(let i=0;i<9;i++){const x=((i*173+d)%(W+200))-100,y=GY+30+((i*53)%70);put(g,i%3?SP.rock:SP.bush,x,y,{s:.5})}
  const shore=CXC-(PORT-d);
  if(shore>-50){clay(g,[[shore-1500,GY-14],[shore,GY-14],[shore+30,GY+40],[shore+10,H+20],[shore-1500,H+20]],'#79B5C8',{shadow:false,id:.25,il:.5,grain:.15,raw:true});
    g.save();g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=4;g.lineCap='round';const tt=f/FPS;for(let i=0;i<10;i++){const wx=shore-80-i*140+Math.sin(tt*2+i)*8,wy=GY+20+(i%3)*30;if(wx<shore-20){g.beginPath();g.moveTo(wx-24,wy);g.quadraticCurveTo(wx,wy-8,wx+24,wy);g.stroke()}}
    const sail=E.inOutQuart(P(f,395,55))*260;put(g,SP.dhow,shore-300-sail,GY+30+Math.sin(tt*1.6)*4,{rot:Math.sin(tt*1.2)*.03,s:1/1.2});
    if(f>330){for(let k=0;k<2;k++){const gx=shore-200-k*120+Math.sin(tt*.7+k)*40,gy=230+k*40+Math.sin(tt*2+k)*8,fl=Math.sin(tt*9+k)*6;g.strokeStyle='#5d6b70';g.lineWidth=2.5;g.beginPath();g.moveTo(gx-12,gy-fl);g.quadraticCurveTo(gx-5,gy-8,gx,gy);g.quadraticCurveTo(gx+5,gy-8,gx+12,gy-fl);g.stroke()}}g.restore()}
  put(g,SP.ruins,CXC-(DEND-170-d)+0,GY+6,{s:1/1.2});
  for(const[sd,t]of SIGNS){const sx=CXC-(sd-d);if(sx>-200&&sx<W+200)put(g,SP.sign[t],sx,GY+6,{s:1/1.2})}
  const st=Math.floor(f/FPS*7)%2,bob=moving?st*3:0;const cy=GY-bob;
  put(g,moving&&st?SP.camelB:SP.camelA,CXC,cy+4,{s:1.25/1.3});put(g,SP.ride,CXC+16,cy-136,{s:.9/1.2});
  if(f>392)turki(g,CXC-230,GY+62,f,.8,'cheer');
  chip(g,'أهمية النبات في عُمان',C.imp,f,6);
  const v1=vis(f,26,190);pill(g,[['منذ آلاف السنين تحمل القوافل اللبان',C.deep]],1222,140,40,v1);pill(g,[['إلى ميناء ',C.deep],['سمهرم',C.coral]],1222,204,40,vis(f,34,190));
  pill(g,[['«أرض اللبان»',C.coral],[' في قائمة التراث العالمي لليونسكو',C.deep]],1222,140,40,vis(f,226));
}
const TG=[{k:'burner',x:300,n:'البخور'},{k:'cup',x:520,n:'ماء اللبان'},{k:'perfume',x:740,n:'العطور'},{k:'scale',x:960,n:'رزق المزارعين'}];
const S6={drop0:45,dropD:90,fall:20};
function shot6(g,f){ // benefits in the majlis
  const z=1+.02*f/450;g.save();cam(g,z,640,480);g.drawImage(SP.majlis,0,0,W,H);const tt=f/FPS;
  TG.forEach((o,i)=>{const td=S6.drop0+i*S6.dropD,hit=td+S6.fall,y0=560;let sx=1,sy=1;
    if(f>=hit){const s=spring((f-hit)/FPS,.35,3);sx=1+.18*(1-s);sy=1-.18*(1-s)}
    const sp=SP[o.k];put(g,sp,o.x,y0,{s:1/1.5,sx,sy});
    const top=y0-sp.ay/1.5;
    if(f>=td&&f<hit){const p=E.inExpo(P(f,td,S6.fall));put(g,SP.tear,o.x,lerp(-40,top+10,p),{s:1.1,rot:p*2})}
    if(f>=hit){const a=f-hit;
      if(o.k==='burner'){for(let k=0;k<60;k++){const sk=k*5;if(a<sk)break;const age=(a-sk)/FPS;if(age>4.5)continue;const R=rng(k+3),x=o.x+(R()-.5)*16+Math.sin(age*2+R()*6)*12*age,y=top-age*58,r=(10+R()*8)*(1+age*.8),al=Math.min(1,age*2)*(1-age/4.5)*.5;
        const rg=g.createRadialGradient(x,y,0,x,y,r);rg.addColorStop(0,`rgba(255,255,255,${al})`);rg.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=rg;g.beginPath();g.arc(x,y,r,0,7);g.fill()}}
      if(o.k==='cup'){g.save();g.globalAlpha=Math.min(1,a/20)*.6;g.fillStyle='#F3DC95';g.beginPath();g.ellipse(o.x,top+52,20,4,0,0,7);g.fill();g.restore();
        const rp=cl01(a/30);if(rp<1){g.strokeStyle=`rgba(255,255,255,${1-rp})`;g.lineWidth=2;g.beginPath();g.ellipse(o.x,top+48,8+rp*22,2+rp*4,0,0,7);g.stroke()}
        for(let k=0;k<4;k++){const by=top+90-((a*1.2+k*16)%60);g.fillStyle='rgba(255,255,255,.7)';g.beginPath();g.arc(o.x-10+k*7,by,2.4,0,7);g.fill()}}
      if(o.k==='perfume')for(let k=0;k<6;k++){const an=tt*1.4+k*1.05,al=(Math.sin(tt*4+k)+1)/2*Math.min(1,a/15);g.save();g.globalAlpha=al;g.fillStyle='#FFF0B4';g.translate(o.x+Math.cos(an)*62,top+40+Math.sin(an)*36);g.rotate(an);g.fillRect(-5,-1.2,10,2.4);g.fillRect(-1.2,-5,2.4,10);g.restore()}
      if(o.k==='scale')for(let k=0;k<5;k++){const p=cl01((a-k*4)/24);if(p<=0)continue;const ang=-Math.PI/2+(k-2)*.45,dist=E.outQuint(p)*70;put(g,SP.coin,o.x+Math.cos(ang)*dist,top+20+Math.sin(ang)*dist+p*p*60,{s:1/1.5,a:1-cl01((a-k*4-50)/20)})}
    }});
  turki(g,1170,690,f,.95,f>S6.drop0+3*S6.dropD+S6.fall+10?'cheer':'happy');
  g.restore();
  TG.forEach((o,i)=>{const hit=S6.drop0+i*S6.dropD+S6.fall,w=measure(g,[[o.n,0]],30)+57;pill(g,[[o.n,C.deep]],o.x*z-640*z+640+w/2,612,30,vis(f,hit+6))});
  chip(g,'الاستفادة منها',C.benefit,f,6);
}
function shot7(g,f){ // outro + credits
  const z=1+.025*f/375;g.save();cam(g,z,400,500);
  g.drawImage(SP.sky600,0,0,W,H);put(g,SP.sun,140,120,{});clouds(g,f+2175,[[420,110,1,5],[950,70,.7,4]]);g.drawImage(SP.landEnd,0,0,W,H);
  put(g,SP.treeBig,250,616,{s:.85});turki(g,480,672,f,1.15,'cheer');
  for(let k=0;k<4;k++){const c=(f+k*40)%160;if(c>60)continue;const R=rng(Math.floor((f+k*40)/160)*7+k),bx=150+R()*420,by=180+R()*180;
    for(let m=0;m<10;m++){const an=m/10*6.28,p=c/60,dd=E.outQuint(p)*60;g.save();g.globalAlpha=1-p;g.fillStyle=['#F2C94C','#E4643F','#7FB05A','#FFF6DF'][m%4];g.beginPath();g.arc(bx+Math.cos(an)*dd,by+Math.sin(an)*dd+p*p*30,4,0,7);g.fill();g.restore()}}
  g.restore();
  pill(g,[['أرضنا خير.. ',C.deep],['وزرعتنا مستقبلنا',C.benefit]],1222,90,44,vis(f,25));
  // credit card
  const cs=spring((f-115)/FPS,.6,1.4),ca=cl01((f-115)/8);if(f>=115){g.save();g.globalAlpha=ca;const cx=960,cy=390;g.translate(cx,cy+(1-cs)*60);g.scale(.9+.1*cs,.9+.1*cs);g.translate(-cx,-cy);
    g.shadowColor='rgba(30,60,40,.28)';g.shadowBlur=40;g.shadowOffsetY=18;g.fillStyle=C.cream;g.fill(pathOf(rrp(700,190,520,400,44,8)));g.shadowColor='transparent';
    g.strokeStyle='#E5CF9C';g.lineWidth=4;g.setLineDash([12,10]);g.stroke(pathOf(rrp(716,206,488,368,32,8)));g.setLineDash([]);
    g.save();g.textAlign='center';g.direction='rtl';g.textBaseline='middle';
    g.font=`600 24px ${FONT}`;g.fillStyle='#6b7a6c';g.fillText('من إعداد',cx,262);
    g.font=`800 42px ${FONT}`;g.fillStyle='#B94A2B';g.fillText('تركي بن طارق الربيعي',cx,320);
    g.font=`800 34px ${FONT}`;g.fillStyle=C.deep;g.fillText('الصف ٢/٢',cx,384);
    g.font=`600 23px ${FONT}`;g.fillStyle='#6b7a6c';g.fillText('مدرسة البراعم للتعليم الأساسي (١–٤)',cx,450);g.fillText('مسابقة يوم الزراعة العُماني',cx,488);
    g.restore();g.restore();
    for(let i=0;i<5;i++)put(g,SP.tear,cx-60+i*30,536,{s:.8*spring((f-140-i*5)/FPS,.5,2)})}
  const fade=P(f,355,20);if(fade>0){g.fillStyle=`rgba(255,249,238,${E.inOutQuart(fade)})`;g.fillRect(0,0,W,H)}
}
const SHOTS=[shot1,shot2,shot3,shot4,shot5,shot6,shot7];

/* ---------- render ---------- */
const cv=document.getElementById('c'),ctx=cv.getContext('2d');
window.renderAt=function(t){const F=Math.min(TOTAL-1e-6,t*FPS);let i=SHOT.findIndex(([a,b])=>F>=a&&F<b);if(i<0)i=6;
  ctx.setTransform(cv.width/W,0,0,cv.height/H,0,0);ctx.clearRect(0,0,W,H);SHOTS[i](ctx,F-SHOT[i][0]);
  if(DEBUG){ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(8,H-34,150,26);ctx.fillStyle='#fff';ctx.font='16px monospace';ctx.textAlign='left';ctx.textBaseline='middle';ctx.direction='ltr';ctx.fillText(`S${i+1} f${Math.floor(F)} ${t.toFixed(2)}s`,14,H-21)}};

/* ---------- audio: original kids' music + SFX, frame-locked (hit = event frame + 1) ---------- */
const TS=f=>(f+1)/FPS;
function sfxEvents(){const ev=[];const at=(sh,lf)=>SHOT[sh][0]+lf;
  // S1 birds
  for(const[f,p]of[[30,3200],[52,2900],[140,3400],[170,3000]])ev.push(['bird',f,p]);
  // S2 footsteps & tree pop
  let lastSt=-1;for(let lf=0;lf<62;lf++){const st=Math.floor(lf/FPS*8);if(st!==lastSt){lastSt=st;ev.push(['step',at(1,lf)])}}
  ev.push(['pop',at(1,46)]);ev.push(['chime',at(1,82)]);
  // S3 labels
  PARTS.forEach((p,i)=>ev.push(['pluck',at(2,LBL0+i*LBLD+6),i]));ev.push(['whoosh',at(2,420)]);
  // S4 cuts, days, tears
  for(let i=0;i<3;i++)ev.push(['cut',at(3,S4.cut0+i*S4.cutD)]);for(let n=0;n<10;n++)ev.push(['tick',at(3,S4.day0+n*S4.dayD),n]);
  for(let j=0;j<S4.ntear;j++)ev.push(['tink',at(3,S4.tear0+j*S4.tearD+S4.tearDur),j]);
  // S5 camel steps, signs, port
  let ls=-1;for(let lf=0;lf<380;lf++){const st=Math.floor(lf/FPS*7);if(st!==ls){ls=st;ev.push(['hoof',at(4,lf)])}}
  for(const[sd]of SIGNS.slice(0,2)){let lf=0;while(lf<449&&CXC-(sd-dAt(lf))<CXC-10)lf++;ev.push(['chime',at(4,lf)])}
  ev.push(['gull',at(4,350)],['gull',at(4,372)]);
  // S6 drops
  TG.forEach((o,i)=>{const hit=at(5,S6.drop0+i*S6.dropD+S6.fall);ev.push(['plop',hit]);ev.push([o.k,hit])});
  // S7
  ev.push(['sparkle',at(6,25)],['chime',at(6,115)]);
  return ev}
window.buildAudio=async function(){
  const SR=48000,DUR=TOTAL/FPS,ac=new OfflineAudioContext(2,Math.ceil(SR*DUR),SR);
  const master=ac.createGain();master.gain.value=.9;const comp=ac.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=3;comp.attack.value=.003;comp.release.value=.2;master.connect(comp).connect(ac.destination);
  const musicBus=ac.createGain();musicBus.gain.value=.55;musicBus.connect(master);const sfxBus=ac.createGain();sfxBus.gain.value=.9;sfxBus.connect(master);
  // a little room
  const conv=ac.createConvolver();{const L=SR*1.6,b=ac.createBuffer(2,L,SR);for(let c=0;c<2;c++){const d=b.getChannelData(c);const r=rng(9+c);for(let i=0;i<L;i++)d[i]=(r()*2-1)*Math.pow(1-i/L,3)}conv.buffer=b}
  const wet=ac.createGain();wet.gain.value=.18;conv.connect(wet).connect(master);musicBus.connect(conv);
  const nb=(()=>{const b=ac.createBuffer(1,SR*2,SR),d=b.getChannelData(0),r=rng(77);for(let i=0;i<d.length;i++)d[i]=r()*2-1;return b})();
  const env=(gn,t,a,peak,dec)=>{gn.gain.setValueAtTime(0,t);gn.gain.linearRampToValueAtTime(peak,t+a);gn.gain.exponentialRampToValueAtTime(.0001,t+a+dec)};
  const osc=(type,f,t,dur,peak,dec,dest,a=.002,pan=0,slide=0)=>{const o=ac.createOscillator(),g=ac.createGain(),p=ac.createStereoPanner();o.type=type;o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(20,f+slide),t+dur);p.pan.value=pan;env(g,t,a,peak,dec);o.connect(g).connect(p).connect(dest);o.start(t);o.stop(t+a+dec+.05)};
  const noise=(t,dur,peak,type,freq,q,dest,a=.002,pan=0,fEnd)=>{const s=ac.createBufferSource();s.buffer=nb;const fl=ac.createBiquadFilter();fl.type=type;fl.frequency.setValueAtTime(freq,t);if(fEnd)fl.frequency.exponentialRampToValueAtTime(fEnd,t+dur);fl.Q.value=q;const g=ac.createGain(),p=ac.createStereoPanner();p.pan.value=pan;env(g,t,a,peak,dur);s.connect(fl).connect(g).connect(p).connect(dest);s.start(t,Math.random()*0);s.stop(t+a+dur+.05)};
  const pluck=(f,t,v=.16,pan=0)=>{osc('sine',f,t,1,v,.9,musicBus,.002,pan);osc('sine',f*2,t,1,v*.25,.35,musicBus,.002,pan);osc('triangle',f*4.02,t,1,v*.06,.12,musicBus,.001,pan)};
  // ---- music: 96 BPM, D major, bar = 2.5 s, 34 bars
  const BPM=96,beat=60/BPM,bar=beat*4,N=n=>440*Math.pow(2,(n-69)/12);
  const nm={D4:62,E4:64,'F#4':66,A4:69,B4:71,D5:74,E5:76,'F#5':78,A5:81,A3:57,B3:59,D3:50,G3:55,'F#3':54,E3:52,C5:72};
  const chords=[['D3','F#3','A3'],['A3','E4','C5'],['B3','D4','F#4'],['G3','B3','D4']].map(c=>c.map(x=>nm[x]??({C5:73}[x])));
  chords[1]=[57,64,73];
  const A=[['A4',0,'F#4',null,'A4','B4','A4',null],['E4',null,'F#4','E4','D4',null,null,null],['F#4',null,'A4',null,'B4',null,'D5',null],['B4','A4','F#4',null,'E4',null,null,null]];
  const B=[['D5',null,'B4',null,'A4',null,'F#4','A4'],['E4',null,'F#4',null,'A4',null,null,null],['B4',null,'A4','F#4','E4',null,'D4',null],['E4',null,'F#4',null,'D4',null,null,null]];
  const plan=[];for(let b=3;b<31;b+=4)plan.push([b,((b-3)/4)%2?B:A]);
  for(let b=0;b<34;b++){const t0=b*bar,ch=chords[b%4];
    // pad
    const padV=b<1?.018:.03;for(const n of ch){const o=ac.createOscillator(),g=ac.createGain(),lp=ac.createBiquadFilter();o.type='triangle';o.frequency.value=N(n);lp.type='lowpass';lp.frequency.value=900;g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(padV,t0+.5);g.gain.setValueAtTime(padV,t0+bar-.3);g.gain.linearRampToValueAtTime(0,t0+bar+.4);o.connect(lp).connect(g).connect(musicBus);o.start(t0);o.stop(t0+bar+.5)}
    if(b>=1&&b<33){osc('sine',N(ch[0]-12),t0,1,.11,1.2,musicBus,.01);osc('sine',N(ch[0]-12),t0+beat*2,1,.08,.9,musicBus,.01)}
    if(b>=3&&b<32){for(let k=0;k<8;k++){const n=ch[k%3]+(k>=3?12:0);pluck(N(n),t0+k*beat/2,.035,(k%2?.3:-.3))}
      for(let k=0;k<8;k++)noise(t0+k*beat/2,.04,k%2?.02:.011,'highpass',7000,.7,musicBus);
      for(const k of[0,2]){const o=ac.createOscillator(),g=ac.createGain();o.frequency.setValueAtTime(120,t0+k*beat);o.frequency.exponentialRampToValueAtTime(48,t0+k*beat+.14);env(g,t0+k*beat,.003,.22,.18);o.connect(g).connect(musicBus);o.start(t0+k*beat);o.stop(t0+k*beat+.3)}}}
  for(const[b0,ph]of plan)ph.forEach((barNotes,bi)=>barNotes.forEach((n,k)=>{if(n&&b0+bi<31)pluck(N(nm[n]),(b0+bi)*bar+k*beat/2,.14)}));
  // intro motif & ending
  ['A4','D5','F#5'].forEach((n,i)=>pluck(N(nm[n]),1*bar+i*beat,.11));
  [['A4',0],['B4',1],['D5',2],['F#5',3]].forEach(([n,i])=>pluck(N(nm[n]),31*bar+i*beat,.12));
  [['E5',0],['D5',2]].forEach(([n,i])=>pluck(N(nm[n]),32*bar+i*beat,.13));
  for(const n of[62,66,69,74])pluck(N(n),33*bar,.11);
  // ---- SFX
  for(const[k,f,p]of sfxEvents()){const t=TS(f);
    if(k==='bird'){osc('sine',p,t,.12,.05,.1,sfxBus,.005,.4,900);osc('sine',p*1.1,t+.14,.1,.04,.08,sfxBus,.005,.4,700)}
    if(k==='step')noise(t,.07,.09,'lowpass',900,1,sfxBus,.002,.2);
    if(k==='pop'){osc('sine',260,t,.25,.3,.25,sfxBus,.003,0,420);noise(t,.15,.08,'bandpass',1800,2,sfxBus)}
    if(k==='chime'){osc('sine',1568,t,1,.07,.8,sfxBus,.002,.2);osc('sine',2093,t+.06,1,.05,.8,sfxBus,.002,-.2)}
    if(k==='pluck'){const sc=[74,76,78,81,83,86];osc('triangle',N(sc[p]),t,1,.12,.35,sfxBus,.002);osc('sine',N(sc[p]+12),t,1,.05,.3,sfxBus,.002)}
    if(k==='whoosh')noise(t,.9,.08,'bandpass',400,1.2,sfxBus,.4,0,3000);
    if(k==='cut'){noise(t,.09,.14,'highpass',3000,1,sfxBus,.002,.1);noise(t+.03,.12,.08,'bandpass',900,3,sfxBus)}
    if(k==='tick')osc('triangle',p%2?1320:1175,t,.1,.06,.12,sfxBus,.002);
    if(k==='tink'){osc('sine',2350+p*60,t,.3,.07,.3,sfxBus,.001,(p%3-1)*.3);osc('sine',3520,t,.2,.03,.15,sfxBus,.001)}
    if(k==='hoof')noise(t,.06,.05,'lowpass',500,1,sfxBus,.002,.1);
    if(k==='gull'){osc('sine',1700,t,.3,.04,.28,sfxBus,.02,-.3,-700);osc('sine',1800,t+.32,.25,.03,.22,sfxBus,.02,-.3,-600)}
    if(k==='plop'){osc('sine',900,t,.12,.12,.12,sfxBus,.002,0,-600)}
    if(k==='burner')noise(t,1.2,.035,'bandpass',2500,1.5,sfxBus,.05,-.3);
    if(k==='cup'){osc('sine',520,t+.05,.15,.08,.15,sfxBus,.003,-.1,500)}
    if(k==='perfume')[2637,3136,3520].forEach((fr,i)=>osc('sine',fr,t+i*.07,.4,.04,.4,sfxBus,.002,.2));
    if(k==='scale')[0,1,2].forEach(i=>{osc('triangle',2200+i*190,t+i*.08,.3,.05,.3,sfxBus,.001,.3);osc('sine',3300+i*300,t+i*.08,.2,.025,.2,sfxBus,.001,.3)});
    if(k==='sparkle')[1760,2093,2637,3136].forEach((fr,i)=>osc('sine',fr,t+i*.06,.4,.04,.4,sfxBus,.002,0));
  }
  // ambience beds
  const bed=(t0,t1,type,freq,v)=>{const s=ac.createBufferSource();s.buffer=nb;s.loop=true;const fl=ac.createBiquadFilter();fl.type=type;fl.frequency.value=freq;const g=ac.createGain();g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(v,t0+1);g.gain.setValueAtTime(v,t1-1);g.gain.linearRampToValueAtTime(0,t1);s.connect(fl).connect(g).connect(sfxBus);s.start(t0);s.stop(t1)};
  bed(SHOT[4][0]/FPS,(SHOT[4][0]+340)/FPS,'lowpass',500,.025);bed((SHOT[4][0]+300)/FPS,SHOT[4][1]/FPS,'lowpass',700,.04);
  const buf=await ac.startRendering();
  // DC removal + peak normalise to -2.5 dBFS, 16-bit WAV, base64
  const L=buf.getChannelData(0),R=buf.getChannelData(1);let mL=0,mR=0;for(let i=0;i<L.length;i++){mL+=L[i];mR+=R[i]}mL/=L.length;mR/=R.length;let pk=0;for(let i=0;i<L.length;i++){L[i]-=mL;R[i]-=mR;pk=Math.max(pk,Math.abs(L[i]),Math.abs(R[i]))}
  const gain=Math.pow(10,-2.5/20)/(pk||1);const n=L.length,bytes=new Uint8Array(44+n*4),dv=new DataView(bytes.buffer);const ws=(o,s)=>{for(let i=0;i<s.length;i++)bytes[o+i]=s.charCodeAt(i)};
  ws(0,'RIFF');dv.setUint32(4,36+n*4,true);ws(8,'WAVEfmt ');dv.setUint32(16,16,true);dv.setUint16(20,1,true);dv.setUint16(22,2,true);dv.setUint32(24,SR,true);dv.setUint32(28,SR*4,true);dv.setUint16(32,4,true);dv.setUint16(34,16,true);ws(36,'data');dv.setUint32(40,n*4,true);
  for(let i=0;i<n;i++){dv.setInt16(44+i*4,Math.max(-32767,Math.min(32767,L[i]*gain*32767)),true);dv.setInt16(46+i*4,Math.max(-32767,Math.min(32767,R[i]*gain*32767)),true)}
  let s='';const CH=0x8000;for(let i=0;i<bytes.length;i+=CH)s+=String.fromCharCode.apply(null,bytes.subarray(i,i+CH));return btoa(s)};

/* ---------- boot ---------- */
window.__ready=false;
(async()=>{try{await Promise.race([Promise.all([document.fonts.load('800 40px "Baloo Bhaijaan 2"'),document.fonts.load('600 40px "Baloo Bhaijaan 2"')]),new Promise(r=>setTimeout(r,6000))])}catch(e){}
  buildFilm();const q=new URLSearchParams(location.search);
  if(q.has('t')){window.renderAt(parseFloat(q.get('t'))||0);window.__ready=true;return}
  window.__ready=true;const t0=performance.now();const loop=()=>{const t=((performance.now()-t0)/1000)%(TOTAL/FPS);window.renderAt(t);requestAnimationFrame(loop)};loop()})();
