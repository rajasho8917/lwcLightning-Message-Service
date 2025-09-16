import { LightningElement, track } from 'lwc';

export default class HelloWorld extends LightningElement {
    @track greeting = 'Hello World!';
    @track inputValue = '';

    handleInputChange(event) {
        this.inputValue = event.target.value;
    }

    handleButtonClick() {
        this.greeting = `Hello ${this.inputValue || 'World'}!`;
    }
}