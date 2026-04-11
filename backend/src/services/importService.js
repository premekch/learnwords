const XLSX = require('xlsx');

/**
 * Parse an uploaded .xlsx or .csv file.
 * Expects a header row (skipped) followed by rows with two columns:
 *   Column A: source word
 *   Column B: target word
 *
 * @param {Express.Multer.File} file
 * @returns {{ source: string, target: string }[]}
 */
exports.parseFile = (file) => {
  const workbook = XLSX.read(file.buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // header: 1 → returns array of arrays
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

  if (rows.length < 2) return [];

  // Skip header row (index 0)
  return rows
    .slice(1)
    .filter((row) => row.length >= 2)
    .map((row) => ({
      source: String(row[0]).trim(),
      target: String(row[1]).trim(),
    }))
    .filter((row) => row.source && row.target);
};
