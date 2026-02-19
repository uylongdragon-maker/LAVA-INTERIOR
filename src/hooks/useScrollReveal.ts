
import React, { useEffect } from 'react';

// Scroll reveal hook
export const useScrollReveal = (containerRef: React.RefObject<HTMLElement | null>, trigger: any = null) => {
    useEffect(() => {
        const container = containerRef.current || document;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('revealed');
                        observer.unobserve(entry.target); // Stop observing once revealed
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
        );

        const revealElements = container.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
        revealElements.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, [trigger]);
};
