/**
 * Created by barakedry on 01/08/2018.
 */
'use strict';

let events = [];

function compress(events) {
    return events;
}

function formatElementRule(elementProperties) {
    if (!elementProperties) { return; }

    return [
        elementProperties.localName,
        elementProperties.id ? '#' + elementProperties.id : '',
        elementProperties.className ? '.' + elementProperties.className.split(' ').join('.') : '',
        elementProperties.attributes ? elementProperties.attributes.map((attr) => `[${attr}]`) : ''
    ].join('');
}

function formatEvent(event) {
    event.target = formatElementRule(event.target);
    event.srcElement = formatElementRule(event.srcElement);
    event.path = event.path.map(formatElementRule);
    return event;
}

function send(){

    if (events.length === 0) {
        return;
    }

    console.log(`sending ${events.length} events`);
    console.log(events.map(formatEvent));

    debugger;
    events = [];

}

onmessage = function(msg) {
    if(msg === 'send') {
        send();
    } else if (msg.events) (
        events = events.concat(msg.events)
    )
};