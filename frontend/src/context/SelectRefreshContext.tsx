"use client";

import React, { createContext, useContext, useState } from 'react';

type RefreshType = 'scene' | 'shot';
type RefreshMap = { [key: string]: number };

const SelectRefreshContext = createContext<{
    refreshMap: RefreshMap
    triggerRefresh: (type: RefreshType, definitionId: string | number) => void
    lastRefresh: string
}>({
    refreshMap: {},
    triggerRefresh: () => {},
    lastRefresh: ""
});

export default function SelectRefreshProvider({ children }: { children: React.ReactNode }) {
    const [refreshMap, setRefreshMap] = useState<RefreshMap>({})
    const [lastRefresh, setLastRefresh] = useState<string>("")

    const triggerRefresh = (type: RefreshType, definitionId: string | number) => {
        const key = `${type}-${definitionId}`;
        setRefreshMap((prev) => ({
            ...prev,
            [key]: Date.now(),
        }))
        setLastRefresh(key)
    };

    return (
        <SelectRefreshContext.Provider value={{ refreshMap, triggerRefresh, lastRefresh }}>
            {children}
        </SelectRefreshContext.Provider>
    );
}

export const useSelectRefresh = () => useContext(SelectRefreshContext);
