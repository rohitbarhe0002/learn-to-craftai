import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Initialize pdfMake with fonts
pdfMake.vfs = pdfFonts.vfs;

/**
 * Generates a PDF health consultation report
 * @param {Object} reportData - Data for the report
 * @param {Object} reportData.patientInfo - Patient information
 * @param {Array} reportData.consultationHistory - Chat history/consultation details
 * @param {Object} reportData.diagnosis - Diagnosis information
 * @param {Array} reportData.medicines - Recommended medicines
 * @param {Array} reportData.advice - Medical advice
 */
export function generateHealthReport(reportData) {
    const {
        patientInfo = {},
        diagnosis = {},
        medicines = [],
        advice = []
    } = reportData;

    const currentDate = new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });

    const currentTime = new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
    });

    // Document definition
    const docDefinition = {
        pageSize: 'A4',
        pageMargins: [40, 60, 40, 60],
        
        // Header
        header: {
            columns: [
                {
                    width: '*',
                    stack: [
                        { text: '🏥 AI Health Support', style: 'hospitalName' },
                        { text: 'Virtual Health Consultation Platform', style: 'hospitalSubtitle' },
                        { text: 'Powered by Advanced AI Technology', style: 'hospitalTagline' }
                    ]
                },
                {
                    width: 'auto',
                    stack: [
                        { text: `Date: ${currentDate}`, style: 'dateText', alignment: 'right' },
                        { text: `Time: ${currentTime}`, style: 'dateText', alignment: 'right' }
                    ]
                }
            ],
            margin: [40, 20, 40, 10]
        },

        // Footer
        footer: function(currentPage, pageCount) {
            return {
                columns: [
                    { 
                        text: '⚠️ This report is for informational purposes only. Please consult a qualified healthcare professional for diagnosis and treatment.',
                        style: 'disclaimer',
                        alignment: 'center'
                    }
                ],
                margin: [40, 10, 40, 20]
            };
        },

        content: [
            // Divider line
            { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 2, lineColor: '#10a37f' }] },
            { text: '', margin: [0, 5] },

            // Diagnosis Section (PDF: Disease name only, description hidden)
            diagnosis.disease ? {
                style: 'sectionBox',
                table: {
                    widths: ['*'],
                    body: [
                        [{ text: '🔬 DIAGNOSIS', style: 'sectionHeader' }],
                        [{
                            text: diagnosis.disease,
                            style: 'diagnosisTitle',
                            margin: [10, 3, 10, 3]
                        }]
                    ]
                },
                layout: 'noBorders'
            } : {},
            diagnosis.disease ? { text: '', margin: [0, 5] } : {},

            // Causes Section (PDF: Short bullet points only)
            diagnosis.causes && diagnosis.causes.length > 0 ? {
                style: 'sectionBox',
                table: {
                    widths: ['*'],
                    body: [
                        [{ text: '⚡ POSSIBLE CAUSES', style: 'sectionHeader' }],
                        [{
                            ul: diagnosis.causes.map(cause => ({ 
                                text: formatCauseForPDF(cause), 
                                style: 'listItem' 
                            })),
                            margin: [20, 3, 10, 5]
                        }]
                    ]
                },
                layout: 'noBorders'
            } : {},
            diagnosis.causes && diagnosis.causes.length > 0 ? { text: '', margin: [0, 5] } : {},

            // Medicines Section (PDF: Structured format with dosage, duration, advice)
            medicines.length > 0 ? {
                style: 'sectionBox',
                table: {
                    widths: ['*'],
                    body: [
                        [{ text: '💊 PRESCRIBED MEDICINES', style: 'sectionHeader' }],
                        [{
                            stack: medicines.map((med, index) => ({
                                stack: [
                                    { text: `${index + 1}. ${med.name || 'N/A'}`, style: 'medicineName' },
                                    { 
                                        stack: [
                                            { text: `• Dosage: ${med.dosage || 'As prescribed by doctor'}`, style: 'medicineDetail' },
                                            { text: `• Duration: ${med.duration || 'As advised by doctor'}`, style: 'medicineDetail' },
                                            { text: `• Advice: ${med.advice || 'Follow doctor\'s instructions'}`, style: 'medicineDetail' }
                                        ],
                                        margin: [15, 1, 0, 4]
                                    }
                                ],
                                margin: [0, 2, 0, 2]
                            })),
                            margin: [10, 3, 10, 5]
                        }]
                    ]
                },
                layout: 'noBorders'
            } : {},
            medicines.length > 0 ? { text: '', margin: [0, 5] } : {},

            // Advice Section
            advice.length > 0 ? {
                style: 'sectionBox',
                table: {
                    widths: ['*'],
                    body: [
                        [{ text: '📝 ADVICE & RECOMMENDATIONS', style: 'sectionHeader' }],
                        [{
                            ul: advice.map(adv => ({ text: adv, style: 'listItem' })),
                            margin: [20, 3, 10, 5]
                        }]
                    ]
                },
                layout: 'noBorders'
            } : {},
            advice.length > 0 ? { text: '', margin: [0, 5] } : {},

        ],

        // Styles
        styles: {
            hospitalName: {
                fontSize: 18,
                bold: true,
                color: '#10a37f'
            },
            hospitalSubtitle: {
                fontSize: 10,
                color: '#666666',
                margin: [0, 2, 0, 0]
            },
            hospitalTagline: {
                fontSize: 8,
                color: '#999999',
                italics: true
            },
            dateText: {
                fontSize: 10,
                color: '#333333'
            },
            sectionHeader: {
                fontSize: 11,
                bold: true,
                color: '#ffffff',
                fillColor: '#10a37f',
                margin: [8, 5, 8, 5]
            },
            sectionBox: {
                margin: [0, 0, 0, 0]
            },
            patientDetail: {
                fontSize: 10,
                color: '#333333',
                margin: [0, 1, 0, 1]
            },
            diagnosisTitle: {
                fontSize: 14,
                bold: true,
                color: '#10a37f',
                margin: [0, 0, 0, 0]
            },
            diagnosisDescription: {
                fontSize: 10,
                color: '#555555',
                lineHeight: 1.4
            },
            listItem: {
                fontSize: 10,
                color: '#444444',
                margin: [0, 1, 0, 1]
            },
            medicineName: {
                fontSize: 11,
                bold: true,
                color: '#1a7f64',
                margin: [0, 0, 0, 3]
            },
            medicineDetail: {
                fontSize: 10,
                color: '#555555',
                margin: [0, 1, 0, 1]
            },
            noticeHeader: {
                fontSize: 11,
                bold: true,
                color: '#856404',
                margin: [0, 0, 0, 5]
            },
            noticeText: {
                fontSize: 9,
                color: '#856404',
                lineHeight: 1.3
            },
            disclaimer: {
                fontSize: 8,
                color: '#999999',
                italics: true
            }
        },

        defaultStyle: {
            font: 'Roboto'
        }
    };

    // Generate and download PDF
    pdfMake.createPdf(docDefinition).download(`Health_Report_${currentDate.replace(/\s/g, '_')}.pdf`);
}

