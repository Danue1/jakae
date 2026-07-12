import { type Locale } from "../config";
import { en } from "./en";
import { ja } from "./ja";
import { ko } from "./ko";

export type Messages = typeof ko;

export const MESSAGES: Record<Locale, Messages> = { ko, en, ja };
