import { object, string } from "zod";

export const HlthRes = object({
  status: string(),
});