/**
 * Generate a random consultation ID
 */
function generateConsultationId() {
    return 'HC-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
}

/**
 * Format cause text for PDF (short bullet points only)
 * Extracts key phrase from long sentences
 * @param {string} cause - Original cause text
 * @returns {string} Shortened cause for PDF
 */
function formatCauseForPDF(cause) {
    if (!cause) return 'Unknown';
    
    // If already short (less than 50 chars), return as is
    if (cause.length <= 50) return cause;
    
    // Try to extract the main point (first part before comma, colon, or dash)
    const separators = [',', ':', ' - ', ' – '];
    for (const sep of separators) {
        if (cause.includes(sep)) {
            const firstPart = cause.split(sep)[0].trim();
            if (firstPart.length >= 10 && firstPart.length <= 60) {
                return firstPart;
            }
        }
    }
    
    // If no separator found, truncate at 50 chars at word boundary
    const words = cause.split(' ');
    let result = '';
    for (const word of words) {
        if ((result + ' ' + word).length > 50) break;
        result = result ? result + ' ' + word : word;
    }
    
    return result || cause.substring(0, 50);
}

/**
 * Extract dosage information from medicine note
 * @param {string} note - Medicine note text
 * @returns {string} Extracted dosage or default
 */
function extractDosageFromNote(note) {
    if (!note) return 'As prescribed by doctor';
    
    // Look for common dosage patterns
    const dosagePatterns = [
        /(\d+\s*mg)/i,
        /(\d+\s*ml)/i,
        /(\d+\s*tablet)/i,
        /(once|twice|thrice)\s*(daily|a day)/i,
        /(\d+\s*times?\s*(a\s*)?day)/i
    ];
    
    for (const pattern of dosagePatterns) {
        const match = note.match(pattern);
        if (match) return match[0];
    }
    
    return 'As prescribed by doctor';
}

/**
 * Extract duration information from medicine note
 * @param {string} note - Medicine note text
 * @returns {string} Extracted duration or default
 */
function extractDurationFromNote(note) {
    if (!note) return 'As advised by doctor';
    
    // Look for common duration patterns
    const durationPatterns = [
        /(\d+\s*days?)/i,
        /(\d+\s*weeks?)/i,
        /(\d+\s*months?)/i,
        /(as\s*needed)/i,
        /(until\s*symptoms\s*improve)/i
    ];
    
    for (const pattern of durationPatterns) {
        const match = note.match(pattern);
        if (match) return match[0];
    }
    
    return 'As advised by doctor';
}

/**
 * Extract report data from chat messages
 * @param {Array} messages - Chat messages array
 * @param {string} conversationId - Conversation ID
 * @returns {Object} Extracted report data
 */
export function extractReportData(messages, conversationId = null) {
    const reportData = {
        patientInfo: {
            consultationId: conversationId || generateConsultationId()
        },
        diagnosis: {},
        medicines: [],
        advice: [
            'Follow up with a healthcare professional for proper diagnosis',
            'Take adequate rest and stay hydrated',
            'Monitor your symptoms and seek immediate care if they worsen'
        ]
    };

    // Extract data from messages
    messages.forEach(msg => {
        if (msg.type === 'assistant' && msg.data) {
            const data = msg.data;
            
            // Extract disease info
            if (data.disease && !reportData.diagnosis.disease) {
                reportData.diagnosis.disease = data.disease;
                reportData.diagnosis.description = data.description || '';
                reportData.diagnosis.causes = data.causes || [];
            }
            
            // Extract medicines with all available details for PDF formatting
            if (data.commonly_used_medicines && Array.isArray(data.commonly_used_medicines)) {
                data.commonly_used_medicines.forEach(med => {
                    if (!reportData.medicines.find(m => m.name === med.name)) {
                        reportData.medicines.push({
                            name: med.name || 'N/A',
                            dosage: med.dosage || extractDosageFromNote(med.note),
                            duration: med.duration || extractDurationFromNote(med.note),
                            advice: med.advice || med.note || 'Consult doctor for proper guidance'
                        });
                    }
                });
            }
        }
    });

    return reportData;
}

