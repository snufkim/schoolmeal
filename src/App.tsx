import React, { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  School as SchoolIcon,
  Search,
  Sparkles,
  Info,
  RotateCcw,
  Utensils,
  BookOpen,
  ArrowRight,
  PlusCircle,
} from "lucide-react";
import { School, Meal, Concept, ConceptId } from "./types";
import SchoolSearchModal from "./components/SchoolSearchModal";
import MealDetailModal from "./components/MealDetailModal";
import ReviewBubble from "./components/ReviewBubble";
import { motion, AnimatePresence } from "motion/react";

// List of all critic personas
const CONCEPTS: Concept[] = [
  {
    id: "student",
    name: "고딩 마스터",
    emoji: "👨‍🎓",
    description: "ㄹㅇ 군침 도는 고딩 텐션",
    bgColor: "bg-blue-50/80",
    borderColor: "border-blue-200",
    accentColor: "bg-blue-500",
    bubbleBg: "bg-blue-50/50",
    title: "급식 킹정하는 고딩 한줄평"
  },
  {
    id: "michelin",
    name: "미슐랭 가이드",
    emoji: "👨‍🍳",
    description: "우아하고 세련된 미식 비평",
    bgColor: "bg-amber-50/80",
    borderColor: "border-amber-200",
    accentColor: "bg-amber-600",
    bubbleBg: "bg-amber-50/40",
    title: "미슐랭 3스타 비평가의 한줄비평"
  },
  {
    id: "gym",
    name: "헬창 트레이너",
    emoji: "🏋️‍♂️",
    description: "근성장을 향한 탄단지 파워",
    bgColor: "bg-red-50/80",
    borderColor: "border-red-200",
    accentColor: "bg-red-600",
    bubbleBg: "bg-red-50/40",
    title: "근손실 저격 득근 헬창의 매서운 평"
  },
  {
    id: "poet",
    name: "감성 과다 시인",
    emoji: "✍️",
    description: "눈물을 자극하는 시적 가사",
    bgColor: "bg-purple-50/80",
    borderColor: "border-purple-200",
    accentColor: "bg-purple-500",
    bubbleBg: "bg-purple-50/40",
    title: "오글거리는 낭만 시인의 한줄시"
  },
  {
    id: "grandma",
    name: "시골 할머니",
    emoji: "👵",
    description: "구수하고 애정 어린 사투리",
    bgColor: "bg-green-50/80",
    borderColor: "border-green-200",
    accentColor: "bg-green-600",
    bubbleBg: "bg-green-50/40",
    title: "손주를 위한 정 많고 푸짐한 할매 평"
  }
];

