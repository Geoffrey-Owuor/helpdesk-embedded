import { query } from "@/lib/Db";

// These variables persist across requests in a Node.js environment
let healthPromise: Promise<boolean> | null = null;
let lastResult: boolean = true;
let lastChecked = 0;

const CACHE_TTL = 5000; // 5 seconds "cool-down"

export async function checkDbHealth(): Promise<boolean> {
  const now = Date.now();

  // 1. If we checked recently, return the cached result
  if (now - lastChecked < CACHE_TTL) {
    return lastResult;
  }

  // 2. If a check is ALREADY in progress, join that promise
  if (healthPromise) {
    return healthPromise;
  }

  // 3. Otherwise, start a new probe
  healthPromise = (async () => {
    try {
      // Direct simple probe
      await query("SELECT 1");
      lastResult = true;
    } catch (error) {
      console.error("DB Health Probe Failed:", error);
      lastResult = false;
    } finally {
      lastChecked = Date.now();
      healthPromise = null; // Clear the promise for the next cycle
    }
    return lastResult;
  })();

  return healthPromise;
}
