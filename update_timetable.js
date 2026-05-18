const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'timetable.html');
let content;

try {
    content = fs.readFileSync(filePath, 'utf-8');
} catch (err) {
    console.error(`Error reading ${filePath}: ${err.message}`);
    process.exit(1);
}

// Extract Monday's grid content
const mondayRegex = /(<div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4 lg:gap-6">\s*<!-- 8:00 AM.*?<\/div>\s*<!-- End of Monday Grid -->)/s;
const m = content.match(mondayRegex);

if (!m) {
    console.error('Failed to find Monday Grid');
    process.exit(1);
}

const mondayGrid = m[1];

// Generate grids for other days
const days = ['Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const replacements = [];

for (const day of days) {
    const dayLower = day.toLowerCase();
    let dayGrid = mondayGrid.replace('End of Monday Grid', `End of ${day} Grid`);
    
    // Optional: Change some subject names just so they don't all look identical
    if (day === 'Tuesday') {
        dayGrid = dayGrid.replace('Mathematics', 'English Language').replace('Mr. Thompson', 'Mrs. Johnson');
        dayGrid = dayGrid.replace('English Language', 'Mathematics').replace('Mrs. Johnson', 'Mr. Thompson');
    } else if (day === 'Wednesday') {
        dayGrid = dayGrid.replace('Mathematics', 'Chemistry').replace('Mr. Thompson', 'Dr. Williams');
        dayGrid = dayGrid.replace('English Language', 'Biology').replace('Mrs. Johnson', 'Mrs. Phronesis');
    } else if (day === 'Thursday') {
        dayGrid = dayGrid.replace('Mathematics', 'Physics').replace('Mr. Thompson', 'Mr. Anderson');
        dayGrid = dayGrid.replace('English Language', 'Technical Drawing').replace('Mrs. Johnson', 'Mr. Clark');
    } else if (day === 'Friday') {
        dayGrid = dayGrid.replace('Mathematics', 'Further Math').replace('Mr. Thompson', 'Mr. Thompson');
        dayGrid = dayGrid.replace('English Language', 'Civic Education').replace('Mrs. Johnson', 'Mrs. Peters');
    }

    const section = `      <!-- ${day} Schedule -->
      <section id="${dayLower}-schedule" class="schedule-section space-y-3 hidden">
        <h3 class="text-lg font-bold dark:text-white flex items-center gap-2 mb-2 md:mb-4">
          <span class="material-icons-outlined text-primary">schedule</span>
          ${day} Schedule
        </h3>
        ${dayGrid}
      </section>`;
    replacements.push(section);
}

const newSchedules = replacements.join('\n\n');

// Replace everything from Tuesday Schedule to the end of Friday Schedule
// We match from <!-- Tuesday Schedule --> to the end of the Friday section to avoid duplicates
// if the script is run multiple times. If only Tuesday exists, we still want to match up to its end.
const newContent = content.replace(
    /<!-- Tuesday Schedule -->[\s\S]*?(?:<!-- End of Friday Grid -->\s*<\/section>|<\/section>)/,
    newSchedules
);

try {
    fs.writeFileSync(filePath, newContent, 'utf-8');
    console.log("success");
} catch (err) {
    console.error(`Error writing ${filePath}: ${err.message}`);
    process.exit(1);
}
