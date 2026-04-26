import { Class, PopulatedScheduleProfile } from "@/src/schemas";
import { RequiredSubjectGroup } from "@/src/state/scheduler-context";

function generateId(prefix: string): string {
  const random = Math.random().toString(36).slice(2, 10);
  return `${prefix}-${Date.now()}-${random}`;
}

function selectClassesByGroups(
  classes: Class[],
  groups: RequiredSubjectGroup[],
): Class[] {
  if (groups.length === 0) {
    return classes;
  }

  const selected: Class[] = [];
  groups.forEach((group) => {
    const candidateIds = group.options.map((option) => option.subjectId);
    const candidate = classes.find((cls) =>
      candidateIds.includes(cls.subjectId),
    );
    if (candidate) {
      selected.push(candidate);
    }
  });

  return selected;
}

export function generatePassthroughSchedules(input: {
  classes: Class[];
  requiredGroups: RequiredSubjectGroup[];
}): PopulatedScheduleProfile[] {
  const selectedClasses = selectClassesByGroups(
    input.classes,
    input.requiredGroups,
  );
  const sourceClasses =
    selectedClasses.length > 0 ? selectedClasses : input.classes;

  if (sourceClasses.length === 0) {
    return [];
  }

  return [
    {
      id: generateId("profile"),
      isMain: false,
      score: 100,
      classes: sourceClasses.map((cls) => ({
        classInfo: cls,
        selectedPracticeGroup: cls.practiceGroups?.[0],
        selectedExerciseGroup: cls.exerciseGroups?.[0],
      })),
    },
  ];
}
