export type Kind = "need" | "want" | "save";

export interface Category {
  id: number;
  n: string;
  k: Kind;
  /** percent of salary */
  p: number;
}

export interface Entry {
  id: number;
  c: number;
  a: number;
  n: string;
  d: string;
}

export interface State {
  salary: number;
  growth: number;
  ret: number;
  extra: number;
  demo: boolean;
  nid: number;
  cats: Category[];
  spend: Entry[];
}
