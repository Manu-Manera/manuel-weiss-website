/**
 * HR Coach Workflow – gemeinsame Logik für alle Bereiche (Strategie, Recruiting, …)
 * Verwendung: Vor dem Laden areaId, areaTitle, categoryKeys und categoryTitles setzen.
 */
(function () {
    var areaId = window.HR_COACH_AREA_ID || 'strategie';
    var categoryKeys = window.HR_COACH_KEYS || ['c1','c2','c3','c4','c5','c6','c7','c8'];
    var categoryTitles = window.HR_COACH_TITLES || {};
    var areaData = {};
    categoryKeys.forEach(function (k) { areaData[k] = 1; });

    function updateArea(key, value) {
        var v = parseFloat(value, 10);
        areaData[key] = v;
        var el = document.getElementById(key + 'Value');
        if (el) el.textContent = v;
        updateOverall();
        saveToStorage();
    }

    function updateOverall() {
        var sum = categoryKeys.reduce(function (acc, k) { return acc + areaData[k]; }, 0);
        var avg = (sum / categoryKeys.length).toFixed(1);
        var scoreEl = document.getElementById('overallScore');
        if (scoreEl) scoreEl.textContent = avg;
        var labelEl = document.getElementById('scoreLabel');
        var recEl = document.getElementById('scoreRec');
        if (avg <= 1.5) {
            if (labelEl) labelEl.textContent = 'Anfänger';
            if (recEl) recEl.textContent = 'Fokus auf Grundlagen und erste Schritte';
        } else if (avg <= 2.5) {
            if (labelEl) labelEl.textContent = 'Entwicklung';
            if (recEl) recEl.textContent = 'Systematischer Aufbau';
        } else if (avg <= 3.5) {
            if (labelEl) labelEl.textContent = 'Fortgeschritten';
            if (recEl) recEl.textContent = 'Weitere Optimierung';
        } else if (avg <= 4.5) {
            if (labelEl) labelEl.textContent = 'Erfahren';
            if (recEl) recEl.textContent = 'Best Practices umsetzen';
        } else {
            if (labelEl) labelEl.textContent = 'Expert';
            if (recEl) recEl.textContent = 'Best-in-Class';
        }
        var progressPct = Math.round(((parseFloat(avg, 10) - 1) / 4) * 100);
        try { localStorage.setItem('hrCoach_' + areaId + '_progress', String(progressPct)); } catch (e) {}
    }

    function saveToStorage() {
        try { localStorage.setItem('hrCoach_' + areaId + '_data', JSON.stringify(areaData)); } catch (e) {}
    }

    window.saveProgress = function () {
        saveToStorage();
        updateOverall();
        var btn = document.querySelector('.hr-coach-btn-save');
        if (btn) {
            var orig = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> Gespeichert!';
            setTimeout(function () { btn.innerHTML = orig; }, 2000);
        }
    };

    function loadProgress() {
        try {
            var saved = localStorage.getItem('hrCoach_' + areaId + '_data');
            if (saved) {
                var data = JSON.parse(saved);
                categoryKeys.forEach(function (k) {
                    if (data[k] != null) {
                        areaData[k] = data[k];
                        var slider = document.getElementById(k);
                        var valueEl = document.getElementById(k + 'Value');
                        if (slider) slider.value = data[k];
                        if (valueEl) valueEl.textContent = data[k];
                    }
                });
            }
        } catch (e) {}
        updateOverall();
    }

    window.exportExcel = function () {
        var csv = 'Dimension;Bewertung (1-5)\n';
        categoryKeys.forEach(function (k) {
            csv += (categoryTitles[k] || k) + ';' + areaData[k] + '\n';
        });
        csv += '\nGesamt;' + (document.getElementById('overallScore') && document.getElementById('overallScore').textContent) + '\n';
        var blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'HR-Coach-' + areaId + '-Export.csv';
        a.click();
        URL.revokeObjectURL(a.href);
    };

    window.exportPDF = function () {
        var text = 'HR Coach Framework – ' + (window.HR_COACH_AREA_TITLE || areaId) + '\n';
        text += 'Erstellt: ' + new Date().toLocaleDateString('de-DE') + '\n\n';
        categoryKeys.forEach(function (k) {
            text += (categoryTitles[k] || k) + ': ' + areaData[k] + '/5\n';
        });
        text += '\nGesamtbewertung: ' + (document.getElementById('overallScore') && document.getElementById('overallScore').textContent) + '\n';
        var blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'HR-Coach-' + areaId + '-Report.txt';
        a.click();
        URL.revokeObjectURL(a.href);
    };

    window.updateArea = updateArea;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadProgress);
    } else {
        loadProgress();
    }
})();
