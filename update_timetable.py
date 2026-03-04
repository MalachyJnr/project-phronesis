import os
import re

file_path = r'c:\Users\SECOND USER\Desktop\PS_Academy\timetable.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Extract Monday's grid content
m = re.search(r'(<div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4 lg:gap-6">\s*<!-- 8:00 AM.*?</div>\s*<!-- End of Monday Grid -->)', content, re.DOTALL)
if not m:
    print('Failed to find Monday Grid')
    exit(1)

monday_grid = m.group(1)

# Generate grids for other days
days = ['Tuesday', 'Wednesday', 'Thursday', 'Friday']
replacements = []

for day in days:
    day_lower = day.lower()
    day_grid = monday_grid.replace('End of Monday Grid', f'End of {day} Grid')
    
    # Optional: Change some subject names just so they don\'t all look identical
    if day == 'Tuesday':
        day_grid = day_grid.replace('Mathematics', 'English Language', 1).replace('Mr. Thompson', 'Mrs. Johnson', 1)
        day_grid = day_grid.replace('English Language', 'Mathematics', 1).replace('Mrs. Johnson', 'Mr. Thompson', 1)
    elif day == 'Wednesday':
        day_grid = day_grid.replace('Mathematics', 'Chemistry', 1).replace('Mr. Thompson', 'Dr. Williams', 1)
        day_grid = day_grid.replace('English Language', 'Biology', 1).replace('Mrs. Johnson', 'Mrs. Phronesis', 1)
    elif day == 'Thursday':
        day_grid = day_grid.replace('Mathematics', 'Physics', 1).replace('Mr. Thompson', 'Mr. Anderson', 1)
        day_grid = day_grid.replace('English Language', 'Technical Drawing', 1).replace('Mrs. Johnson', 'Mr. Clark', 1)
    elif day == 'Friday':
        day_grid = day_grid.replace('Mathematics', 'Further Math', 1).replace('Mr. Thompson', 'Mr. Thompson', 1)
        day_grid = day_grid.replace('English Language', 'Civic Education', 1).replace('Mrs. Johnson', 'Mrs. Peters', 1)

    section = f'''      <!-- {day} Schedule -->
      <section id="{day_lower}-schedule" class="schedule-section space-y-3 hidden">
        <h3 class="text-lg font-bold dark:text-white flex items-center gap-2 mb-2 md:mb-4">
          <span class="material-icons-outlined text-primary">schedule</span>
          {day} Schedule
        </h3>
        {day_grid}
      </section>'''
    replacements.append(section)

new_schedules = '\n\n'.join(replacements)

# Replace everything from Tuesday Schedule to the end of Friday Schedule
new_content = re.sub(r'<!-- Tuesday Schedule -->.*?</section>', new_schedules, content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("success")
