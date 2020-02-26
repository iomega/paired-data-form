declare module 'jsdom' {
    class JSDOM {
        constructor(html: string);
        readonly window: DOMWindow;
    }

    interface DOMWindow {
        readonly document: Document
    }
}
