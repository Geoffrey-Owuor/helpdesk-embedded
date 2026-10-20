"use client";
import { useQuery } from "@tanstack/react-query";
import {
  getAllDepartmentOptions,
  getDepartmentOptions,
} from "@/serverActions/GetDepartments";

// Staff department options (public.departments) - the departments users
// belong to. Forms that set a user's department offer active ones only.
export const useDepartmentOptions = () => {
  const { data: departments = [], isLoading } = useQuery({
    queryKey: ["DepartmentOptions"],
    queryFn: getDepartmentOptions,
  });

  return { departments, isLoading };
};

// Every department, for filters - older issues may name one made inactive
export const useAllDepartmentOptions = () => {
  const { data: departments = [], isLoading } = useQuery({
    queryKey: ["AllDepartmentOptions"],
    queryFn: getAllDepartmentOptions,
  });

  return { departments, isLoading };
};
