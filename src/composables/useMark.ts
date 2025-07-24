import type { IMark } from "@/types";

export const markArrayToStr = (arr: IMark[] | null): string => {
  if (arr === null) return "";
  return arr.map((mark) => mark.text).join("; ");
};

export const markStrToArray = (str: string): IMark[] | null => {
  if (str.length === 0) return null;
  return str
    .split(";")
    .map((str) => str.trim())
    .filter((str) => str !== "")
    .map((text) => ({ text }));
};
