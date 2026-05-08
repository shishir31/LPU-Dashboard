const xlsx = require('xlsx');

function extractStudentsFromExcel(buffer) {
  // Read the workbook from buffer
  const workbook = xlsx.read(buffer, { type: 'buffer' });
  
  // Use the first sheet
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  
  // Convert sheet to an array of arrays (each array is a row)
  const rows = xlsx.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

  let schoolName = '';
  let pdfCategory = '';
  let gender = '';

  const students = [];
  const seen = new Set();

  let headerRowIndex = -1;
  let colMap = {};

  // Find School, Category and the Table Header
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    
    // Convert row to a single concatenated string for easy searching
    const rowStr = row.join(' ').replace(/\s+/g, ' ').trim();

    // Look for School
    const schoolMatch = rowStr.match(/SCHOOL:\s*(.+?)(?:\s|$|u\d{2})/i);
    if (schoolMatch && !schoolName) {
      schoolName = schoolMatch[1].trim();
    }

    // Look for Category
    const categoryMatch = rowStr.match(/CATEGORY:\s*(U\d{2}-(?:Boys|Girls))/i);
    if (categoryMatch && !pdfCategory) {
      pdfCategory = categoryMatch[1].trim();
    }

    // Check if this is the header row
    if (headerRowIndex === -1 && rowStr.toLowerCase().includes('registration') && rowStr.toLowerCase().includes('name')) {
      headerRowIndex = i;
      
      // Map columns
      for (let j = 0; j < row.length; j++) {
        const cell = String(row[j]).toLowerCase();
        if (cell.includes('registration') || cell.includes('uid')) colMap.registrationId = j;
        else if (cell.includes('father')) colMap.fatherName = j;
        else if (cell.includes('name') && !cell.includes('father')) colMap.name = j;
        else if (cell.includes('dob') || cell.includes('birth')) colMap.dob = j;
        else if (cell.includes('class')) colMap.class = j;
        else if (cell.includes('event') || cell.includes('variant')) colMap.eventCategory = j;
        else if (cell.includes('category')) colMap.category = j; // Optional, usually category is in header
      }
    }
  }

  // If we couldn't find the school or category via regex on the rows, fallback
  if (!schoolName) schoolName = 'Unknown School';
  if (pdfCategory) {
    if (pdfCategory.toLowerCase().includes('boys')) gender = 'Male';
    else if (pdfCategory.toLowerCase().includes('girls')) gender = 'Female';
  } else {
    pdfCategory = 'Unknown Category';
  }

  console.log('📊 Excel School:', schoolName, '| Category:', pdfCategory, '| Gender:', gender);

  if (headerRowIndex === -1) {
    throw new Error('Could not find data headers (Registration, Name) in the Excel file.');
  }

  // Parse Data Rows
  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    
    // Skip empty rows
    if (row.length === 0 || !row.some(cell => String(cell).trim() !== '')) continue;

    let registrationId = '';
    if (colMap.registrationId !== undefined) registrationId = String(row[colMap.registrationId]).trim();

    // Skip rows without a registration ID (like coach/manager)
    if (!registrationId || !registrationId.includes('CISCE')) continue;
    if (registrationId.match(/^\d{1,3}C/)) continue; // Coach ID

    // Remove any prefixed serial numbers like "1 24CISCE..." or "126CISCE..." 
    // This handles if the S.No was concatenated with the Reg ID
    const regMatch = registrationId.match(/(\d{2}CISCE\d{8})/);
    if (regMatch) {
      registrationId = regMatch[1];
    }

    let name = colMap.name !== undefined ? String(row[colMap.name]).trim() : 'Unknown';
    let fatherName = colMap.fatherName !== undefined ? String(row[colMap.fatherName]).trim() : '';
    let dob = colMap.dob !== undefined ? String(row[colMap.dob]).trim() : '';
    let className = colMap.class !== undefined ? String(row[colMap.class]).trim() : '';
    let eventCategory = colMap.eventCategory !== undefined ? String(row[colMap.eventCategory]).trim() : 'Singles';
    let category = colMap.category !== undefined && String(row[colMap.category]).trim() ? String(row[colMap.category]).trim() : pdfCategory;

    // Clean up event category
    if (/Badminton\s*Doubles/i.test(eventCategory)) eventCategory = 'Doubles';
    else if (/Mixed\s*Doubles/i.test(eventCategory)) eventCategory = 'Mixed Doubles';
    else if (/Badminton\s*Singles/i.test(eventCategory)) eventCategory = 'Singles';
    else if (!eventCategory) eventCategory = 'Singles';

    // Format DOB if it's an Excel serial number
    if (typeof row[colMap.dob] === 'number') {
      const date = xlsx.SSF.parse_date_code(row[colMap.dob]);
      if (date) {
        dob = `${String(date.d).padStart(2, '0')}/${String(date.m).padStart(2, '0')}/${date.y}`;
      }
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
        gender,
        category,
        dob,
        eventCategory,
      });
    }
  }

  console.log('✅ Extracted', students.length, 'unique students from Excel');

  return {
    totalPages: 1, // Excel is considered 1 page for our context
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
