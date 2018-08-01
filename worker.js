/**
 * Created by barakedry on 01/08/2018.
 */
'use strict';

let events = [];

function compress(events) {
    return events;
}

function send(){

    if (events.length === 0) {
        return;
    }

    console.log(`sending ${events.length} events`);
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