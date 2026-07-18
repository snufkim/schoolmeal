export interface School {
  officeCode: string;
  officeName: string;
  schoolCode: string;
  schoolName: string;
  engSchoolName: string;
  schoolKind: string;
  location: string;
  address: string;
}

export interface Meal {
  mealCode: string;
  mealName: string;
  date: string;
  dishes: string[];
  rawDish: string;
  calories: string;
  nutrition: string;
  origin: string;
}

export type ConceptId = "student" | "michelin" | "gym" | "poet" | "grandma";

export interface Concept {
  id: ConceptId;
  name: string;
  description: string;
  emoji: string;
  bgColor: string;
  borderColor: string;
  accentColor: string;
  bubbleBg: string;
  title: string;
}
