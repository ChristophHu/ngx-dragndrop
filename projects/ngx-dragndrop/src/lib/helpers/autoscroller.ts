type Func = (...args: any[]) => any;
type ElementArray = HTMLElement[];
type Options = {
    allowUpdate?: boolean | ((event: Event) => boolean);
    margin?: number | Margin;
    scrollWhenOutside?: boolean;
    maxSpeed?: number | Margin;
    autoScroll?: boolean;
    syncMove?: boolean;
};
type PointCBObject = {
    target: EventTarget | null;
    element: HTMLElement | null;
    type: string | null;
    x?: number;
    y?: number;
    pageX?: number;
    pageY?: number;
    screenX?: number;
    screenY?: number;
    clientX?: number;
    clientY?: number;
};
type WindowRect = {
    top: number;
    left: number;
    right: number;
    bottom: number;
    width: number;
    height: number;
    x: number;
    y: number;
};
type Settings = {
    screenX: number;
    screenY: number;
    clientX: number;
    clientY: number;
    ctrlKey: boolean;
    shiftKey: boolean;
    altKey: boolean;
    metaKey: boolean;
    button: number;
    buttons: number;
    relatedTarget: EventTarget | null;
    region: any;
};
interface Margin {
    left: number;
    right: number;
    top: number;
    bottom: number;
}

class AutoScroller {
    margin: Margin;
    scrollWhenOutside: boolean;
    autoScroll: boolean;
    syncMove: boolean;

    constructor(elements: any[], options: Options = {}) {
        let objectCreate: (proto: object | null, propertiesObject?: PropertyDescriptorMap | undefined) => any;
    
        if (typeof Object.create != 'function') {
            objectCreate = function (undefined$1) {
                var Temp = function Temp() {};
                return function (prototype: object | null, propertiesObject?: PropertyDescriptorMap | undefined) {
                    if (prototype !== Object(prototype) && prototype !== null) {
                        throw TypeError('Argument must be an object, or null');
                    }
                    Temp.prototype = prototype || {};
                    const result = new Temp();
                    Temp.prototype = null;
                    if (propertiesObject !== undefined$1) {
                        Object.defineProperties(result, propertiesObject);
                    }
        
                    // to imitate the case of Object.create(null)
                    if (prototype === null) {
                        (result as any).__proto__ = null;
                    }
                    return result;
                };
            }();
        } else {
            objectCreate = Object.create;
        }
        
        const objectCreate$1 = objectCreate;
        
        const mouseEventProps = ['altKey', 'button', 'buttons', 'clientX', 'clientY', 'ctrlKey', 'metaKey', 'movementX', 'movementY', 'offsetX', 'offsetY', 'pageX', 'pageY', 'region', 'relatedTarget', 'screenX', 'screenY', 'shiftKey', 'which', 'x', 'y'];
    
        let maxSpeed: number | Margin = 4;
        let scrolling = false;

        if (typeof options.margin !== 'object') {
            let margin = options.margin || -1;

            this.margin = {
                left: margin,
                right: margin,
                top: margin,
                bottom: margin
            };
        } else {
            this.margin = options.margin as Margin;
        }

        this.scrollWhenOutside = options.scrollWhenOutside || false;

        let point = {};
        let pointCB = createPointCB(point);
        let dispatcher = createDispatcher();
        let down = false;

        window.addEventListener('mousemove', pointCB, false);
        window.addEventListener('touchmove', pointCB, false);

        if (!isNaN(options.maxSpeed as number)) {
            maxSpeed = options.maxSpeed as number;
        }

        if (typeof maxSpeed !== 'object') {
            maxSpeed = {
                left: maxSpeed as number,
                right: maxSpeed as number,
                top: maxSpeed as number,
                bottom: maxSpeed as number
            };
        }

        this.autoScroll = Boolean(options.autoScroll);
        this.syncMove = Boolean(options.syncMove);

        this.destroy = function (forceCleanAnimation: boolean) {
            window.removeEventListener('mousemove', pointCB, false);
            window.removeEventListener('touchmove', pointCB, false);
            window.removeEventListener('mousedown', onDown, false);
            window.removeEventListener('touchstart', onDown, false);
            window.removeEventListener('mouseup', onUp, false);
            window.removeEventListener('touchend', onUp, false);
            window.removeEventListener('pointerup', onUp, false);
            window.removeEventListener('mouseleave', onMouseOut, false);

            window.removeEventListener('mousemove', onMove, false);
            window.removeEventListener('touchmove', onMove, false);

            window.removeEventListener('scroll', setScroll, true);
            elements = [];
            if (forceCleanAnimation) {
                cleanAnimation();
            }
        };
    }
// }

// const autoScroll = (function () {
//     'use strict';

