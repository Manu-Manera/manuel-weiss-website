/**
 * Text-to-BPMN: Erzeugt einfaches BPMN-XML aus Prozessbeschreibung (Text).
 * POST Body: { text: string, processId?: string }
 * Response: { success: true, bpmnXml: string } oder { success: false, error: string }
 */
exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ success: false, error: 'Method not allowed' })
        };
    }
    try {
        const body = typeof event.body === 'string' ? JSON.parse(event.body) : (event.body || {});
        const text = (body.text || '').trim();
        const processId = (body.processId || 'process').replace(/[^a-zA-Z0-9_-]/g, '_');
        if (!text) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ success: false, error: 'text is required' })
            };
        }
        const taskName = text.length > 80 ? text.substring(0, 77) + '...' : text;
        const safeName = taskName.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        const bpmnXml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
            '<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC">\n' +
            '  <bpmn:process id="Proc_' + processId + '" name="' + safeName + '">\n' +
            '    <bpmn:startEvent id="Start_1" name="Start"/>\n' +
            '    <bpmn:task id="Task_1" name="' + safeName + '"/>\n' +
            '    <bpmn:endEvent id="End_1" name="End"/>\n' +
            '  </bpmn:process>\n' +
            '</bpmn:definitions>';
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, bpmnXml })
        };
    } catch (e) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, error: (e && e.message) || 'Server error' })
        };
    }
};
