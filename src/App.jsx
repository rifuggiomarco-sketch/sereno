import React, { useState, useEffect } from 'react';
import {
  Leaf, Wind, Moon, Briefcase, Heart, BarChart3, Sparkles, TreePine, Bird,
  Sun, Pause, Lock, Users, Flame, AlertCircle, ArrowRight, Check, X,
  Settings as Gear, Bell, Shield, Coffee, Camera, MessageCircle, Music,
  Smartphone, Clock, ChevronLeft, ChevronRight, Plus, Cloud, Flower2, Globe, MapPin
} from 'lucide-react';
import Auth from './components/Auth';
import { supabase } from './supabase';

/* ─── THEME ──────────────────────────────────────────────── */
const T = {
  cream:      '#f4efe6',
  creamLight: '#faf6ed',
  green:      '#2d4a3e',
  greenDark:  '#1a2e25',
  greenMid:   '#8a9676',
  earth:      '#d4c5a9',
  terra:      '#c97b5c',
  ink:        '#2d3a2e',
  muted:      '#7a7a5e',
};

/* ─── STYLES ─────────────────────────────────────────────── */
function GlobalStyles() {
  return (
    <style>{`
      @keyframes bloom-in   { from{transform:scale(0.5);opacity:0} to{transform:scale(1);opacity:1} }
      @keyframes fade-up    { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
      @keyframes slide-up   { from{transform:translateY(100%)} to{transform:translateY(0)} }
      @keyframes sway       { 0%,100%{transform:rotate(-2deg)} 50%{transform:rotate(2deg)} }
      @keyframes drift      { 0%{transform:translateX(-40px)} 100%{transform:translateX(420px)} }
      @keyframes float-up   { 0%{opacity:0;transform:translateY(0)} 20%{opacity:.6} 100%{opacity:0;transform:translateY(-90px) translateX(15px)} }
      @keyframes pulse-soft { 0%,100%{opacity:.35} 50%{opacity:.8} }
      @keyframes br-expand  { from{transform:scale(.55)} to{transform:scale(1)} }
      @keyframes br-contract{ from{transform:scale(1)} to{transform:scale(.55)} }
      .fd { font-family:sans-serif }
      .sway         { animation:sway 4s ease-in-out infinite; transform-origin:bottom }
      .drift        { animation:drift 28s linear infinite }
      .float-up     { animation:float-up 4s ease-out infinite }
      .pulse-soft   { animation:pulse-soft 3s ease-in-out infinite }
      .fade-up      { animation:fade-up .45s ease-out forwards }
      .bloom-in     { animation:bloom-in 1.4s cubic-bezier(.22,1,.36,1) forwards }
      .slide-up     { animation:slide-up .35s cubic-bezier(.22,1,.36,1) forwards }
      .scroll::-webkit-scrollbar { display:none }
      .scroll { -ms-overflow-style:none; scrollbar-width:none }
      .grain { background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.4'/%3E%3C/svg%3E") }
    `}</style>
  );
}

/* ─── ROOT ───────────────────────────────────────────────── */
export default function Sereno() {
  const [stage, setStage]           = useState('splash');     // splash | auth | main
  const [session, setSession]       = useState(null);
  const [screen, setScreen]         = useState('garden');     // garden | insights | modes
  const [user, setUser]             = useState({
    name:'', relationship:null, vulnerableTimes:[], apps:[],
    intensity:'balanced', activeMode:'famiglia',
  });

  // metrics from supabase
  const [streak, setStreak]           = useState(0);
  const [opensToday, setOpensToday]   = useState(0);
  const [timeMin, setTimeMin]         = useState(0);
  const [realTrees, setRealTrees]     = useState(0);
  const [friendsData, setFriendsData] = useState([]);

  // overlays
  const [pauseApp, setPauseApp]     = useState(null);         // null or app name
  const [focusSess, setFocusSess]   = useState(null);         // null or {type,duration,flower}
  const [settingsOpen, setSettings] = useState(false);
  const [modeSheet, setModeSheet]   = useState(false);
  const [friendsOpen, setFriends]   = useState(false);
  const [insTab, setInsTab]         = useState('week');

  // Splash auto-advance
  useEffect(() => {
    if (stage !== 'splash') return;
    const t = setTimeout(() => setStage('auth'), 2400);
    return () => clearTimeout(t);
  }, [stage]);

  // Load data from Supabase when session is available
  useEffect(() => {
    if (!session?.user?.id) return;
    const userId = session.user.id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    supabase.from('profiles').select('*').eq('id', userId).single()
      .then(({ data: profile, error }) => {
        if (error && error.code === 'PGRST116') {
          return supabase.from('profiles').insert({
            id: userId, name: '', streak: 0, trees: 0,
            intensity: 'balanced', active_mode: 'famiglia'
          }).select().single().then(({ data }) => data);
        }
        return profile;
      })
      .then(profile => {
        if (profile) {
          setStreak(profile.streak || 0);
          setRealTrees(profile.trees || 0);
          setUser(u => ({
            ...u,
            name: profile.name || '',
            intensity: profile.intensity || 'balanced',
            activeMode: profile.active_mode || 'famiglia',
          }));
        }
      });

    supabase.from('sessions').select('duration,completed')
      .eq('user_id', userId).gte('created_at', today.toISOString())
      .then(({ data: sessions }) => {
        if (sessions) {
          setOpensToday(sessions.length);
          setTimeMin(sessions.filter(s => s.completed).reduce((sum, s) => sum + s.duration, 0));
        }
      });

    supabase.from('friendships').select('friend_id').eq('user_id', userId)
      .then(async ({ data: friendships }) => {
        if (!friendships?.length) return;
        const friendIds = friendships.map(f => f.friend_id);
        const { data: friendProfiles } = await supabase
          .from('profiles').select('*').in('id', friendIds);
        if (friendProfiles) {
          setFriendsData(friendProfiles.map(p => ({
            id: p.id, name: p.name || 'Amico',
            streak: p.streak || 0, trees: p.trees || 0,
            avatar: ['🌳','🌲','🌸','🌿','🌻','🌱'][Math.abs((p.name||'A').charCodeAt(0)) % 6],
            color: ['#c97b5c','#3a5a2e','#c97b94','#8aa66e','#e8a83a','#8aa66e'][Math.abs((p.name||'A').charCodeAt(0)) % 6],
            online: false,
          })));
        }
      });
  }, [session]);

  const hours = Math.floor(timeMin / 60);
  const mins  = timeMin % 60;

  const onResist = () => {
    setTimeMin(m => m + 8);
    setPauseApp(null);
    if (session?.user?.id) {
      supabase.from('sessions').insert({
        user_id: session.user.id, type: 'breath',
        duration: 8, completed: true,
      }).then(({ error }) => { if (error) console.error(error); });
    }
  };

  const onSlip = () => {
    setOpensToday(o => o + 1);
    setPauseApp(null);
    if (session?.user?.id) {
      supabase.from('sessions').insert({
        user_id: session.user.id, type: 'breath',
        duration: 0, completed: false,
      }).then(({ error }) => { if (error) console.error(error); });
    }
  };

  // what layer is on top?
  const busy = !!pauseApp || !!focusSess;

  return (
    <div style={{ minHeight:'100vh', width:'100%', background:'radial-gradient(ellipse at top,#d4c5a9,#8a7c63)', fontFamily:'sans-serif' }}>
      <GlobalStyles />

      <div style={{ position:'relative', width:'100%', height:'100%', background: screenBg(stage, screen) }}>

            {/* Status bar */}
            {stage !== 'splash' && <StatusBar dark={stage==='main' && screen==='modes'} />}

            {/* ── Layers ── */}
            {stage === 'splash' && <Splash />}
            {stage === 'auth' && <Auth onAuthSuccess={(s) => { setSession(s); setStage('main'); }} />}

            {stage === 'main' && !busy && (
              <>
                {screen === 'garden'   && (
                  <Garden user={user} streak={streak} opensToday={opensToday}
                    hours={hours} mins={mins} realTrees={realTrees}
                    friends={friendsData}
                    onTriggerPause={app => setPauseApp(app)}
                    onOpenSettings={() => setSettings(true)}
                    onOpenModeSheet={() => setModeSheet(true)}
                    onOpenFriends={() => setFriends(true)}
                    onStartFocus={(type,duration,flower) => setFocusSess({type,duration,flower})} />
                )}
                {screen === 'insights' && (
                  <Insights tab={insTab} setTab={setInsTab} realTrees={realTrees} />
                )}
                {screen === 'modes'    && (
                  <Modes user={user} setUser={setUser} onOpenFriends={() => setFriends(true)} />
                )}
                <BottomNav screen={screen} setScreen={setScreen} dark={screen==='modes'} />
              </>
            )}

            {/* Full-screen overlays (no nav) */}
            {!!pauseApp && (
              <PauseOverlay appName={pauseApp} opensToday={opensToday}
                intensity={user.intensity} onResist={onResist} onSlip={onSlip} />
            )}
            {!!focusSess && (
              <FocusSession {...focusSess} onEnd={() => {
                if (session?.user?.id && focusSess) {
                  supabase.from('sessions').insert({
                    user_id: session.user.id, type: focusSess.type,
                    duration: focusSess.duration, flower: focusSess.flower, completed: true,
                  }).then(({ error }) => { if (error) console.error(error); });
                  setTimeMin(m => m + focusSess.duration);
                }
                setFocusSess(null);
              }} />
            )}

            {/* Slide-in panels */}
            {settingsOpen  && <SettingsPanel user={user} setUser={setUser} onClose={() => setSettings(false)} />}
            {modeSheet     && <ModeSheet user={user} setUser={setUser} onClose={() => setModeSheet(false)} />}
            {friendsOpen   && <FriendsModal friends={friendsData} onClose={() => setFriends(false)} />}
          </div>
        </div>
  );
}

