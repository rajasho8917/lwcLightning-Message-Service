import { LightningElement , wire} from 'lwc';
import accountController from '@salesforce/apex/AccountlmsController.accountController';
import { publish , MessageContext ,subscribe } from 'lightning/messageService';
import selectedAccount from '@salesforce/messageChannel/selectedAccount__c';
const COLUMNS =[
    {label:'Account Name',fieldName:'accountUrl',type:'url',
        typeAttributes:{label:{fieldName:'accountName'},target:'_blank'}},
    {label:'Type',fieldName:'accountType',type:'text'},
    {label:'BillingCountry',fieldName:'accountBillingCountry',type:'text'},
    {label:'Total Opportunities',fieldName:'TotalOpportunities',type:'number' , sortable:true}
]

export default class AccountViewWithOpportunity extends LightningElement {
    columns = COLUMNS;
    selectedRow;
    @wire(accountController) accounts;

    @wire(MessageContext) messageContext;

    handleRowSelection(event){
        const selectedRows = event.detail.selectedRows;
        if (selectedRows.length > 0) {
            this.selectedRow = selectedRows[0].accountId;
            console.log('---selectedRows---', this.selectedRow);

        publish(this.messageContext,selectedAccount,{accountId:this.selectedRow});    
        }else{
            this.selectedRow = null;
            console.log('ERROR', this.selectedRow);
        }
    } 
}