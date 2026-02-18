// Complete situation report layout including tables, dates, contractor info, signatures and all details

const situationReport = { 
    reportDate: '2026-02-18', // report date 
    contractor: { 
        name: 'Contractor Name', 
        address: 'Contractor Address', 
        contact: 'Contractor Contact Info', 
    }, 
    signatures: { 
        authorized: 'Authorized Signatory', 
        contractor: 'Contractor Signature', 
    }, 
    details: {
        table: [
            { description: 'Detail 1', value: 'Value 1' }, 
            { description: 'Detail 2', value: 'Value 2' }, 
            // additional details
        ], 
        notes: 'Additional notes regarding the situation report'
    }
};