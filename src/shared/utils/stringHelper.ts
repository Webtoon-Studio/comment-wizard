export function convertUnicode(text: string): string {
    return text.replace(/\\+u([0-9a-fA-F]{4})/g, (_a, b) => 
        String.fromCharCode(parseInt(b, 16))
    );
}

export function shorthandNumber(n: number): string {
    if (n < 1000) return n.toString();
    if (n < 10000) return (n / 1000).toFixed(1) + "K";
    return (n / 1000).toFixed(0) + "K";
}