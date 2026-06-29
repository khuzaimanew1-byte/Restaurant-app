import { useQuery } from "@tanstack/react-query";
import { fetchEmployee, type EmployeeProfile } from "../services/employee.service";

export function empKey(id: number) { return ["employee", id] as const; }

/** Fetches a single employee's full profile. Disabled when id is null. */
export function useEmployee(id: number | null) {
  return useQuery<EmployeeProfile, Error>({
    queryKey: id !== null ? empKey(id) : (["employee", null] as const),
    queryFn:  () => fetchEmployee(id!),
    enabled:  id !== null,
    staleTime: 30_000,
    retry: 2,
  });
}
