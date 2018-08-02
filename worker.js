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

    if (elementProperties.isFragment) {
        return '/deep/'
    }

    if (elementProperties.type !== 1) {
        return;
    }

    if (elementProperties.attributes) {
        elementProperties.attributes = elementProperties.attributes.filter((attr) => { return 'class id'.indexOf(attr.a) === -1; })
        if (elementProperties.attributes.length === 0) {
            delete elementProperties.attributes;
        }
    }

    return [
        elementProperties.localName,
        elementProperties.id ? '#' + elementProperties.id : '',
        elementProperties.className ? '.' + elementProperties.className.split(' ').join('.') : '',
        elementProperties.attributes ? elementProperties.attributes.map((attr) => `[${attr.a}${attr.v ? `='${attr.v}'` : ''}]`) : ''
    ].join('');
}

function formatEvent(event) {
    event.target = formatElementRule(event.path[0]);
    event.srcElement = formatElementRule(event.srcElement);
    event.path = event.path.map(formatElementRule).filter(i => i).reverse().join(' > ');
    return event;
}

function send(){

    if (events.length === 0) {
        return;
    }

    console.log(`sending ${events.length} events`);
    console.log(events.map(formatEvent).map(e => `${e.timeStamp}  ${e.type}@(x=${e.clientX} y=${e.clientY}) on ${e.target} path="${e.path}"`));

    events = [];

}

onmessage = function({data}) {
    if(data === 'send') {
        send();
    } else if (data.events) (
        events = events.concat(data.events)
    )
};
