import { Transform } from "class-transformer";
import { IsString, Matches, MinLength } from "class-validator";

export const purps = ["login", "reset"] as const;
export type Purp = (typeof purps)[number];

export function trim(obj: object, key: string | symbol): void {
  Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim() : value,
  )(obj, key);
}

export function arr(obj: object, key: string | symbol): void {
  Transform(({ value }: { value: unknown }) =>
    Array.isArray(value)
      ? value.map(v => (typeof v === "string" ? v.trim() : v)).filter(Boolean)
      : value,
  )(obj, key);
}

export function pwd(obj: object, key: string | symbol): void {
  IsString()(obj, key);
  MinLength(8)(obj, key);
  Matches(/[0-9]/, { message: "Password must contain at least one number" })(obj, key);
  Matches(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/, {
    message: "Password must contain at least one special character",
  })(obj, key);
}

