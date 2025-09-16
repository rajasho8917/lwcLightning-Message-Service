import { LightningElement } from 'lwc';
import { 
    createMessageContext, 
    releaseMessageContext,
    subscribe,
    unsubscribe,
    APPLICATION_SCOPE 
} from 'lightning/messageService';
import RECORD_SELECTED_CHANNEL from '@salesforce/messageChannel/RecordSelected__c';

export default class RecordSubscriber extends LightningElement {
    messageContext = createMessageContext();
    subscription = null;
    receivedMessage = null;

    connectedCallback() {
        this.handleSubscribe();
    }

    handleSubscribe() {
        if (this.messageContext && !this.subscription) {
            this.subscription = subscribe(
                this.messageContext,
                RECORD_SELECTED_CHANNEL,
                (message) => this.handleReceivedMessage(message),
                { scope: APPLICATION_SCOPE }
            );
        }
    }

    handleReceivedMessage(message) {
        this.receivedMessage = {
            ...message,
            timestamp: new Date().toLocaleTimeString()
        };
        console.log('✅ Received message:', this.receivedMessage);
    }

    disconnectedCallback() {
        if (this.subscription) {
            unsubscribe(this.subscription);
            this.subscription = null;
        }
        if (this.messageContext) {
            releaseMessageContext(this.messageContext);
        }
    }

    get hasReceivedMessage() {
        return this.receivedMessage !== null;
    }
}