    getDef(f: any, d: any): any {
        if (typeof f === 'undefined') {
            return typeof d === 'undefined' ? f : d;
        }

        return f;
    }

    boolean(func: Func | boolean, def: Func | boolean): Func {
        func = getDef(func, def);

        if (typeof func === 'function') {
            return function f(...args: any[]): boolean {
                return !!func.apply(self, args); // todo: self = this
            };
        }

        return !!func ? function (): boolean {
            return true;
        } : function (): boolean {
            return false;
        };
    }

    const _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj: any): string { 
        return typeof obj; 
    } : function (obj: any): string { 
        return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; 
    };

    /**
     * Returns `true` if provided input is Element.
     * @name isElement
     * @param {*} [input]
     * @returns {boolean}
     */
    isElement$1(input: any): boolean {
        return input != null && typeof input === 'object' && input.nodeType === 1 && typeof input.style === 'object' && typeof input.ownerDocument === 'object';
    }

    indexOfElement(elements: ElementArray, element: HTMLElement | null): number {
        element = resolveElement(element, true);
        if (!isElement$1(element)) { return -1; }
        for (let i = 0; i < elements.length; i++) {
            if (elements[i] === element) {
                return i;
            }
        }
        return -1;
    }

    hasElement(elements: ElementArray, element: HTMLElement | null): boolean {
        return -1 !== indexOfElement(elements, element);
    }

    pushElements(elements: ElementArray, toAdd: ElementArray): ElementArray {
        for (let i = 0; i < toAdd.length; i++) {
            if (!hasElement(elements, toAdd[i]))
                { elements.push(toAdd[i]); }
        }
        return toAdd;
    }

    addElements(elements: ElementArray, ...args: any[]): ElementArray {
        let toAdd: any[] = [], len = args.length;
        while (len-- > 0) { 
            toAdd[len] = args[len]; 
        }
        // toAdd = toAdd.map(resolveElement);
        toAdd = toAdd.map((element: any) => resolveElement(element));
        return pushElements(elements, toAdd);
    }

    removeElements(elements: ElementArray, ...args: any[]): any[] {
        let toRemove: any[] = [], len = args.length;
        while (len-- > 0) { 
            toRemove[len] = args[len]; 
        }
        // return toRemove.map(resolveElement).reduce((last: any[], e: HTMLElement | null) => {
        return toRemove.map((element: any) => resolveElement(element)).reduce((last: any[], e: HTMLElement | null) => {
            let index = indexOfElement(elements, e);
            if(index !== -1) {
                return last.concat(elements.splice(index, 1));
            }
            return last;
        }, []);
    }

    resolveElement(element: any, noThrow?: boolean): HTMLElement | null {
        if(typeof element === 'string'){
            try{
                return document.querySelector(element);
            } catch(e) {
                if(noThrow) {
                    return null;
                }
                throw e;
            }
        }
        return element;
    }

    createPointCB(object: PointCBObject, options?: Options) {
        options = options || {};
    
        const allowUpdate = typeof options.allowUpdate === 'function' ? options.allowUpdate : () => true;
    
        return function pointCB(event: any) {
            event = event || window.event; // IE-ism
            object.target = event?.target || event?.srcElement || (event as any).originalTarget;
            object.element = this;
            object.type = event.type;
    
            if (!allowUpdate(event)) {
                return;
            }
    
            // Support touch

            if (event.targetTouches) {
                object.x = event.targetTouches[0].clientX;
                object.y = event.targetTouches[0].clientY;
                object.pageX = event.targetTouches[0].pageX;
                object.pageY = event.targetTouches[0].pageY;
                object.screenX = event.targetTouches[0].screenX;
                object.screenY = event.targetTouches[0].screenY;
            } else {
                object.x = event.clientX;
                object.y = event.clientY;

                object.screenX = event.screenX;
                object.screenY = event.screenY;
            }
            object.clientX = object.x;
            object.clientY = object.y;
        }
    }

    createWindowRect(): WindowRect {
        const props: WindowRect = {
            top: 0,
            left: 0,
            right: window.innerWidth,
            bottom: window.innerHeight,
            width: window.innerWidth,
            height: window.innerHeight,
            x: 0,
            y: 0
        };
    
        return props;
    }
    
    getClientRect(el: HTMLElement | Window): WindowRect | DOMRect {
        if (el === window) {
            return createWindowRect();
        } else {
            try {
                const rect = (el as HTMLElement).getBoundingClientRect();
                if (rect.x === undefined) {
                    rect.x = rect.left;
                    rect.y = rect.top;
                }
                return rect;
            } catch (e) {
                throw new TypeError(`Can't call getBoundingClientRect on ${el}`);
            }
        }
    }

    pointInside(point: {x: number, y: number}, el: HTMLElement | Window): boolean {
        const rect = getClientRect(el);
        return point.y > rect.top && point.y < rect.bottom && point.x > rect.left && point.x < rect.right;
    }
        
    createDispatcher(element?: HTMLElement) {
        const defaultSettings: Settings = {
            screenX: 0,
            screenY: 0,
            clientX: 0,
            clientY: 0,
            ctrlKey: false,
            shiftKey: false,
            altKey: false,
            metaKey: false,
            button: 0,
            buttons: 1,
            relatedTarget: null,
            region: null
        };
    
        if (element !== undefined) {
            element.addEventListener('mousemove', onMove);
        }
    
        onMove(e: MouseEvent) {
            for (let i = 0; i < mouseEventProps.length; i++) {
                defaultSettings[mouseEventProps[i]] = e[mouseEventProps[i]];
            }
        }
    
        const dispatch = function () {
            if (MouseEvent) {
                return function m1(element: HTMLElement, initMove: any, data: any) {
                    const evt = new MouseEvent('mousemove', createMoveInit(defaultSettings, initMove));
    
                    setSpecial(evt, data);
    
                    return element.dispatchEvent(evt);
                };
            } else if (typeof document.createEvent === 'function') {
                return function m2(element: HTMLElement, initMove: any, data: any) {
                    const settings = createMoveInit(defaultSettings, initMove);
                    const evt = document.createEvent('MouseEvents');
    
                    evt.initMouseEvent("mousemove", true, true, window, 0, 
                        settings.screenX, settings.screenY, settings.clientX, settings.clientY, 
                        settings.ctrlKey, settings.altKey, settings.shiftKey, settings.metaKey, 
                        settings.button, settings.relatedTarget);
    
                    setSpecial(evt, data);
    
                    return element.dispatchEvent(evt);
                };
            } else if (typeof document.createEventObject === 'function') {
                return function m3(element: HTMLElement, initMove: any, data: any) {
                    const evt = document.createEventObject();
                    const settings = createMoveInit(defaultSettings!, initMove);
                    for (const name in settings) {
                        evt[name] = settings[name];
                    }
    
                    setSpecial(evt, data);
    
                    return element.dispatchEvent(evt);
                };
            }
        };

        function destroy() {
            if (element) { element.removeEventListener('mousemove', onMove, false); }
            defaultSettings = null;
        }
    
        return {
            destroy: destroy,
            dispatch: dispatch
        };
    }

    function createMoveInit(defaultSettings: Settings, initMove: Settings = {}): Settings {
        const settings: Settings = Object.create(defaultSettings);
        for (let i = 0; i < mouseEventProps.length; i++) {
            if (initMove[mouseEventProps[i]] !== undefined) {
                settings[mouseEventProps[i]] = initMove[mouseEventProps[i]];
            }
        }
    
        return settings;
    }
    
    function setSpecial(e: Event, data: any): void {
        console.log('data ', data);
        e['data'] = data || {};
        e['dispatched'] = 'mousemove';
    }
    
    const prefix: string[] = ['webkit', 'moz', 'ms', 'o'];
    
    let requestFrame: (callback?: FrameRequestCallback) => number = (function () {
        if (typeof window === "undefined") {
            return function () {};
        }
    
        for (let i = 0, limit = prefix.length; i < limit && !window.requestAnimationFrame; ++i) {
            window.requestAnimationFrame = window[prefix[i] + 'RequestAnimationFrame'];
        }
    
        if (!window.requestAnimationFrame) {
            let lastTime = 0;
    
            window.requestAnimationFrame = function (callback) {
                const now = new Date().getTime();
                const ttc = Math.max(0, 16 - now - lastTime);
                const timer = window.setTimeout(() => callback(now + ttc), ttc);
    
                lastTime = now + ttc;
    
                return timer;
            };
        }
    
        return window.requestAnimationFrame.bind(window);
    })();
    
    let cancelFrame: (handle: number) => void = (function () {
        if (typeof window === "undefined") {
            return function () {};
        }
    
        for (let i = 0, limit = prefix.length; i < limit && !window.cancelAnimationFrame; ++i) {
            window.cancelAnimationFrame = window[prefix[i] + 'CancelAnimationFrame'] || window[prefix[i] + 'CancelRequestAnimationFrame'];
        }
    
        if (!window.cancelAnimationFrame) {
            window.cancelAnimationFrame = function (timer) {
                window.clearTimeout(timer);
            };
        }
    
        return window.cancelAnimationFrame.bind(window);
    })();
}