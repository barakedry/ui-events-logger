/**
 * Created by barakedry on 01/08/2018.
 */
'use strict';

const UIActivityLogger = {

    waitingForIdle: false,

    eventsBuffer: [],

    start() {
        this.worker = new Worker('./worker.js');
        this.addHandlers();
    },

    flushAtIdle() {
        if (this.waitingForIdle) { return; }

        this.waitingForIdle = true;
        window.requestIdleCallback(() => {
            this.waitingForIdle = false;
            this.worker.postMessage({events: this.eventsBuffer});
            this.eventsBuffer = [];
        });
    },

    log(event) {
        if (this.idleSendTimeoutHandle) {
            clearTimeout(this.idleSendTimeoutHandle);
            this.idleSendTimeoutHandle = null;
        }

        this.eventsBuffer.push(event);
        this.flushAtIdle();
    },

    onMouseEvent(event) {

        // defer
        setTimeout(() => {
            this.log(event);
        }, 0);
    },

    onKeyEvent(e) {


        // defer
        setTimeout(() => {
            this.log(event);
        }, 0);
    },

    send() {
        this.worker.postMessage('send');
    },

    addHandlers() {
        document.addEventListener('click', this.onMouseEvent.bind(this), true);
        document.addEventListener('keyup', this.onKeyEvent.bind(this), true);

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

        window.addEventListener('mouseove', () => {
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