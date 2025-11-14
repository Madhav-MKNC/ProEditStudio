import { useState, useCallback } from "react";

interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

export const useHistory = <T,>(initialState: T) => {
  const [state, setState] = useState<HistoryState<T>>({
    past: [],
    present: initialState,
    future: [],
  });

  const set = useCallback((newState: T | ((prev: T) => T)) => {
    setState((prev) => {
      const nextPresent = typeof newState === 'function'
        ? (newState as (prev: T) => T)(prev.present)
        : newState;
      return {
        past: [...prev.past, prev.present],
        present: nextPresent,
        future: [],
      };
    });
  }, []);
  const undo = useCallback(() => {
    setState((prev) => {
      if (prev.past.length === 0) return prev;
      const newPast = [...prev.past];
      const newPresent = newPast.pop()!;
      return {
        past: newPast,
        present: newPresent,
        future: [prev.present, ...prev.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState((prev) => {
      if (prev.future.length === 0) return prev;
      const newFuture = [...prev.future];
      const newPresent = newFuture.shift()!;
      return {
        past: [...prev.past, prev.present],
        present: newPresent,
        future: newFuture,
      };
    });
  }, []);

  return {
    state: state.present,
    set,
    undo,
    redo,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
  };
};
