'use client';

import {useEffect, useState} from 'react';
import {usePathname, useRouter} from 'next/navigation';
import auth from "@/Auth"

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const [version, setVersion] = useState(0);

    const forceUpdate = () => setVersion(v => v + 1);

    useEffect(() => {
        runAuth();
    }, [pathname]);

    const runAuth = async () => {
        if (pathname === '/callback') return;

        try {
            await auth.silentAuth();

            if(pathname !== "/" && pathname !== "")
                forceUpdate()
        } catch (err: any) {
            if (err.error === 'login_required') {
                auth.login();
                return;
            }
            console.error('Silent auth error:', err.error);
        }

    }

    return <div className={"AuthWrapper"} key={version}>{children}</div>;
}