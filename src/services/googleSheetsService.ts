import { TrainingWeek } from '../types';
import { PACING_ZONES, GOLDEN_RULES } from '../data/marathonPlanData';

export interface CreateSheetResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
}

export const createTrainingSpreadsheet = async (
  accessToken: string,
  plan: TrainingWeek[],
  customTitle = '18-Week Marathon Training Plan'
): Promise<CreateSheetResult> => {
  // Build row data for the Training Plan & Log sheet
  const planRows: any[][] = [];

  // Row 1: Banner Header
  planRows.push(['18-WEEK MARATHON TRAINING PLAN & WORKOUT TRACKER', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']);
  // Row 2: Target summary
  planRows.push(['Goal Marathon Pace (GMP): 5:40 /km', 'Target Race: 42.2 km', 'Cycle: Oct 12 – Feb 14', '', '', '', '', '', '', '', '', '', '', '', '', '']);
  // Row 3: Blank separator
  planRows.push([]);
  // Row 4: Column Headers
  planRows.push([
    'Week',
    'Date (Mon)',
    'Monday (Recovery)',
    'Tuesday (Aerobic)',
    'Wednesday (Rest)',
    'Thursday (Quality Workout)',
    'Thursday Details',
    'Friday (Easy)',
    'Saturday (Rest)',
    'Sunday (Long Run)',
    'Sunday Details',
    'Planned Dist (km)',
    'Actual Dist (km)',
    'Total Duration',
    'Avg Pace',
    'Notes / Progress',
  ]);

  // Rows 5-22: 18 Weeks data
  plan.forEach((w) => {
    planRows.push([
      `Week ${w.weekNumber}`,
      w.dateMon,
      `${w.days.monday.plannedKm} km (${w.days.monday.targetPace || 'Recovery'})`,
      `${w.days.tuesday.plannedKm} km (${w.days.tuesday.targetPace || 'Aerobic'})`,
      'Rest',
      `${w.days.thursday.plannedKm} km (${w.days.thursday.title})`,
      w.days.thursday.details || '',
      `${w.days.friday.plannedKm} km (Easy)`,
      'Rest',
      `${w.days.sunday.plannedKm} km (${w.days.sunday.title})`,
      w.days.sunday.details || '',
      w.plannedDist,
      w.actualDist !== undefined ? w.actualDist : '',
      w.totalDuration || '',
      w.avgPace || '',
      w.notes || '',
    ]);
  });

  // Row 23: Totals
  planRows.push([
    'TOTALS',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '=SUM(L5:L22)',
    '=SUM(M5:M22)',
    '',
    '',
    'All 18 Weeks Completed',
  ]);

  // Build Pacing & Golden Rules Sheet
  const rulesRows: any[][] = [];
  rulesRows.push(['RUN DETAILS & PACING GUIDELINES', '', '', '']);
  rulesRows.push(['Pacing Zone', 'Pace Target', 'Effort (RPE)', 'Purpose & Guidance']);
  PACING_ZONES.forEach((z) => {
    rulesRows.push([z.name, z.paceRange, z.effortRpe, `${z.purpose} — ${z.description}`]);
  });
  rulesRows.push([]);
  rulesRows.push(['GOLDEN RULES FOR GMP (GOAL MARATHON PACE) BLOCKS', '', '', '']);
  rulesRows.push(['Rule #', 'Title', 'Guideline & Actionable Advice', '']);
  GOLDEN_RULES.forEach((r) => {
    rulesRows.push([`Rule ${r.id}`, r.title, r.content, '']);
  });

  const requestBody = {
    properties: {
      title: customTitle,
    },
    sheets: [
      {
        properties: {
          title: 'Training Schedule & Log',
          gridProperties: {
            frozenRowCount: 4,
            frozenColumnCount: 2,
          },
        },
        data: [
          {
            startRow: 0,
            startColumn: 0,
            rowData: planRows.map((row) => ({
              values: row.map((val) => ({
                userEnteredValue:
                  typeof val === 'number'
                    ? { numberValue: val }
                    : typeof val === 'string' && val.startsWith('=')
                    ? { formulaValue: val }
                    : { stringValue: String(val ?? '') },
              })),
            })),
          },
        ],
      },
      {
        properties: {
          title: 'Pacing & Golden Rules',
          gridProperties: {
            frozenRowCount: 2,
          },
        },
        data: [
          {
            startRow: 0,
            startColumn: 0,
            rowData: rulesRows.map((row) => ({
              values: row.map((val) => ({
                userEnteredValue: { stringValue: String(val ?? '') },
              })),
            })),
          },
        ],
      },
    ],
  };

  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Failed to create spreadsheet (HTTP ${response.status})`);
  }

  const result = await response.json();
  const spreadsheetId = result.spreadsheetId;
  const spreadsheetUrl = result.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  return { spreadsheetId, spreadsheetUrl };
};

export const syncPlanToSpreadsheet = async (
  accessToken: string,
  spreadsheetId: string,
  plan: TrainingWeek[]
): Promise<void> => {
  // Columns M to P in row 5 to 22:
  // M: Actual Dist (km)
  // N: Total Duration
  // O: Avg Pace
  // P: Notes / Progress
  const rows = plan.map((w) => [
    w.actualDist !== undefined && w.actualDist !== null ? w.actualDist : '',
    w.totalDuration || '',
    w.avgPace || '',
    w.notes || '',
  ]);

  const range = `'Training Schedule & Log'!M5:P22`;

  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
      range
    )}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range,
        majorDimension: 'ROWS',
        values: rows,
      }),
    }
  );

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Failed to sync with spreadsheet (HTTP ${response.status})`);
  }
};

export const verifySpreadsheetAccess = async (
  accessToken: string,
  spreadsheetId: string
): Promise<{ title: string; sheets: string[] }> => {
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=properties.title,sheets.properties.title`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Spreadsheet not found or access denied`);
  }

  const data = await response.json();
  const title = data.properties?.title || 'Marathon Training Plan';
  const sheets = (data.sheets || []).map((s: any) => s.properties?.title || '');

  return { title, sheets };
};
