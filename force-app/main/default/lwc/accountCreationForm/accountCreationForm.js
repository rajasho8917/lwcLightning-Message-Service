import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { createRecord } from 'lightning/uiRecordApi';
import CONTACT_OBJECT from '@salesforce/schema/Contact';
import LASTNAME_FIELD from '@salesforce/schema/Contact.LastName';
import EMAIL_FIELD from '@salesforce/schema/Contact.Email';
import ACCOUNTID_FIELD from '@salesforce/schema/Contact.AccountId';

export default class AccountContactForm extends LightningElement {
    @track contactLastName = '';
    @track contactEmail = '';

    handleLastNameChange(event) {
        this.contactLastName = event.target.value;
    }

    handleEmailChange(event) {
        this.contactEmail = event.target.value;
    }

    // Called after Account is created
    handleAccountSuccess(event) {
        const accountId = event.detail.id;

        // Build Contact record
        const fields = {};
        fields[LASTNAME_FIELD.fieldApiName] = this.contactLastName;
        fields[EMAIL_FIELD.fieldApiName] = this.contactEmail;
        fields[ACCOUNTID_FIELD.fieldApiName] = accountId;

        const recordInput = { apiName: CONTACT_OBJECT.objectApiName, fields };

        createRecord(recordInput)
            .then(() => {
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Success',
                    message: 'Account and Contact created successfully!',
                    variant: 'success'
                }));
            })
            .catch(error => {
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Error creating Contact',
                    message: error.body.message,
                    variant: 'error'
                }));
            });
    }
}
