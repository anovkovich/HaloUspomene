export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  content: string;
  category: "Vodič" | "Poređenje" | "Saveti" | "Trendovi";
  tags: string[];
  publishDate: string;
  readTime: number;
  featured?: boolean;
}
