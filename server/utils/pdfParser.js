const pdfParse = require('pdf-parse');
const fs = require('fs');

/**
 * Parse a CISCE Sports Management System PDF and extract student data.
 *
 * PDF rows look like (all concatenated):
 * "126CISCE13528874AAYUSHMAAN SINGHAMIT KUMAR SINGHU19-Boys28/02/200917895734427012Badminton Singles"
 *
 * Format: SerialNo + RegistrationID + PlayerName + FatherName + Category + DOB + Age + Phone + Class + Variant
 */
async function extractStudentsFromPDF(filepath) {
  const dataBuffer = fs.readFileSync(filepath);
  const pdfData = await pdfParse(dataBuffer);

  const text = pdfData.text;
  const students = [];
  const seen = new Set();

  // Extract school name from header
  let schoolName = '';
  const schoolMatch = text.match(/SCHOOL:\s*(.+?)(?:\n|\()/);
  if (schoolMatch) schoolName = schoolMatch[1].trim();

  // Extract category from header
  let pdfCategory = '';
  const categoryMatch = text.match(/CATEGORY:\s*(.+?)(?:\n)/);
  if (categoryMatch) pdfCategory = categoryMatch[1].trim();

  let gender = '';
  if (pdfCategory.toLowerCase().includes('boys')) gender = 'Male';
  else if (pdfCategory.toLowerCase().includes('girls')) gender = 'Female';

  console.log('📄 PDF School:', schoolName, '| Category:', pdfCategory, '| Gender:', gender);

  // Process line by line
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Match: digit(s) + 2-digit-year + "CISCE" + 8-digit-code + rest
    const entryMatch = line.match(/^\d{1,3}(\d{2}CISCE\d{8})(.*)/);
    if (!entryMatch) continue;

    // Skip coach/manager entries (they have C prefix like 1C26CISCE...)
    if (line.match(/^\d{1,3}C\d{2}CISCE/)) continue;

    const registrationId = entryMatch[1];
    let remainder = entryMatch[2];

    // If the line is incomplete, grab continuation lines
    let fullBlock = remainder;
    for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
      if (lines[j].match(/^\d{1,3}\d{2}CISCE/) || lines[j].match(/^\d{1,3}C\d{2}CISCE/) || lines[j].match(/COACH|MANAGER|Generated/)) break;
      if (lines[j].match(/Badminton|Singles|Doubles|\(Sb\)/i) || !lines[j].match(/^\d{1,3}\d{2}CISCE/)) {
        fullBlock += ' ' + lines[j];
      }
    }

    // --- Extract event category ---
    let eventCategory = 'Singles';
    if (/Badminton\s*Doubles/i.test(fullBlock)) eventCategory = 'Doubles';
    else if (/Mixed\s*Doubles/i.test(fullBlock)) eventCategory = 'Mixed Doubles';
    else if (/Badminton\s*Singles/i.test(fullBlock)) eventCategory = 'Singles';

    // --- Split at category marker (U19-Boys, U14-Girls, etc.) ---
    const catSplit = remainder.match(/^(.+?)(U\d{2}-(?:Boys|Girls))(.*)/i);
    let nameSection = '';
    let ageCategory = pdfCategory;
    let dob = '';
    let className = '';

    if (catSplit) {
      nameSection = catSplit[1].trim();
      ageCategory = catSplit[2]; // e.g. "U19-Boys"
      const afterCat = catSplit[3];

      // Extract DOB (dd/mm/yyyy format)
      const dobMatch = afterCat.match(/(\d{2}\/\d{2}\/\d{4})/);
      if (dobMatch) dob = dobMatch[1];

      // Extract class (1-2 digit number before "Badminton" or end)
      const classMatch = afterCat.match(/(\d{1,2})(?:\s*Badminton|\s*$)/);
      if (classMatch) {
        const num = parseInt(classMatch[1]);
        if (num >= 1 && num <= 12) className = String(num);
      }
    }

    // --- Split Player Name and Father's Name ---
    // nameSection is like "AAYUSHMAAN SINGHAMIT KUMAR SINGH"
    // Player: AAYUSHMAAN SINGH, Father: AMIT KUMAR SINGH
    // They are concatenated without a space between last word of player name and first word of father name
    const { playerName, fatherName } = splitPlayerAndFather(nameSection);

    // De-duplicate by registrationId
    const key = registrationId;
    if (!seen.has(key)) {
      seen.add(key);
      students.push({
        registrationId,
        name: toTitleCase(playerName),
        fatherName: toTitleCase(fatherName),
        school: schoolName,
        class: className,
        section: '',
        gender,
        category: ageCategory,
        dob,
        eventCategory,
      });
    }
  }

  console.log('✅ Extracted', students.length, 'unique students from PDF');

  return {
    totalPages: pdfData.numpages,
    rawText: text.substring(0, 1000),
    students,
  };
}

