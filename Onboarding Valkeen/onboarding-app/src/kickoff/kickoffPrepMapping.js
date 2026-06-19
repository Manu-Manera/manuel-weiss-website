/**
 * Fragebogen-Antworten → session.answers (Kick-off-Folien).
 * Wird bei prep-submit in der Lambda angewendet (Spiegelung hier für Tests/Doku).
 */
export function mapPrepAnswersToSession(prepAnswers = {}) {
  const answers = {};
  const a = prepAnswers;

  if (a['purpose.goals'] || a['purpose.main']) {
    answers['success-metrics'] = {
      questionAnswers: [
        '',
        a['purpose.goals'] || '',
        a['purpose.challenges'] || '',
        '',
      ],
    };
  }

  if (a['team.inner'] || a['team.champions'] || a['team.owner']) {
    const lines = [a['team.inner'], a['team.champions'], a['team.owner']].filter(Boolean);
    answers['team'] = {
      rows: lines.map((line) => {
        const parts = String(line).split('·').map((p) => p.trim());
        return [parts[0] || line, parts[1] || '', parts[2] || '', parts[3] || ''];
      }),
    };
  }

  if (a['data.migration.historical'] || a['data.migration.scope']) {
    answers['data-migration'] = {
      questionAnswers: [
        '',
        '',
        '',
        [a['data.migration.historical'], a['data.migration.scope']].filter(Boolean).join(' — '),
      ],
    };
  }

  if (a['state.current'] || a['state.future']) {
    answers['ways-of-working'] = {
      questionAnswers: [
        a['state.current'] || '',
        '',
        '',
        a['state.future'] || '',
      ],
    };
  }

  return answers;
}
