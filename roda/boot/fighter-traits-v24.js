// Heights affect sprite proportions and attack reach; physiques remain consistent in every pose.
const fighterTraits=[
{height:172,build:1.02,speed:4.8,tempo:1,reach:1,power:1,style:'Measured pressure',signature:'Roda de Dandara',accent:'#e8bb42',variant:0},
{height:181,build:.88,speed:5.2,tempo:.91,reach:1.07,power:.94,style:'Long-range feints',signature:'Tranca de Recife',accent:'#d78938',variant:1},
{height:154,build:1.13,speed:4.2,tempo:1.04,reach:.91,power:1.06,style:'Compact counterplay',signature:'Memória de Cachoeira',accent:'#e0e0ce',variant:2},
{height:178,build:1.16,speed:4.5,tempo:1.06,reach:1.03,power:1.08,style:'Heavy turning kicks',signature:'Chama de Zinga',accent:'#d45b37',variant:3},
{height:150,build:.87,speed:5.6,tempo:.86,reach:.88,power:.9,style:'Fast evasive entries',signature:'Lua de Belém',accent:'#d3bf8e',variant:4},
{height:186,build:.93,speed:4.9,tempo:.96,reach:1.1,power:.98,style:'Flowing reach',signature:'Correnteza',accent:'#61a176',variant:1},
{height:166,build:1.15,speed:5,tempo:.92,reach:.97,power:1.04,style:'Explosive close range',signature:'Raio de Nala',accent:'#e4b82d',variant:3},
{height:164,build:.83,speed:5.3,tempo:.88,reach:.93,power:.95,style:'Low crouching specialist',signature:'Jardim de Jade',accent:'#60bd9a',variant:2},
{height:162,build:.9,speed:5.5,tempo:.88,reach:.95,power:.92,style:'Aerial mix-ups',signature:'Vento de Jaci',accent:'#4d9bc7',variant:4},
{height:176,build:1.08,speed:4.9,tempo:.97,reach:1.02,power:1,style:'Rhythmic combinations',signature:'Sol Nascente',accent:'#b6bf65',variant:0},
{height:191,build:.95,speed:4.4,tempo:1.08,reach:1.14,power:1.07,style:'Patient long-range guard',signature:'Guarda de Ayana',accent:'#d6cc94',variant:1},
{height:199,build:1.24,speed:3.9,tempo:1.14,reach:1.12,power:1.12,style:'Heavyweight pressure',signature:'Muralha',accent:'#c6bbad',variant:3},
{height:169,build:.85,speed:5.6,tempo:.85,reach:.98,power:.91,style:'Quick airborne attacks',signature:'Trovão de Natal',accent:'#efbc35',variant:4},
{height:160,build:1.08,speed:4.3,tempo:1.03,reach:.94,power:1.05,style:'Deceptive low counters',signature:'Armadilha do Velho',accent:'#609067',variant:2},
{height:182,build:1,speed:4.3,tempo:1,reach:1.06,power:1,style:'Six heavy kicks',signature:'Maré Cheia',accent:'#739ecf',variant:3}
];
const characterMoves=fighterTraits.map((t,id)=>movesForTraits(t,id));
function movesForTraits(t,id){return []} // Filled after the base move tables initialize.

