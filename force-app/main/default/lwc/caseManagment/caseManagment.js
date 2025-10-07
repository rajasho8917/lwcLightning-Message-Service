import { LightningElement, wire } from 'lwc';
import getCase from '@salesforce/apex/CaseManagementController.getCase';
import closeCases from '@salesforce/apex/CaseManagementController.clodecases';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const columns = [
    { label: 'Case Number', fieldName: 'CaseNumber' },
    { label: 'Subject', fieldName: 'Subject' },
    { label: 'Account Name', fieldName: 'AccountName' },
    { label: 'Contact Name', fieldName: 'ContactName' },
    { label: 'Status', fieldName: 'Status' },
    { label: 'Priority', fieldName: 'Priority' },
    { label: 'Created Date', fieldName: 'CreatedDate' },
];

export default class CaseManagement extends LightningElement {
    columns = columns;
    selectedAccountId = '';
    selectedRows = [];
    wiredCasesResult;
    cases = [];
    error;

    // Wire service for Apex call
    @wire(getCase, { accountId: '$selectedAccountId' })
    wiredCaseData(result) {
        this.wiredCasesResult = result;
        const { data, error } = result;
        if (data) {
            this.cases = this.processCases(data);
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.cases = undefined;
            console.error('Error fetching cases:', error);
        }
    }

    // Process wired data to display related fields in the datatable
    processCases(casesData) {
        return casesData.map(caseItem => ({
            ...caseItem,
            AccountName: caseItem.Account ? caseItem.Account.Name : 'N/A',
            ContactName: caseItem.Contact ? caseItem.Contact.Name : 'N/A'
        }));
    }

    // Handles the account selection from the record picker
    handleSelect(event) {
        this.selectedAccountId = event.detail.recordId;
        this.selectedRows = []; // Clear selections on account change
    }

    // Handles the row selection in the lightning-datatable
    handleRowSelection(event) {
        this.selectedRows = event.detail.selectedRows;
    }

    // Closes selected cases via Apex
    async handleCloseCases() {
        const caseIds = this.selectedRows.map(row => row.Id);
        try {
            await closeCases({ caseIds: caseIds });
            this.showToast('Success', `${caseIds.length} case(s) closed successfully.`, 'success');
            // Refresh the wired data to update the datatable
            return refreshApex(this.wiredCasesResult);
        } catch (error) {
            this.showToast('Error', 'Error closing cases: ' + error.body.message, 'error');
        } finally {
            this.selectedRows = [];
        }
    }
    
    // Getter to check if data is available
    get isDataVisible() {
        return this.cases && this.cases.length > 0;
    }

    // Getter to provide the count of selected cases
    get selectedCasesCount() {
        return this.selectedRows.length;
    }   

    // Getter to provide the count of open cases
    get openCasesCount() {
        return this.cases.filter(caseItem => caseItem.Status !== 'Closed').length;
    }

    // Getter to manage the button's disabled state
    get disableButton() {
        return this.selectedRows.length === 0;
    }

    // Helper method to dispatch a toast event
    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(event);
    }
}
