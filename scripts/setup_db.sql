-- Results Module Database Migration and Seed Script

-- 1. Drop existing tables if they exist (in correct dependency order)
DROP TABLE IF EXISTS result_subjects;
DROP TABLE IF EXISTS student_results;
DROP TABLE IF EXISTS subject_teachers;
DROP TABLE IF EXISTS terms;
DROP TABLE IF EXISTS sessions;

-- 2. Create 'sessions' table
CREATE TABLE sessions (
  session_id INT AUTO_INCREMENT PRIMARY KEY,
  session_name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Create 'terms' table
CREATE TABLE terms (
  term_id INT AUTO_INCREMENT PRIMARY KEY,
  term_name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Create 'subject_teachers' table (linking Subjects, Teachers, and Classes)
CREATE TABLE subject_teachers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subject_id INT NOT NULL,
  teacher_id INT NOT NULL,
  class_id INT NOT NULL,
  FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE CASCADE,
  UNIQUE KEY idx_subject_teacher_class (subject_id, teacher_id, class_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Create 'student_results' table (Result Summary)
CREATE TABLE student_results (
  result_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  session_id INT NOT NULL,
  term_id INT NOT NULL,
  class_id INT NOT NULL,
  total_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  average_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  gpa DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  cgpa DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  grade VARCHAR(10) NOT NULL DEFAULT '',
  class_position INT NOT NULL DEFAULT 0,
  total_students INT NOT NULL DEFAULT 0,
  remarks TEXT,
  FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
  FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE,
  FOREIGN KEY (term_id) REFERENCES terms(term_id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE CASCADE,
  UNIQUE KEY idx_student_session_term (student_id, session_id, term_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Create 'result_subjects' table (Subject Results Breakdown)
CREATE TABLE result_subjects (
  result_subject_id INT AUTO_INCREMENT PRIMARY KEY,
  result_id INT NOT NULL,
  subject_id INT NOT NULL,
  ca_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  mid_term_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  exam_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  total_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  grade VARCHAR(10) NOT NULL DEFAULT '',
  remarks TEXT,
  FOREIGN KEY (result_id) REFERENCES student_results(result_id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE CASCADE,
  UNIQUE KEY idx_result_subject (result_id, subject_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ─── SEED DATA ──────────────────────────────────────────────────────────────

-- Seed academic sessions
INSERT INTO sessions (session_id, session_name) VALUES
(1, '2024/2025'),
(2, '2025/2026');

-- Seed terms
INSERT INTO terms (term_id, term_name) VALUES
(1, 'Term 1'),
(2, 'Term 2'),
(3, 'Term 3');

-- Seed subject-teacher mappings for classes (JSS1 = class_id 1, JSS2 = class_id 2)
INSERT INTO subject_teachers (subject_id, teacher_id, class_id) VALUES
-- JSS1 (class_id 1)
(1, 1, 1), -- Mathematics -> Mr. Thompson
(2, 2, 1), -- English Language -> Mrs. Johnson
(3, 3, 1), -- Biology -> Mrs. Phronesis
(4, 4, 1), -- Chemistry -> Dr. Williams
(5, 5, 1), -- Physics -> Mr. Anderson
-- JSS2 (class_id 2)
(1, 1, 2), -- Mathematics -> Mr. Thompson
(2, 2, 2), -- English Language -> Mrs. Johnson
(3, 3, 2), -- Biology -> Mrs. Phronesis
(4, 4, 2), -- Chemistry -> Dr. Williams
(5, 5, 2); -- Physics -> Mr. Anderson

-- Seed result summaries (student_results)
-- John (student_id 3, class_id 1) results:
-- 2025/2026 Term 1
INSERT INTO student_results (result_id, student_id, session_id, term_id, class_id, total_score, average_score, gpa, cgpa, grade, class_position, total_students, remarks) VALUES
(1, 3, 2, 1, 1, 437.00, 87.40, 3.80, 3.80, 'A-', 5, 120, 'An excellent academic performance. John has demonstrated strong analytical abilities and consistent dedication. Keep up the high standard.');

-- 2025/2026 Term 2
INSERT INTO student_results (result_id, student_id, session_id, term_id, class_id, total_score, average_score, gpa, cgpa, grade, class_position, total_students, remarks) VALUES
(2, 3, 2, 2, 1, 444.00, 88.80, 3.90, 3.85, 'A-', 3, 120, 'Superb performance. Outstanding progress in Physics and English.');

-- 2025/2026 Term 3
INSERT INTO student_results (result_id, student_id, session_id, term_id, class_id, total_score, average_score, gpa, cgpa, grade, class_position, total_students, remarks) VALUES
(3, 3, 2, 3, 1, 461.00, 92.20, 4.00, 3.90, 'A', 1, 120, 'A phenomenal academic year! John finishes top of the class. Exceptional excellence across all subjects.');

-- 2024/2025 Term 3
INSERT INTO student_results (result_id, student_id, session_id, term_id, class_id, total_score, average_score, gpa, cgpa, grade, class_position, total_students, remarks) VALUES
(4, 3, 1, 3, 1, 406.00, 81.20, 3.40, 3.40, 'B', 12, 115, 'John had a good academic year. Focused and hardworking.');

-- Jane (student_id 1, class_id 2) results:
-- 2025/2026 Term 1
INSERT INTO student_results (result_id, student_id, session_id, term_id, class_id, total_score, average_score, gpa, cgpa, grade, class_position, total_students, remarks) VALUES
(5, 1, 2, 1, 2, 432.00, 86.40, 3.75, 3.75, 'A-', 7, 120, 'Very good academic performance. Jane is highly conscientious.');


-- Seed individual subject results (result_subjects)
-- John, 2025/2026, Term 1 (result_id 1)
INSERT INTO result_subjects (result_id, subject_id, ca_score, mid_term_score, exam_score, total_score, grade, remarks) VALUES
(1, 1, 28.00, 18.00, 46.00, 92.00, 'A', 'John has shown exceptional understanding of Mathematics concepts this term. His participation in class discussions is commendable.'),
(1, 2, 26.00, 17.00, 45.00, 88.00, 'A-', 'Very good performance in English. Keep it up.'),
(1, 3, 25.00, 16.00, 44.00, 85.00, 'B+', 'Good performance in Biology.'),
(1, 4, 27.00, 17.00, 46.00, 90.00, 'A', 'Excellent work in Chemistry. Showed deep curiosity.'),
(1, 5, 24.00, 15.00, 43.00, 82.00, 'B', 'Above average. Can do better.');

-- John, 2025/2026, Term 2 (result_id 2)
INSERT INTO result_subjects (result_id, subject_id, ca_score, mid_term_score, exam_score, total_score, grade, remarks) VALUES
(2, 1, 25.00, 16.00, 43.00, 84.00, 'B+', 'Consistent effort. Keep pushing for perfection.'),
(2, 2, 27.00, 18.00, 47.00, 92.00, 'A', 'Brilliant command of the language. Active participation.'),
(2, 3, 26.00, 17.00, 45.00, 88.00, 'A-', 'A solid understanding of ecology and cell biology concepts.'),
(2, 4, 25.00, 16.00, 44.00, 85.00, 'B+', 'Excellent practical skills demonstrated in laboratory sessions.'),
(2, 5, 28.00, 19.00, 48.00, 95.00, 'A+', 'Outstanding! Exceptional capability in theoretical and applied physics.');

-- John, 2025/2026, Term 3 (result_id 3)
INSERT INTO result_subjects (result_id, subject_id, ca_score, mid_term_score, exam_score, total_score, grade, remarks) VALUES
(3, 1, 29.00, 19.00, 49.00, 97.00, 'A+', 'Absolute genius performance in final mathematics exam.'),
(3, 2, 28.00, 18.00, 46.00, 92.00, 'A', 'Consistent excellence in essay writing and literature analysis.'),
(3, 3, 27.00, 17.00, 46.00, 90.00, 'A', 'Outstanding research skills and theoretical biological application.'),
(3, 4, 26.00, 17.00, 45.00, 88.00, 'A-', 'Very good performance. Showed excellent problem solving skill.'),
(3, 5, 29.00, 18.00, 47.00, 94.00, 'A', 'A highly satisfying end to the academic year. Superb work.');

-- John, 2024/2025, Term 3 (result_id 4)
INSERT INTO result_subjects (result_id, subject_id, ca_score, mid_term_score, exam_score, total_score, grade, remarks) VALUES
(4, 1, 24.00, 16.00, 40.00, 80.00, 'B', 'Shows good potential in mathematics.'),
(4, 2, 25.00, 17.00, 40.00, 82.00, 'B', 'Shows steady improvement in speech and writing.'),
(4, 3, 23.00, 15.00, 40.00, 78.00, 'B-', 'Good effort, needs to participate more in class.'),
(4, 4, 26.00, 16.00, 43.00, 85.00, 'B+', 'Shows a keen interest in chemistry practicals.'),
(4, 5, 24.00, 16.00, 41.00, 81.00, 'B', 'Satisfactory understanding of physical concepts.');

-- Jane, 2025/2026, Term 1 (result_id 5)
INSERT INTO result_subjects (result_id, subject_id, ca_score, mid_term_score, exam_score, total_score, grade, remarks) VALUES
(5, 1, 26.00, 17.00, 42.00, 85.00, 'B+', 'Very good logical thinking and problem-solving skills.'),
(5, 2, 28.00, 18.00, 44.00, 90.00, 'A', 'Superb communication. Creative writing is top-notch.'),
(5, 3, 27.00, 17.00, 44.00, 88.00, 'A-', 'Great work. Demonstrated strong comprehension of anatomy topics.'),
(5, 4, 25.00, 16.00, 41.00, 82.00, 'B', 'Good performance, could review chemical equation balancing.'),
(5, 5, 27.00, 17.00, 43.00, 87.00, 'A-', 'Splendid effort. Understood mechanics and forces very well.');
