import { useRef, useLayoutEffect, useCallback } from 'react';

/**
 * A hook that returns a stable reference to a callback that always
 * sees the latest state without triggering re-effects.
 */
export function useLatestCallback<T extends (...args: any[]) => any>(callback: T) {
    const callbackRef = useRef(callback);

    useLayoutEffect(() => {
        callbackRef.current = callback;
    });

    return useCallback((...args: Parameters<T>): ReturnType<T> => {
        return callbackRef.current(...args);
    }, []) as T;
}