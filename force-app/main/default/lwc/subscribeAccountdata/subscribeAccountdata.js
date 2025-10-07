import { LightningElement, wire } from 'lwc';
import { unsubscribe , MessageContext ,subscribe } from 'lightning/messageService';
import selectedAccount from '@salesforce/messageChannel/selectedAccount__c';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class SubscribeAccountdata extends LightningElement {
    subscription;
    recordId;
    
    @wire(MessageContext) messageContext;

    connectedCallback(){
        this.subscribeToMessageChannel();
    }
    subscribeToMessageChannel(){
        this.subscription = subscribe(
            this.messageContext,
            selectedAccount,
            (message) => this.handleMessage(message)
        );
    }
    handleMessage(message){
        this.recordId = message.accountId;
        console.log('--recordId--', this.recordId);
    }
    disconnectedCallback(){
        unsubscribe(this.subscription);
        this.subscription = null;
    }
}