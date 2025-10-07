import { LightningElement, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import Id from '@salesforce/user/Id';
import FirstName from '@salesforce/schema/User.FirstName';
import LastName from '@salesforce/schema/User.LastName';
import Email from '@salesforce/schema/User.Email';

const fields = [FirstName, LastName, Email];

export default class EmbadedMessageSetRecord extends LightningElement {
    userId = Id;

    @wire(getRecord, { recordId: '$userId', fields })
    wiredRecord({ error, data }) {
        if (data) {
            const payload = {
                userId: this.userId,
                email: getFieldValue(data, Email),
                fname: getFieldValue(data, FirstName),
                lname: getFieldValue(data, LastName)
            };

            console.log("Dispatching Current_User_Id event:", JSON.stringify(payload));

            window.dispatchEvent(
                new CustomEvent('Current_User_Id', { detail: payload })
            );
        }
    }
}
