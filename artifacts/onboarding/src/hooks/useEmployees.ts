import { useQuery } from "@tanstack/react-query";
import { fetchEmployees, type EmployeeCard } from "../services/employee.service";

export const EMPLOYEES_KEY = ["employees"] as const;

/** Fetches all employees from DB. Returns view-model cards ready for the dashboard.
    Refetches on window focus (React Query default) so the list stays fresh.      */
export function useEmployees() {
  return useQuery<EmployeeCard[], Error>({
    queryKey:    EMPLOYEES_KEY,
    queryFn:     fetchEmployees,
    staleTime:   30_000,  // 30 s — avoid redundant fetches on rapid navigation
    retry:       2,
  });
}
