"use client";
import { useState } from "react";
import { ShieldAlert, CheckCircle, Upload, Activity, Search, BrainCircuit } from "lucide-react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      // CONNECT TO BACKEND
      const response = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      // Parse the JSON string from Gemini
      let parsedData;
      try {
        parsedData = typeof data === 'string' ? JSON.parse(data) : data;
      } catch (e) {
        // If Gemini returns raw text instead of JSON, handle it gracefully
        parsedData = {
          is_fake: false,
          verdict_title: "ANALYSIS ERROR",
          fact_check_analysis: "Raw Output: " + data
        };
      }
      setResult(parsedData);
    } catch (error) {
      console.error("Error:", error);
      alert("Connection Failed! Is the Backend running on port 8000?");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-start p-10 scanline relative overflow-hidden">

      {/* BACKGROUND DECORATION */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-10 left-10 animate-pulse">Running TruthLens v2.0...</div>
        <div className="absolute top-14 left-10">Connection: SECURE</div>
        <div className="absolute bottom-10 right-10">Google Vertex AI: CONNECTED</div>
      </div>

      {/* HEADER */}
      <div className="text-center mb-10 z-10">
        <h1 className="text-6xl font-bold tracking-widest border-b-4 border-green-500 pb-2 mb-2 text-shadow-glow">
          TRUTH<span className="text-white">LENS</span>
        </h1>
        <p className="text-xl font-mono text-green-400 opacity-80 flex items-center justify-center gap-2">
          <BrainCircuit className="w-5 h-5" /> MULTIMODAL FORENSICS ENGINE
        </p>
      </div>

      {/* UPLOAD SECTION */}
      {!result && (
        <div className="z-10 w-full max-w-2xl bg-black/80 border border-green-700 p-10 rounded-lg shadow-[0_0_50px_rgba(0,255,0,0.2)] backdrop-blur-sm">
          <div className="flex flex-col items-center gap-6">
            <label className="w-full flex flex-col items-center justify-center h-48 border-2 border-green-500 border-dashed rounded-lg cursor-pointer hover:bg-green-900/20 transition group">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-16 h-16 mb-4 text-green-500 group-hover:scale-110 transition" />
                <p className="text-lg">DROP SUSPICIOUS FOOTAGE HERE</p>
                <p className="text-sm opacity-60 mt-2">MP4 / MOV Supported</p>
              </div>
              <input type="file" className="hidden" accept="video/mp4,video/quicktime" onChange={handleFileChange} />
            </label>

            {file && (
              <div className="w-full bg-green-900/30 p-2 text-center border border-green-500/50 text-green-300 font-mono">
                [FILE READY]: {file.name}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="mt-2 px-8 py-4 bg-green-600 text-black font-extrabold text-xl rounded hover:bg-green-400 hover:scale-105 transition w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Activity className="animate-spin" /> RUNNING NEURAL SCAN...
                </>
              ) : (
                "INITIATE ANALYSIS"
              )}
            </button>
          </div>
        </div>
      )}

      {/* RESULTS DASHBOARD */}
      {result && (
        <div className="z-10 w-full max-w-5xl animate-in fade-in slide-in-from-bottom-10 duration-700">

          <button onClick={() => setResult(null)} className="mb-4 text-sm hover:underline">&larr; ANALYZE NEW FILE</button>

          {/* MAIN VERDICT CARD */}
          {/* LOGIC: User requested 'Fake Video Detecting %'. So we treat score as Probability of Fake. 
              > 50% = FAKE (RED), <= 50% = REAL (GREEN) 
              Fix: Use parseInt to ensure string/number compatibility */}
          <div className={`p-8 border-4 ${parseInt(result.confidence_score) > 50 ? "border-red-600 bg-red-950/40" : "border-green-600 bg-green-950/40"} rounded-xl mb-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6`}>
            <div className="flex items-center gap-6">
              {parseInt(result.confidence_score) > 50 ? <ShieldAlert className="w-24 h-24 text-red-500 animate-pulse" /> : <CheckCircle className="w-24 h-24 text-green-500" />}
              <div>
                <h2 className={`text-4xl font-black ${parseInt(result.confidence_score) > 50 ? "text-red-500" : "text-green-500"}`}>
                  {result.verdict_title}
                </h2>
                <p className="text-xl opacity-80 mt-1">DEEPFAKE PROBABILITY: {result.confidence_score}%</p>
              </div>
            </div>
            <div className="text-right hidden md:block">
              <div className="text-xs opacity-50">ANALYSIS ID</div>
              <div className="font-mono text-lg">#GDG-{Math.floor(Math.random() * 10000)}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* GOOGLE FACT CHECKER */}
            <div className="p-6 border border-blue-500/50 bg-blue-900/10 rounded-lg backdrop-blur-md">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-400">
                <Search className="w-6 h-6" /> GOOGLE GROUNDING
              </h3>
              <p className="text-md leading-relaxed text-blue-100/90 font-sans">
                {result.fact_check_analysis || "No contextual data found in search index."}
              </p>
            </div>

            {/* FORENSIC EVIDENCE */}
            <div className="p-6 border border-gray-600 bg-gray-900/50 rounded-lg">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-300">
                <Activity className="w-6 h-6" /> FORENSIC TRACES
              </h3>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-red-400 uppercase mb-2">Visual Anomalies</h4>
                  {result.visual_evidence?.length > 0 ? (
                    <ul className="list-disc pl-5 text-sm space-y-1 text-gray-300">
                      {result.visual_evidence.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  ) : <span className="text-sm text-green-500">No visual artifacts detected.</span>}
                </div>

                <div className="border-t border-gray-700 pt-4">
                  <h4 className="text-sm font-bold text-yellow-400 uppercase mb-2">Audio Anomalies</h4>
                  {result.audio_evidence?.length > 0 ? (
                    <ul className="list-disc pl-5 text-sm space-y-1 text-gray-300">
                      {result.audio_evidence.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  ) : <span className="text-sm text-green-500">Audio matches visual patterns.</span>}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </main>
  );
}
