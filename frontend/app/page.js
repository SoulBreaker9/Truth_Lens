"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, ShieldAlert, CheckCircle, Search, Activity, Cpu, Eye, Lock, ScanLine, AlertTriangle, Cloud, ShieldCheck } from "lucide-react";
import TerminalLoader from "../components/TerminalLoader";

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

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
    const formData = new FormData();
    formData.append("file", file);
    formData.append("mode", mode);

    try {
      // DYNAMIC ENDPOINT SELECTION
      const endpoint = mode === 'master'
        ? `${API_BASE}/analyze_ensemble`
        : `${API_BASE}/analyze`;

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      // CACHE BUSTING: Append timestamp to force video reload
      if (data.video_url) {
        data.video_url = `${data.video_url}?t=${new Date().getTime()}`;
      }

      stopBoot(); // Stop animation
      setUploading(false);
      setResult(data);
    } catch (error) {
      console.error("API Connection Failed:", error);
      alert("Backend Offline! Is python main.py running?");
      stopBoot();
      setUploading(false);
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
    <div className="min-h-screen relative bg-black text-green-500 font-mono selection:bg-green-900 selection:text-green-100 flex flex-col items-center justify-center p-4">
      {/* SCANLINES & GRID OVERLAY */}
      <div className="fixed inset-0 pointer-events-none opacity-20 z-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
      <div className="fixed inset-0 pointer-events-none opacity-10 z-0 bg-[size:50px_50px] bg-[linear-gradient(to_right,#22c55e_1px,transparent_1px),linear-gradient(to_bottom,#22c55e_1px,transparent_1px)]" />

      {/* --- HEADER --- */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="z-10 text-center mb-12"
      >
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-2 text-green-500 drop-shadow-[0_0_15px_rgba(34,197,94,0.8)]">
          TRINETRA // SYSTEM_ONLINE
        </h1>
        <p className="text-green-500/70 font-bold text-sm tracking-[0.3em] uppercase">
          [ THE THIRD EYE PROTOCOL ]
        </p>
      </motion.div>

      {/* --- UPLOAD ZONE --- */}
      {!result && !uploading && (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="z-10 w-full max-w-4xl"
        >
          {/* ENGINE SWITCH - RETRO TERMINAL PANELS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <button
              onClick={() => setMode('cloud')}
              className={`relative overflow-hidden group p-6 border transition-all duration-300 flex flex-col items-center justify-center gap-3 ${mode === 'cloud'
                ? 'bg-green-500/10 border-green-400 shadow-[0_0_10px_rgba(34,197,94,0.4)]'
                : 'bg-black border-green-500/30 hover:bg-green-500 hover:text-black hover:border-green-500'}`}
            >
              <div className={`p-3 border border-green-500 rounded-sm ${mode === 'cloud' ? 'bg-green-500 text-black' : 'text-green-500 group-hover:bg-black group-hover:text-green-500'}`}>
                <Cloud className="w-8 h-8" />
              </div>
              <div className="text-center">
                <div className="font-bold tracking-widest text-base">CLOUD_ENGINE</div>
                <div className={`text-[10px] font-bold mt-1 uppercase tracking-widest ${mode === 'cloud' ? 'text-green-400' : 'text-green-500/60 group-hover:text-black'}`}>:: GEMINI 2.5 ::</div>
              </div>
            </button>

            <button
              onClick={() => setMode('local')}
              className={`relative overflow-hidden group p-6 border transition-all duration-300 flex flex-col items-center justify-center gap-3 ${mode === 'local'
                ? 'bg-green-500/10 border-green-400 shadow-[0_0_10px_rgba(34,197,94,0.4)]'
                : 'bg-black border-green-500/30 hover:bg-green-500 hover:text-black hover:border-green-500'}`}
            >
              <div className={`p-3 border border-green-500 rounded-sm ${mode === 'local' ? 'bg-green-500 text-black' : 'text-green-500 group-hover:bg-black group-hover:text-green-500'}`}>
                <Cpu className="w-8 h-8" />
              </div>
              <div className="text-center">
                <div className="font-bold tracking-widest text-base">NEURAL_CORE</div>
                <div className={`text-[10px] font-bold mt-1 uppercase tracking-widest ${mode === 'local' ? 'text-green-400' : 'text-green-500/60 group-hover:text-black'}`}>:: ON_DEVICE ::</div>
              </div>
            </button>

            <button
              onClick={() => setMode('gradcam')}
              className={`relative overflow-hidden group p-6 border transition-all duration-300 flex flex-col items-center justify-center gap-3 ${mode === 'gradcam'
                ? 'bg-green-500/10 border-green-400 shadow-[0_0_10px_rgba(34,197,94,0.4)]'
                : 'bg-black border-green-500/30 hover:bg-green-500 hover:text-black hover:border-green-500'}`}
            >
              <div className={`p-3 border border-green-500 rounded-sm ${mode === 'gradcam' ? 'bg-green-500 text-black' : 'text-green-500 group-hover:bg-black group-hover:text-green-500'}`}>
                <Eye className="w-8 h-8" />
              </div>
              <div className="text-center">
                <div className="font-bold tracking-widest text-base">GRAD_CAM</div>
                <div className={`text-[10px] font-bold mt-1 uppercase tracking-widest ${mode === 'gradcam' ? 'text-green-400' : 'text-green-500/60 group-hover:text-black'}`}>:: HEATMAP ::</div>
              </div>
            </button>

            {/* MASTER SCAN BUTTON */}
            <button
              onClick={() => setMode('master')}
              className={`relative overflow-hidden group p-6 border-2 transition-all duration-300 flex flex-col items-center justify-center gap-3 col-span-1 md:col-span-3 ${mode === 'master'
                ? 'bg-green-500 text-black border-green-400 shadow-[0_0_20px_rgba(34,197,94,0.6)]'
                : 'bg-black border-green-500 hover:bg-green-500 hover:text-black'}`}
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-10 h-10" />
                <div className="text-center">
                  <div className="font-black tracking-widest text-xl">MASTER SCAN</div>
                  <div className="text-xs font-bold mt-1 uppercase tracking-[0.3em]">:: ENSEMBLE_MODE ::</div>
                </div>
              </div>
            </button>
          </div>

          {/* UPLOAD BOX */}
          <div className="relative overflow-hidden border-2 border-dashed border-green-500/30 p-1">
            <div className="bg-black p-12 text-center border border-green-500/10 hover:border-green-500 transition-all duration-300 group relative">
              <input
                type="file"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50"
                accept="video/*"
              />

              <div className="flex flex-col items-center gap-6 relative z-10 pointer-events-none">
                <div className="w-20 h-20 border-2 border-green-500 flex items-center justify-center group-hover:bg-green-500 group-hover:text-black transition-colors duration-300">
                  <Upload className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 tracking-widest uppercase group-hover:text-green-400">Initialized Upload Sequence</h3>
                  <p className="text-green-500/60 text-xs font-mono">[ TARGETS: MP4, MOV, AVI ]</p>
                </div>
                {file && (
                  <div className="bg-green-500 text-black px-6 py-2 border border-green-500 text-sm font-bold flex items-center gap-2 uppercase tracking-tight">
                    <CheckCircle className="w-4 h-4" /> &gt;&gt; {file.name}
                  </div>
                )}
              </div>
            </div>
          </div>

          {file && (
            <motion.button
              onClick={handleSubmit}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="mt-8 w-full py-5 bg-green-900/20 border-2 border-green-500 hover:bg-green-500 hover:text-black text-green-500 font-bold text-xl tracking-[0.2em] shadow-[0_0_20px_rgba(34,197,94,0.2)] transition-all uppercase rounded-none"
            >
              {mode === 'gradcam' ? '[ INITIATE HEATMAP ]' : mode === 'local' ? '[ RUN NEURAL SCAN ]' : mode === 'master' ? '[ EXECUTE MASTER SCAN ]' : '[ EXECUTE ANALYSIS ]'}
            </motion.button>
          )}
        </motion.div>
      )}

      {/* --- DASHBOARD FOR ENSEMBLE --- */}
      {result && result.breakdown && (
        <div className="z-20 w-full max-w-4xl mb-8 p-6 border-2 border-green-500 bg-black/90 shadow-[0_0_50px_rgba(34,197,94,0.1)]">
          <h2 className="text-2xl font-black text-green-500 mb-6 tracking-widest border-b border-green-500/30 pb-2">Diagnostic Dashboard // ENSEMBLE_METRICS</h2>

          {/* TOTAL SCORE */}
          <div className="mb-6">
            <div className="flex justify-between text-sm font-bold mb-1">
              <span>FINAL AI/DEEPFAKE SCORE</span>
              <span>{result.final_verdict}%</span>
            </div>
            <div className="w-full h-6 bg-gray-900 border border-green-500 relative overflow-hidden">
              <div
                className="h-full transition-all duration-1000"
                style={{
                  width: `${result.final_verdict}%`,
                  background: `linear-gradient(90deg, #22c55e 0%, ${result.final_verdict > 50 ? '#ef4444' : '#22c55e'} 100%)`
                }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* CLOUD */}
            <div>
              <div className="flex justify-between text-xs mb-1 text-green-500/70">
                <span>CLOUD INTELLIGENCE </span>
                <span>{result.breakdown.api}%</span>
              </div>
              <div className="w-full h-2 bg-gray-900 border border-green-500/30">
                <div className="h-full bg-blue-500" style={{ width: `${result.breakdown.api}%` }}></div>
              </div>
            </div>

            {/* HEATMAP */}
            <div>
              <div className="flex justify-between text-xs mb-1 text-green-500/70">
                <span>VISUAL SPECTRUM </span>
                <span>{result.breakdown.heatmap}%</span>
              </div>
              <div className="w-full h-2 bg-gray-900 border border-green-500/30">
                <div className="h-full bg-orange-500" style={{ width: `${result.breakdown.heatmap}%` }}></div>
              </div>
            </div>

            {/* NEURAL */}
            <div>
              <div className="flex justify-between text-xs mb-1 text-green-500/70">
                <span>NEURAL PATTERNS </span>
                <span>{result.breakdown.neural}%</span>
              </div>
              <div className="w-full h-2 bg-gray-900 border border-green-500/30">
                <div className="h-full bg-purple-500" style={{ width: `${result.breakdown.neural}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- LOADING UI --- */}
      {uploading && (
        <div className="z-10 w-full max-w-3xl text-center">
          <TerminalLoader />

          {/* RETRO PROGRESS BAR */}
          <div className="mt-8 font-mono border border-green-500/30 p-4 bg-black">
            <div className="flex justify-between text-xs text-green-500 mb-2 tracking-widest uppercase">
              <span>&gt; Processing_Unit</span>
              <span>[{progress.toFixed(0)}%_LOADED]</span>
            </div>
            <div className="w-full h-4 border border-green-500 p-0.5">
              <motion.div
                className="h-full bg-green-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
              />
              {/* Grid Lines in Progress Bar */}
              <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_10px,#000_10px,#000_12px)] opacity-50 pointer-events-none"></div>
            </div>
            <div className="mt-2 text-green-500/60 text-[10px] tracking-[0.2em] blink">
              ... DECRYPTING_VIDEO_STREAM ...
            </div>
          </div>
        </div>
      )}

      {/* --- RESULT DASHBOARD --- */}
      {result && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="z-20 w-full max-w-6xl mt-4 pb-20 font-mono"
        >
          <button
            onClick={() => setResult(null)}
            className="mb-8 flex items-center gap-2 text-green-500 hover:bg-green-500 hover:text-black px-4 py-2 border border-green-500 transition-colors text-sm font-bold tracking-widest uppercase"
          >
            <span>&lt;&lt;</span> REBOOT_SYSTEM
          </button>

          {/* VIDEO TERMINAL */}
          {result.video_url && (
            <div className="mb-8 border-2 border-green-500 bg-black relative p-1 shadow-[0_0_30px_rgba(34,197,94,0.1)]">
              {result.is_demo_mode && (
                <div className="bg-red-900/20 text-red-500 font-bold text-center py-2 text-xs tracking-widest _uppercase border-b border-red-500/50">
                  WARNING: DEMO_MODE_ACTIVE // STANDARD_WEIGHTS_LOADED
                </div>
              )}

              <div className="relative bg-black flex items-center justify-center border-b border-green-500/30 p-2">
                <div className="absolute top-2 left-2 text-[10px] text-green-500/50">CAM_01 // LIVE_FEED</div>
                <video
                  key={result.video_url}
                  src={result.video_url}
                  controls
                  autoPlay
                  loop
                  className="max-h-[600px] w-auto mx-auto"
                  style={{ filter: 'contrast(1.1) brightness(1.1)' }}
                />
                {/* Corner markers */}
                <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-green-500"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-green-500"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-green-500"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-green-500"></div>
              </div>

              {/* --- START OF FIXED LEGEND (THERMAL/JET) --- */}
              <div className="mt-8 border border-green-500/50 p-4 rounded-sm bg-black relative">
                <div className="flex items-center space-x-2 mb-3">
                  {/* Pulse Icon */}
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <h3 className="text-green-500 font-mono tracking-widest text-sm">
                    SPECTRUM_ANALYSIS
                  </h3>
                </div>

                {/* THE GRADIENT BAR - THERMAL COLORS (BLUE -> RED) */}
                <div
                  className="w-full h-8 rounded-sm mb-2 border border-white/20"
                  style={{
                    background: 'linear-gradient(90deg, #0000ff 0%, #00ffff 25%, #00ff00 50%, #ffff00 75%, #ff0000 100%)',
                    minHeight: '24px'
                  }}
                >
                  {/* Empty div just for visual bar */}
                </div>

                {/* Labels - Updated to match Blue-Safe / Red-Fake */}
                <div className="flex justify-between font-mono text-[10px] text-green-400/70 uppercase tracking-wider">
                  <span className="text-blue-400">[ SAFE (COLD) ]</span>
                  <span className="text-green-400">[ NEUTRAL ]</span>
                  <span className="text-red-500">[ MANIPULATED (HOT) ]</span>
                </div>
              </div>
              {/* --- END OF FIXED LEGEND --- */}
            </div>
          )}

          {/* VERDICT TERMINAL */}
          <div className={`relative p-8 mb-8 border-l-4 ${isFake ? 'border-red-500 bg-red-950/10' : 'border-green-500 bg-green-950/10'}`}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="flex items-center gap-8">
                <div className={`p-4 border-2 ${isFake ? 'border-red-500 text-red-500' : 'border-green-500 text-green-500'}`}>
                  {isFake ? (
                    <AlertTriangle className="w-12 h-12" />
                  ) : (
                    <CheckCircle className="w-12 h-12" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-xs font-bold tracking-widest uppercase ${isFake ? 'text-red-500' : 'text-green-500'}`}>
                      &gt; FINAL_VERDICT_ISSUED
                    </span>
                  </div>
                  <h2 className={`text-3xl md:text-5xl font-black tracking-tighter uppercase ${isFake ? 'text-red-500 text-shadow-red' : 'text-green-500 text-shadow-green'}`}>
                    {result.verdict_title || (isFake ? "MANIPULATION_DETECTED" : "MEDIA_AUTHENTIC")}
                  </h2>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-green-500/60 mb-1 font-mono tracking-widest uppercase">CONFIDENCE_INTERVAL</div>
                <div className={`text-6xl font-black ${isFake ? 'text-red-500' : 'text-green-500'}`}>
                  {result.confidence_score !== undefined ? result.confidence_score : 0}%
                </div>
              </div>
            </div>
          </div>

          {/* DATA LOGS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Visuals */}
            <div className="border border-green-500/30 p-4 bg-black/50">
              <h3 className="text-sm font-bold text-green-400 mb-4 border-b border-green-500/30 pb-2 uppercase">
                &gt; VISUAL_LOGS
              </h3>
              <ul className="space-y-2 text-xs text-green-500/80 font-mono">
                {result.visual_evidence?.length > 0 ? result.visual_evidence.map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-green-300">[{i}]</span>
                    <span>{item}</span>
                  </li>
                )) : <li className="italic opacity-50">NO_ANOMALIES_FOUND</li>}
              </ul>
            </div>

            {/* Audio */}
            {mode === 'cloud' && (
              <div className="border border-green-500/30 p-4 bg-black/50">
                <h3 className="text-sm font-bold text-green-400 mb-4 border-b border-green-500/30 pb-2 uppercase">
                  &gt; AUDIO_SPECTROGRAM
                </h3>
                <ul className="space-y-2 text-xs text-green-500/80 font-mono">
                  {result.audio_evidence?.length > 0 ? result.audio_evidence.map((item, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-purple-400">[{i}]</span>
                      <span>{item}</span>
                    </li>
                  )) : <li className="italic opacity-50">NO_ANOMALIES_FOUND</li>}
                </ul>
              </div>
            )}

            {/* Context */}
            {mode === 'cloud' && (
              <div className="border border-green-500/30 p-4 bg-black/50">
                <h3 className="text-sm font-bold text-green-400 mb-4 border-b border-green-500/30 pb-2 uppercase">
                  &gt; GLOBAL_DB_QUERY
                </h3>
                <div className="text-xs text-green-500/80 font-mono leading-relaxed">
                  {result.fact_check_analysis || "DATABASE_RETURNED_NULL"}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
