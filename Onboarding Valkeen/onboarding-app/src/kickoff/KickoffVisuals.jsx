import { ui } from './kickoffStudioI18n';

/** Nur Tabellen-Vorschau für Workshop-Gates — keine Folienbilder. */
export function CapturePreviewTable({ slide, locale }) {
  const headers = slide.headers || [];
  const rows = slide.rows || [];
  const t = (k) => ui(locale, k);
  return (
    <div className="kickoff-capture-preview" aria-hidden>
      <table className="kickoff-table w-full">
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 3).map((row, ri) => (
            <tr key={ri}>
              {row.map((_, ci) => (
                <td key={ci}>
                  <div className="kickoff-capture-placeholder">{t('capturePlaceholder')}</div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
