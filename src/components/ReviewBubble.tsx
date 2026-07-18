import React, { useState, useEffect } from "react";
import { Volume2, VolumeX, Copy, Check, Sparkles, RefreshCw } from "lucide-react";
import { Concept } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface ReviewBubbleProps {
  review: string | null;
  concept: Concept;
  isLoading: boolean;
  onRefresh: () => void;
}

export default function ReviewBubble({ review, concept, isLoading, onRefresh }: ReviewBubbleProps) {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Stop reading if concept or review changes
  useEffect(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, [review, concept.id]);

  const handleCopy = () => {
    if (!review) return;
    navigator.clipboard.writeText(review);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Web Speech Synthesis TTS
  const handleVoice = () => {
    if (!review) return;
    if (!("speechSynthesis" in window)) {
      alert("이 브라우저에서는 음성 합성(TTS)이 지원되지 않습니다.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Cancel anything playing
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(review);
    utterance.lang = "ko-KR";

    // Adjust tone based on concept
    switch (concept.id) {
      case "student":
        utterance.rate = 1.2; // Fast energetic teenager
        utterance.pitch = 1.1;
        break;
      case "michelin":
        utterance.rate = 0.9; // Slow solemn critic
        utterance.pitch = 0.9;
        break;
      case "gym":
        utterance.rate = 1.15; // Shouting loud guy
        utterance.pitch = 0.85; // Deeper voice
        break;
      case "poet":
        utterance.rate = 0.85; // Very emotional and slow
        utterance.pitch = 1.05;
        break;
      case "grandma":
        utterance.rate = 0.8; // Old grandma speed
        utterance.pitch = 1.2; // Slightly higher old-age pitch
        break;
    }

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="relative mt-2" id="review-bubble-container">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-5">
        {/* Critic Mascot Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className={`shrink-0 w-28 h-28 rounded-2xl border-2 flex flex-col items-center justify-center relative shadow-lg ${concept.bgColor} ${concept.borderColor}`}
        >
          {/* Avatar Character emoji */}
          <span className="text-5xl select-none filter drop-shadow-md">{concept.emoji}</span>
          <span className={`text-[11px] font-black mt-2 px-2 py-0.5 rounded-full ${concept.accentColor} text-white`}>
            {concept.name}
          </span>
          {isSpeaking && (
            <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-green-500"></span>
            </span>
          )}
        </motion.div>

        {/* Speech Bubble Card */}
        <div className="flex-1 w-full relative">
          <AnimatePresence mode="wait">
            {isLoading ? (
              /* Loading Speech Bubble */
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 min-h-[100px] flex flex-col justify-center relative shadow-md"
              >
                {/* Arrow indicator (hidden on mobile, left arrow on desktop) */}
                <div className="hidden md:block absolute left-0 top-10 -translate-x-2 w-4 h-4 rotate-45 bg-slate-50 border-l border-b border-slate-100" />
                
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5 items-center">
                    <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-bounce delay-100"></span>
                    <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-bounce delay-200"></span>
                    <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-bounce delay-300"></span>
                  </div>
                  <span className="text-sm font-medium text-slate-500">
                    {concept.name} 평론가가 열심히 급식 냄새를 맡고 생각하는 중...
                  </span>
                </div>
              </motion.div>
            ) : review ? (
              /* Display Generated Review */
              <motion.div
                key="review"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className={`w-full rounded-2xl p-6 min-h-[100px] flex flex-col justify-between relative shadow-lg border ${concept.bubbleBg} ${concept.borderColor}`}
              >
                {/* Speech Bubble Arrow */}
                <div className={`hidden md:block absolute left-0 top-10 -translate-x-2.5 w-5 h-5 rotate-45 border-l border-b ${concept.bubbleBg} ${concept.borderColor}`} />

                {/* Sparkling icon top right */}
                <div className="absolute top-4 right-4 text-amber-500/35">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>

                {/* Review Text */}
                <div className="pr-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    📢 {concept.title}
                  </p>
                  <p className="text-xl md:text-2xl font-display font-semibold text-slate-800 leading-relaxed">
                    "{review}"
                  </p>
                </div>

                {/* Action Controls */}
                <div className="flex items-center justify-between border-t border-slate-200/50 mt-5 pt-3">
                  <span className="text-[10px] text-slate-400 font-medium">
                    * 구글 AI 스튜디오 Gemini 3.5 모델로 생성된 가상 리뷰입니다.
                  </span>
                  
                  <div className="flex items-center gap-1.5">
                    {/* TTS Voice Button */}
                    <button
                      onClick={handleVoice}
                      title={isSpeaking ? "소리 멈추기" : "소리내어 읽기 (TTS)"}
                      className={`p-2 rounded-lg transition-colors flex items-center justify-center cursor-pointer ${
                        isSpeaking
                          ? "bg-red-50 text-red-600 hover:bg-red-100"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>

                    {/* Copy Button */}
                    <button
                      onClick={handleCopy}
                      title="한줄평 복사하기"
                      className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors flex items-center justify-center cursor-pointer"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    </button>

                    {/* Refresh Button */}
                    <button
                      onClick={onRefresh}
                      title="새로운 평론 받아보기"
                      className="p-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors flex items-center justify-center cursor-pointer shadow-sm"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* No Review Generated Yet */
              <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 min-h-[100px] flex flex-col justify-center text-center text-slate-400">
                <p className="text-sm font-medium">아직 한줄평이 작성되지 않았습니다.</p>
                <p className="text-xs mt-1">우측 또는 하단의 [AI 한줄평 생성] 버튼을 눌러보세요!</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
