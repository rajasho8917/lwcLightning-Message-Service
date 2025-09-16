import { LightningElement, track, wire } from 'lwc';
import { subscribe, MessageContext } from 'lightning/messageService';
import AccountChannel from '@salesforce/messageChannel/AccountChannel__c';
import getAccount from '@salesforce/apex/getAccountData.getAccount';
import { refreshApex } from '@salesforce/apex';

export default class ComponentA extends LightningElement {
    @track accounts;
    @track error;
    @track isLoading = false;

    columns = [
        { label: 'Name', fieldName: 'Name' },
        { label: 'Phone', fieldName: 'Phone' },
        { label: 'Industry', fieldName: 'Industry' }
    ];

    wiredResult;
    subscription;
    @wire(MessageContext) messageContext;

    connectedCallback() {
        this.subscribeToMessage();
    }

    @wire(getAccount)
    wiredAccount(result) {
        this.wiredResult = result;
        this.isLoading = true;
        if (result.data) {
            this.accounts = result.data;
            this.error = undefined;
            this.isLoading = false;
        } else if (result.error) {
            this.error = result.error;
            this.accounts = undefined;
            this.isLoading = false;
        }
    }

    subscribeToMessage() {
        if (this.subscription) return;
        this.subscription = subscribe(
            this.messageContext,
            AccountChannel,
            (message) => this.handleMessage(message)
        );
    }

    handleMessage(message) {
        if (message?.action === 'UPDATED') {
            this.refreshAccounts();
        }
    }

    handleManualRefresh() {
        this.refreshAccounts();
    }

    refreshAccounts() {
        if (this.wiredResult) {
            this.isLoading = true;
            refreshApex(this.wiredResult).finally(() => (this.isLoading = false));
        }
    }
}
