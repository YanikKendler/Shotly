import { useState, useEffect } from 'react';

//AI
export function useKeyboardOpen(): boolean {
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

    useEffect(() => {
        // SSR check
        if (typeof window === 'undefined') return;

        // 1. Check if the device has a coarse pointer (touch screen) on init
        const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

        // If it's a desktop/mouse device, bail early to save resources
        if (!isCoarsePointer) return;

        const checkKeyboardState = () => {
            const el = document.activeElement as HTMLElement | null;

            if (!el) {
                setIsKeyboardOpen(false);
                return;
            }

            // Elements that trigger keyboards:
            // 1. Textareas
            const isTextArea = el.tagName === 'TEXTAREA';

            // 2. ContentEditable elements (like rich text editors)
            const isContentEditable = el.isContentEditable;

            // 3. Inputs (excluding types that don't open the keyboard)
            const ignoredInputTypes = ['radio', 'checkbox', 'button', 'submit', 'image', 'reset', 'color', 'range'];
            const isTextInput = el.tagName === 'INPUT' && !ignoredInputTypes.includes((el as HTMLInputElement).type);

            const isKeyboardTargetFocused = isTextArea || isContentEditable || isTextInput;

            // Check if the screen is reasonably small (typical mobile portrait height)
            const isSmallScreen = window.innerHeight < 450;

            setIsKeyboardOpen(isKeyboardTargetFocused && isSmallScreen);
        };

        // Run initial check in case an input is already focused on mount
        checkKeyboardState();

        // Listen for focus changes.
        // Note: focusin/focusout bubble, whereas focus/blur do not.
        document.addEventListener('focusin', checkKeyboardState);
        document.addEventListener('focusout', checkKeyboardState);
        document.addEventListener('resize', checkKeyboardState);
        window.visualViewport?.addEventListener('resize', checkKeyboardState);

        return () => {
            document.removeEventListener('resize', checkKeyboardState)
            document.removeEventListener('focusin', checkKeyboardState);
            document.removeEventListener('focusout', checkKeyboardState);
            window.visualViewport?.removeEventListener('resize', checkKeyboardState);
        };
    }, []);

    return isKeyboardOpen;
}