function screenBg(stage, screen) {
  if (stage === 'splash') return T.green;
  if (stage === 'main' && screen === 'garden') return '#c4b896';
  if (stage === 'main' && screen === 'modes')  return T.greenDark;
  return T.cream;
}

/* ─── STATUS BAR ────────────────────────────────────────── */
function StatusBar({ dark }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingLeft:'32px', paddingRight:'32px', paddingTop:'12px', paddingBottom:'8px', fontSize:'12px', fontWeight:500, position:'relative', zIndex:30, color: dark ? T.cream : T.ink }}>
      <span>9:41</span>
      <div style={{ position:'absolute', left:'50%', transform:'translateX(-50%)', top:'8px', width:'96px', height:'24px', borderRadius:'9999px', backgroundColor:'black' }} />
      <span>●●●</span>
    </div>
  );
}

/* ─── SPLASH ─────────────────────────────────────────────── */
function Splash() {
  return (
    <div style={{ position:'absolute', top:0, right:0, bottom:0, left:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:T.cream }}>
      <div style={{ animation:'bloom-in 1.4s cubic-bezier(.22,1,.36,1) forwards', textAlign:'center' }}>
        <div style={{ position:'relative', width:'96px', height:'96px', marginBottom:'24px', display:'flex', alignItems:'center', justifyContent:'center', marginLeft:'auto', marginRight:'auto' }}>
          <div style={{ position:'absolute', top:0, right:0, bottom:0, left:0, borderRadius:'9999px', animation:'pulse-soft 3s ease-in-out infinite', background:'radial-gradient(circle,rgba(212,197,169,.3),transparent 70%)' }} />
          <Leaf size={48} style={{ color:T.earth }} strokeWidth={1.2} />
        </div>
        <p style={{ fontFamily:'sans-serif', fontSize:'48px', letterSpacing:'-0.025em' }}>Sereno</p>
        <p style={{ fontSize:'12px', marginTop:'12px', letterSpacing:'.3em', textTransform:'uppercase', opacity:0.6 }}>Riconnetti</p>
      </div>
    </div>
  );
}

/* ─── ONBOARDING ─────────────────────────────────────────── */
const ONB_STEPS = ['welcome','name','relationship','times','apps','intensity','permission','ready'];

