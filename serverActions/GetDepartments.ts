"use server";

import { loadDepartments } from "@/lib/departments";

// Staff department dropdown options (public.departments). Not session-gated:
// the registration and SSO completion forms load them before sign-in, and
// department names aren't sensitive.

interface DropdownOption {
  option: string;
  value: string;
}

const toOptions = (names: string[]): DropdownOption[] =>
  names.map((name) => ({ option: name, value: name }));

// Active departments, for forms that set a user's department
export const getDepartmentOptions = async (): Promise<DropdownOption[]> => {
  try {
    const departments = await loadDepartments();
    return toOptions(
      departments
        .filter((department) => department.isActive)
        .map((department) => department.name),
    );
  } catch (error) {
    console.error("Error fetching departments", error);
    return [];
  }
};

// Every department, for filters - older issues may name one made inactive
export const getAllDepartmentOptions = async (): Promise<DropdownOption[]> => {
  try {
    return toOptions(
      (await loadDepartments()).map((department) => department.name),
    );
  } catch (error) {
    console.error("Error fetching departments", error);
    return [];
  }
};
