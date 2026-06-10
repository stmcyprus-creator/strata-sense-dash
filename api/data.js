function parseCSV(text) {
  const rows = [];
  let row = [], field = '', inQuotes = false;
  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') { row.push(field); field = ''; }
      else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
      else field += c;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  if (!rows.length) return [];
  const headers = rows[0].map(h => h.trim());
  return rows.slice(1)
    .filter(r => r.some(c => c.trim() !== ''))
    .map(r => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = (r[i] || '').trim(); });
      return obj;
    });
}

export default async function handler(req, res) {
  try {
    const [works, estimates, problems] = await Promise.all([
      fetch(process.env.SHEET_WORKS_URL).then(r => r.text()),
      fetch(process.env.SHEET_ESTIMATES_URL).then(r => r.text()),
      fetch(process.env.SHEET_PROBLEMS_URL).then(r => r.text()),
    ]);
    res.setHeader('Cache-Control', 's-maxage=60');
    res.status(200).json({
      works: parseCSV(works),
      estimates: parseCSV(estimates),
      problems: parseCSV(problems),
    });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
