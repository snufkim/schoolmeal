import React from "react";
import { X, Flame, ShieldAlert, Award, FileText } from "lucide-react";
import { Meal } from "../types";
import { motion } from "motion/react";

interface MealDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  meal: Meal | null;
}

export default function MealDetailModal({ isOpen, onClose, meal }: MealDetailModalProps) {
  if (!isOpen || !meal) return null;

  // Helpers to parse NEIS data string with <br/> or colons
  const parseNutrition = (nutritionStr: string) => {
    if (!nutritionStr) return [];
    return nutritionStr
      .split(/<br\s*\/?>|\n/i)
      .map((item) => {
        const parts = item.split(":");
        if (parts.length >= 2) {
          return {
            name: parts[0].trim(),
            value: parts.slice(1).join(":").trim(),
          };
        }
        return null;
      })
      .filter((item): item is { name: string; value: string } => item !== null && item.name.length > 0);
  };

  const parseOrigin = (originStr: string) => {
    if (!originStr) return [];
    return originStr
      .split(/,|\n|<br\s*\/?>/i)
      .map((item) => {
        const parts = item.split(":");
        if (parts.length >= 2) {
          return {
            name: parts[0].trim(),
            value: parts.slice(1).join(":").trim(),
          };
        }
        return null;
      })
      .filter((item): item is { name: string; value: string } => item !== null && item.name.length > 0);
  };

  const nutritionList = parseNutrition(meal.nutrition);
  const originList = parseOrigin(meal.origin);

  // Allergies dictionary for a nice explainer (Standard Korean Allergen Codes 1~19)
  const allergyMap: { [key: string]: string } = {
    "1": "난류(가금류)",
    "2": "우유",
    "3": "메밀",
    "4": "땅콩",
    "5": "대두",
    "6": "밀",
    "7": "고등어",
    "8": "게",
    "9": "새우",
    "10": "돼지고기",
    "11": "복숭아",
    "12": "토마토",
    "13": "아황산류",
    "14": "호두",
    "15": "닭고기",
    "16": "쇠고기",
    "17": "오징어",
    "18": "조개류(굴,전복,홍합 등)",
    "19": "잣"
  };

  // Helper to extract allergy codes from the raw dish string (e.g. "돈까스 (1.2.5.6.10.12.13)")
  const getDishAllergies = (rawDish: string) => {
    const dishesWithAllergy: { name: string; allergies: string[] }[] = [];
    const lines = rawDish.replace(/<br\s*\/?>/g, "\n").split("\n");
    
    lines.forEach((line) => {
      const match = line.match(/(.*?)\s*\(([0-9.]+)\)/);
      if (match && match[1] && match[2]) {
        const dishName = match[1].trim();
        const codes = match[2].split(".");
        const allergyNames = codes
          .map((code) => allergyMap[code] || `기타(${code})`)
          .filter(Boolean);
        
        dishesWithAllergy.push({
          name: dishName,
          allergies: allergyNames,
        });
      }
    });
    return dishesWithAllergy;
  };

  const allergyList = getDishAllergies(meal.rawDish);

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

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: "spring", duration: 0.4 }}
        className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-100 flex flex-col max-h-[85vh]"
        id="meal-detail-modal"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-amber-50">
          <div className="flex items-center gap-2">
            <div className="bg-amber-100 text-amber-600 p-1.5 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">{meal.mealName} 상세 정보</h3>
              <p className="text-xs text-amber-700 font-medium">{meal.calories || "칼로리 정보 없음"}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Box */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Calorie Large Card */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-100/60 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-amber-700/80">하루 에너지를 가득 채워줄</span>
              <h4 className="text-xl font-black text-slate-800">오늘의 급식 열량</h4>
            </div>
            <div className="flex items-center gap-1 text-orange-600 bg-orange-100/50 px-4 py-2 rounded-xl border border-orange-200">
              <Flame className="w-5 h-5 fill-current" />
              <span className="font-english font-bold text-lg">{meal.calories || "N/A"}</span>
            </div>
          </div>

          {/* Grid Layout for Nutrition and Origin */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Nutrition Box */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" /> 영양성분 정보
              </h4>
              <div className="border border-slate-100 rounded-xl overflow-hidden bg-slate-50/50">
                {nutritionList.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {nutritionList.map((item, index) => (
                      <div key={index} className="px-4 py-2.5 flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-600">{item.name}</span>
                        <span className="font-bold text-slate-800">{item.value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="p-4 text-xs text-slate-400 text-center">제공된 영양성분이 없습니다.</p>
                )}
              </div>
            </div>

            {/* Origin Box */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-blue-500" /> 식재료 원산지
              </h4>
              <div className="border border-slate-100 rounded-xl overflow-hidden bg-slate-50/50">
                {originList.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {originList.map((item, index) => (
                      <div key={index} className="px-4 py-2.5 flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-600">{item.name}</span>
                        <span className="font-bold text-slate-800 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="p-4 text-xs text-slate-400 text-center">제공된 원산지 정보가 없습니다.</p>
                )}
              </div>
            </div>
          </div>

          {/* Allergy warnings (if any) */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-red-500" /> 알레르기 안내
            </h4>
            {allergyList.length > 0 ? (
              <div className="border border-red-50/70 rounded-xl p-4 bg-red-50/20 space-y-3">
                <p className="text-xs text-slate-500 leading-relaxed">
                  ※ 해당 요리에 함유된 알레르기 유발 식품입니다. 알레르기가 있는 학생은 섭취 전 반드시 주의해 주세요.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {allergyList.map((dish, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-white border border-red-100/40 text-xs">
                      <div className="font-semibold text-slate-800">{dish.name}</div>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {dish.allergies.map((allergy, j) => (
                          <span
                            key={j}
                            className="px-1.5 py-0.5 bg-red-50 text-red-600 rounded text-[10px] font-bold"
                          >
                            {allergy}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="border border-slate-100 rounded-xl p-4 text-center text-xs text-slate-400">
                상세 요리별 알레르기 표기 정보가 없습니다.
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
