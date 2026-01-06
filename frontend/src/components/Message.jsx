import { markdownToHTML } from '../utils/markdown';
import { generateHealthReport, extractReportData } from '../utils/reportGenerator';
import { useState } from 'react';
export function UserMessage({ text }) {
    return (
        <div className="message user">
            <div className="message-avatar">You</div>
            <div className="message-content">
                <div className="message-bubble">{text}</div>
            </div>
        </div>
    );
}

export function ErrorMessage({ errorText }) {
    return (
        <div className="message assistant">
            <div className="message-avatar">AI</div>
            <div className="message-content">
                <div className="message-bubble">
                    <div className="error-message">{errorText}</div>
                </div>
            </div>
        </div>
    );
}

export function AssistantMessage({ data, allMessages = [], onLocationAllowed, onLocationDenied }) {
    //  HANDLE LOCATION REQUEST (MUST BE FIRST)
    const [locationDenied, setLocationDenied] = useState("Yes");
    if (data?.type === 'LOCATION_REQUIRED' && locationDenied !== "Yes") {
        return (
            <div className="message assistant">
                <div className="message-avatar">AI</div>
                <div className="message-content">
                    <div className="message-bubble">
                        <div className="assistant-content">
                            <div className="disease-description mb-0 p">
                                <p className="text-sm text-gray-200">
                                    I can still help 🙂
                                    Location access helps me find nearby hospitals, doctors, or pharmacies,
                                    but you can continue without it.
                                </p>

                                <div className="text-sm text-gray-300">
                                    <p className="font-medium mb-1">You can try:</p>
                                    <ul className="list-disc pl-4 space-y-1">
                                        <li>
                                            <strong>Type your city / address</strong> –
                                            <em> “Suggest a good hospital in Indore / 54 Vijay nagar”</em>
                                        </li>
                                        
                                    </ul>
                                </div>

                                <p className="text-xs text-gray-400">
                                    Just type your request below 👇
                                </p>


                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    if (data?.type === 'LOCATION_REQUIRED') {
        const handleAllowLocation = () => {
            if (!navigator.geolocation) {
                alert('Geolocation is not supported by your browser');
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    console.log('User location:', {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                    onLocationAllowed({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    console.error('message:', error.message);
                    setLocationDenied(`${error.message}`);
                }
            );
        };
        console.log(onLocationDenied, 'onLocationDenied  ');
        return (
            <div className="message assistant">
                <div className="message-avatar">AI</div>
                <div className="message-content">
                    <div className="message-bubble">
                        <div className="assistant-content">
                            <div className="disease-description mb-0 p">
                                {data.message}
                            </div>
                            { }
                            <button
                                className="allow-location-button w-fit"
                                onClick={handleAllowLocation}
                                style={{ marginTop: '2px' }}
                            >
                                Allow Location
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    const assistantContent = [];
    if (data.type === 'healthcare_list') {
        return (
            <div className="message assistant">
                <div className="message-avatar">AI</div>
                <div className="message-content">
                    <div className="message-bubble">
                        <div className="section-title">
                            Nearby {data.resource_type}
                        </div>
                        <ul>
                            {data.items.map((item, i) => (
                                <li key={i}>
                                    <strong>{item.name}</strong>
                                    <div>{item.description}</div>
                                </li>
                            ))}
                        </ul>
                        <div className="medicine-disclaimer">
                            {data.note}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Handle download report response - Simple inline style
    if (data.type === 'download_report') {
        const handleDownload = () => {
            const reportData = extractReportData(allMessages);
            generateHealthReport(reportData);
        };

        return (
            <div className="message assistant">
                <div className="message-avatar">AI</div>
                <div className="message-content">
                    <div className="message-bubble">
                        <div className="download-report-container">
                            <span className="download-message">Your report is ready.</span>
                            <button className="download-button" onClick={handleDownload}>
                                Download PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (data.message && !data.type) {
        assistantContent.push(
            <div key="fallback" className="disease-description">{data.message}</div>
        );

        if (data.guidance) {
            assistantContent.push(
                <div key="guidance" className="disease-description" style={{ marginTop: 'var(--spacing-md)' }}>
                    {data.guidance}
                </div>
            );
        }

        if (data.note) {
            assistantContent.push(
                <div key="note" className="medicine-note" style={{ marginTop: 'var(--spacing-sm)' }}>
                    {data.note}
                </div>
            );
        }
    }
    else if (data.response && typeof data.response === 'string') {
        assistantContent.push(
            <div
                key="conversational"
                className="disease-description"
                dangerouslySetInnerHTML={{ __html: markdownToHTML(data.response) }}
            />
        );
    } else {
        if (data.disease) {
            assistantContent.push(
                <div key="disease" className="disease-heading">{data.disease}</div>
            );
        }

        if (data.description) {
            assistantContent.push(
                <div key="description" className="disease-description">{data.description}</div>
            );
        }

        if (data.causes && Array.isArray(data.causes) && data.causes.length > 0) {
            assistantContent.push(
                <div key="causes" className="section">
                    <div className="section-title">Causes</div>
                    <ul className="causes-list">
                        {data.causes.map((cause, index) => (
                            <li key={index}>{cause}</li>
                        ))}
                    </ul>
                </div>
            );
        }

        // Medicines section
        if (data.commonly_used_medicines && Array.isArray(data.commonly_used_medicines) && data.commonly_used_medicines.length > 0) {
            assistantContent.push(
                <div key="medicines" className="section">
                    <div className="section-title">Commonly Used Medicines</div>
                    <ul className="causes-list">
                        {data.commonly_used_medicines.map((medicine, index) => (
                            <li key={index}>{medicine.name || 'Unknown medicine'}</li>
                        ))}
                    </ul>
                    <div className="medicine-disclaimer">
                        This is a general overview and not a substitute for professional medical advice. Please consult a doctor for any health concerns.
                    </div>
                </div>
            );
        }

        const hasStructuredData = data.disease || data.description ||
            (data.causes && data.causes.length > 0) ||
            (data.commonly_used_medicines && data.commonly_used_medicines.length > 0);

        if (!hasStructuredData && !data.type) {
            assistantContent.push(
                <div key="fallback" className="disease-description">
                    I apologize, but I couldn't find specific information about that. Please try asking about a specific disease.
                </div>
            );
        }
    }

    return (
        <div className="message assistant">
            <div className="message-avatar">AI</div>
            <div className="message-content">
                <div className="message-bubble">
                    <div className="assistant-content">
                        {assistantContent}
                    </div>
                </div>
            </div>
        </div>
    );
}