/**
 * Split concatenated player name and father's name.
 *
 * Input: "AAYUSHMAAN SINGHAMIT KUMAR SINGH"
 * The words are: ["AAYUSHMAAN", "SINGHAMIT", "KUMAR", "SINGH"]
 *
 * "SINGHAMIT" is actually "SINGH" (end of player name) + "AMIT" (start of father name)
 * We detect this by checking if a word can be split into two known name parts.
 *
 * Fallback: first 2 words = player name, rest = father name
 */
function splitPlayerAndFather(nameSection) {
  if (!nameSection) return { playerName: 'Unknown', fatherName: '' };

  const cleaned = nameSection.replace(/\s+/g, ' ').trim();
  const words = cleaned.split(' ');

  if (words.length <= 1) {
    return { playerName: cleaned, fatherName: '' };
  }

  // Common Indian surname endings that might be concatenated with the start of father's name
  const commonSuffixes = [
    'SINGH', 'KUMAR', 'PATEL', 'SHARMA', 'VERMA', 'GUPTA', 'KHAN',
    'PANDEY', 'MISHRA', 'TIWARI', 'YADAV', 'JAIN', 'RAI', 'SAH',
    'DAS', 'ROY', 'DEV', 'NATH', 'LAL', 'RAM', 'PRASAD', 'CHAUHAN',
    'RATHORE', 'THAKUR', 'JOSHI', 'DUBEY', 'SHUKLA', 'SAXENA',
    'AGARWAL', 'BANSAL', 'GOEL', 'MEHTA', 'SHAH', 'REDDY', 'NAIR',
    'MENON', 'IYER', 'BHAT', 'SINHA', 'BOSE', 'SEN', 'DUTTA',
  ];

  // Try to find a word that's a concatenation of two names
  for (let i = 0; i < words.length; i++) {
    const word = words[i].toUpperCase();

    for (const suffix of commonSuffixes) {
      if (word.length > suffix.length && word.startsWith(suffix)) {
        // This word starts with a surname and has more text after it
        // e.g., "SINGHAMIT" → "SINGH" + "AMIT"
        const playerParts = [...words.slice(0, i), suffix];
        const fatherFirstPart = word.substring(suffix.length);
        const fatherParts = [fatherFirstPart, ...words.slice(i + 1)];

        return {
          playerName: playerParts.join(' '),
          fatherName: fatherParts.join(' '),
        };
      }

      if (word.length > suffix.length && word.endsWith(suffix)) {
        // This word ends with a surname prefix
        // e.g., "PATELUDAI" → "PATEL" + "UDAI"
        const playerFirstPart = word.substring(0, word.length - suffix.length);
        // Check if the remaining part is at least 2 chars (a valid name start)
        if (playerFirstPart.length >= 2) {
          // Actually this means the word ENDS with a common name, so
          // playerName includes up to here, fatherName starts with suffix
          const playerParts = [...words.slice(0, i), word.substring(0, word.length - suffix.length)];
          const fatherParts = [suffix, ...words.slice(i + 1)];

          // This doesn't seem right — let's skip endsWith for now
        }
      }
    }

    // Also check if a word contains a known surname in the middle
    for (const suffix of commonSuffixes) {
      const idx = word.indexOf(suffix);
      if (idx > 0 && idx + suffix.length < word.length) {
        // Found surname in the middle: e.g., "PATELUDAI" has "PATEL" at start
        const beforeSuffix = word.substring(0, idx + suffix.length);
        const afterSuffix = word.substring(idx + suffix.length);

        if (afterSuffix.length >= 2) {
          const playerParts = [...words.slice(0, i), beforeSuffix];
          const fatherParts = [afterSuffix, ...words.slice(i + 1)];
          return {
            playerName: playerParts.join(' '),
            fatherName: fatherParts.join(' '),
          };
        }
      }
    }
  }

  // Fallback: first 2 words = player, rest = father
  if (words.length >= 4) {
    return {
      playerName: words.slice(0, 2).join(' '),
      fatherName: words.slice(2).join(' '),
    };
  } else if (words.length === 3) {
    return {
      playerName: words.slice(0, 2).join(' '),
      fatherName: words[2],
    };
  }

  return { playerName: cleaned, fatherName: '' };
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

module.exports = { extractStudentsFromPDF };
