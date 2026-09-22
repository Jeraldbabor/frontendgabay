"use client";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/shared/lib/api-client";
export function useResource<T>(path: string | null) {
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<{ key: string; data?: T; error?: Error }>({
    key: "",
  });
  const key = `${path}:${revision}`;
  useEffect(() => {
    if (!path) return;
    let active = true;
    api
      .get<T>(path)
      .then((data) => {
        if (active) setState({ key, data });
      })
      .catch((error: Error) => {
        if (active) setState({ key, error });
      });
    return () => {
      active = false;
    };
  }, [path, key]);
  const reload = useCallback(() => setRevision((value) => value + 1), []);
  return {
    data: state.key === key ? state.data : undefined,
    error: state.key === key ? state.error : undefined,
    loading: Boolean(path) && state.key !== key,
    reload,
  };
}
export function useAction() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  async function run<T>(
    action: () => Promise<T>,
    message = "",
    onError?: (message: string) => void,
  ) {
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const value = await action();
      setSuccess(message);
      return value;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong.";
      setError(message);
      onError?.(message);
      return undefined;
    } finally {
      setBusy(false);
    }
  }
  return {
    busy,
    error,
    success,
    run,
    clear: () => {
      setError("");
      setSuccess("");
    },
  };
}