// Techniques describe real differences in attack path and contact height.
// Every fighter has an authored six-button loadout, including two sequences.
const techniqueBook={
 bencao:{name:'Bênção',visual:'push',level:'mid',reach:1,travel:0},
 rasteira:{name:'Rasteira',visual:'sweep',level:'low',reach:1,travel:0},
 frente:{name:'Meia-lua de frente',visual:'crescent',level:'high',reach:1.02,travel:.4},
 costas:{name:'Meia-lua de costas',visual:'back',level:'high',reach:1.06,travel:.2},
 chapa:{name:'Chapa lateral',visual:'side',level:'mid',reach:1.12,travel:1.1},
 martelo:{name:'Martelo',visual:'hook',level:'high',reach:.92,travel:.7},
 armada:{name:'Armada',visual:'turn',level:'high',reach:1.04,travel:1.3},
 au:{name:'Aú com chapa',visual:'wheel',level:'high',reach:1.03,travel:2.2}
};
const fighterKits=[
 // A, B, X, Y, LB sequence, RB sequence; specials never share an entire kit.
 ['bencao','rasteira','frente','costas',['frente','chapa'],['bencao','armada','costas']],
 ['chapa','bencao','armada','frente',['chapa','costas'],['frente','chapa','armada']],
 ['bencao','rasteira','costas','chapa',['rasteira','chapa'],['costas','rasteira']],
 ['martelo','chapa','armada','costas',['armada','costas'],['martelo','armada','chapa']],
 ['rasteira','bencao','frente','martelo',['rasteira','frente'],['frente','rasteira','chapa']],
 ['chapa','frente','costas','armada',['costas','chapa'],['armada','costas','frente']],
 ['martelo','bencao','chapa','frente',['bencao','martelo'],['martelo','chapa','bencao']],
 ['lowpush','lowsweep','lowback','lowswitch',['lowpush','lowsweep'],['lowback','lowswitch','lowsweep']],
 ['frente','bencao','au','martelo',['au','frente'],['frente','au','chapa']],
 ['bencao','frente','martelo','armada',['frente','martelo'],['bencao','frente','armada']],
 ['chapa','bencao','frente','costas',['bencao','chapa'],['chapa','costas']],
 ['bencao','chapa','costas','armada',['chapa'],['bencao','costas']],
 ['martelo','frente','au','armada',['au','martelo'],['martelo','au','armada']],
 ['rasteira','chapa','costas','frente',['costas','rasteira'],['rasteira','costas','rasteira']],
 ['bencao','chapa','frente','costas',['costas','armada'],['chapa','frente','costas']]
];
const fighterPlans=[
 'Balanced pressure · crescent into straight kick',
 'Long-range kicks · advancing turning finish',
 'Retreating setups · sweep into side kick',
 'Turning pressure · heavy chained kicks',
 'Low openings · retreat, then re-enter',
 'Long sweeping arcs · back-kick combinations',
 'Close pressure · short, rapid kick strings',
 'Low ginga · six low attacks · jade-garden combinations',
 'Hand-supported aú entries · high pressure',
 'Three-kick rhythm · straight, crescent, turn',
 'Keep-out reach · strong pushback',
 'Single heavy special · slow committed advance',
 'Fast aú entries · mobile turning combinations',
 'Low traps · retreating sweep sequences',
 'Six heavy attacks · measured three-kick finish'
];
Object.assign(techniqueBook,{lowpush:{name:'Chapa baixa',visual:'lowpush',level:'low',reach:.9,travel:0},lowsweep:{name:'Rasteira de jade',visual:'lowsweep',level:'low',reach:.95,travel:.2},lowback:{name:'Meia-lua baixa',visual:'lowback',level:'low',reach:.94,travel:.2},lowswitch:{name:'Troca rasteira',visual:'lowswitch',level:'low',reach:.9,travel:.5}});
function buildFighterMoves(base,boss){
 fighterTraits.forEach((t,id)=>{characterMoves[id]=fighterKits[id].map((entry,n)=>{
  const keys=Array.isArray(entry)?entry:[entry],m=(id===14?boss:base)[n];
  const totalDamage=id===14?m.damage:Math.round(m.damage*t.power);
  const phases=keys.map((key,i)=>{const tech=techniqueBook[key];return {...tech,key,frames:keys.length>1?12: m.active,range:Math.round(m.range*t.reach*tech.reach),damage:keys.length>1?Math.round(totalDamage*(i===keys.length-1?.5:.5/(keys.length-1))):totalDamage,knockdown:i===keys.length-1&&(n>=4||tech.level==='low'),push:id===10||id===11?7:keys.length>1&&i<keys.length-1?1.2:3.2}});
  return {...m,...phases[0],phases,start:Math.max(4,Math.round(m.start*t.tempo)),active:phases.reduce((s,p)=>s+p.frames,0),end:Math.max(6,Math.round(m.end*t.tempo)-2),name:keys.map(k=>techniqueBook[k].name).join(' → '),signature:n>=4?(n===5?t.signature:profiles[id].name+' · sequência'):null,retreat:[2,4,13].includes(id)&&n>=4?-1.8:0,variant:t.variant};
 });});
}
function attackPhase(m,age){let frame=Math.max(0,age-m.start),index=0;while(index<m.phases.length-1&&frame>=m.phases[index].frames){frame-=m.phases[index].frames;index++}return {...m,...m.phases[index],phase:index,phaseFrame:frame};}

// Each bumper uses its own authored atlas row, contacts and timing.
const exclusiveSpecials=[
 [['Círculo de Dandara',['frente','rasteira'],[3,5]],['Roda de Dandara',['frente','costas'],[3,5]]],
 [['Linha de Recife',['chapa'],[4]],['Tranca de Recife',['frente'],[5]]],
 [['Raiz de Cachoeira',['rasteira'],[5]],['Memória de Cachoeira',['chapa'],[5]]],
 [['Volta de Fogo',['costas'],[5]],['Chama de Zinga',['frente','costas'],[3,5]]],
 [['Lua Rasteira',['rasteira'],[4]],['Lua de Belém',['chapa'],[5]]],
 [['Arco do Rio',['costas','costas'],[4,5]],['Correnteza',['frente'],[5]]],
 [['Estalo de Nala',['bencao','martelo'],[4,5]],['Raio de Nala',['chapa'],[5]]],
 [['Nuvem Rasteira',['lowpush','lowsweep'],[4,4]],['Jardim de Jade',['lowback','lowswitch','lowsweep'],[4,4,4]]],
 [['Aú do Horizonte',['au','au'],[4,5]],['Vento de Jaci',['costas'],[5]]],
 [['Giro Solar',['armada'],[5]],['Sol Nascente',['costas','rasteira'],[4,5]]],
 [['Palma da Guarda',['bencao'],[5]],['Guarda de Ayana',['frente'],[5]]],
 [['Portão de Pedra',['chapa'],[5]],['Muralha',['costas'],[5]]],
 [['Salto de Natal',['au','chapa'],[3,5]],['Trovão de Natal',['armada'],[5]]],
 [['Isca do Velho',['rasteira'],[5]],['Armadilha do Velho',['costas'],[5]]],
 [['Passo do Mestre',['bencao'],[4]],['Maré Cheia',['costas'],[5]]]
];
function connectExclusiveSpecials(){fighterTraits.forEach((t,id)=>{for(let slot=0;slot<2;slot++){const old=characterMoves[id][slot+4],def=exclusiveSpecials[id][slot],keys=def[1];const phases=keys.map((key,i)=>({...techniqueBook[key],key,frames:keys.length===1?24:14,range:old.range,damage:Math.round(old.phases.reduce((sum,phase)=>sum+phase.damage,0)/keys.length),knockdown:i===keys.length-1,push:i===keys.length-1?5:1.1,contactPose:def[2][i]}));characterMoves[id][slot+4]={...old,...phases[0],phases,start:Math.round((slot?21:17)*t.tempo),active:phases.reduce((n,p)=>n+p.frames,0),end:Math.round(17*t.tempo),signature:def[0],name:keys.map(k=>techniqueBook[k].name).join(' → '),exclusiveSlot:slot,retreat:[1,2,4,13].includes(id)&&slot===1?-1.1:0};}})}
