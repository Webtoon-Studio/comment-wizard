export function convertUnicode(text: string): string {
    return text.replace(/\\+u([0-9a-fA-F]{4})/g, (_a, b) => 
        String.fromCharCode(parseInt(b, 16))
    );
}