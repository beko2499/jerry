import { useState, useEffect } from 'react';

export default function useDetectKeyboard() {
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

    useEffect(() => {
        const initialHeight = window.innerHeight;

        const handleResize = () => {
            const currentHeight = window.innerHeight;
            // If height difference is significant (> 20%), assume keyboard is open
            if (currentHeight < initialHeight * 0.8) {
                setIsKeyboardOpen(true);
            } else {
                setIsKeyboardOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return isKeyboardOpen;
}
