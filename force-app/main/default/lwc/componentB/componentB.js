import { LightningElement, track, wire } from 'lwc';
import { publish, subscribe, MessageContext } from 'lightning/messageService';
import AccountChannel from '@salesforce/messageChannel/AccountChannel__c';
import updateAccount from '@salesforce/apex/getAccountData.updateAccount';

export default class ComponentB extends LightningElement {
    @track recordId = '';
    @track name = '';
    @track phone = '';
    @track industry = '';
    @track statusMessage = '';
    @track subscription;

    @wire(MessageContext) messageContext;

    connectedCallback() {
        this.subscribeToMessage();
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
        if (message?.action === 'SELECTED' && message.payload) {
            const accountData = message.payload;
            this.recordId = accountData.Id;
            this.name = accountData.Name;
            this.phone = accountData.Phone;
            this.industry = accountData.Industry;
            this.statusMessage = 'Account data populated from selection.';
        }
    }

    handleIdChange(e) { this.recordId = e.target.value; }
    handleNameChange(e) { this.name = e.target.value; }
    handlePhoneChange(e) { this.phone = e.target.value; }
    handleIndustryChange(e) { this.industry = e.target.value; }

    handleClear() {
        this.recordId = this.name = this.phone = this.industry = '';
        this.statusMessage = '';
    }

    handleSave() {
        if (!this.recordId) {
            this.statusMessage = 'Please provide an Account Id';
            return;
        }

        const acc = {
            sobjectType: 'Account',
            Id: this.recordId,
            Name: this.name || undefined,
            Phone: this.phone || undefined,
            Industry: this.industry || undefined
        };

        updateAccount({ acc })
            .then(() => {
                this.statusMessage = 'Account updated successfully';
                publish(this.messageContext, AccountChannel, {
                    recordId: this.recordId,
                    action: 'UPDATED'
                });
            })
            .catch((error) => {
                this.statusMessage = 'Error updating: ' + (error.body?.message || error.message);
            });
    }
}
