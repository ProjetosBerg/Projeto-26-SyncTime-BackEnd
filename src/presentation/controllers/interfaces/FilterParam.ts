export interface FilterParam {
  field: string;
  operator:
    | "equals"
    | "contains"
    | "startsWith"
    | "endsWith"
    | "gt"
    | "gte"
    | "lt"
    | "lte"
    | "between"
    | "in";
  value: any;
  value2?: any;
}
