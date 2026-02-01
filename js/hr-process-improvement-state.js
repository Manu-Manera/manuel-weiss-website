/**
 * HR Process Improvement State – localStorage API für Prozess-Optimierung
 * Keys: status, notes, sketchDataUrl, dictationText, bpmnXml, bpmnGeneratedAt, lastUpdated
 */
(function (global) {
    var STORAGE_KEY = 'hrProcessImprovement';
    var SKETCH_MAX_LENGTH = 450000;

    function getRaw() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch (e) {
            return {};
        }
    }

    function setRaw(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            return true;
        } catch (e) {
            if (e.name === 'QuotaExceededError') {
                console.warn('localStorage full');
                return false;
            }
            throw e;
        }
    }

    function defaultState() {
        return {
            status: 'pending',
            lastUpdated: null,
            notes: '',
            sketchDataUrl: '',
            dictationText: '',
            bpmnXml: '',
            bpmnGeneratedAt: null
        };
    }

    function getProcessState(processId) {
        var data = getRaw();
        var state = data[processId];
        if (!state) return defaultState();
        return {
            status: state.status || 'pending',
            lastUpdated: state.lastUpdated || null,
            notes: state.notes || '',
            sketchDataUrl: state.sketchDataUrl || '',
            dictationText: state.dictationText || '',
            bpmnXml: state.bpmnXml || '',
            bpmnGeneratedAt: state.bpmnGeneratedAt || null
        };
    }

    function setProcessState(processId, partial) {
        var data = getRaw();
        var current = data[processId] || defaultState();
        var updated = Object.assign({}, current, partial, { lastUpdated: new Date().toISOString() });
        data[processId] = updated;
        return setRaw(data);
    }

    function setProcessStatus(processId, status) {
        return setProcessState(processId, { status: status });
    }

    function getNotes(processId) {
        return getProcessState(processId).notes;
    }

    function saveNotes(processId, text) {
        return setProcessState(processId, { notes: text || '' });
    }

    function getSketch(processId) {
        return getProcessState(processId).sketchDataUrl;
    }

    function saveSketch(processId, dataUrl) {
        if (dataUrl && dataUrl.length > SKETCH_MAX_LENGTH) {
            console.warn('Sketch too large, may fail to save');
        }
        return setProcessState(processId, { sketchDataUrl: dataUrl || '' });
    }

    function getDictation(processId) {
        return getProcessState(processId).dictationText;
    }

    function saveDictation(processId, text) {
        return setProcessState(processId, { dictationText: text || '' });
    }

    function getBpmn(processId) {
        var s = getProcessState(processId);
        return { xml: s.bpmnXml, generatedAt: s.bpmnGeneratedAt };
    }

    function saveBpmn(processId, xml, generatedAt) {
        return setProcessState(processId, {
            bpmnXml: xml || '',
            bpmnGeneratedAt: generatedAt || null
        });
    }

    function getAllProcessesWithState(registry) {
        var data = getRaw();
        return (registry || []).map(function (p) {
            var state = data[p.id] || defaultState();
            return {
                id: p.id,
                name: p.name,
                icon: p.icon,
                color: p.color,
                description: p.description,
                status: state.status,
                lastUpdated: state.lastUpdated,
                hasNotes: !!(state.notes && state.notes.trim()),
                hasSketch: !!(state.sketchDataUrl && state.sketchDataUrl.length > 0),
                hasDictation: !!(state.dictationText && state.dictationText.trim()),
                hasBpmn: !!(state.bpmnXml && state.bpmnXml.trim())
            };
        });
    }

    global.HRProcessImprovementState = {
        getProcessState: getProcessState,
        setProcessState: setProcessState,
        setProcessStatus: setProcessStatus,
        getNotes: getNotes,
        saveNotes: saveNotes,
        getSketch: getSketch,
        saveSketch: saveSketch,
        getDictation: getDictation,
        saveDictation: saveDictation,
        getBpmn: getBpmn,
        saveBpmn: saveBpmn,
        getAllProcessesWithState: getAllProcessesWithState
    };
})(typeof window !== 'undefined' ? window : this);
