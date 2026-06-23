import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateEmployeeStatus,
  dbStatusToUi,
  type UpdateStatusPayload,
  type EmployeeCard,
} from "../services/employee.service";
import { EMPLOYEES_KEY } from "./useEmployees";

interface UpdateStatusArgs {
  eid:     number;
  payload: UpdateStatusPayload;
}

/** Optimistically updates employee status in the cache, then syncs with DB.
    On error, rolls back to the previous cached state.                        */
export function useUpdateEmployeeStatus() {
  const qc = useQueryClient();
  return useMutation<EmployeeCard, Error, UpdateStatusArgs>({
    mutationFn: ({ eid, payload }) => updateEmployeeStatus(eid, payload),

    onMutate: async ({ eid, payload }) => {
      await qc.cancelQueries({ queryKey: EMPLOYEES_KEY });
      const prev = qc.getQueryData<EmployeeCard[]>(EMPLOYEES_KEY);

      qc.setQueryData<EmployeeCard[]>(EMPLOYEES_KEY, old => {
        if (!old) return old;
        return old.map(emp => {
          if (emp.id !== eid) return emp;

          /* Map DB status token → UI token via SSOT function from employee.service */
          let leaveStatus = emp.leaveStatus;
          if ("sts" in payload) {
            leaveStatus = dbStatusToUi(payload.sts ?? null);
          }

          /* Derive checkIn/checkOut from shift object */
          let checkIn  = emp.checkIn;
          let checkOut = emp.checkOut;
          if ("shift" in payload) {
            if (payload.shift === null) {
              checkIn  = "";
              checkOut = "";
            } else {
              checkIn  = payload.shift?.in  ?? emp.checkIn;
              checkOut = payload.shift?.out ?? emp.checkOut;
            }
          }

          return {
            ...emp,
            leaveStatus,
            checkIn,
            checkOut,
            att:  payload.att  ?? emp.att,
            perf: payload.perf ?? emp.perf,
          };
        });
      });

      return { prev };
    },

    onError: (_err, _vars, ctx) => {
      /* Roll back to snapshot taken before the mutation */
      if (ctx && typeof ctx === "object" && "prev" in ctx && ctx.prev !== undefined) {
        qc.setQueryData(EMPLOYEES_KEY, ctx.prev);
      }
    },

    onSettled: () => {
      /* Always re-sync with server to confirm the mutation landed */
      void qc.invalidateQueries({ queryKey: EMPLOYEES_KEY });
    },
  });
}
