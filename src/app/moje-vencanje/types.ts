export type ChecklistGroup =
  | "12+"
  | "6-12"
  | "3-6"
  | "1-3"
  | "last-week"
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
