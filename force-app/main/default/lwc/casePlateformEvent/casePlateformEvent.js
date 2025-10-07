import { LightningElement, track } from 'lwc';
import { subscribe, unsubscribe, onError } from 'lightning/empApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class SimpleCaseEvent extends LightningElement {
    @track events = [];
    @track isSubscribed = false;

    channelName = '/event/Case_Platform_event__e';
    subscription = {};

    columns = [
        { label: 'Time', fieldName: 'timestamp', type: 'text' },
        { label: 'Subject', fieldName: 'subject', type: 'text' },
        { label: 'Status', fieldName: 'status', type: 'text' },
        { label: 'Origin', fieldName: 'origin', type: 'text' },
        { label: 'Email', fieldName: 'email', type: 'email' }
    ];

    connectedCallback() {
        onError(error => {
            console.error('EMP API error: ', error);
        });
    }

    handleSubscribe() {
        if (this.isSubscribed) return; // prevent duplicate subs

        const messageCallback = (response) => {
            console.log('New event received: ', response);

            const { subjectEvent__c, StatusEvent__c, CaseOriginEvent__c, EmailEvent__c } = response.data.payload;

            const newEvent = {
                id: Date.now(),
                timestamp: new Date().toLocaleTimeString(),
                subject: subjectEvent__c || 'N/A',
                status: StatusEvent__c || 'N/A',
                origin: CaseOriginEvent__c || 'N/A',
                email: EmailEvent__c || 'N/A'
            };

            this.events = [newEvent, ...this.events];

            this.dispatchEvent(new ShowToastEvent({
                title: 'New Case Event',
                message: newEvent.subject,
                variant: 'success'
            }));
        };

        subscribe(this.channelName, -1, messageCallback).then(response => {
            console.log('Subscribed to: ', response.channel);
            this.subscription = response;
            this.isSubscribed = true;
        });
    }

    handleUnsubscribe() {
        unsubscribe(this.subscription, response => {
            console.log('Unsubscribed from: ', response.channel);
            this.isSubscribed = false;
        });
    }

    handleClear() {
        this.events = [];
    }

    disconnectedCallback() {
        if (this.isSubscribed) {
            unsubscribe(this.subscription, response => {
                console.log('Auto unsubscribed: ', response.channel);
            });
        }
    }
}
