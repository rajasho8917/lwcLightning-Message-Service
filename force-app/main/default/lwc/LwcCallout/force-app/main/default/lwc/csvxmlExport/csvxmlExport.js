import { LightningElement } from 'lwc';
import getAllAccounts from '@salesforce/apex/vehicle.getAllAccounts';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class CsvxmlExport extends LightningElement {
    isLoading = false;

    fields = [
        'Name',
        'Type',
        'Industry',
        'Phone',
        'Website',
        'BillingCity',
        'BillingState',
        'BillingCountry',
        'AnnualRevenue',
        'NumberOfEmployees',
        'CreatedDate'
    ];

    // ---------------- CSV Export ----------------
    async downloadCSV() {
        this.isLoading = true;
        try {
            const accounts = await getAllAccounts();
            if (!accounts || accounts.length === 0) {
                this.showToast('Warning', 'No accounts found to export', 'warning');
                return;
            }

            const header = this.fields.join(',');
            let csvContent = header + '\n';

            accounts.forEach(acc => {
                const row = this.fields.map(f => {
                    let val = acc[f] || '';
                    if (f === 'CreatedDate' && val) {
                        val = new Date(val).toLocaleDateString();
                    }
                    return `"${String(val).replace(/"/g, '""')}"`;
                });
                csvContent += row.join(',') + '\n';
            });

            this.downloadFile(csvContent, 'accounts.csv');
            this.showToast('Success', `Downloaded ${accounts.length} accounts successfully!`, 'success');
        } catch (error) {
            console.error('CSV Export error:', JSON.stringify(error));
            const msg = error?.body?.message 
                     || error?.body?.pageErrors?.[0]?.message
                     || error.message
                     || 'Unknown error';
            this.showToast('Error', `Download failed: ${msg}`, 'error');
        } finally {
            this.isLoading = false;
        }
    }

    // ---------------- Excel Export ----------------
    async downloadExcel() {
        this.isLoading = true;
        try {
            const accounts = await getAllAccounts();
            if (!accounts || accounts.length === 0) {
                this.showToast('Warning', 'No accounts found to export', 'warning');
                return;
            }

            let excelContent = `
                <table border="1">
                    <tr style="background-color:#4CAF50;color:white;">
                        ${this.fields.map(f => `<th>${f}</th>`).join('')}
                    </tr>
            `;

            accounts.forEach(acc => {
                excelContent += `<tr>`;
                this.fields.forEach(f => {
                    let val = acc[f] || '';
                    if (f === 'CreatedDate' && val) {
                        val = new Date(val).toLocaleDateString();
                    }
                    excelContent += `<td>${val}</td>`;
                });
                excelContent += `</tr>`;
            });

            excelContent += `</table>`;

            this.downloadFile(excelContent, 'accounts.xls');
            this.showToast('Success', `Downloaded ${accounts.length} accounts successfully!`, 'success');
        } catch (error) {
            console.error('Excel Export error:', JSON.stringify(error));
            const msg = error?.body?.message 
                     || error?.body?.pageErrors?.[0]?.message
                     || error.message
                     || 'Unknown error';
            this.showToast('Error', `Download failed: ${msg}`, 'error');
        } finally {
            this.isLoading = false;
        }
    }

    // ---------------- Helpers ----------------
    downloadFile(content, filename) {
        // Add BOM for CSV (fixes Excel encoding issue)
        if (filename.endsWith('.csv')) {
            content = '\uFEFF' + content;
        }

        // Safe MIME type for Lightning Web Security
        const blob = new Blob([content], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.URL.revokeObjectURL(url);
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
}
