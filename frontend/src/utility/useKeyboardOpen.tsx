import { useState, useEffect } from 'react';

export function useKeyboardOpen(): boolean {
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined' || !window.visualViewport) {
            return;
        }

        const handleResize = () => {
            if(!window.visualViewport) return

            //assume the keyboard is open if more than 35% of the screen height are not used
            const isKeyboardActive = window.visualViewport.height < window.innerHeight * 0.75;

            setIsKeyboardOpen(isKeyboardActive);
        };

        handleResize();

        window.visualViewport.addEventListener('resize', handleResize);

        return () => {
            window.visualViewport?.removeEventListener('resize', handleResize);
        };
    }, []);

    return isKeyboardOpen;
}