import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/**
 * Export visa applications to CSV format
 * @param {Array} visas - Array of visa application objects
 * @param {string} filename - Name of the file to download
 */
export const exportToCSV = (visas, filename = 'visa-applications.csv') => {
    if (!visas || visas.length === 0) {
        alert('No data to export');
        return;
    }

    // Prepare data for export
    const exportData = visas.map(visa => ({
        'Application Number': visa.applicationNumber || 'N/A',
        'Application Date': visa.applicationDate?.toDate ?
            new Date(visa.applicationDate.toDate()).toLocaleDateString() : 'N/A',
        'Applicant Name': visa.applicantName || 'N/A',
        'Age': visa.age || 'N/A',
        'Email': visa.email || 'N/A',
        'Phone': visa.phone || 'N/A',
        'CNIC': visa.cnic || 'N/A',
        'Country': visa.country || 'N/A',
        'Visa Type': visa.visaType || 'N/A',
        'Processing Time': visa.processingTime || 'N/A',
        'Validity': visa.validity || 'N/A',
        'Stay Duration': visa.stayDuration || 'N/A',
        'Urgent Processing': visa.urgentProcessing ? 'Yes' : 'No',
        'Visa Fee': visa.visaFee || 0,
        'Urgent Fee': visa.urgentFee || 0,
        'Total Fee': visa.totalFee || 0,
        'Payment Status': visa.paymentStatus || 'N/A',
        'Payment Method': visa.paymentMethod || 'N/A',
        'Transaction ID': visa.transactionId || 'N/A',
        'Status': visa.status || 'N/A',
        'User ID': visa.uid || 'N/A',
        'User Email': visa.userEmail || 'N/A',
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Visa Applications');

    // Generate CSV
    const csvOutput = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, filename);
};

/**
 * Export visa applications to Excel format
 * @param {Array} visas - Array of visa application objects
 * @param {string} filename - Name of the file to download
 */
export const exportToExcel = (visas, filename = 'visa-applications.xlsx') => {
    if (!visas || visas.length === 0) {
        alert('No data to export');
        return;
    }

    // Prepare data for export
    const exportData = visas.map(visa => ({
        'Application Number': visa.applicationNumber || 'N/A',
        'Application Date': visa.applicationDate?.toDate ?
            new Date(visa.applicationDate.toDate()).toLocaleDateString() : 'N/A',
        'Applicant Name': visa.applicantName || 'N/A',
        'Age': visa.age || 'N/A',
        'Email': visa.email || 'N/A',
        'Phone': visa.phone || 'N/A',
        'CNIC': visa.cnic || 'N/A',
        'Country': visa.country || 'N/A',
        'Visa Type': visa.visaType || 'N/A',
        'Processing Time': visa.processingTime || 'N/A',
        'Validity': visa.validity || 'N/A',
        'Stay Duration': visa.stayDuration || 'N/A',
        'Urgent Processing': visa.urgentProcessing ? 'Yes' : 'No',
        'Visa Fee': visa.visaFee || 0,
        'Urgent Fee': visa.urgentFee || 0,
        'Total Fee': visa.totalFee || 0,
        'Payment Status': visa.paymentStatus || 'N/A',
        'Payment Method': visa.paymentMethod || 'N/A',
        'Transaction ID': visa.transactionId || 'N/A',
        'Status': visa.status || 'N/A',
        'User ID': visa.uid || 'N/A',
        'User Email': visa.userEmail || 'N/A',
    }));

    // Add document URLs if available
    const dataWithDocs = exportData.map((row, index) => {
        const visa = visas[index];
        const docUrls = visa.documentURLs || {};

        return {
            ...row,
            'CNIC Front URL': docUrls.cnicFront || 'N/A',
            'CNIC Back URL': docUrls.cnicBack || 'N/A',
            'Bank Statement URL': docUrls.bankStatement || 'N/A',
            'Passport URL': docUrls.passport || 'N/A',
            'NIC Scan URL': docUrls.nicScan || 'N/A',
            'B-Form URL': docUrls.bForm || 'N/A',
            'FRC URL': docUrls.frc || 'N/A',
        };
    });

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(dataWithDocs);

    // Set column widths
    const colWidths = [
        { wch: 20 }, // Application Number
        { wch: 15 }, // Application Date
        { wch: 20 }, // Applicant Name
        { wch: 8 },  // Age
        { wch: 25 }, // Email
        { wch: 15 }, // Phone
        { wch: 18 }, // CNIC
        { wch: 20 }, // Country
        { wch: 20 }, // Visa Type
        { wch: 18 }, // Processing Time
        { wch: 12 }, // Validity
        { wch: 15 }, // Stay Duration
        { wch: 15 }, // Urgent Processing
        { wch: 12 }, // Visa Fee
        { wch: 12 }, // Urgent Fee
        { wch: 12 }, // Total Fee
        { wch: 15 }, // Payment Status
        { wch: 15 }, // Payment Method
        { wch: 20 }, // Transaction ID
        { wch: 15 }, // Status
        { wch: 25 }, // User ID
        { wch: 25 }, // User Email
        { wch: 50 }, // Document URLs
    ];
    ws['!cols'] = colWidths;

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Visa Applications');

    // Generate Excel file
    XLSX.writeFile(wb, filename);
};

/**
 * Download all documents for a visa application as a zip (future enhancement)
 * @param {Object} visa - Visa application object
 */
export const downloadAllDocuments = async (visa) => {
    if (!visa.documentURLs) {
        alert('No documents available for this application');
        return;
    }

    const docUrls = visa.documentURLs;
    const docNames = Object.keys(docUrls);

    if (docNames.length === 0) {
        alert('No documents available for this application');
        return;
    }

    // For now, open each document in a new tab
    // Future: implement zip download
    docNames.forEach(docName => {
        if (docUrls[docName]) {
            window.open(docUrls[docName], '_blank');
        }
    });
};

/**
 * Format visa data for display
 * @param {Array} visas - Array of visa applications
 * @returns {Object} Formatted statistics
 */
export const getVisaStatistics = (visas) => {
    if (!visas || visas.length === 0) {
        return {
            total: 0,
            byStatus: {},
            byCountry: {},
            totalRevenue: 0,
            urgentCount: 0,
        };
    }

    const stats = {
        total: visas.length,
        byStatus: {},
        byCountry: {},
        totalRevenue: 0,
        urgentCount: 0,
    };

    visas.forEach(visa => {
        // Count by status
        const status = visa.status || 'Unknown';
        stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;

        // Count by country
        const country = visa.country || 'Unknown';
        stats.byCountry[country] = (stats.byCountry[country] || 0) + 1;

        // Calculate revenue
        stats.totalRevenue += visa.totalFee || 0;

        // Count urgent processing
        if (visa.urgentProcessing) {
            stats.urgentCount++;
        }
    });

    return stats;
};