export default function App() {
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [meals, setMeals] = useState<Meal[]>([]);
  const [activeMealIndex, setActiveMealIndex] = useState<number>(0);
  const [selectedConcept, setSelectedConcept] = useState<ConceptId>("student");
  
  // Review state
  const [currentReview, setCurrentReview] = useState<string | null>(null);
  const [isLoadingMeals, setIsLoadingMeals] = useState<boolean>(false);
  const [isLoadingReview, setIsLoadingReview] = useState<boolean>(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // Modals state
  const [searchModalOpen, setSearchModalOpen] = useState<boolean>(false);
  const [detailModalOpen, setDetailModalOpen] = useState<boolean>(false);

  // 1. Initial Load: Retrieve school from localStorage
  useEffect(() => {
    const savedSchool = localStorage.getItem("selected_school");
    if (savedSchool) {
      try {
        setSelectedSchool(JSON.parse(savedSchool));
      } catch (e) {
        console.error("Failed to parse saved school", e);
      }
    }
  }, []);

  // Format Helper: YYYYMMDD
  const formatDateYYYYMMDD = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}${m}${d}`;
  };

  // Format Helper: Korean Date with Day of Week
  const formatDateKorean = (date: Date): string => {
    const days = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();
    const day = days[date.getDay()];
    return `${y}년 ${m}월 ${d}일 (${day})`;
  };

  // 2. Fetch meals when school or date changes
  useEffect(() => {
    if (!selectedSchool) return;

    const fetchMeals = async () => {
      setIsLoadingMeals(true);
      setCurrentReview(null);
      setReviewError(null);
      
      const dateStr = formatDateYYYYMMDD(selectedDate);
      try {
        const response = await fetch(
          `/api/lunch?officeCode=${selectedSchool.officeCode}&schoolCode=${selectedSchool.schoolCode}&date=${dateStr}`
        );
        const data = await response.json();
        const mealList: Meal[] = data.meals || [];
        setMeals(mealList);

        // Auto-select lunch (Code 2) if available, otherwise first item
        if (mealList.length > 0) {
          const lunchIdx = mealList.findIndex((m) => m.mealCode === "2");
          setActiveMealIndex(lunchIdx !== -1 ? lunchIdx : 0);
        } else {
          setActiveMealIndex(0);
        }
      } catch (err) {
        console.error("Failed to fetch meals", err);
        setMeals([]);
      } finally {
        setIsLoadingMeals(false);
      }
    };

    fetchMeals();
  }, [selectedSchool, selectedDate]);

  // 3. Load or clear reviews based on active meal & concept
  useEffect(() => {
    if (!selectedSchool || meals.length === 0 || !meals[activeMealIndex]) {
      setCurrentReview(null);
      return;
    }

    const activeMeal = meals[activeMealIndex];
    const reviewKey = `lunch_review_${selectedSchool.schoolCode}_${activeMeal.date}_${activeMeal.mealCode}_${selectedConcept}`;
    const savedReview = localStorage.getItem(reviewKey);
    
    if (savedReview) {
      setCurrentReview(savedReview);
    } else {
      setCurrentReview(null);
    }
  }, [selectedSchool, meals, activeMealIndex, selectedConcept]);

  // Save school helper
  const handleSelectSchool = (school: School) => {
    setSelectedSchool(school);
    localStorage.setItem("selected_school", JSON.stringify(school));
  };

  // Clear current school
  const handleClearSchool = () => {
    setSelectedSchool(null);
    localStorage.removeItem("selected_school");
    setMeals([]);
    setCurrentReview(null);
  };

  // Date Navigator Helpers
  const shiftDate = (offset: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + offset);
    setSelectedDate(newDate);
  };

  const jumpToToday = () => {
    setSelectedDate(new Date());
  };

  // Generate Review Trigger
  const generateReview = async () => {
    if (!selectedSchool || meals.length === 0 || !meals[activeMealIndex]) return;

    const activeMeal = meals[activeMealIndex];
    setIsLoadingReview(true);
    setReviewError(null);

    try {
      const response = await fetch("/api/lunch-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolName: selectedSchool.schoolName,
          mealName: activeMeal.mealName,
          dishes: activeMeal.dishes,
          concept: selectedConcept,
        }),
      });

      const data = await response.json();
      if (data.error) {
        setReviewError(data.error);
      } else if (data.review) {
        const reviewKey = `lunch_review_${selectedSchool.schoolCode}_${activeMeal.date}_${activeMeal.mealCode}_${selectedConcept}`;
        localStorage.setItem(reviewKey, data.review);
        setCurrentReview(data.review);
      }
    } catch (err) {
      setReviewError("AI 한줄평을 생성하는 과정에서 네트워크 오류가 발생했습니다.");
    } finally {
      setIsLoadingReview(false);
    }
  };

  // Current selected concept data object
  const activeConcept = CONCEPTS.find((c) => c.id === selectedConcept) || CONCEPTS[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16 font-sans">
      {/* Top Beautiful Header */}
      <header className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500 text-white p-2.5 rounded-2xl shadow-md shadow-amber-500/10 flex items-center justify-center">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight flex items-center gap-1 text-slate-800">
                나이스 급식 <span className="text-amber-500">AI 한줄평</span>
                <Sparkles className="w-4 h-4 text-amber-500 animate-pulse fill-current" />
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">NEIS OPEN API & Google Gemini AI</p>
            </div>
          </div>

          {/* School Badge Header Status */}
          {selectedSchool ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col items-end text-right">
                <span className="text-xs font-bold text-slate-700">{selectedSchool.schoolName}</span>
                <span className="text-[10px] text-slate-400">{selectedSchool.location}</span>
              </div>
              <button
                onClick={() => setSearchModalOpen(true)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl text-xs transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                학교변경
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSearchModalOpen(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-amber-500/10 flex items-center gap-1 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              학교 선택하기
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 mt-6 space-y-6">
        {/* If no school is selected, display empty search trigger block */}
        {!selectedSchool ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 text-center space-y-6 max-w-lg mx-auto mt-12"
          >
            <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <SchoolIcon className="w-10 h-10 stroke-1.5" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-slate-800">조회할 학교가 없습니다</h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                나이스 급식 정보를 찾기 위해 학교를 먼저 등록해 주세요. 전국 시도교육청 관할의 모든 학교 검색이 가능합니다.
              </p>
            </div>
            <button
              onClick={() => setSearchModalOpen(true)}
              className="w-full py-4 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-extrabold rounded-2xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 text-base cursor-pointer"
            >
              <Search className="w-5 h-5" />
              우리 학교 검색해서 등록하기
            </button>

            {/* Micro details */}
            <div className="flex items-center justify-center gap-4 pt-4 border-t border-slate-50 text-[11px] text-slate-400">
              <div className="flex items-center gap-1">
                <Utensils className="w-3.5 h-3.5 text-amber-400" />
                나이스 공식 급식 DB 연동
              </div>
              <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
              <div className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Gemini AI 한줄평 연출
              </div>
            </div>
          </motion.div>
        ) : (
          /* Active App Screen Dashboard */
          <div className="space-y-6">
            
            {/* Top Toolbar: Date Selector & School Badge */}
            <div className="flex flex-col md:flex-row gap-4 items-stretch justify-between">
              
              {/* Date Selector Component */}
              <div className="bg-white border border-slate-100 rounded-2xl p-2.5 flex items-center justify-between shadow-sm flex-1">
                <button
                  onClick={() => shiftDate(-1)}
                  className="p-2 hover:bg-slate-50 text-slate-500 hover:text-slate-700 rounded-xl transition-colors cursor-pointer"
                  title="이전날"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex flex-col items-center">
                  <span className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                    <CalendarIcon className="w-4 h-4 text-amber-500" />
                    {formatDateKorean(selectedDate)}
                  </span>
                  {selectedDate.toDateString() === new Date().toDateString() && (
                    <span className="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-full font-bold mt-0.5">
                      오늘
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={jumpToToday}
                    className="px-2.5 py-1 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                  >
                    오늘로
                  </button>
                  <button
                    onClick={() => shiftDate(1)}
                    className="p-2 hover:bg-slate-50 text-slate-500 hover:text-slate-700 rounded-xl transition-colors cursor-pointer"
                    title="다음날"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* School Information Card */}
              <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-4 md:w-80">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 rounded-xl bg-amber-50 text-amber-500 shrink-0">
                    <SchoolIcon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-slate-800 text-sm truncate">{selectedSchool.schoolName}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">{selectedSchool.address}</p>
                  </div>
                </div>
                <button
                  onClick={handleClearSchool}
                  title="학교 해제"
                  className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Layout Grid: Left side Meals, Right side Gemini reviews */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Meal Dishes Viewer (lg: 5 cols) */}
              <div className="lg:col-span-5 flex flex-col space-y-4">
                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex-1 flex flex-col min-h-[350px]">
                  
                  {/* Meal Tab Headers (조식 / 중식 / 석식) */}
                  <div className="bg-slate-50 border-b border-slate-100 p-2.5 flex gap-1">
                    {meals.length > 0 ? (
                      meals.map((meal, idx) => (
                        <button
                          key={meal.mealCode}
                          onClick={() => setActiveMealIndex(idx)}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            activeMealIndex === idx
                              ? "bg-amber-500 text-white shadow-md shadow-amber-500/10"
                              : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                          }`}
                        >
                          {meal.mealName}
                        </button>
                      ))
                    ) : (
                      <div className="flex-1 text-center py-2 text-xs font-bold text-slate-400">
                        급식 정보 없음
                      </div>
                    )}
                  </div>

                  {/* Tab Content Box */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <AnimatePresence mode="wait">
                      {isLoadingMeals ? (
                        /* Loading Meals Skeleton */
                        <motion.div
                          key="loading_meals"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="space-y-4 py-8 text-center"
                        >
                          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                          <p className="text-xs font-medium text-slate-400">나이스 급식데이터를 연동하는 중...</p>
                        </motion.div>
                      ) : meals.length > 0 && meals[activeMealIndex] ? (
                        /* Display Meal Dishes */
                        <motion.div
                          key="meals_data"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="space-y-5"
                        >
                          {/* Calories and Meta info */}
                          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                {meals[activeMealIndex].mealName} 총 열량
                              </span>
                              <p className="text-lg font-black text-slate-800">
                                {meals[activeMealIndex].calories || "칼로리 미제공"}
                              </p>
                            </div>
                            <button
                              onClick={() => setDetailModalOpen(true)}
                              className="px-2.5 py-1.5 bg-slate-50 hover:bg-amber-50 text-slate-600 hover:text-amber-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer border border-slate-100 hover:border-amber-100"
                            >
                              <Info className="w-3.5 h-3.5" />
                              영양/원산지
                            </button>
                          </div>

                          {/* Dishes list items */}
                          <div className="space-y-2.5">
                            {meals[activeMealIndex].dishes.map((dish, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50/50 hover:bg-slate-50 border border-slate-100/40 hover:border-slate-100 transition-colors"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></span>
                                <span className="text-sm font-semibold text-slate-700 leading-snug">{dish}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      ) : (
                        /* Empty State: No lunch */
                        <motion.div
                          key="no_meals"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-center py-16 space-y-3"
                        >
                          <span className="text-4xl select-none">😴</span>
                          <div>
                            <p className="text-sm font-bold text-slate-700">이날은 급식 일정이 없습니다</p>
                            <p className="text-xs text-slate-400 mt-1">주말, 공휴일 또는 방학 기간일 수 있습니다.</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Micro footnote info */}
                    {meals.length > 0 && meals[activeMealIndex] && (
                      <p className="text-[10px] text-slate-400 mt-6 pt-3 border-t border-slate-50 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 shrink-0" />
                        메뉴 옆 알레르기 유발 물질 정보는 간략화되었습니다.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: AI One-line Review Box (lg: 7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 flex flex-col space-y-6">
                  
                  {/* Persona Header Selector title */}
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500 fill-current" />
                      급식 AI 평론가 컨셉 선택
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      각양각색의 AI 평론가들을 만나보세요! 같은 메뉴라도 전혀 다른 고유의 개성적인 비평이 완성됩니다.
                    </p>
                  </div>

                  {/* Critic Grid Layout selection */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-5 gap-2.5">
                    {CONCEPTS.map((concept) => {
                      const isSelected = selectedConcept === concept.id;
                      return (
                        <button
                          key={concept.id}
                          onClick={() => setSelectedConcept(concept.id)}
                          className={`p-3 rounded-2xl border transition-all duration-200 flex flex-col items-center text-center justify-between cursor-pointer ${
                            isSelected
                              ? `${concept.bgColor} ${concept.borderColor} ring-2 ring-amber-500/10 shadow-md`
                              : "border-slate-100 hover:border-slate-200 hover:bg-slate-50/50"
                          }`}
                        >
                          <span className="text-3xl select-none filter drop-shadow-sm mb-1.5">{concept.emoji}</span>
                          <div className="space-y-0.5">
                            <p className="text-xs font-bold text-slate-800">{concept.name}</p>
                            <p className="text-[9px] text-slate-400 line-clamp-1">{concept.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* AI review action block */}
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          선택한 평론가 컨셉
                        </span>
                        <p className="text-sm font-bold text-slate-700 flex items-center gap-1">
                          {activeConcept.emoji} {activeConcept.name} ({activeConcept.description})
                        </p>
                      </div>

                      {/* Main Generate Button */}
                      <button
                        onClick={generateReview}
                        disabled={meals.length === 0 || isLoadingReview}
                        className="w-full sm:w-auto px-5 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none text-white font-extrabold rounded-xl transition-all shadow-md shadow-amber-500/15 flex items-center justify-center gap-1.5 text-sm cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 fill-current" />
                        AI 한줄평 생성
                      </button>
                    </div>

                    {reviewError && (
                      <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-700 text-xs font-semibold">
                        ⚠️ {reviewError}
                      </div>
                    )}

                    {/* Speech Bubble review container component */}
                    <ReviewBubble
                      review={currentReview}
                      concept={activeConcept}
                      isLoading={isLoadingReview}
                      onRefresh={generateReview}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODALS */}
      <AnimatePresence>
        {searchModalOpen && (
          <SchoolSearchModal
            isOpen={searchModalOpen}
            onClose={() => setSearchModalOpen(false)}
            onSelectSchool={handleSelectSchool}
            currentSchool={selectedSchool}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {detailModalOpen && meals.length > 0 && meals[activeMealIndex] && (
          <MealDetailModal
            isOpen={detailModalOpen}
            onClose={() => setDetailModalOpen(false)}
            meal={meals[activeMealIndex]}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
