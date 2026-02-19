/**
 * AWS Lambda: Text-to-BPMN
 * Erzeugt BPMN 2.0 XML aus Prozessbeschreibung (Text).
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
      '<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI">\n' +
      '  <bpmn:process id="Proc_' + processId + '" name="' + safeName + '" isExecutable="true">\n' +
      '    <bpmn:startEvent id="Start_1" name="Start"/>\n' +
      '    <bpmn:sequenceFlow id="Flow_1" sourceRef="Start_1" targetRef="Task_1"/>\n' +
      '    <bpmn:task id="Task_1" name="' + safeName + '"/>\n' +
      '    <bpmn:sequenceFlow id="Flow_2" sourceRef="Task_1" targetRef="End_1"/>\n' +
      '    <bpmn:endEvent id="End_1" name="Ende"/>\n' +
      '  </bpmn:process>\n' +
      '  <bpmndi:BPMNDiagram id="BPMNDiagram_1">\n' +
      '    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Proc_' + processId + '">\n' +
      '      <bpmndi:BPMNShape id="Start_1_di" bpmnElement="Start_1"><dc:Bounds x="152" y="102" width="36" height="36"/></bpmndi:BPMNShape>\n' +
      '      <bpmndi:BPMNShape id="Task_1_di" bpmnElement="Task_1"><dc:Bounds x="240" y="80" width="100" height="80"/></bpmndi:BPMNShape>\n' +
      '      <bpmndi:BPMNShape id="End_1_di" bpmnElement="End_1"><dc:Bounds x="382" y="102" width="36" height="36"/></bpmndi:BPMNShape>\n' +
      '      <bpmndi:BPMNEdge id="Flow_1_di" bpmnElement="Flow_1"><di:waypoint x="188" y="120"/><di:waypoint x="240" y="120"/></bpmndi:BPMNEdge>\n' +
      '      <bpmndi:BPMNEdge id="Flow_2_di" bpmnElement="Flow_2"><di:waypoint x="340" y="120"/><di:waypoint x="382" y="120"/></bpmndi:BPMNEdge>\n' +
      '    </bpmndi:BPMNPlane>\n' +
      '  </bpmndi:BPMNDiagram>\n' +
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
