export type ChecklistGroup =
  | "12+"
  | "9-12"
  | "6-9"
  | "3-6"
  | "1-3"
  | "2-weeks"
  | "day-before"
  | "wedding-day"
  | "custom";

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  isCustom: boolean;
  group: ChecklistGroup;
}

export interface BudgetCategory {
  id: string;
  name: string;
  planned: number;
  spent: number;
  isCustom: boolean;
}

export interface PortalBudget {
  totalBudget: number;
  categories: BudgetCategory[];
}

export interface PortalData {
  slug: string;
  checklist: ChecklistItem[];
  budget: PortalBudget;
  updatedAt: Date;
  createdAt: Date;
}