function Onboarding({ step, setStep, user, setUser, onComplete }) {
  const key = ONB_STEPS[step];
  const isLast = step === ONB_STEPS.length - 1;

  const canNext = () => {
    if (key==='name') return user.name.trim().length > 0;
    if (key==='relationship') return !!user.relationship;
    if (key==='times') return user.vulnerableTimes.length > 0;
    if (key==='apps') return user.apps.length > 0;
    return true;
  };

  const next = () => isLast ? onComplete() : setStep(s => s+1);
  const back = () => setStep(s => s-1);

  return (
    <div style={{ position:'absolute', top:0, right:0, bottom:0, left:0, display:'flex', flexDirection:'column', paddingLeft:'24px', paddingRight:'24px', paddingBottom:'24px', paddingTop:'8px', background:T.cream }}>
      {/* Progress bar */}
      {step > 0 && (
        <div style={{ display:'flex', alignItems:'center', gap:'8px', paddingBottom:'16px' }}>
          {step > 1 && <button onClick={back}><ChevronLeft size={20} style={{ color:T.ink }} /></button>}
          <div style={{ flex:1, display:'flex', gap:'4px' }}>
            {ONB_STEPS.slice(1).map((_,i) => (
              <div key={i} style={{ flex:1, height:'2px', borderRadius:'9999px', background: i+1<=step ? T.green : 'rgba(45,58,46,.15)' }} />
            ))}
          </div>
        </div>
      )}

      <div style={{ flex:1, overflowY:'auto', MsOverflowStyle:'none', scrollbarWidth:'none', animation:'fade-up .45s ease-out forwards' }} key={key}>
        {key==='welcome'      && <OnbWelcome />}
        {key==='name'         && <OnbName user={user} setUser={setUser} />}
        {key==='relationship' && <OnbRelationship user={user} setUser={setUser} />}
        {key==='times'        && <OnbTimes user={user} setUser={setUser} />}
        {key==='apps'         && <OnbApps user={user} setUser={setUser} />}
        {key==='intensity'    && <OnbIntensity user={user} setUser={setUser} />}
        {key==='permission'   && <OnbPermission />}
        {key==='ready'        && <OnbReady user={user} />}
      </div>

      <button onClick={next} disabled={!canNext()}
        style={{ marginTop:'12px', width:'100%', borderRadius:'16px', paddingTop:'16px', paddingBottom:'16px', fontSize:'14px', fontWeight:500, display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', background:canNext()?T.green:'rgba(45,58,46,.18)', color:canNext()?T.cream:'rgba(45,58,46,.35)' }}>
        {key==='welcome' ? 'Inizia' : isLast ? 'Entra nel giardino' : 'Continua'}
        <ArrowRight size={16} />
      </button>
    </div>
  );
}

function OnbWelcome() {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', textAlign:'center' }}>
      <div style={{ position:'relative', width:'112px', height:'112px', marginBottom:'32px', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ position:'absolute', top:0, right:0, bottom:0, left:0, borderRadius:'50%', animation:'pulse-soft 3s ease-in-out infinite', background:'radial-gradient(circle,rgba(45,74,62,.15),transparent 70%)' }} />
        <Leaf size={52} style={{ color:T.green }} strokeWidth={1.2} />
      </div>
      <h1 style={{ fontFamily:'sans-serif', fontSize:'36px', lineHeight:1.25, marginBottom:'16px', color:T.ink }}>Riconnetti<br/>con il presente</h1>
      <p style={{ fontSize:'14px', lineHeight:1.625, maxWidth:'320px', color:T.muted }}>
        Non ti dirò di smettere. Ti aiuterò a notare. Poi a scegliere.
      </p>
      <div style={{ marginTop:'32px', display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px', width:'100%', textAlign:'center' }}>
        {[['186','controlli/giorno'],['4h','al telefono'],['23%','recuperabile']].map(([n,l],i)=>(
          <div key={i}>
            <p style={{ fontFamily:'sans-serif', fontSize:'24px', color:T.green }}>{n}</p>
            <p style={{ fontSize:'10px', marginTop:'4px', lineHeight:1.25, color:T.muted }}>{l}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function OnbName({ user, setUser }) {
  return (
    <div style={{ paddingTop:'16px' }}>
      <h2 style={{ fontFamily:'sans-serif', fontSize:'30px', lineHeight:1.25, marginBottom:'8px', color:T.ink }}>Come ti chiami?</h2>
      <p style={{ fontSize:'14px', marginBottom:'32px', color:T.muted }}>Solo per parlarti come una persona.</p>
      <input autoFocus type="text" value={user.name}
        onChange={e => setUser({...user, name:e.target.value})}
        placeholder="Il tuo nome"
        style={{ width:'100%', borderRadius:'16px', padding:'16px 20px', fontSize:'16px', outline:'none', borderWidth:'2px', borderStyle:'solid', background:'white', borderColor:user.name?T.green:'rgba(45,58,46,.1)', color:T.ink, fontFamily:'inherit' }} />
    </div>
  );
}

function OnbRelationship({ user, setUser }) {
  const opts = [
    { id:'addicted',   label:'Mi sento dipendente',       sub:'Non riesco a smettere di controllarlo' },
    { id:'distracted', label:'Mi distrae troppo',          sub:'Non riesco a concentrarmi' },
    { id:'drained',    label:'Mi svuota',                  sub:'Dopo ore mi sento peggio' },
    { id:'curious',    label:'Voglio essere intenzionale', sub:'Sto bene, ma voglio migliorare' },
  ];
  return (
    <div style={{ paddingTop:'16px' }}>
      <h2 style={{ fontFamily:'sans-serif', fontSize:'30px', lineHeight:1.25, marginBottom:'8px', color:T.ink }}>Cosa ti porta qui?</h2>
      <p style={{ fontSize:'14px', marginBottom:'24px', color:T.muted }}>Nessuna risposta sbagliata.</p>
      <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
        {opts.map(o => {
          const sel = user.relationship === o.id;
          return (
            <button key={o.id} onClick={() => setUser({...user,relationship:o.id})}
              style={{ width:'100%', textAlign:'left', borderRadius:'16px', padding:'16px', borderWidth:'2px', borderStyle:'solid', background:sel?T.green:'white', color:sel?T.cream:T.ink, borderColor:sel?T.green:'rgba(45,58,46,.08)' }}>
              <p style={{ fontWeight:500, fontSize:'14px' }}>{o.label}</p>
              <p style={{ fontSize:'12px', marginTop:'2px', opacity:0.7 }}>{o.sub}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function OnbTimes({ user, setUser }) {
  const opts = [
    { id:'morning', label:'Appena sveglio',   Icon:Coffee },
    { id:'commute', label:'Spostamenti',       Icon:Smartphone },
    { id:'lunch',   label:'Dopo pranzo',       Icon:Sun },
    { id:'work',    label:'Lavoro',            Icon:Briefcase },
    { id:'evening', label:'Sera sul divano',   Icon:Cloud },
    { id:'night',   label:'Prima di dormire',  Icon:Moon },
  ];
  const toggle = id => {
    const has = user.vulnerableTimes.includes(id);
    setUser({...user, vulnerableTimes: has ? user.vulnerableTimes.filter(t=>t!==id) : [...user.vulnerableTimes,id]});
  };
  return (
    <div style={{ paddingTop:'16px' }}>
      <h2 style={{ fontFamily:'sans-serif', fontSize:'30px', lineHeight:1.25, marginBottom:'8px', color:T.ink }}>Quando sei più fragile?</h2>
      <p style={{ fontSize:'14px', marginBottom:'24px', color:T.muted }}>I momenti in cui prendi il telefono senza pensarci.</p>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
        {opts.map(({ id, label, Icon }) => {
          const sel = user.vulnerableTimes.includes(id);
          return (
            <button key={id} onClick={() => toggle(id)}
              style={{ textAlign:'left', borderRadius:'16px', padding:'16px', borderWidth:'2px', borderStyle:'solid', background:sel?T.green:'white', color:sel?T.cream:T.ink, borderColor:sel?T.green:'rgba(45,58,46,.08)' }}>
              <Icon size={18} style={{ marginBottom:8, opacity:.8 }} />
              <p style={{ fontWeight:500, fontSize:'12px' }}>{label}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function OnbApps({ user, setUser }) {
  const opts = [
    { id:'instagram', label:'Instagram', Icon:Camera,        color:'#E4405F' },
    { id:'tiktok',    label:'TikTok',    Icon:Music,         color:'#000' },
    { id:'x',         label:'X / Twitter',Icon:MessageCircle,color:'#1DA1F2' },
    { id:'youtube',   label:'YouTube',   Icon:Camera,        color:'#FF0000' },
    { id:'whatsapp',  label:'WhatsApp',  Icon:MessageCircle, color:'#25D366' },
    { id:'reddit',    label:'Reddit',    Icon:MessageCircle, color:'#FF4500' },
  ];
  const toggle = id => {
    const has = user.apps.includes(id);
    setUser({...user, apps: has ? user.apps.filter(a=>a!==id) : [...user.apps,id]});
  };
  return (
    <div style={{ paddingTop:'16px' }}>
      <h2 style={{ fontFamily:'sans-serif', fontSize:'30px', lineHeight:1.25, marginBottom:'8px', color:T.ink }}>Quali app<br/>ti rubano tempo?</h2>
      <p style={{ fontSize:'14px', marginBottom:'24px', color:T.muted }}>Le metterò in pausa, non le bloccherò. Sceglierai tu.</p>
      <div>
        {opts.map(({ id, label, Icon, color }) => {
          const sel = user.apps.includes(id);
          return (
            <button key={id} onClick={() => toggle(id)}
              style={{ width:'100%', display:'flex', alignItems:'center', gap:'12px', borderRadius:'16px', padding:'14px', borderWidth:'2px', borderStyle:'solid', marginBottom:'8px', background:sel?T.green:'white', color:sel?T.cream:T.ink, borderColor:sel?T.green:'rgba(45,58,46,.08)' }}>
              <div style={{ width:'36px', height:'36px', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', background:sel?'rgba(244,239,230,.15)':`${color}15` }}>
                <Icon size={16} style={{ color:sel?T.cream:color }} />
              </div>
              <span style={{ fontWeight:500, fontSize:'14px', flex:1, textAlign:'left' }}>{label}</span>
              <div style={{ width:'20px', height:'20px', borderRadius:'9999px', borderWidth:'2px', borderStyle:'solid', display:'flex', alignItems:'center', justifyContent:'center', borderColor:sel?T.cream:'rgba(45,58,46,.2)', background:sel?T.cream:'transparent' }}>
                {sel && <Check size={12} style={{ color:T.green }} strokeWidth={3} />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function OnbIntensity({ user, setUser }) {
  const opts = [
    { id:'gentle',   label:'Gentile',     sub:'1 respiro · puoi sempre passare',        desc:'Una piccola pausa, niente di più' },
    { id:'balanced', label:'Bilanciato',  sub:'3 respiri · riflessione · scelta',        desc:'Il mio consiglio per la maggior parte' },
    { id:'strict',   label:'Determinato', sub:'5 respiri · blocco hard · streak rigida', desc:'Quando sei serio' },
  ];
  return (
    <div style={{ paddingTop:'16px' }}>
      <h2 style={{ fontFamily:'sans-serif', fontSize:'30px', lineHeight:1.25, marginBottom:'8px', color:T.ink }}>Quanto vuoi<br/>che ti aiuti?</h2>
      <p style={{ fontSize:'14px', marginBottom:'24px', color:T.muted }}>Puoi cambiare in qualsiasi momento.</p>
      <div>
        {opts.map(o => {
          const sel = user.intensity === o.id;
          return (
            <button key={o.id} onClick={() => setUser({...user,intensity:o.id})}
              style={{ width:'100%', textAlign:'left', borderRadius:'16px', padding:'16px', borderWidth:'2px', borderStyle:'solid', marginBottom:'10px', background:sel?T.green:'white', color:sel?T.cream:T.ink, borderColor:sel?T.green:'rgba(45,58,46,.08)' }}>
              <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:'4px' }}>
                <p style={{ fontFamily:'sans-serif', fontSize:'20px' }}>{o.label}</p>
                {o.id==='balanced' && (
                  <span style={{ fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.05em', paddingLeft:'8px', paddingRight:'8px', paddingTop:'2px', paddingBottom:'2px', borderRadius:'9999px', background:sel?'rgba(244,239,230,.2)':'rgba(201,123,92,.15)', color:sel?T.cream:T.terra }}>
                    Consigliato
                  </span>
                )}
              </div>
              <p style={{ fontSize:'12px', fontWeight:500, marginBottom:'4px', opacity:0.9 }}>{o.sub}</p>
              <p style={{ fontSize:'12px', opacity:0.65 }}>{o.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function OnbPermission() {
  return (
    <div style={{ paddingTop:'16px', display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center' }}>
      <div style={{ width:'80px', height:'80px', borderRadius:'24px', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'24px', background:T.green }}>
        <Shield size={32} style={{ color:T.cream }} strokeWidth={1.5} />
      </div>
      <h2 style={{ fontFamily:'sans-serif', fontSize:'30px', lineHeight:1.25, marginBottom:'12px', color:T.ink }}>Un permesso<br/>e mai più</h2>
      <p style={{ fontSize:'14px', lineHeight:1.625, marginBottom:'32px', maxWidth:'260px', color:T.muted }}>
        Sereno ha bisogno dell'accesso al "tempo di utilizzo". I tuoi dati restano sul tuo telefono.
      </p>
      <div style={{ width:'100%' }}>
        {['Niente cloud. Niente tracker.','Niente pubblicità. Mai.','Codice aperto.'].map((r,i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:'10px', fontSize:'12px', marginBottom:'8px', color:T.ink }}>
            <Check size={14} style={{ color:T.green }} strokeWidth={3} />
            <span>{r}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function OnbReady({ user }) {
  return (
    <div style={{ paddingTop:'16px', display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', justifyContent:'center', height:'100%' }}>
      <div style={{ position:'relative', width:'96px', height:'96px', marginBottom:'24px', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ position:'absolute', top:0, right:0, bottom:0, left:0, borderRadius:'9999px', animation:'pulse-soft 3s ease-in-out infinite', background:'radial-gradient(circle,rgba(201,123,92,.2),transparent 70%)' }} />
        <TreePine size={48} style={{ color:T.terra }} strokeWidth={1.2} />
      </div>
      <h2 style={{ fontFamily:'sans-serif', fontSize:'30px', lineHeight:1.25, marginBottom:'12px', color:T.ink }}>
        Tutto pronto,<br/>{user.name || 'amico'}.
      </h2>
      <p style={{ fontSize:'14px', lineHeight:1.625, marginBottom:'24px', maxWidth:'320px', color:T.muted }}>
        Il tuo giardino inizia oggi.<br/>Ogni momento di pausa lo fa crescere.
      </p>
      <div style={{ borderRadius:'16px', padding:'16px', width:'100%', background:'white', border:'1px solid rgba(45,58,46,.08)' }}>
        <p style={{ fontSize:'12px', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'8px', color:T.muted }}>Modalità iniziale</p>
        <p style={{ fontSize:'14px', color:T.ink }}><span style={{ fontFamily:'sans-serif', fontSize:'18px' }}>Famiglia</span> attiva 19:00–21:30</p>
      </div>
    </div>
  );
}

/* ─── BOTTOM NAV ─────────────────────────────────────────── */
function BottomNav({ screen, setScreen, dark }) {
  const tabs = [
    { id:'garden',   label:'Giardino' },
    { id:'insights', label:'Pattern' },
    { id:'modes',    label:'Modalità' },
  ];
  return (
    <div style={{position:'absolute', bottom:0, left:0, right:0, display:'flex', justifyContent:'space-around', padding:'16px 24px 28px', backdropFilter:'blur(12px)', background:dark?'rgba(26,46,37,.75)':'rgba(244,239,230,.75)', borderTop:'1px solid rgba(0,0,0,.06)'}}>
      {tabs.map(({ id, label }) => {
        const active = screen === id;
        const color  = dark ? '#f4efe6' : '#2d3a2e';
        return (
          <button key={id} onClick={() => setScreen(id)} style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'4px', padding:'4px 0', border:'none', background:'none', cursor:'pointer'}}>
            <span style={{color, opacity:active?1:.38, fontSize:'13px', fontWeight:active?600:400}}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

function Garden({ user, streak, opensToday, hours, mins, realTrees, friends=[],
                  onTriggerPause, onOpenSettings, onOpenModeSheet, onOpenFriends, onStartFocus }) {

  return (
    <div style={{width:'100%', height:'100vh', backgroundColor:'#c4b896', padding:'20px', position:'relative'}}>
      <h1 style={{color:'#2d3a2e', fontSize:'28px', margin:0}}>Il tuo giardino</h1>
      <button onClick={() => onTriggerPause('Instagram')}
        style={{backgroundColor:'#2d4a3e', color:'white', padding:'15px', borderRadius:'12px', width:'100%', marginTop:'20px', border:'none', cursor:'pointer', fontSize:'16px'}}>
        Apri Instagram
      </button>
    </div>
  );
}

/* ─── PAUSE OVERLAY ──────────────────────────────────────── */
function PauseOverlay({ appName, opensToday, intensity, onResist, onSlip }) {
  const target = intensity==='gentle' ? 1 : intensity==='strict' ? 5 : 3;
  const [phase,       setPhase]       = useState('breathing');   // breathing | reflection
  const [breathPhase, setBreathPhase] = useState('in');
  const [breathCount, setBreathCount] = useState(0);
  const [reason,      setReason]      = useState(null);

  useEffect(() => {
    if (phase !== 'breathing') return;
    const t = setTimeout(() => {
      setBreathPhase(b => {
        if (b==='in') return 'out';
        setBreathCount(c => {
          const next = c+1;
          if (next >= target) setPhase('reflection');
          return next;
        });
        return 'in';
      });
    }, 2600);
    return () => clearTimeout(t);
  }, [breathPhase, phase, target]);

  const reasons = [
    { id:'boredom',    label:'Noia',             advice:'È solo abitudine. 60 secondi nel giardino.' },
    { id:'habit',      label:'Riflesso',          advice:'Il pollice si muove da solo. Respira ancora.' },
    { id:'avoid',      label:'Evito qualcosa',    advice:"Cosa stai evitando? Spesso è lì la cosa importante." },
    { id:'validation', label:'Validazione',       advice:'Il tuo valore non sta in un like. Tu lo sai.' },
    { id:'real',       label:'Mi serve davvero',  advice:'Ok. Hai 5 minuti consapevoli.' },
  ];

  return (
    <div style={{ position:'absolute', top:0, right:0, bottom:0, left:0, zIndex:50, background:'radial-gradient(ellipse at center,#2d4a3e,#1a2a1e)' }}>

      <div style={{ position:'absolute', top:'48px', left:'24px', right:'24px', display:'flex', alignItems:'center', justifyContent:'space-between', zIndex:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          <Lock size={13} style={{ color:T.earth }} />
          <span style={{ fontSize:'12px', textTransform:'uppercase', letterSpacing:'0.16em', color:T.earth }}>{appName}</span>
        </div>
        <span style={{ fontSize:'12px', color:T.greenMid }}>{opensToday}ª volta oggi</span>
      </div>

      {phase==='breathing' && (
        <div style={{ position:'absolute', top:0, right:0, bottom:0, left:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', paddingLeft:'32px', paddingRight:'32px', animation:'fade-up .45s ease-out forwards' }}>
          <div style={{ textAlign:'center', marginBottom:'40px' }}>
            <p style={{ fontSize:'12px', textTransform:'uppercase', letterSpacing:'0.16em', marginBottom:'8px', color:T.greenMid }}>
              {breathPhase==='in' ? 'Inspira' : 'Espira'}
            </p>
            <p style={{ fontFamily:'sans-serif', fontSize:'24px', lineHeight:1.3, color:T.cream }}>
              Cosa stai<br/>cercando davvero?
            </p>
          </div>
          <div style={{ position:'relative', width:'224px', height:'224px', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'40px' }}>
            <div style={{ position:'absolute', top:0, right:0, bottom:0, left:0, borderRadius:'50%', border:'1px solid rgba(244,239,230,.12)' }} />
            <div style={{ position:'absolute', top:'24px', right:'24px', bottom:'24px', left:'24px', borderRadius:'50%', border:'1px solid rgba(244,239,230,.08)' }} />
            <div key={`${breathPhase}-${breathCount}`} style={{
              width:160, height:160, borderRadius:'50%',
              background:'radial-gradient(circle,rgba(212,197,169,.45),rgba(212,197,169,.1) 70%,transparent)',
              boxShadow:'0 0 60px rgba(212,197,169,.28)',
              animation:`${breathPhase==='in'?'br-expand':'br-contract'} 2.6s ease-in-out forwards`
            }} />
            <div style={{ position:'absolute', fontFamily:'sans-serif', fontSize:'48px', color:T.cream }}>
              {breathCount+1}<span style={{ fontSize:'24px', opacity:0.45 }}>/{target}</span>
            </div>
          </div>
          <p style={{ fontSize:'12px', color:T.greenMid }}>Resta. Stai facendo bene.</p>
        </div>
      )}

      {phase==='reflection' && (
        <div style={{ position:'absolute', top:0, right:0, bottom:0, left:0, display:'flex', flexDirection:'column', padding:'80px 28px 24px', animation:'fade-up .45s ease-out forwards' }}>
          <p style={{ fontSize:'12px', textTransform:'uppercase', letterSpacing:'0.16em', marginBottom:'8px', color:T.greenMid }}>Riflessione</p>
          <h2 style={{ fontFamily:'sans-serif', fontSize:'30px', lineHeight:1.3, marginBottom:'8px', color:T.cream }}>
            Cosa cerchi<br/>in {appName}?
          </h2>
          <p style={{ fontSize:'12px', marginBottom:'20px', color:T.greenMid }}>Una risposta onesta cambia tutto.</p>

          <div style={{ display:'flex', flexDirection:'column', gap:'8px', flex:1, overflowY:'auto', MsOverflowStyle:'none', scrollbarWidth:'none' }}>
            {reasons.map(r => {
              const sel = reason===r.id;
              return (
                <button key={r.id} onClick={() => setReason(r.id)}
                  style={{ width:'100%', textAlign:'left', borderRadius:'12px', padding:'12px', background:sel?T.earth:'rgba(244,239,230,.08)', color:sel?T.ink:T.cream, border:'none', cursor:'pointer' }}>
                  <p style={{ fontSize:'14px', fontWeight:500 }}>{r.label}</p>
                  {sel && <p style={{ fontSize:'12px', marginTop:'4px', lineHeight:1.5, color:T.green }}>{r.advice}</p>}
                </button>
              );
            })}
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginTop:'16px' }}>
            <button onClick={onResist} disabled={!reason}
              style={{ width:'100%', borderRadius:'16px', padding:'14px 0', fontSize:'14px', fontWeight:500, background:reason?T.cream:'rgba(244,239,230,.18)', color:reason?T.green:'rgba(244,239,230,.35)', border:'none', cursor:reason?'pointer':'default' }}>
              Torno al mio momento
            </button>
            <button onClick={onSlip} disabled={reason!=='real'}
              style={{ width:'100%', fontSize:'12px', textDecoration:'underline', textUnderlineOffset:'4px', padding:'4px 0', background:'none', border:'none', cursor:reason==='real'?'pointer':'default', color:reason==='real'?T.greenMid:'rgba(138,150,118,.3)' }}>
              {reason==='real' ? `Apri ${appName} (5 min)` : 'Disponibile solo per necessità reale'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── FOCUS SESSION ──────────────────────────────────────── */
function FocusSession({ type, duration, flower, onEnd }) {
  const SCALE = 1;
  const total = duration * 60;
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => setElapsed(e => Math.min(total, e+SCALE)), 1000);
    return () => clearInterval(iv);
  }, [total]);

  const progress  = Math.min(1, elapsed/total);
  const remaining = Math.max(0, total-elapsed);
  const rm        = String(Math.floor(remaining/60)).padStart(2,'0');
  const rs        = String(remaining%60).padStart(2,'0');
  const done      = progress >= 1;

  const bg = type==='bloom'
    ? 'radial-gradient(ellipse at center top,#2a1a35,#0f0a1f)'
    : 'radial-gradient(ellipse at center,#2d4a3e,#1a2a1e)';

  return (
    <div style={{ position:'absolute', top:0, right:0, bottom:0, left:0, zIndex:50, overflow:'hidden', background:bg }}>
      {type==='bloom' && [
        [8,12,.4,0],[16,8,.28,1],[80,6,.35,.5],[20,4,.3,1.5],[4,32,.25,2]
      ].map(([r,t,o,d],i)=>(
        <div key={i} style={{ position:'absolute', width:'4px', height:'4px', borderRadius:'50%', right:`${r}%`, top:`${t}%`, opacity:o, background:T.cream, animation:'pulse-soft 3s ease-in-out infinite', animationDelay:`${d}s` }} />
      ))}

      <div style={{ position:'absolute', top:'56px', left:0, right:0, textAlign:'center', zIndex:10, animation:'fade-up .45s ease-out forwards' }}>
        <p style={{ fontFamily:'sans-serif', fontSize:'48px', letterSpacing:'-0.025em', color:T.cream }}>{rm}:{rs}</p>
        <p style={{ fontSize:'10px', textTransform:'uppercase', letterSpacing:'.4em', opacity:0.5, marginTop:'12px', color:T.cream }}>
          {done ? 'Completato' : type==='bloom' ? 'Il fiore sboccia' : 'Respira con me'}
        </p>
      </div>

      <div style={{ position:'absolute', top:0, right:0, bottom:0, left:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
        {type==='bloom' ? <FlowerBloom progress={progress} flower={flower} /> : <BreathingCircle />}
      </div>

      <div style={{ position:'absolute', bottom:'48px', left:0, right:0, textAlign:'center', zIndex:10, paddingLeft:'32px', paddingRight:'32px' }}>
        {done ? (
          <div style={{ animation:'fade-up .45s ease-out forwards' }}>
            <p style={{ fontSize:'14px', marginBottom:'16px', color:T.cream }}>Un albero in più nella tua foresta. 🌳</p>
            <button onClick={onEnd} style={{ borderRadius:'9999px', padding:'12px 24px', fontSize:'14px', fontWeight:500, background:T.earth, color:T.green, border:'none', cursor:'pointer' }}>
              Torna al giardino →
            </button>
          </div>
        ) : (
          <button onClick={onEnd} style={{ fontSize:'12px', textDecoration:'underline', textUnderlineOffset:'4px', background:'none', border:'none', cursor:'pointer', color:'rgba(244,239,230,.38)' }}>
            Termina prima (l'albero appassirà)
          </button>
        )}
      </div>
    </div>
  );
}

/* flower */
const FLOWER_PALETTES = {
  rose:      { front:'radial-gradient(ellipse at 30% 25%,#fde4ea,#f4b8c8 50%,#d97894)',
                back:'radial-gradient(ellipse at 30% 25%,#f8d4dc,#e8a8b8 60%,#b06478)',
                glow:'rgba(244,184,200', center:'radial-gradient(circle at 35% 35%,#fff4b8,#f5d76e 35%,#e8a83a)',
                pollen:'#8a6a3a', count:8,  shape:'50% 50% 50% 50%/85% 85% 15% 15%' },
  lotus:     { front:'radial-gradient(ellipse at 30% 25%,#fff,#f4e8e0 45%,#d4a8b0)',
                back:'radial-gradient(ellipse at 30% 25%,#faf0e8,#e8d0c0 60%,#b08894)',
                glow:'rgba(244,232,224', center:'radial-gradient(circle at 35% 35%,#fffbe0,#f5d76e 50%,#c8a040)',
                pollen:'#a0763a', count:10, shape:'40% 40% 50% 50%/80% 80% 20% 20%' },
  sunflower: { front:'radial-gradient(ellipse at 30% 25%,#fff4a8,#f5d76e 40%,#d89830)',
                back:'radial-gradient(ellipse at 30% 25%,#f5d76e,#d89830 60%,#8a5818)',
                glow:'rgba(245,215,110', center:'radial-gradient(circle at 35% 35%,#6a4818,#3a2810 60%,#1a1408)',
                pollen:'#1a1408', count:12, shape:'30% 30% 50% 50%/90% 90% 10% 10%' },
  cherry:    { front:'radial-gradient(ellipse at 30% 25%,#fff,#fde4ea 50%,#f4b8c8)',
                back:'radial-gradient(ellipse at 30% 25%,#fde4ea,#f4c8d8 60%,#d098a8)',
                glow:'rgba(253,228,234', center:'radial-gradient(circle at 35% 35%,#fff4b8,#f5b86e 50%,#d87830)',
                pollen:'#8a4830', count:5,  shape:'30% 70% 30% 70%/80% 80% 20% 20%' },
};

function FlowerBloom({ progress, flower='rose' }) {
  const p        = FLOWER_PALETTES[flower] || FLOWER_PALETTES.rose;
  const sz       = 30 + progress*90;
  const rot      = progress*25;
  const cSz      = 18 + progress*30;
  const opacity  = 0.35 + progress*0.65;
  const glow     = progress;
  const angles   = Array.from({length:p.count},(_,i)=>(360/p.count)*i);
  const backOff  = 360/p.count/2;
  const wMul     = flower==='sunflower' ? 0.42 : 0.57;
  const hMul     = flower==='sunflower' ? 1.65 : 1.5;

  return (
    <div style={{ position:'relative', width:300, height:300 }}>
      <div style={{ position:'absolute', top:0, right:0, bottom:0, left:0, background:`radial-gradient(circle,${p.glow},${.28*glow}) 0%,transparent 60%)`,
        transform:`scale(${0.8+progress*0.6})`, filter:'blur(22px)',
        transition:'transform 4s cubic-bezier(.22,1,.36,1)'
      }} />
      {angles.map((a,i)=>(
        <div key={`b${i}`} style={{ position:'absolute', top:0, right:0, bottom:0, left:0, display:'flex', alignItems:'center', justifyContent:'center', transform:`rotate(${a+backOff+rot}deg)`, transition:'transform 6s cubic-bezier(.22,1,.36,1)' }}>
          <div style={{ width:`${sz*wMul*0.9}px`, height:`${sz*hMul*0.9}px`, background:p.back,
            borderRadius:p.shape, transformOrigin:'center bottom', transform:`translateY(-${sz*.48}px)`,
            transition:'all 6s cubic-bezier(.22,1,.36,1)', opacity:opacity*.68 }} />
        </div>
      ))}
      {angles.map((a,i)=>(
        <div key={`f${i}`} style={{ position:'absolute', top:0, right:0, bottom:0, left:0, display:'flex', alignItems:'center', justifyContent:'center', transform:`rotate(${a+rot}deg)`, transition:'transform 6s cubic-bezier(.22,1,.36,1)' }}>
          <div style={{ width:`${sz*wMul}px`, height:`${sz*hMul}px`, background:p.front,
            borderRadius:p.shape, transformOrigin:'center bottom', transform:`translateY(-${sz*.53}px)`,
            transition:'all 6s cubic-bezier(.22,1,.36,1)', opacity,
            boxShadow:progress>.6?`0 0 ${20*glow}px ${p.glow},.5)`:undefined }} />
        </div>
      ))}
      <div style={{ position:'absolute', top:0, right:0, bottom:0, left:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ width:cSz, height:cSz, borderRadius:'50%', background:p.center,
          boxShadow:`0 0 ${40*glow}px ${p.glow},${.4+glow*.4}),inset 0 0 10px rgba(0,0,0,.25)`,
          transition:'all 4s cubic-bezier(.22,1,.36,1)' }} />
      </div>
      {progress>.72 && (
        <div style={{ position:'absolute', top:0, right:0, bottom:0, left:0, display:'flex', alignItems:'center', justifyContent:'center', animation:'fade-up .45s ease-out forwards' }}>
          <div style={{ width:`${cSz*.6}px`, height:`${cSz*.6}px`, position:'relative' }}>
            {Array.from({length:p.count<=5?5:6}).map((_,i)=>{
              const tot=p.count<=5?5:6;
              return <div key={i} style={{ position:'absolute', width:'4px', height:'4px', borderRadius:'50%', background:p.pollen, top:`${20+Math.sin(i*2*Math.PI/tot)*25}%`, left:`${20+Math.cos(i*2*Math.PI/tot)*25}%` }} />;
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function BreathingCircle() {
  const [phase, setPhase] = useState('in');
  const [cycle, setCycle] = useState(0);
  useEffect(() => {
    const t = setInterval(() => {
      setPhase(p => { if(p==='in') return 'out'; setCycle(c=>c+1); return 'in'; });
    }, 4000);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ position:'relative', width:'288px', height:'288px', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ position:'absolute', top:0, right:0, bottom:0, left:0, borderRadius:'50%', border:'1px solid rgba(244,239,230,.07)' }} />
      <div style={{ position:'absolute', top:'32px', right:'32px', bottom:'32px', left:'32px', borderRadius:'50%', border:'1px solid rgba(244,239,230,.05)' }} />
      <div style={{ position:'absolute', top:'64px', right:'64px', bottom:'64px', left:'64px', borderRadius:'50%', border:'1px solid rgba(244,239,230,.04)' }} />
      <div key={phase} style={{ width:200, height:200, borderRadius:'50%',
        background:'radial-gradient(circle,rgba(212,197,169,.48),rgba(212,197,169,.14) 60%,transparent)',
        boxShadow:'0 0 80px rgba(212,197,169,.28)',
        animation:`${phase==='in'?'br-expand':'br-contract'} 4s ease-in-out forwards` }} />
      <div style={{ position:'absolute', textAlign:'center' }}>
        <p style={{ fontSize:'14px', textTransform:'uppercase', letterSpacing:'.4em', opacity:0.7, marginBottom:'4px', color:T.cream }}>
          {phase==='in' ? 'Inspira' : 'Espira'}
        </p>
        <p style={{ fontFamily:'sans-serif', fontSize:'12px', opacity:0.35, color:T.cream }}>ciclo {cycle+1}</p>
      </div>
    </div>
  );
}

/* ─── INSIGHTS ───────────────────────────────────────────── */
function Insights({ tab, setTab, realTrees }) {
  const BARS = {
    week:  [40,55,35,70,60,85,75],
    month: [30,45,60,75],
    year:  [20,35,50,45,60,70,65,80,75,85,90,95],
  };
  const LABELS = {
    week:  ['L','M','M','G','V','S','D'],
    month: ['S1','S2','S3','S4'],
    year:  ['G','F','M','A','M','G','L','A','S','O','N','D'],
  };
  const TIME = { week:['14','32','38'], month:['56','18','24'], year:['184','04','120'] };
  const [th,tm,pct] = TIME[tab];

  return (
    <div style={{ position:'absolute', top:0, right:0, bottom:0, left:0, overflowY:'auto', MsOverflowStyle:'none', scrollbarWidth:'none', paddingLeft:'24px', paddingRight:'24px', paddingTop:'8px', paddingBottom:110 }}>
      <div style={{ marginBottom:'16px' }}>
        <p style={{ fontSize:'12px', textTransform:'uppercase', letterSpacing:'0.16em', color:T.muted }}>I tuoi pattern</p>
        <h1 style={{ fontFamily:'sans-serif', fontSize:'30px', marginTop:'4px', color:T.ink }}>Vedere chiaro</h1>
      </div>

      <div style={{ display:'flex', gap:'4px', marginBottom:'20px', padding:'4px', borderRadius:'9999px', background:'rgba(45,58,46,.06)' }}>
        {['week','month','year'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ flex:1, padding:'8px 0', fontSize:'12px', fontWeight:500, borderRadius:'9999px', background:tab===t?'white':'transparent', color:tab===t?T.ink:T.muted, border:'none', cursor:'pointer', boxShadow:tab===t?'0 2px 8px rgba(0,0,0,.05)':'none' }}>
            {t==='week'?'Settimana':t==='month'?'Mese':'Anno'}
          </button>
        ))}
      </div>

      <div style={{ borderRadius:'24px', padding:'24px', marginBottom:'16px', background:T.green, color:T.cream }}>
        <p style={{ fontSize:'12px', textTransform:'uppercase', letterSpacing:'0.16em', opacity:0.7, marginBottom:'8px' }}>Tempo recuperato</p>
        <p style={{ fontFamily:'sans-serif', fontSize:'48px', marginBottom:'4px' }}>
          {th}<span style={{ fontSize:'24px', opacity:0.6 }}>h</span> {tm}<span style={{ fontSize:'24px', opacity:0.6 }}>m</span>
        </p>
        <p style={{ fontSize:'12px', opacity:0.7 }}>+{pct}% rispetto al periodo precedente</p>
        <div style={{ display:'flex', alignItems:'flex-end', gap:'6px', height:'64px', marginTop:'20px' }}>
          {BARS[tab].map((h,i,arr) => (
            <div key={i} style={{ flex:1, borderRadius:'4px 4px 0 0', height:`${h}%`, background:i===arr.length-1?T.earth:'rgba(212,197,169,.4)' }} />
          ))}
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:'12px', opacity:0.45, marginTop:'8px' }}>
          {LABELS[tab].map((l,i) => <span key={i}>{l}</span>)}
        </div>
      </div>

      <div style={{ borderRadius:'24px', padding:'20px', marginBottom:'16px', background:'white' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px' }}>
          <Heart size={16} style={{ color:T.terra }} />
          <p style={{ fontSize:'12px', textTransform:'uppercase', letterSpacing:'0.16em', fontWeight:500, color:'#5a5a3e' }}>Umore × Schermo</p>
        </div>
        <p style={{ fontSize:'14px', lineHeight:1.6, color:T.ink }}>
          Nei giorni con meno telefono hai riportato <span style={{ fontWeight:600 }}>+42% energia</span> e{' '}
          <span style={{ fontWeight:600 }}>-31% ansia</span>.
        </p>
      </div>

      <div style={{ borderRadius:'24px', padding:'20px', marginBottom:'16px', background:'white' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px' }}>
          <AlertCircle size={16} style={{ color:T.terra }} />
          <p style={{ fontSize:'12px', textTransform:'uppercase', letterSpacing:'0.16em', fontWeight:500, color:'#5a5a3e' }}>Momenti fragili</p>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          {[
            { t:'22:30–23:15', a:'Prima di dormire', l:92 },
            { t:'7:20–7:45',   a:'Appena sveglio',   l:78 },
            { t:'14:00–14:30', a:'Dopo pranzo',       l:65 },
          ].map((m,i) => (
            <div key={i}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'12px', marginBottom:'4px' }}>
                <span style={{ color:T.ink, fontWeight:500 }}>{m.t}</span>
                <span style={{ color:T.muted }}>{m.a}</span>
              </div>
              <div style={{ height:'6px', borderRadius:'9999px', overflow:'hidden', background:'#f4efe6' }}>
                <div style={{ height:'100%', borderRadius:'9999px', width:`${m.l}%`, background:T.terra }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ borderRadius:'24px', padding:'20px', background:`linear-gradient(135deg,${T.terra},#a85f44)`, color:T.cream }}>
        <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px' }}>
          <TreePine size={16} />
          <p style={{ fontSize:'12px', textTransform:'uppercase', letterSpacing:'0.16em', fontWeight:500 }}>Impatto reale</p>
        </div>
        <p style={{ fontFamily:'sans-serif', fontSize:'30px', marginBottom:'4px' }}>{realTrees} alberi piantati</p>
        <p style={{ fontSize:'12px', opacity:0.9 }}>in Madagascar via Eden Reforestation</p>
      </div>
    </div>
  );
}

/* ─── MODES ──────────────────────────────────────────────── */
function Modes({ user, setUser, onOpenFriends }) {
  const MODES = [
    { id:'lavoro',   Icon:Briefcase, name:'Lavoro profondo', desc:'Blocca social, news, video · Permetti Slack, Mail', time:'9:00–12:30',  color:T.greenMid },
    { id:'famiglia', Icon:Heart,     name:'Famiglia',         desc:'Solo chiamate e messaggi essenziali',                time:'19:00–21:30', color:T.terra },
    { id:'sonno',    Icon:Moon,      name:'Sonno',            desc:'Grayscale + blocco totale',                         time:'22:30–7:00',  color:'#6b7d8e' },
    { id:'libero',   Icon:Wind,      name:'Respiro libero',   desc:'Nessun blocco, solo tracciamento',                  time:'Sempre',      color:T.earth },
  ];

  return (
    <div style={{ position:'absolute', top:0, right:0, bottom:0, left:0, overflowY:'auto', MsOverflowStyle:'none', scrollbarWidth:'none', paddingLeft:'24px', paddingRight:'24px', paddingTop:'8px', color:T.cream, paddingBottom:110 }}>
      <div style={{ marginBottom:'20px' }}>
        <p style={{ fontSize:'12px', textTransform:'uppercase', letterSpacing:'0.16em', opacity:0.6 }}>Scegli un'intenzione</p>
        <h1 style={{ fontFamily:'sans-serif', fontSize:'30px', marginTop:'4px' }}>Modalità</h1>
      </div>

      {MODES.map(({ id, Icon, name, desc, time, color }) => {
        const active = user.activeMode === id;
        return (
          <button key={id} onClick={() => setUser({...user, activeMode:id})}
            style={{ width:'100%', textAlign:'left', marginBottom:'12px', borderRadius:'24px', padding:'20px', background:active?color:'rgba(255,255,255,.08)', color:active?T.ink:T.cream, border:'none', cursor:'pointer' }}>
            <div style={{ display:'flex', alignItems:'flex-start', gap:'16px' }}>
              <div style={{ width:'44px', height:'44px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, background:active?'rgba(45,58,46,.15)':'rgba(255,255,255,.08)' }}>
                <Icon size={20} />
              </div>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'4px' }}>
                  <p style={{ fontFamily:'sans-serif', fontSize:'18px' }}>{name}</p>
                  {active && <span style={{ fontSize:'12px', padding:'2px 8px', borderRadius:'9999px', background:'rgba(45,58,46,.15)' }}>Attiva</span>}
                </div>
                <p style={{ fontSize:'12px', opacity:0.75, marginBottom:'6px', lineHeight:1.5 }}>{desc}</p>
                <p style={{ fontSize:'12px', opacity:0.55, display:'flex', alignItems:'center', gap:'4px' }}><Clock size={10} />{time}</p>
              </div>
            </div>
          </button>
        );
      })}

      <button style={{ width:'100%', borderRadius:'24px', padding:'16px', marginBottom:'16px', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', fontSize:'14px', background:'rgba(255,255,255,.05)', color:T.greenMid, border:`1px dashed ${T.greenMid}40`, cursor:'pointer' }}>
        <Plus size={14} /> Crea modalità
      </button>

      <div style={{ borderRadius:'24px', padding:'20px', background:'rgba(255,255,255,.08)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <Users size={16} />
            <p style={{ fontSize:'12px', textTransform:'uppercase', letterSpacing:'0.16em', opacity:0.7 }}>Giardino condiviso</p>
          </div>
          <button onClick={onOpenFriends} style={{ fontSize:'12px', display:'flex', alignItems:'center', gap:'2px', color:T.earth, opacity:0.8, background:'none', border:'none', cursor:'pointer' }}>
            Vedi tutti <ChevronRight size={11} />
          </button>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px' }}>
          {['🌳','🌿','🌸'].map((e,i)=>(
            <div key={i} style={{ width:'36px', height:'36px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', background:'rgba(255,255,255,.1)' }}>{e}</div>
          ))}
          <span style={{ fontSize:'12px', opacity:0.7, marginLeft:'4px' }}>Sofia, Marco, Elena</span>
        </div>
        <p style={{ fontSize:'12px', opacity:0.75, lineHeight:1.5, marginBottom:'12px' }}>
          Sofia ha completato 5 giorni. Inviale un gesto gentile.
        </p>
        <button onClick={onOpenFriends}
          style={{ fontSize:'12px', padding:'6px 12px', borderRadius:'9999px', fontWeight:500, background:T.cream, color:T.ink, border:'none', cursor:'pointer' }}>
          Invia 🐝 →
        </button>
      </div>
    </div>
  );
}

/* ─── SETTINGS ───────────────────────────────────────────── */
function SettingsPanel({ user, setUser, onClose }) {
  const [tog, setTog] = useState({ notif:true, grayscale:true, trees:true, social:false });
  return (
    <div style={{ position:'absolute', top:0, right:0, bottom:0, left:0, zIndex:40, animation:'slide-up .35s cubic-bezier(.22,1,.36,1) forwards', background:T.cream }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingLeft:'24px', paddingRight:'24px', paddingTop:'48px', paddingBottom:'16px' }}>
        <h2 style={{ fontFamily:'sans-serif', fontSize:'24px', color:T.ink }}>Impostazioni</h2>
        <button onClick={onClose} style={{ width:'36px', height:'36px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(45,58,46,.06)', border:'none', cursor:'pointer' }}>
          <X size={16} style={{ color:T.ink }} />
        </button>
      </div>

      <div style={{ paddingLeft:'24px', paddingRight:'24px', display:'flex', flexDirection:'column', gap:'16px', overflowY:'auto', MsOverflowStyle:'none', scrollbarWidth:'none', height:'calc(100% - 100px)' }}>
        <div style={{ borderRadius:'16px', padding:'16px', background:'white' }}>
          <p style={{ fontSize:'12px', textTransform:'uppercase', letterSpacing:'0.16em', marginBottom:'8px', color:T.muted }}>Profilo</p>
          <p style={{ fontFamily:'sans-serif', fontSize:'18px', color:T.ink }}>{user.name || 'Amico'}</p>
          <p style={{ fontSize:'12px', color:T.muted }}>Iscritto oggi</p>
        </div>

        <div style={{ borderRadius:'16px', padding:'16px', background:'white' }}>
          <p style={{ fontSize:'12px', textTransform:'uppercase', letterSpacing:'0.16em', marginBottom:'12px', color:T.muted }}>Intensità</p>
          <div style={{ display:'flex', gap:'8px', padding:'4px', borderRadius:'9999px', background:'rgba(45,58,46,.06)' }}>
            {['gentle','balanced','strict'].map(id => {
              const labels = {gentle:'Gentile',balanced:'Bilanciato',strict:'Determinato'};
              return (
                <button key={id} onClick={() => setUser({...user,intensity:id})}
                  style={{ flex:1, padding:'8px 0', fontSize:'12px', fontWeight:500, borderRadius:'9999px', background:user.intensity===id?T.green:'transparent', color:user.intensity===id?T.cream:T.muted, border:'none', cursor:'pointer' }}>
                  {labels[id]}
                </button>
              );
            })}
          </div>
          <p style={{ fontSize:'12px', marginTop:'12px', color:T.muted }}>
            {user.intensity==='gentle' ? '1 respiro, sempre passabile.' :
             user.intensity==='balanced'? '3 respiri, riflessione.' : '5 respiri, blocco hard.'}
          </p>
        </div>

        <div style={{ borderRadius:'16px', background:'white' }}>
          {[
            { k:'notif',    Icon:Bell,       label:'Notifiche gentili',    sub:'Reminder quotidiani' },
            { k:'grayscale',Icon:Smartphone, label:'Grayscale automatico', sub:'In modalità Sonno' },
            { k:'trees',    Icon:TreePine,   label:'Pianta alberi reali',  sub:'Via Eden Reforestation' },
            { k:'social',   Icon:Users,      label:'Giardino condiviso',   sub:'Visibile agli amici' },
          ].map(({ k, Icon, label, sub }, idx) => (
            <div key={k} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'16px', borderTop:idx>0?'1px solid rgba(0,0,0,.05)':'none' }}>
              <Icon size={18} style={{ color:T.muted }} />
              <div style={{ flex:1 }}>
                <p style={{ fontSize:'14px', color:T.ink }}>{label}</p>
                <p style={{ fontSize:'12px', color:T.muted }}>{sub}</p>
              </div>
              <button onClick={() => setTog({...tog,[k]:!tog[k]})}
                style={{ width:'40px', height:'24px', borderRadius:'9999px', padding:'2px', background:tog[k]?T.green:'rgba(45,58,46,.15)', border:'none', cursor:'pointer' }}>
                <div style={{ width:'20px', height:'20px', borderRadius:'50%', background:'white', transform:tog[k]?'translateX(16px)':'translateX(0)', transition:'transform .2s' }} />
              </button>
            </div>
          ))}
        </div>

        <div style={{ textAlign:'center', padding:'16px 0' }}>
          <p style={{ fontFamily:'sans-serif', fontSize:'16px', color:T.green }}>Sereno</p>
          <p style={{ fontSize:'12px', marginTop:'4px', color:T.muted }}>v1.0 · Open source · Made with care</p>
        </div>
      </div>
    </div>
  );
}

/* ─── MODE SHEET ─────────────────────────────────────────── */
function ModeSheet({ user, setUser, onClose }) {
  const opts = [
    { id:'lavoro',   Icon:Briefcase, label:'Lavoro' },
    { id:'famiglia', Icon:Heart,     label:'Famiglia' },
    { id:'sonno',    Icon:Moon,      label:'Sonno' },
    { id:'libero',   Icon:Wind,      label:'Libero' },
  ];
  return (
    <div style={{ position:'absolute', top:0, right:0, bottom:0, left:0, zIndex:40, display:'flex', alignItems:'flex-end' }}
      onClick={onClose}>
      <div style={{ background:'rgba(0,0,0,.32)', position:'absolute', top:0, right:0, bottom:0, left:0 }} />
      <div style={{ width:'100%', borderRadius:'24px 24px 0 0', padding:'24px', animation:'slide-up .35s cubic-bezier(.22,1,.36,1) forwards', background:T.cream, position:'relative', zIndex:1 }}
        onClick={e=>e.stopPropagation()}>
        <div style={{ width:'40px', height:'4px', borderRadius:'9999px', margin:'0 auto 16px', background:'rgba(45,58,46,.15)' }} />
        <p style={{ fontFamily:'sans-serif', fontSize:'20px', marginBottom:'16px', color:T.ink }}>Cambia modalità</p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
          {opts.map(({ id, Icon, label }) => {
            const sel = user.activeMode === id;
            return (
              <button key={id}
                onClick={() => { setUser({...user,activeMode:id}); onClose(); }}
                style={{ borderRadius:'16px', padding:'16px', textAlign:'left', borderWidth:'2px', borderStyle:'solid', background:sel?T.green:'white', color:sel?T.cream:T.ink, borderColor:sel?T.green:'rgba(45,58,46,.08)', cursor:'pointer' }}>
                <Icon size={18} style={{ marginBottom:8 }} />
                <p style={{ fontSize:'14px', fontWeight:500 }}>{label}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── FRIENDS MODAL ──────────────────────────────────────── */
const GIFTS = [
  { id:'bee',       emoji:'🐝', label:"Un'ape",      msg:'Per nutrire la tua foresta' },
  { id:'butterfly', emoji:'🦋', label:'Una farfalla', msg:'Per la grazia che mostri' },
  { id:'leaf',      emoji:'🍃', label:'Una foglia',   msg:'Sei sulla strada giusta' },
  { id:'seed',      emoji:'🌱', label:'Un seme',      msg:'Per il tuo nuovo inizio' },
];

function FriendsModal({ friends=[], onClose }) {
  const [tab,       setTab]       = useState('amici');
  const [beeTarget, setBeeTarget] = useState(null);
  const [sent,      setSent]      = useState([]);

  const leaderboard = [...friends].sort((a,b)=>b.streak-a.streak);

  const sendGift = (friendId) => {
    setSent(s=>[...s, friendId]);
    setBeeTarget(null);
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from('gifts').insert({
          from_id: user.id, to_id: friendId, gift_type: 'bee'
        }).then(({ error }) => { if (error) console.error(error); });
      }
    });
  };

  return (
    <div style={{ position:'absolute', top:0, right:0, bottom:0, left:0, zIndex:40, animation:'slide-up .35s cubic-bezier(.22,1,.36,1) forwards', background:T.cream }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingLeft:'24px', paddingRight:'24px', paddingTop:'48px', paddingBottom:'12px' }}>
        <div>
          <p style={{ fontSize:'12px', textTransform:'uppercase', letterSpacing:'0.16em', color:T.muted }}>La tua rete</p>
          <h2 style={{ fontFamily:'sans-serif', fontSize:'24px', color:T.ink }}>Amici</h2>
        </div>
        <button onClick={onClose} style={{ width:'36px', height:'36px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(45,58,46,.06)', border:'none', cursor:'pointer' }}>
          <X size={16} style={{ color:T.ink }} />
        </button>
      </div>

      <div style={{ paddingLeft:'24px', paddingRight:'24px', marginBottom:'16px' }}>
        <div style={{ display:'flex', gap:'4px', padding:'4px', borderRadius:'9999px', background:'rgba(45,58,46,.06)' }}>
          {[
            { id:'amici',      label:'Amici', count:friends.length },
            { id:'classifica', label:'Classifica' },
            { id:'invita',     label:'Invita' },
          ].map(({ id, label, count }) => (
            <button key={id} onClick={() => setTab(id)}
              style={{ flex:1, padding:'8px 0', fontSize:'12px', fontWeight:500, borderRadius:'9999px', display:'flex', alignItems:'center', justifyContent:'center', gap:'4px', background:tab===id?'white':'transparent', color:tab===id?T.ink:T.muted, border:'none', cursor:'pointer', boxShadow:tab===id?'0 2px 8px rgba(0,0,0,.05)':'none' }}>
              {label}
              {count !== undefined && (
                <span style={{ fontSize:'10px', padding:'0 6px', borderRadius:'9999px', background:tab===id?T.green:'rgba(45,58,46,.1)', color:tab===id?T.cream:T.muted }}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div style={{ paddingLeft:'24px', paddingRight:'24px', overflowY:'auto', MsOverflowStyle:'none', scrollbarWidth:'none', paddingBottom:'32px', height:'calc(100% - 180px)' }}>

        {tab==='amici' && (
          <div style={{ display:'flex', flexDirection:'column', gap:'8px', animation:'fade-up .45s ease-out forwards' }}>
            {friends.map(f => {
              const isSent = sent.includes(f.id);
              return (
                <div key={f.id} style={{ borderRadius:'16px', padding:'16px', background:'white' }}>
                  <div style={{ display:'flex', alignItems:'flex-start', gap:'12px' }}>
                    <div style={{ position:'relative', width:'48px', height:'48px', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px', flexShrink:0, background:`${f.color}22` }}>
                      {f.avatar}
                      {f.online && (
                        <div style={{ position:'absolute', bottom:'-2px', right:'-2px', width:'12px', height:'12px', borderRadius:'50%', border:'2px solid white', background:'#4ade80' }} />
                      )}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'2px' }}>
                        <p style={{ fontWeight:500, fontSize:'14px', color:T.ink }}>{f.name}</p>
                        {f.badge && <span style={{ fontSize:'12px' }}>{f.badge}</span>}
                      </div>
                      <p style={{ fontSize:'12px', marginBottom:'8px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:T.muted }}>{f.status}</p>
                      <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                        <span style={{ display:'flex', alignItems:'center', gap:'4px', fontSize:'11px', color:T.ink }}>
                          <Flame size={10} style={{ color:T.terra }} />{f.streak}g
                        </span>
                        <span style={{ display:'flex', alignItems:'center', gap:'4px', fontSize:'11px', color:T.ink }}>
                          <TreePine size={10} style={{ color:T.green }} />{f.trees}
                        </span>
                        <span style={{ display:'flex', alignItems:'center', gap:'4px', fontSize:'11px', color:T.muted }}>
                          <Clock size={10} />{f.hrs}h
                        </span>
                      </div>
                    </div>
                    <button onClick={() => !isSent && setBeeTarget(f)}
                      style={{ borderRadius:'9999px', padding:'6px 12px', fontSize:'12px', fontWeight:500, flexShrink:0, background:isSent?'rgba(74,222,128,.15)':`${T.terra}18`, color:isSent?'#3a8c5a':T.terra, border:'none', cursor:'pointer' }}>
                      {isSent ? '✓ Inviato' : '🐝 Invia'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab==='classifica' && (
          <div style={{ animation:'fade-up .45s ease-out forwards' }}>
            <p style={{ fontSize:'12px', marginBottom:'16px', color:T.muted }}>Settimana corrente · per streak</p>
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              {leaderboard.map((f,i) => (
                <div key={f.id} style={{ borderRadius:'16px', padding:'14px', display:'flex', alignItems:'center', gap:'12px', background:i===0?`linear-gradient(135deg,${T.terra},#a85f44)`:'white', color:i===0?T.cream:T.ink }}>
                  <div style={{ width:'28px', height:'28px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'sans-serif', fontSize:'14px', fontWeight:600, background:i===0?'rgba(244,239,230,.2)':i<3?'rgba(45,58,46,.08)':'transparent', color:i===0?T.cream:i<3?T.ink:T.muted }}>
                    {i+1}
                  </div>
                  <div style={{ width:'36px', height:'36px', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', background:i===0?'rgba(244,239,230,.18)':`${f.color}22` }}>
                    {f.avatar}
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:'14px', fontWeight:500 }}>{f.name}</p>
                    <p style={{ fontSize:'11px', opacity:0.7 }}>{f.hrs}h recuperate</p>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <p style={{ fontFamily:'sans-serif', fontSize:'18px', lineHeight:1 }}>{f.streak}</p>
                    <p style={{ fontSize:'9px', textTransform:'uppercase', letterSpacing:'0.05em', opacity:0.65 }}>giorni</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop:'12px', borderRadius:'16px', padding:'14px', display:'flex', alignItems:'center', gap:'12px', background:T.green, color:T.cream }}>
              <div style={{ width:'28px', height:'28px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'sans-serif', fontSize:'14px', fontWeight:600, background:'rgba(244,239,230,.15)' }}>3</div>
              <div style={{ width:'36px', height:'36px', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', background:'rgba(244,239,230,.15)' }}>🌳</div>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:'14px', fontWeight:500 }}>Tu</p>
                <p style={{ fontSize:'11px', opacity:0.7 }}>14.5h recuperate</p>
              </div>
              <div style={{ textAlign:'right' }}>
                <p style={{ fontFamily:'sans-serif', fontSize:'18px', lineHeight:1 }}>12</p>
                <p style={{ fontSize:'9px', textTransform:'uppercase', letterSpacing:'0.05em', opacity:0.65 }}>giorni</p>
              </div>
            </div>
          </div>
        )}

        {tab==='invita' && (
          <div style={{ animation:'fade-up .45s ease-out forwards' }}>
            <div style={{ borderRadius:'24px', padding:'20px', marginBottom:'16px', textAlign:'center', background:`linear-gradient(135deg,${T.green},${T.greenDark})`, color:T.cream }}>
              <div style={{ width:'64px', height:'64px', borderRadius:'50%', margin:'0 auto 12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px', background:'rgba(244,239,230,.1)' }}>🌱</div>
              <p style={{ fontFamily:'sans-serif', fontSize:'20px', marginBottom:'8px' }}>Cresciamo insieme</p>
              <p style={{ fontSize:'12px', opacity:0.8, lineHeight:1.6, marginBottom:'16px', maxWidth:'260px', marginLeft:'auto', marginRight:'auto' }}>
                Le ricerche mostrano che è 3× più probabile cambiare abitudini con amici che ti supportano.
              </p>
              <div style={{ borderRadius:'12px', padding:'12px', marginBottom:'12px', background:'rgba(244,239,230,.1)' }}>
                <p style={{ fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.16em', opacity:0.6, marginBottom:'4px' }}>Il tuo codice</p>
                <p style={{ fontFamily:'sans-serif', fontSize:'24px', letterSpacing:'.2em' }}>SERENO-LUCA-7</p>
              </div>
              <button style={{ width:'100%', borderRadius:'12px', padding:'12px 0', fontSize:'14px', fontWeight:500, background:T.earth, color:T.green, border:'none', cursor:'pointer' }}>
                Condividi invito
              </button>
            </div>

            <div style={{ borderRadius:'16px', padding:'16px', marginBottom:'12px', background:'white' }}>
              <p style={{ fontSize:'12px', textTransform:'uppercase', letterSpacing:'0.16em', marginBottom:'12px', color:T.muted }}>Come funziona</p>
              <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                {[
                  'Condividi il codice con un amico',
                  'Si iscrive e collega il suo giardino al tuo',
                  'Vedete i progressi reciproci e vi mandate gesti',
                  'Insieme piantate alberi reali via Eden',
                ].map((s,i)=>(
                  <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:'12px' }}>
                    <div style={{ width:'24px', height:'24px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:500, flexShrink:0, background:`${T.terra}20`, color:T.terra }}>{i+1}</div>
                    <p style={{ fontSize:'12px', lineHeight:1.6, paddingTop:'2px', color:T.ink }}>{s}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ borderRadius:'16px', padding:'12px', display:'flex', alignItems:'center', gap:'8px', background:'rgba(201,123,92,.08)' }}>
              <Sparkles size={14} style={{ color:T.terra, flexShrink:0 }} />
              <p style={{ fontSize:'11px', lineHeight:1.6, color:T.ink }}>
                Quando entrambi raggiungete 7 giorni, Sereno pianta un albero extra a vostro nome.
              </p>
            </div>
          </div>
        )}
      </div>

      {beeTarget && (
        <div style={{ position:'absolute', top:0, right:0, bottom:0, left:0, zIndex:50, display:'flex', alignItems:'flex-end' }}
          onClick={() => setBeeTarget(null)}>
          <div style={{ position:'absolute', top:0, right:0, bottom:0, left:0, background:'rgba(0,0,0,.38)' }} />
          <div style={{ width:'100%', borderRadius:'24px 24px 0 0', padding:'24px', animation:'slide-up .35s cubic-bezier(.22,1,.36,1) forwards', background:T.cream, position:'relative', zIndex:1 }}
            onClick={e=>e.stopPropagation()}>
            <div style={{ width:'40px', height:'4px', borderRadius:'9999px', margin:'0 auto 16px', background:'rgba(45,58,46,.15)' }} />
            <div style={{ textAlign:'center', marginBottom:'20px' }}>
              <div style={{ width:'56px', height:'56px', borderRadius:'12px', margin:'0 auto 12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'32px', background:`${beeTarget.color}22` }}>{beeTarget.avatar}</div>
              <p style={{ fontFamily:'sans-serif', fontSize:'20px', marginBottom:'4px', color:T.ink }}>Manda un gesto a {beeTarget.name}</p>
              <p style={{ fontSize:'12px', color:T.muted }}>Lo riceve come notifica gentile.</p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'12px' }}>
              {GIFTS.map(g => (
                <button key={g.id} onClick={() => sendGift(beeTarget.id)}
                  style={{ borderRadius:'16px', padding:'16px', textAlign:'center', background:'white', border:'none', cursor:'pointer' }}>
                  <div style={{ fontSize:'32px', marginBottom:'8px' }}>{g.emoji}</div>
                  <p style={{ fontSize:'14px', fontWeight:500, color:T.ink }}>{g.label}</p>
                  <p style={{ fontSize:'10px', marginTop:'4px', lineHeight:1.3, color:T.muted }}>{g.msg}</p>
                </button>
              ))}
            </div>
            <button onClick={() => setBeeTarget(null)}
              style={{ width:'100%', fontSize:'12px', textDecoration:'underline', textUnderlineOffset:'4px', padding:'8px 0', background:'none', border:'none', cursor:'pointer', color:T.muted }}>
              Annulla
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
