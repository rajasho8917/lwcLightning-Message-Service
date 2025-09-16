import { LightningElement, api } from 'lwc';
import { createMessageContext, publish } from 'lightning/messageService';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import RECORD_SELECTED_CHANNEL from '@salesforce/messageChannel/RecordSelected__c';

export default class RecordPublisher extends LightningElement {
    @api recordId;
    @api recordName;
    @api objectType;

    messageContext = createMessageContext(); // ✅ FIXED

    handleRecordIdChange(event) {
        this.recordId = event.target.value;
    }

    handleRecordNameChange(event) {
        this.recordName = event.target.value;
    }

    handleObjectTypeChange(event) {
        this.objectType = event.target.value;
    }

    handlePublishMessage() {
        const message = {
            recordId: this.recordId || 'sample-id-123',
            recordName: this.recordName || 'Sample Record',
            objectType: this.objectType || 'Account'
        };

        publish(this.messageContext, RECORD_SELECTED_CHANNEL, message);

        this.showToast('Success', 'Message published successfully!', 'success');
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
}
