import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateEmployee,
  type UpdateProfilePayload,
  type EmployeeProfile,
} from "../services/employee.service";
import { EMPLOYEES_KEY } from "./useEmployees";
import { empKey }        from "./useEmployee";

interface Args { eid: number; payload: UpdateProfilePayload; }

/** Patches employee_profile and invalidates both list and single-profile caches. */
export function useUpdateEmployee() {
  const qc = useQueryClient();
  return useMutation<EmployeeProfile, Error, Args>({
    mutationFn: ({ eid, payload }) => updateEmployee(eid, payload),
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: EMPLOYEES_KEY });
      void qc.invalidateQueries({ queryKey: empKey(data.id) });
    },
  });
}
