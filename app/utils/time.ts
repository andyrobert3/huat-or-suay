export const timestamptzToMilliseconds = (timestamptz: string): number => {
    return Date.parse(timestamptz);
}

/**
 * Find the duration between two times
 * @param {Number} timeA - The first time in ms
 * @param {Number} timeB - The second time in ms
 * @returns {Number} The duration between the two times in ms
 */
export const diffDuration = (timeA: number, timeB: number): number => {
    return Math.abs(timeA - timeB);
}


/**
 * Milliseconds to Minutes and Seconds
 */
export const millisecondsToSeconds = (duration: number): string => {
    const seconds = ((duration % 60000) / 1000).toFixed(0);
    if (Number(seconds) < 0) {
        return '0';
    }
    return `${seconds}`;
}

export const countDownFrom = (currentDuration: number, fromDuration: number): number => {
    return fromDuration - currentDuration;
}