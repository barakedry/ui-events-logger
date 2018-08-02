/**
 * Created by barakedry on 01/08/2018.
 */
'use strict';

function getAttributes(node) {
    if (node.nodeType !== 1 ) {
        return;
    }

    const attributes = [];
    const names = node.getAttributeNames()
    for (let i = 0; i < names.length; i++) {
        attributes.push({a: names[i], v:node.getAttribute(names[i])});
    }

    return attributes;
}

function destructNode(node) {

    if (!node) { return; }

    return {
        localName: node.localName,
        id: node.id,
        type: node.nodeType,
        className: node.className,
        attributes: getAttributes(node),
        isFragment: node.nodeType === 11
    };
}


function destructMouseEvent(event) {
    const { clientX, clientY, pageX, pageY, type, which, buttons, timeStamp } = event;
    const target = destructNode(event.target),
        path = event.path.map(destructNode),
        srcElement = destructNode(event.srcElement);

    return { clientX, clientY, pageX, pageY, type, which, buttons, timeStamp, target, path, srcElement}
}

function destructKeyboardEvent(event) {
    const { type, which, buttons, timeStamp, charCode, keyCode } = event;
    const target = destructNode(event.target),
        path = event.path.map(destructNode),
        srcElement = destructNode(event.srcElement);

    return {type, timeStamp, target, path, srcElement, charCode, keyCode}
}

const eventDestructors = {
    'click': destructMouseEvent,
    'mousedown': destructMouseEvent,
    'mouseup': destructMouseEvent,
    'mouseover': destructMouseEvent,
    'mouseout': destructMouseEvent,
    'keyup': destructKeyboardEvent,
    'keydown': destructKeyboardEvent,
    'keypress':destructKeyboardEvent
}

function destructEvent(event) {
    if (eventDestructors[event.type]) {
        return eventDestructors[event.type](event);
    }
}

const UIActivityLogger = {

    waitingForIdle: false,

    eventsBuffer: [],

    start() {
        this.worker = new Worker('/node_modules/ui-events-logger/worker.js');
        this.addHandlers();
    },

    flushAtIdle() {
        if (this.waitingForIdle) { return; }

        this.waitingForIdle = true;
        window.requestIdleCallback(() => {
            this.waitingForIdle = false;
            this.worker.postMessage({events: this.eventsBuffer.map(destructEvent)});
            this.eventsBuffer = [];
        });
    },

    log(event) {

        if (!event) { return; }

        if (this.idleSendTimeoutHandle) {
            clearTimeout(this.idleSendTimeoutHandle);
            this.idleSendTimeoutHandle = null;
        }

        this.eventsBuffer.push(event);
        this.flushAtIdle();
    },

    onEvent(event) {
        // defer
        setTimeout(() => {
            this.log(event);
        }, 0);
    },

    send() {
        this.worker.postMessage('send');
    },

    addHandlers() {
        document.addEventListener('click', this.onEvent.bind(this), true);
        document.addEventListener('keyup', this.onEvent.bind(this), true);

        window.addEventListener('blur', () => {
            if (this.idleSendTimeoutHandle) {
                clearTimeout(this.idleSendTimeoutHandle);
                this.idleSendTimeoutHandle = null;
            }

            this.idleSendTimeoutHandle = setTimeout(() => {
                this.send();
                this.idleSendTimeoutHandle = null;
            }, 500);
        });

        window.addEventListener('focus', () => {
            if (this.idleSendTimeoutHandle) {
                clearTimeout(this.idleSendTimeoutHandle);
                this.idleSendTimeoutHandle = null;
            }
        });

        window.addEventListener('mousemove', () => {
            if (this.idleSendTimeoutHandle) {
                clearTimeout(this.idleSendTimeoutHandle);
                this.idleSendTimeoutHandle = null;
            }

            this.idleSendTimeoutHandle = setTimeout(() => {
                this.send();
                this.idleSendTimeoutHandle = null;
            }, 5000);
        });
    }
};

export default UIActivityLogger;
