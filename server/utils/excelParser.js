const xlsx = require('xlsx');

function extractStudentsFromExcel(buffer) {
  const workbook = xlsx.read(buffer, { type: 'buffer' });
  const students = [];
  const seen = new Set();

  // Iterate over all sheets in the workbook
  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

    if (rows.length === 0) continue;

    let sheetCategory = '';
    let sheetGender = '';
    
    // Try to get category from sheet name first
    const catMatch = sheetName.match(/(U\d{2}-(?:Boys|Girls))/i);
    if (catMatch) {
      sheetCategory = catMatch[1];
    } else {
      // Look in the first few rows (e.g. A1)
      for (let i = 0; i < Math.min(5, rows.length); i++) {
        const rowStr = rows[i].join(' ').replace(/\s+/g, ' ').trim();
        const rMatch = rowStr.match(/(U\d{2}-(?:Boys|Girls))/i);
        if (rMatch) {
          sheetCategory = rMatch[1];
          break;
        }
      }
    }

    if (sheetCategory.toLowerCase().includes('boys')) sheetGender = 'Male';
    else if (sheetCategory.toLowerCase().includes('girls')) sheetGender = 'Female';

    let headerRowIndex = -1;
    let colMap = {
      singlesCols: [],
      doublesCols: []
    };

    // Find the Table Header
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowStr = row.join(' ').toLowerCase();

      if (headerRowIndex === -1 && rowStr.includes('registration') && rowStr.includes('name')) {
        headerRowIndex = i;
        
        // Map columns
        for (let j = 0; j < row.length; j++) {
          const cell = String(row[j]).toLowerCase();
          if (cell.includes('registration') || cell.includes('uid')) colMap.registrationId = j;
          else if (cell.includes('father')) colMap.fatherName = j;
          else if (cell.includes('player name') || (cell.includes('name') && !cell.includes('school'))) colMap.name = j;
          else if (cell.includes('school name')) colMap.schoolName = j;
          else if (cell.includes('dob') || cell.includes('birth')) colMap.dob = j;
          else if (cell.includes('class')) colMap.class = j;
          else if (cell.includes('singles')) colMap.singlesCols.push(j);
          else if (cell.includes('doubles')) colMap.doublesCols.push(j);
        }
        break; // found header
      }
    }

    if (headerRowIndex === -1) {
      console.warn(`Could not find data headers in sheet: ${sheetName}`);
      continue;
    }

    // Parse Data Rows for this sheet
    for (let i = headerRowIndex + 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length === 0 || !row.some(cell => String(cell).trim() !== '')) continue;

      let registrationId = '';
      if (colMap.registrationId !== undefined) registrationId = String(row[colMap.registrationId]).trim();

      if (!registrationId || !registrationId.includes('CISCE')) continue;
      if (registrationId.match(/^\d{1,3}C/)) continue; // Coach ID

      const regMatch = registrationId.match(/(\d{2}CISCE\d{8})/);
      if (regMatch) registrationId = regMatch[1];

      let name = colMap.name !== undefined ? String(row[colMap.name]).trim() : 'Unknown';
      
      // Clean up name if it has (UP...) suffix
      const nameMatch = name.match(/(.+?)\s*\([A-Z0-9]+\)/i);
      if (nameMatch) name = nameMatch[1];

      let schoolName = colMap.schoolName !== undefined ? String(row[colMap.schoolName]).trim() : 'Unknown';
      let fatherName = colMap.fatherName !== undefined ? String(row[colMap.fatherName]).trim() : '';
      let dob = colMap.dob !== undefined ? String(row[colMap.dob]).trim() : '';
      let className = colMap.class !== undefined ? String(row[colMap.class]).trim() : '';
      
      let eventCategory = 'Singles'; // Default
      
      // Check doubles columns first, then singles
      for (const idx of colMap.doublesCols) {
        const val = String(row[idx]).trim();
        if (val && val !== '0' && val !== 'false') {
          eventCategory = 'Doubles';
          break;
        }
      }
      
      if (eventCategory !== 'Doubles') {
        for (const idx of colMap.singlesCols) {
          const val = String(row[idx]).trim();
          if (val && val !== '0' && val !== 'false') {
            eventCategory = 'Singles';
            break;
          }
        }
      }

      if (typeof row[colMap.dob] === 'number') {
        const date = xlsx.SSF.parse_date_code(row[colMap.dob]);
        if (date) dob = `${String(date.d).padStart(2, '0')}/${String(date.m).padStart(2, '0')}/${date.y}`;
      }

      const key = registrationId;
      if (!seen.has(key)) {
        seen.add(key);
        students.push({
          registrationId,
          name: toTitleCase(name),
          fatherName: toTitleCase(fatherName),
          school: schoolName,
          class: className,
          section: '',
          gender: sheetGender,
          category: sheetCategory || 'Unknown Category',
          dob,
          eventCategory,
        });
      }
    }
  }

  console.log('✅ Extracted', students.length, 'unique students from Excel across', workbook.SheetNames.length, 'sheets');

  if (students.length === 0) {
     throw new Error('Could not extract any students from the Excel file. Please ensure it follows the standard CISCE report format.');
  }

  return {
    totalPages: workbook.SheetNames.length,
    students,
  };
}

function toTitleCase(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

module.exports = { extractStudentsFromExcel };
