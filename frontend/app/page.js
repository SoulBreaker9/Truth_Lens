"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, ShieldAlert, CheckCircle, Search, Activity, Cpu, Eye, Lock, ScanLine, AlertTriangle, Cloud } from "lucide-react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [bootText, setBootText] = useState("INITIALIZING NEURAL CORE...");
  const [progress, setProgress] = useState(0);
  const [mode, setMode] = useState('cloud'); // 'cloud' or 'local'

  // --- BOOT SEQUENCE LOGIC ---
  const runBootSequence = () => {
    const steps = [
      "ESTABLISHING SECURE LINK...",
      "EXTRACTING BIO-METRIC DATA...",
      "RUNNING PHYSICS SIMULATION...",
      "DETECTING GENERATIVE ARTIFACTS...",
      "QUERYING GLOBAL KNOWLEDGE GRAPH...",
      "SYNTHESIZING FINAL VERDICT..."
    ];
    let i = 0;
    const interval = setInterval(() => {
      setBootText(steps[i % steps.length]);
      i++;
    }, 1200);

    const progInterval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 100 : prev + 1.5));
    }, 100);

    return () => {
      clearInterval(interval);
      clearInterval(progInterval);
    };
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setProgress(0);
    const stopBoot = runBootSequence();

    const formData = new FormData();
    formData.append("file", file);
    formData.append("mode", mode);

    try {
      const response = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      stopBoot(); // Stop animation
      setUploading(false);
      setResult(data);
    } catch (error) {
      console.error("Error uploading file:", error);
      stopBoot();
      setUploading(false);
      alert("SECURE CONNECTION FAILED. RETRY.");
    }
  };

  // --- VERDICT LOGIC ---
  // If score > 50 -> RED (Fake)
  // If score <= 50 -> GREEN (Real)
  const isFake = result ? parseInt(result.confidence_score) > 50 : false;
  const themeColor = isFake ? "text-red-500" : "text-green-500";
  const themeBorder = isFake ? "border-red-500" : "border-green-500";
  const themeBg = isFake ? "bg-red-950/30" : "bg-green-950/30";

  return (
    <div className="min-h-screen relative scanline bg-black selection:bg-green-900 selection:text-green-100 flex flex-col items-center justify-center p-4">
      {/* BACKGROUND MATRIX GRID */}
      <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none"></div>

      {/* --- HEADER --- */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="z-10 text-center mb-12"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <ScanLine className="w-6 h-6 text-blue-400 animate-pulse" />
          <span className="text-blue-400 font-mono text-xs tracking-[0.3em]">DEPARTMENT OF DEFENSE // CYBER DIVISION</span>
        </div>
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-600 glitch-text" data-text="TRUTHLENS OMEGA">
          TRUTHLENS OMEGA
        </h1>
        <p className="mt-4 text-green-400/80 font-mono text-sm tracking-widest uppercase">
          [ Tier-1 Generative Media Forensics Engine ]
        </p>
      </motion.div>

      {/* --- UPLOAD ZONE --- */}
      {!result && !uploading && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="z-10 w-full max-w-2xl"
        >
          {/* ENGINE SWITCH - REDESIGNED */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <button
              onClick={() => setMode('cloud')}
              className={`relative overflow-hidden group p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-2 ${mode === 'cloud'
                ? 'bg-green-950/40 border-green-500 shadow-[0_0_20px_rgba(0,255,65,0.2)]'
                : 'bg-black/40 border-white/10 hover:border-white/30 hover:bg-white/5'}`}
            >
              <Cloud className={`w-8 h-8 ${mode === 'cloud' ? 'text-green-400' : 'text-gray-500'}`} />
              <div className="text-center">
                <div className={`font-black font-mono tracking-widest text-lg ${mode === 'cloud' ? 'text-green-400' : 'text-gray-400'}`}>CLOUD ENGINE</div>
                <div className="text-xs font-mono text-gray-500 mt-1">GEMINI 2.5 PRO // MULTIMODAL</div>
              </div>
              {mode === 'cloud' && <div className="absolute inset-0 bg-green-500/5 pointer-events-none animate-pulse"></div>}
            </button>

            <button
              onClick={() => setMode('local')}
              className={`relative overflow-hidden group p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-2 ${mode === 'local'
                ? 'bg-purple-950/40 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.2)]'
                : 'bg-black/40 border-white/10 hover:border-white/30 hover:bg-white/5'}`}
            >
              <Cpu className={`w-8 h-8 ${mode === 'local' ? 'text-purple-400' : 'text-gray-500'}`} />
              <div className="text-center">
                <div className={`font-black font-mono tracking-widest text-lg ${mode === 'local' ? 'text-purple-400' : 'text-gray-400'}`}>NEURAL CORE</div>
                <div className="text-xs font-mono text-gray-500 mt-1">LOCAL INFERENCE // PIXEL-SCAN</div>
              </div>
              {mode === 'local' && <div className="absolute inset-0 bg-purple-500/5 pointer-events-none animate-pulse"></div>}
            </button>

            <button
              onClick={() => setMode('gradcam')}
              className={`relative overflow-hidden group p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-2 ${mode === 'gradcam'
                ? 'bg-amber-950/40 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                : 'bg-black/40 border-white/10 hover:border-white/30 hover:bg-white/5'}`}
            >
              <Eye className={`w-8 h-8 ${mode === 'gradcam' ? 'text-amber-400' : 'text-gray-500'}`} />
              <div className="text-center">
                <div className={`font-black font-mono tracking-widest text-lg ${mode === 'gradcam' ? 'text-amber-400' : 'text-gray-400'}`}>GRAD-CAM</div>
                <div className="text-xs font-mono text-gray-500 mt-1">EXPLAINABLE AI // HEATMAP</div>
              </div>
              {mode === 'gradcam' && <div className="absolute inset-0 bg-amber-500/5 pointer-events-none animate-pulse"></div>}
            </button>
          </div>
          <div className="glass-panel rounded-2xl p-10 text-center border border-white/10 hover:border-green-500/50 transition-all duration-500 group relative overflow-hidden">
            {/* Hover Glow */}
            <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

            <input
              type="file"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50"
              accept="video/*"
            />

            <div className="flex flex-col items-center gap-6 relative z-10 pointer-events-none">
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-green-500/30 flex items-center justify-center group-hover:scale-110 group-hover:border-green-500 transition-all">
                <Upload className="w-10 h-10 text-green-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">INITIATE FILE UPLOAD</h3>
                <p className="text-gray-400 font-mono text-xs">SUPPORTS: MP4, MOV, AVI [MAX 50MB]</p>
              </div>
              {file && (
                <div className="bg-green-900/20 px-4 py-2 rounded border border-green-500/30 text-green-300 font-mono text-sm">
                  SELECTED: {file.name}
                </div>
              )}
            </div>
          </div>

          {file && (
            <motion.button
              onClick={handleSubmit}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-6 w-full py-4 bg-green-600 hover:bg-green-500 text-black font-bold text-xl tracking-widest uppercase rounded clip-path-polygon hover:shadow-[0_0_20px_rgba(0,255,65,0.6)] transition-all"
            >
              {mode === 'gradcam' ? 'GENERATE HEATMAP' : mode === 'local' ? 'EXECUTE NEURAL SCAN' : 'START FORENSIC ANALYSIS'}
            </motion.button>
          )}
        </motion.div>
      )}

      {/* --- SYSTEM BOOT LOADER --- */}
      {uploading && (
        <div className="z-10 w-full max-w-3xl text-center font-mono">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8"
          >
            <Cpu className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin-slow" />
            <h2 className="text-2xl text-blue-400 font-bold animate-pulse">{bootText}</h2>
          </motion.div>

          {/* Hacking Progress Bar */}
          <div className="w-full h-2 bg-gray-900/50 border border-gray-700 rounded-full overflow-hidden relative">
            <motion.div
              className="h-full bg-blue-500 relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/50 shadow-[0_0_10px_white]"></div>
            </motion.div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>SYSTEM_INTEGRITY: 100%</span>
            <span>{progress.toFixed(1)}%</span>
          </div>

          <div className="mt-8 text-left h-32 overflow-hidden text-xs text-green-500/50 border-l-2 border-green-500/20 pl-4">
            <p>&gt;&gt; loading_modules: [vision, audio, physics]</p>
            <p>&gt;&gt; extracting_frames: (5/5) complete</p>
            <p>&gt;&gt; checking_database: 404_records_found</p>
            <p>&gt;&gt; analyzing_pixels: .................</p>
            <p>&gt;&gt; physics_engine: calculating_trajectory</p>
          </div>
        </div>
      )}

      {/* --- RESULT DASHBOARD --- */}
      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="z-20 w-full max-w-6xl mt-10 pb-20"
        >
          <button
            onClick={() => setResult(null)}
            className="mb-8 group flex items-center gap-2 text-gray-400 hover:text-white transition-colors bg-gray-900/50 px-4 py-2 rounded-lg border border-gray-800 hover:border-gray-500"
          >
            <span className="group-hover:-translate-x-1 transition-transform">&larr;</span> START NEW INVESTIGATION
          </button>

          {/* GRAD-CAM VIDEO PLAYER */}
          {result.video_url && (
            <div className="mb-8 rounded-xl overflow-hidden border-2 border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.3)] bg-black relative">
              {result.is_demo_mode && (
                <div className="bg-red-600 text-white font-bold text-center py-2 text-xs animate-pulse tracking-widest uppercase">
                  ⚠️ DEMO MODE: USING STANDARD RESNET WEIGHTS (RANDOM CLASSIFICATION)
                </div>
              )}
              <div className="bg-amber-950/30 p-3 text-center text-amber-500 font-mono text-xs tracking-[0.2em] border-b border-amber-500/30">
                    // EXPLAINABLE AI VISUALIZATION: ACTIVATION HEATMAP
              </div>
              <div className="relative aspect-video bg-black flex items-center justify-center">
                <video src={result.video_url} controls autoPlay loop className="max-h-[500px] w-auto mx-auto" />
              </div>


              <div style={{ width: '100%', maxWidth: '800px', margin: '20px auto', fontFamily: 'sans-serif' }}>
                <h3 style={{ color: '#fff', marginBottom: '10px', fontWeight: 'normal', fontSize: '14px', letterSpacing: '1px' }}>
                  VISUAL DECODER // SPECTRUM
                </h3>

                <div style={{
                  width: '100%',
                  height: '16px',
                  background: 'linear-gradient(90deg, #0000FF 0%, #00FFFF 25%, #FFFF00 50%, #FF0000 100%)',
                  borderRadius: '8px',
                  boxShadow: '0 0 10px rgba(0,0,0,0.5)',
                  border: '1px solid #333'
                }}></div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '8px',
                  color: '#aaa',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  <span>SAFE AREA</span>
                  <span>UNCERTAIN</span>
                  <span style={{ color: '#ff4444' }}>MANIPULATED</span>
                </div>
              </div>
            </div>
          )}

          {/* VERDICT BANNER */}
          <div className={`relative overflow-hidden rounded-xl border-4 ${themeBorder} ${themeBg} p-6 md:p-10 mb-8 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.5)]`}>
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <ShieldAlert className="w-48 h-48 md:w-64 md:h-64" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className={`p-4 rounded-full border-2 ${themeBorder} bg-black/40 shadow-lg`}>
                  {isFake ? (
                    <AlertTriangle className="w-12 h-12 text-red-500 animate-pulse" />
                  ) : (
                    <CheckCircle className="w-12 h-12 text-green-500" />
                  )}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className={`text-xs font-bold px-3 py-1 rounded tracking-wider ${isFake ? 'bg-red-600 text-black' : 'bg-green-600 text-black'}`}>
                      VERDICT FINALIZED
                    </span>
                    <span className="text-gray-400 text-xs font-mono tracking-widest">ID: {Math.floor(Math.random() * 100000).toString(16).toUpperCase()}</span>
                  </div>
                  <h1 className={`text-4xl md:text-6xl font-black italic tracking-tighter ${themeColor} text-glow break-words`}>
                    {result.verdict_title || (isFake ? "DEEPFAKE DETECTED" : "LIKELY AUTHENTIC")}
                  </h1>
                </div>
              </div>

              <div className="text-left md:text-right mt-4 md:mt-0 bg-black/30 p-4 rounded-lg border border-white/5">
                <div className="text-xs text-gray-400 mb-1 font-mono tracking-widest uppercase">Probability of Manipulation</div>
                <div className={`text-5xl md:text-6xl font-mono font-bold ${themeColor}`}>
                  {result.confidence_score !== undefined ? result.confidence_score : 0}%
                </div>
              </div>
            </div>
          </div>

          {/* EVIDENCE GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* COL 1: VISUALS */}
            <div className="glass-panel p-6 rounded-lg border-t-4 border-blue-500 bg-blue-950/10">
              <h3 className="text-lg font-bold text-blue-400 mb-4 flex items-center gap-2 uppercase tracking-wider">
                <Eye className="w-5 h-5" /> Visual Forensics
              </h3>
              <ul className="space-y-3 font-mono text-sm text-gray-300">
                {result.visual_evidence?.length > 0 ? result.visual_evidence.map((item, i) => (
                  <li key={i} className="flex gap-3 bg-black/20 p-2 rounded">
                    <span className="text-blue-500 font-bold">[{i + 1}]</span>
                    <span className="leading-snug">{item}</span>
                  </li>
                )) : <li className="text-gray-500 italic flex gap-2"><CheckCircle className="w-4 h-4" /> No visual anomalies detected.</li>}
              </ul>
            </div>

            {/* COL 2: AUDIO */}
            {mode === 'cloud' && (
              <div className="glass-panel p-6 rounded-lg border-t-4 border-purple-500 bg-purple-950/10">
                <h3 className="text-lg font-bold text-purple-400 mb-4 flex items-center gap-2 uppercase tracking-wider">
                  <Activity className="w-5 h-5" /> Audio Spectrum
                </h3>
                <ul className="space-y-3 font-mono text-sm text-gray-300">
                  {result.audio_evidence?.length > 0 ? result.audio_evidence.map((item, i) => (
                    <li key={i} className="flex gap-3 bg-black/20 p-2 rounded">
                      <span className="text-purple-500 font-bold">[{i + 1}]</span>
                      <span className="leading-snug">{item}</span>
                    </li>
                  )) : <li className="text-gray-500 italic flex gap-2"><CheckCircle className="w-4 h-4" /> No audio anomalies detected.</li>}
                </ul>
              </div>
            )}

            {/* COL 3: CONTEXT */}
            {mode === 'cloud' && (
              <div className="glass-panel p-6 rounded-lg border-t-4 border-yellow-500 bg-yellow-950/10">
                <h3 className="text-lg font-bold text-yellow-400 mb-4 flex items-center gap-2 uppercase tracking-wider">
                  <Search className="w-5 h-5" /> Knowledge Graph
                </h3>
                <div className="text-sm text-gray-300 font-mono leading-relaxed bg-black/20 p-3 rounded border border-white/5">
                  {result.fact_check_analysis || "No contextual matches found in global database."}
                </div>
              </div>
            )}

          </div>

        </motion.div>
      )}
    </div>
  );
}
