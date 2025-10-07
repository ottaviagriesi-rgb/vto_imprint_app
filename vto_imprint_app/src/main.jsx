import React, { useEffect, useRef, useState, useMemo } from "react";
import { createRoot } from "react-dom/client";

function useQuery() {
  return useMemo(() => new URLSearchParams(window.location.search), []);
}

function Panel(props){ return <div className={"panel "+(props.className||"")}>{props.children}</div>; }
function Button(props){ return <button className={"btn "+(props.className||"")} {...props} />; }

function Slider({label,value,min,max,step=0.01,onChange}){
  return <div className="row">
    <div className="label">{label}</div>
    <input className="slider" type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(parseFloat(e.target.value))} />
    <div style={{width:50,fontSize:12,opacity:.7,textAlign:"right"}}>{value.toFixed(2)}</div>
  </div>;
}

function VTO(){
  const q = useQuery();
  const item = q.get("item") || "earring"; // earring | necklace | corset
  const assetUrl = q.get("asset") || "/overlay.png";
  const brand = q.get("brand") || "";

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayImg = useRef(new Image());

  const [ready,setReady] = useState(false);
  const [err,setErr] = useState("");

  const [scale,setScale] = useState(1);
  const [rotation,setRotation] = useState(0);
  const [offsetX,setOffsetX] = useState(0);
  const [offsetY,setOffsetY] = useState(0);
  const [flip,setFlip] = useState(false);

  useEffect(()=>{ overlayImg.current.crossOrigin = "anonymous"; overlayImg.current.src = assetUrl; },[assetUrl]);

  useEffect(()=>{
    (async()=>{
      try{
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setReady(true);
        loop();
      }catch(e){ setErr("Permesso camera negato o non disponibile."); console.error(e); }
    })();
    return ()=>{
      const s = videoRef.current?.srcObject; if (s) s.getTracks().forEach(t=>t.stop());
    };
  },[]);

  function loop(){
    const v = videoRef.current, c = canvasRef.current;
    if (!v || !c) return requestAnimationFrame(loop);
    if (v.videoWidth && v.videoHeight){ c.width = v.videoWidth; c.height = v.videoHeight; }
    const ctx = c.getContext("2d");
    ctx.clearRect(0,0,c.width,c.height);
    ctx.save(); ctx.scale(-1,1); ctx.drawImage(v,-c.width,0,c.width,c.height); ctx.restore();

    const cx=c.width/2, cy=c.height/2;
    let tx=cx, ty=cy, baseW=c.width*0.25;
    if (item==="earring"){ tx = cx + (flip? -c.width*0.18: c.width*0.18); ty = cy - c.height*0.05; baseW = c.width*0.12; }
    else if (item==="necklace"){ tx = cx; ty = cy + c.height*0.22; baseW = c.width*0.35; }
    else { tx = cx; ty = cy + c.height*0.35; baseW = c.width*0.55; }
    const w = baseW*scale;
    const img = overlayImg.current;
    const h = img && img.width ? (w * img.height) / img.width : w;

    ctx.save();
    ctx.translate(tx + offsetX*c.width, ty + offsetY*c.height);
    ctx.rotate(rotation*Math.PI/180);
    ctx.drawImage(img, -w/2, -h/2, w, h);
    ctx.restore();

    requestAnimationFrame(loop);
  }

  function snapshot(){
    const a = document.createElement("a");
    a.href = canvasRef.current.toDataURL("image/png");
    a.download = `${item}-tryon.png`; a.click();
  }

  const bgClass = item==="earring" ? "bg-aeterna" : item==="necklace" ? "bg-aeonic" : "bg-aermor";

  return <div className={"container "+bgClass}>
    <div className="grid">
      <Panel className="aspect" style={{position:'relative'}}>
        {!ready && !err && <div style={{position:'absolute',inset:0,display:'grid',placeItems:'center',fontSize:14,opacity:.8}}>Attivazione camera…</div>}
        {err && <div style={{position:'absolute',inset:0,display:'grid',placeItems:'center',color:'#f88',fontSize:13}}>{err}</div>}
        <video ref={videoRef} playsInline muted style={{display:'none'}} />
        <canvas ref={canvasRef} style={{width:'100%',height:'100%',objectFit:'cover'}} />
        {brand && <div className="brand">{brand}</div>}
      </Panel>
      <Panel className="controls" style={{padding:16}}>
        <div className="label" style={{width:'auto',marginBottom:6,opacity:.8}}>Adatta il fit</div>
        <Slider label="Scala" value={scale} min={0.5} max={2.0} step={0.01} onChange={setScale} />
        <Slider label="Rotazione" value={rotation} min={-45} max={45} step={0.1} onChange={setRotation} />
        <Slider label="Offset X" value={offsetX} min={-0.5} max={0.5} step={0.005} onChange={setOffsetX} />
        <Slider label="Offset Y" value={offsetY} min={-0.5} max={0.5} step={0.005} onChange={setOffsetY} />
        {item==="earring" && <label style={{display:'flex',gap:8,alignItems:'center'}}><input type="checkbox" checked={flip} onChange={e=>setFlip(e.target.checked)} />Lato opposto</label>}
        <div style={{display:'flex',gap:10,marginTop:8}}>
          <Button onClick={snapshot}>Scatta foto</Button>
          <a href={`/checkout?brand=${encodeURIComponent(brand)}&item=${item}`}><Button>Procedi</Button></a>
        </div>
        <small>La fotocamera è elaborata solo sul tuo dispositivo. Nessuna immagine viene inviata ai nostri server.</small>
      </Panel>
    </div>
  </div>;
}

