export const animateValue = (el: Element, end: number) => {
    const duration = 1000;
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const currentVal = Math.floor(progress * end);
        el.textContent = Number(currentVal).toLocaleString();
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            el.textContent = Number(end).toLocaleString();
        }
    };
    window.requestAnimationFrame(step);
};
