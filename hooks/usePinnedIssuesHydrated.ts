"use client";
import { useSyncExternalStore } from "react";
import { usePinnedIssuesStore } from "@/store/usePinnedIssuesStore";

const subscribe = (onChange: () => void) =>
  usePinnedIssuesStore.persist.onFinishHydration(onChange);

const getSnapshot = () => usePinnedIssuesStore.persist.hasHydrated();

// Never hydrated on the server - the pins live in localStorage
const getServerSnapshot = () => false;

// Whether the stored pins have loaded. Until then the store holds an empty
// list, so "not pinned" can't be told apart from "not loaded yet".
export const usePinnedIssuesHydrated = () =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