function FakeCheckout(){
  const q = useQuery();
  const imprint = q.get("imprint") || "/imprint.mp4";
  const reward = q.get("reward") || "Scelta impeccabile. Il tuo ordine è in arrivo.";
  const brand = q.get("brand") || "";
  const videoRef = useRef(null);
  const [phase,setPhase] = useState("await");
  useEffect(()=>{
    const v = videoRef.current;
    if (!v) return;
    const onEnd = ()=> setPhase("done");
    v.addEventListener("ended", onEnd);
    return ()=> v.removeEventListener("ended", onEnd);
  },[]);

  return <div className="container" style={{background:'#000',color:'#fff'}}>
    <div style={{width:'100%',maxWidth:800}}>
      <Panel style={{padding:24,display:'grid',gap:12,justifyItems:'center'}}>
        <div style={{fontSize:12,opacity:.7,letterSpacing:'0.18em',textTransform:'uppercase'}}>{brand || "Checkout"}</div>
        {phase==="await" && <>
          <div style={{fontSize:20}}>Avvicina il dito per confermare</div>
          <Button onClick={()=>{ videoRef.current?.play(); setPhase("playing"); }}>Tocca per simulare</Button>
        </>}
        <video ref={videoRef} src={imprint} className={phase==="playing" ? "" : "hidden"} playsInline muted style={{width:'100%',borderRadius:12}} />
        {phase==="done" && <div style={{textAlign:'center',padding:'40px 0'}}>
          <div style={{fontSize:28,marginBottom:8}}>{reward}</div>
          <div style={{fontSize:13,opacity:.7}}>Riceverai un’email di conferma a breve.</div>
        </div>}
      </Panel>
    </div>
  </div>;
}

function VoiceGate(){
  const [listening,setListening] = useState(false);
  const [text,setText] = useState("");
  const [err,setErr] = useState("");
  function start(){
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR){ setErr("SpeechRecognition non supportato in questo browser."); return; }
    const r = new SR(); r.lang = "it-IT"; r.interimResults = true;
    r.onresult = (e)=>{
      const t = Array.from(e.results).map(r=>r[0].transcript).join(" ");
      setText(t);
      const L = t.toLowerCase();
      if (L.includes("audace")) window.location.href = "/vto?item=earring&brand=ÆTHERNA";
      else if (L.includes("equilibr")) window.location.href = "/vto?item=necklace&brand=ÆONIC";
      else if (L.includes("legger") || L.includes("delicat")) window.location.href = "/vto?item=corset&brand=ÆRMOR";
    };
    r.onend = ()=> setListening(false);
    r.onerror = (e)=> { setErr(e.error||"Errore SR"); setListening(false); };
    setListening(true); r.start();
  }
  return <div className="container">
    <div style={{width:'100%',maxWidth:760}}>
      <Panel className="voice">
        <div style={{letterSpacing:'.2em',textTransform:'uppercase',opacity:.7,fontSize:12}}>Concierge</div>
        <h1>Come ti senti oggi?</h1>
        <div style={{opacity:.7}}>Dillo ad alta voce: <em>audace</em>, <em>equilibrato</em> o <em>leggero</em>.</div>
        <div><Button onClick={start}>{listening? "Ascolto…" : "Attiva microfono"}</Button></div>
        {text && <small>Hai detto: “{text}”</small>}
        {err && <small style={{color:'#f88'}}> {err} </small>}
        <small>Oppure scegli:</small>
        <div style={{display:'flex',gap:8,justifyContent:'center',flexWrap:'wrap'}}>
          <a href="/vto?item=earring&brand=ÆTHERNA"><Button>Audace</Button></a>
          <a href="/vto?item=necklace&brand=ÆONIC"><Button>Equilibrato</Button></a>
          <a href="/vto?item=corset&brand=ÆRMOR"><Button>Leggero</Button></a>
        </div>
      </Panel>
    </div>
  </div>;
}

function App(){
  const path = window.location.pathname;
  if (path.startsWith("/vto")) return <VTO />;
  if (path.startsWith("/checkout")) return <FakeCheckout />;
  return <VoiceGate />;
}

const root = createRoot(document.getElementById("root"));
root.render(<App />);
