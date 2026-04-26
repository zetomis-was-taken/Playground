import {
    Class,
    ClassListSchema,
    PopulatedScheduleProfile,
} from "@/src/schemas";
import React, { createContext, useContext, useMemo, useReducer } from "react";

export type CellState = "none" | "free" | "busy";
export type Difficulty = "none" | "easy" | "medium" | "hard";

export interface RequiredSubjectOption {
  subjectId: string;
  difficulty: Difficulty;
}

export interface RequiredSubjectGroup {
  id: string;
  label: string;
  options: RequiredSubjectOption[];
}

interface SchedulerState {
  sourceFileName: string | null;
  classes: Class[];
  timeSlotStates: Record<string, CellState>;
  requiredSubjectGroups: RequiredSubjectGroup[];
  generatedSchedules: PopulatedScheduleProfile[];
}

type SchedulerAction =
  | {
      type: "setSourceData";
      payload: { fileName: string | null; classes: Class[] };
    }
  | { type: "setTimeSlotStates"; payload: Record<string, CellState> }
  | { type: "addRequiredSubjectGroup"; payload: RequiredSubjectGroup }
  | { type: "removeRequiredSubjectGroup"; payload: string }
  | { type: "setGeneratedSchedules"; payload: PopulatedScheduleProfile[] }
  | { type: "resetAll" };

const initialState: SchedulerState = {
  sourceFileName: null,
  classes: [],
  timeSlotStates: {},
  requiredSubjectGroups: [],
  generatedSchedules: [],
};

function schedulerReducer(
  state: SchedulerState,
  action: SchedulerAction,
): SchedulerState {
  switch (action.type) {
    case "setSourceData":
      return {
        ...state,
        sourceFileName: action.payload.fileName,
        classes: action.payload.classes,
        generatedSchedules: [],
      };
    case "setTimeSlotStates":
      return {
        ...state,
        timeSlotStates: action.payload,
      };
    case "addRequiredSubjectGroup":
      return {
        ...state,
        requiredSubjectGroups: [...state.requiredSubjectGroups, action.payload],
      };
    case "removeRequiredSubjectGroup":
      return {
        ...state,
        requiredSubjectGroups: state.requiredSubjectGroups.filter(
          (item) => item.id !== action.payload,
        ),
      };
    case "setGeneratedSchedules":
      return {
        ...state,
        generatedSchedules: action.payload,
      };
    case "resetAll":
      return initialState;
    default:
      return state;
  }
}

interface SchedulerContextValue extends SchedulerState {
  setSourceData: (fileName: string | null, classes: Class[]) => void;
  setTimeSlotStates: (states: Record<string, CellState>) => void;
  addRequiredSubjectGroup: (group: RequiredSubjectGroup) => void;
  removeRequiredSubjectGroup: (id: string) => void;
  setGeneratedSchedules: (schedules: PopulatedScheduleProfile[]) => void;
  parseAndSetSourceData: (
    fileName: string | null,
    data: unknown,
  ) => { ok: boolean; message?: string };
  availableSubjects: { subjectId: string; subjectName: string }[];
}

const SchedulerContext = createContext<SchedulerContextValue | null>(null);

function normalizeSubjectList(
  classes: Class[],
): { subjectId: string; subjectName: string }[] {
  const map = new Map<string, string>();
  classes.forEach((item) => {
    if (!map.has(item.subjectId)) {
      map.set(item.subjectId, item.subjectName);
    }
  });

  return Array.from(map.entries())
    .map(([subjectId, subjectName]) => ({ subjectId, subjectName }))
    .sort((a, b) => a.subjectId.localeCompare(b.subjectId));
}

export function SchedulerProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(schedulerReducer, initialState);

  const value: SchedulerContextValue = useMemo(() => {
    return {
      ...state,
      setSourceData: (fileName: string | null, classes: Class[]) => {
        dispatch({ type: "setSourceData", payload: { fileName, classes } });
      },
      setTimeSlotStates: (states: Record<string, CellState>) => {
        dispatch({ type: "setTimeSlotStates", payload: states });
      },
      addRequiredSubjectGroup: (group: RequiredSubjectGroup) => {
        dispatch({ type: "addRequiredSubjectGroup", payload: group });
      },
      removeRequiredSubjectGroup: (id: string) => {
        dispatch({ type: "removeRequiredSubjectGroup", payload: id });
      },
      setGeneratedSchedules: (schedules: PopulatedScheduleProfile[]) => {
        dispatch({ type: "setGeneratedSchedules", payload: schedules });
      },
      parseAndSetSourceData: (fileName: string | null, data: unknown) => {
        const parsed = ClassListSchema.safeParse(data);
        if (!parsed.success) {
          return {
            ok: false,
            message: "File JSON không đúng định dạng ClassListSchema.",
          };
        }

        dispatch({
          type: "setSourceData",
          payload: { fileName, classes: parsed.data },
        });
        return { ok: true };
      },
      availableSubjects: normalizeSubjectList(state.classes),
    };
  }, [state]);

  return (
    <SchedulerContext.Provider value={value}>
      {children}
    </SchedulerContext.Provider>
  );
}

export function useSchedulerContext() {
  const context = useContext(SchedulerContext);
  if (!context) {
    throw new Error(
      "useSchedulerContext must be used within SchedulerProvider",
    );
  }

  return context;
}
