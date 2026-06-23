import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createEmployee,
  type CreateEmployeePayload,
  type EmployeeCard,
} from "../services/employee.service";
import { EMPLOYEES_KEY } from "./useEmployees";

/** Creates a new employee (profile + status) and invalidates the list cache.
    On success the dashboard auto-refreshes from DB via React Query.           */
export function useCreateEmployee() {
  const qc = useQueryClient();
  return useMutation<EmployeeCard, Error, CreateEmployeePayload>({
    mutationFn: createEmployee,
    onSuccess:  () => {
      void qc.invalidateQueries({ queryKey: EMPLOYEES_KEY });
    },
  });
}
