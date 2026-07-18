import React, { useState, useEffect } from "react";
import { Search, X, MapPin, GraduationCap, School as SchoolIcon, Star, Clock } from "lucide-react";
import { School } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface SchoolSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSchool: (school: School) => void;
  currentSchool: School | null;
}

export default function SchoolSearchModal({
  isOpen,
  onClose,
  onSelectSchool,
  currentSchool,
}: SchoolSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSchools, setRecentSchools] = useState<School[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load recent schools on mount
  useEffect(() => {
    const saved = localStorage.getItem("recent_schools");
    if (saved) {
      try {
        setRecentSchools(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, [isOpen]);

  // Handle Search API Call
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/school?name=${encodeURIComponent(searchTerm.trim())}`);
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setSchools(data.schools || []);
        if (data.schools?.length === 0) {
          setError("검색 결과가 없습니다. 학교명을 다시 확인해 주세요.");
        }
      }
    } catch (err) {
      setError("학교 검색 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // Add school to recent searches and select
  const selectSchool = (school: School) => {
    onSelectSchool(school);

    // Save to recents
    const filtered = recentSchools.filter((s) => s.schoolCode !== school.schoolCode);
    const updated = [school, ...filtered].slice(0, 5); // Keep up to 5
    setRecentSchools(updated);
    localStorage.setItem("recent_schools", JSON.stringify(updated));
    onClose();
  };

  // Remove school from recents
  const removeRecent = (e: React.MouseEvent, schoolCode: string) => {
    e.stopPropagation();
    const updated = recentSchools.filter((s) => s.schoolCode !== schoolCode);
    setRecentSchools(updated);
    localStorage.setItem("recent_schools", JSON.stringify(updated));
  };

  // Pre-set popular schools as helper
  const popularKeywords = ["서울과학고", "한빛초", "대원외고", "경기고", "한성고"];

  const handlePopularClick = (word: string) => {
    setSearchTerm(word);
    setTimeout(() => {
      // Trigger search
      const triggerSearch = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetch(`/api/school?name=${encodeURIComponent(word)}`);
          const data = await response.json();
          setSchools(data.schools || []);
          if (data.schools?.length === 0) {
            setError("검색 결과가 없습니다.");
          }
        } catch (err) {
          setError("학교 검색 중 오류가 발생했습니다.");
        } finally {
          setIsLoading(false);
        }
      };
      triggerSearch();
    }, 50);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: "spring", duration: 0.4 }}
        className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-100 flex flex-col max-h-[85vh]"
        id="school-search-modal"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <SchoolIcon className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-slate-800 text-lg">학교 찾아보기</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Box */}
        <div className="p-5 border-b border-slate-100">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="학교명을 입력하세요 (예: 한빛초, 경기고)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-100 hover:bg-slate-100/80 focus:bg-white border border-transparent focus:border-amber-500 rounded-xl font-medium text-slate-800 placeholder-slate-400 focus:outline-none transition-all"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-3 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 disabled:bg-amber-300 text-white font-medium rounded-xl transition-all shadow-md shadow-amber-500/10 flex items-center gap-1 cursor-pointer"
            >
              {isLoading ? "검색중..." : "검색"}
            </button>
          </form>

          {/* Popular shortcuts */}
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-400">인기검색어</span>
            {popularKeywords.map((word) => (
              <button
                key={word}
                onClick={() => handlePopularClick(word)}
                className="px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition-colors cursor-pointer"
              >
                {word}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {error && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 text-sm font-medium">
              {error}
            </div>
          )}

          {/* Loading Skeleton */}
          {isLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="p-4 rounded-xl border border-slate-100 space-y-2 animate-pulse">
                  <div className="h-4 w-1/3 bg-slate-200 rounded"></div>
                  <div className="h-3 w-2/3 bg-slate-100 rounded"></div>
                </div>
              ))}
            </div>
          )}

          {/* Search Results */}
          {!isLoading && schools.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" /> 검색 결과 ({schools.length})
              </h4>
              <div className="space-y-2">
                {schools.map((school) => {
                  const isCurrent = currentSchool?.schoolCode === school.schoolCode;
                  return (
                    <button
                      key={school.schoolCode}
                      onClick={() => selectSchool(school)}
                      className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-start gap-3 cursor-pointer group ${
                        isCurrent
                          ? "border-amber-400 bg-amber-50/50 hover:bg-amber-50"
                          : "border-slate-100 hover:border-amber-300 hover:bg-amber-50/10"
                      }`}
                    >
                      <div className={`p-2 rounded-lg mt-0.5 transition-colors ${
                        isCurrent ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-500 group-hover:bg-amber-50 group-hover:text-amber-500"
                      }`}>
                        <SchoolIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800 truncate">{school.schoolName}</span>
                          <span className="px-1.5 py-0.5 text-[10px] font-bold text-slate-500 bg-slate-100 rounded">
                            {school.schoolKind}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{school.officeName}</p>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-2">
                          <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
                          <span className="truncate">{school.address}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent Schools */}
          {!isLoading && schools.length === 0 && recentSchools.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> 최근 찾은 학교
              </h4>
              <div className="space-y-2">
                {recentSchools.map((school) => (
                  <div
                    key={school.schoolCode}
                    onClick={() => selectSchool(school)}
                    className="p-4 rounded-xl border border-slate-100 hover:border-amber-200 hover:bg-slate-50/30 transition-all flex items-start justify-between gap-3 cursor-pointer group"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-slate-50 text-slate-400 group-hover:bg-amber-50 group-hover:text-amber-500 transition-colors mt-0.5">
                        <SchoolIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-700 text-sm group-hover:text-amber-600 transition-colors truncate">
                            {school.schoolName}
                          </span>
                          <span className="px-1.5 py-0.5 text-[9px] font-semibold text-slate-400 bg-slate-100 rounded">
                            {school.schoolKind}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{school.address}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => removeRecent(e, school.schoolCode)}
                      className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && schools.length === 0 && recentSchools.length === 0 && (
            <div className="text-center py-8 text-slate-400 space-y-2">
              <SchoolIcon className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
              <p className="text-sm font-medium">조회할 학교를 먼저 검색해 보세요!</p>
              <p className="text-xs text-slate-400">학교 이름의 일부만 입력해도 쉽게 찾을 수 있습니다.</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
