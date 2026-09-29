// ==========================================
// GRADE CALCULATION
// ==========================================
function calculateTablePercentageByElement(table) {
    if (!table) return 0;
    const rows = table.querySelectorAll('tbody tr');
    const highestRow = rows[0].querySelectorAll('td:not(.label)');
    const learnerRow = rows[1].querySelectorAll('td:not(.label)');

    let totalHighest = 0, totalLearner = 0;
    for (let i = 0; i < highestRow.length; i++) {
        totalHighest += parseFloat(highestRow[i].innerText) || 0;
        totalLearner += parseFloat(learnerRow[i].innerText) || 0;
    }
    if (totalHighest === 0) return 0;
    return (totalLearner / totalHighest) * 100;
}

function calculateFinalGrade() {
    const tables = document.querySelectorAll('.score-table');
    const wwPercent = calculateTablePercentageByElement(tables[0]);
    const ptPercent = calculateTablePercentageByElement(tables[1]);
    const exPercent = calculateTablePercentageByElement(tables[2]);

    document.getElementById('ww-percentage').innerText = wwPercent.toFixed(2) + '%';
    document.getElementById('pt-percentage').innerText = ptPercent.toFixed(2) + '%';
    document.getElementById('ex-percentage').innerText = exPercent.toFixed(2) + '%';

    const finalGrade = (wwPercent * 0.20) + (ptPercent * 0.50) + (exPercent * 0.30);
    document.getElementById('final-grade').innerText = finalGrade.toFixed(2);
}

document.addEventListener('input', function(event) {
    if (event.target.hasAttribute('contenteditable')) {
        calculateFinalGrade();
    }
});

// ==========================================
// DATA MANAGEMENT
// ==========================================
function getAllStudents() {
    const data = localStorage.getItem('studentsData');
    return data ? JSON.parse(data) : {};
}

function saveAllStudents(students) {
    localStorage.setItem('studentsData', JSON.stringify(students));
}

function getCurrentStudentId() {
    return document.getElementById('studentList').value;
}

function refreshStudentDropdown() {
    const students = getAllStudents();
    const dropdown = document.getElementById('studentList');
    const linksContainer = document.getElementById('studentLinks');
    const currentId = dropdown.value;

    dropdown.innerHTML = '<option value="">-- Select a student --</option>';
    Object.keys(students).forEach(id => {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = students[id].studentName || 'Unnamed Student';
        dropdown.appendChild(option);
    });

    if (linksContainer) {
        linksContainer.innerHTML = '';
        const studentIds = Object.keys(students);

        if (studentIds.length === 0) {
            linksContainer.innerHTML = '<em style="color:#999; font-size:13px;">No students yet. Click "➕ New Student" to add one.</em>';
        } else {
            studentIds.forEach(id => {
                const link = document.createElement('a');
                link.className = 'student-link';
                link.textContent = students[id].studentName || 'Unnamed Student';
                if (id === currentId) link.classList.add('active');

                link.onclick = function(e) {
                    e.preventDefault();
                    document.getElementById('studentList').value = id;
                    loadSelectedStudent();
                };
                linksContainer.appendChild(link);
            });
        }
    }

    if (students[currentId]) dropdown.value = currentId;
}

function saveData() {
    const studentId = getCurrentStudentId();
    if (!studentId) {
        alert('⚠️ Please create a new student first by clicking "➕ New Student".');
        return;
    }

    const students = getAllStudents();
    const tables = document.querySelectorAll('.score-table');

    students[studentId] = {
        studentName: document.getElementById('studentName').value,
        gradeSection: document.getElementById('gradeSection').value,
        term: document.getElementById('term').value,
        subject: document.getElementById('subject').value,
        teacher: document.getElementById('teacher').value,
        schoolYear: document.getElementById('schoolYear').value,
        wwScores: getTableScores(tables[0]),
        ptScores: getTableScores(tables[1]),
        exScores: getTableScores(tables[2]),
        teacherComment: document.getElementById('teacherComment').value,
        parentComment: document.getElementById('parentComment').value
    };

    saveAllStudents(students);
    refreshStudentDropdown();
    alert('✅ Data Saved!');
}

function getTableScores(table) {
    if (!table) return null;
    const rows = table.querySelectorAll('tbody tr');
    const scores = { highest: [], learner: [] };
    rows[0].querySelectorAll('td:not(.label)').forEach(c => scores.highest.push(c.innerText));
    rows[1].querySelectorAll('td:not(.label)').forEach(c => scores.learner.push(c.innerText));
    return scores;
}

function setTableScores(table, scores) {
    if (!scores || !table) return;
    const rows = table.querySelectorAll('tbody tr');
    rows[0].querySelectorAll('td:not(.label)').forEach((c, i) => {
        if (scores.highest[i] !== undefined) c.innerText = scores.highest[i];
    });
    rows[1].querySelectorAll('td:not(.label)').forEach((c, i) => {
        if (scores.learner[i] !== undefined) c.innerText = scores.learner[i];
    });
}

function loadSelectedStudent() {
    const newStudentId = getCurrentStudentId();

    if (window.currentlyEditingId && window.currentlyEditingId !== newStudentId) {
        const prevStudents = getAllStudents();
        if (prevStudents[window.currentlyEditingId]) {
            const tables = document.querySelectorAll('.score-table');
            prevStudents[window.currentlyEditingId] = {
                studentName: document.getElementById('studentName').value,
                gradeSection: document.getElementById('gradeSection').value,
                term: document.getElementById('term').value,
                subject: document.getElementById('subject').value,
                teacher: document.getElementById('teacher').value,
                schoolYear: document.getElementById('schoolYear').value,
                wwScores: getTableScores(tables[0]),
                ptScores: getTableScores(tables[1]),
                exScores: getTableScores(tables[2]),
                teacherComment: document.getElementById('teacherComment').value,
                parentComment: document.getElementById('parentComment').value
            };
            saveAllStudents(prevStudents);
        }
    }

    if (!newStudentId) {
        clearForm();
        window.currentlyEditingId = null;
        return;
    }

    const students = getAllStudents();
    const data = students[newStudentId];
    if (!data) return;

    document.getElementById('studentName').value = data.studentName || '';
    document.getElementById('gradeSection').value = data.gradeSection || '';
    document.getElementById('term').value = data.term || '';
    document.getElementById('subject').value = data.subject || '';
    document.getElementById('teacher').value = data.teacher || '';
    document.getElementById('schoolYear').value = data.schoolYear || '';

    const tables = document.querySelectorAll('.score-table');
    setTableScores(tables[0], data.wwScores);
    setTableScores(tables[1], data.ptScores);
    setTableScores(tables[2], data.exScores);

    document.getElementById('teacherComment').value = data.teacherComment || '';
    document.getElementById('parentComment').value = data.parentComment || '';

    window.currentlyEditingId = newStudentId;
    calculateFinalGrade();
    refreshStudentDropdown();
}

function createNewStudent() {
    const currentId = getCurrentStudentId();
    if (currentId && document.getElementById('studentName').value) {
        saveData();
    }

    const newId = 'student_' + Date.now();
    const name = prompt('Enter the new student\'s full name:');
    if (!name) return;

    const students = getAllStudents();
    students[newId] = {
        studentName: name,
        gradeSection: '', term: '', subject: '', teacher: '', schoolYear: '',
        wwScores: null, ptScores: null, exScores: null,
        teacherComment: '', parentComment: ''
    };

    saveAllStudents(students);
    refreshStudentDropdown();
    document.getElementById('studentList').value = newId;
    loadSelectedStudent();
}

function bulkAddStudents() {
    const currentId = getCurrentStudentId();
    if (currentId && document.getElementById('studentName').value) {
        saveData();
    }

    const input = prompt(
        'Paste your student list below — ONE STUDENT PER LINE.\n\n' +
        'Format (6 fields separated by commas):\n' +
        'Name, Grade & Section, Term, Subject, Teacher, S.Y.\n\n' +
        'EXAMPLE:\n' +
        'Juan Dela Cruz, 10-Sincerity, 2, Values Education, Jhon Lerry DC Medin, 2026-2027'
    );

    if (!input) return;

    const lines = input.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) {
        alert('⚠️ No students were entered.');
        return;
    }

    const students = getAllStudents();
    let addedCount = 0;
    let firstNewId = null;

    lines.forEach((line, index) => {
        const parts = line.split(',').map(p => p.trim());
        const name = parts[0] || '';
        if (!name) return;

        const newId = 'student_' + Date.now() + '_' + index;
        if (!firstNewId) firstNewId = newId;

        students[newId] = {
            studentName: name,
            gradeSection: parts[1] || '',
            term: parts[2] || '',
            subject: parts[3] || '',
            teacher: parts[4] || '',
            schoolYear: parts[5] || '',
            wwScores: null, ptScores: null, exScores: null,
            teacherComment: '', parentComment: ''
        };
        addedCount++;
    });

    saveAllStudents(students);
    refreshStudentDropdown();
    alert(`✅ Successfully added ${addedCount} student(s)!`);

    if (firstNewId) {
        document.getElementById('studentList').value = firstNewId;
        loadSelectedStudent();
    }
}

function deleteStudent() {
    const studentId = getCurrentStudentId();
    if (!studentId) {
        alert('⚠️ No student is selected.');
        return;
    }

    const students = getAllStudents();
    const name = students[studentId].studentName;

    if (confirm(`⚠️ Are you sure you want to DELETE "${name}"?\nThis cannot be undone.`)) {
        delete students[studentId];
        saveAllStudents(students);
        refreshStudentDropdown();
        clearForm();
        window.currentlyEditingId = null;
        alert('🗑️ Student deleted.');
    }
}

function clearForm() {
    ['studentName','gradeSection','term','subject','teacher','schoolYear','teacherComment','parentComment'].forEach(id => {
        document.getElementById(id).value = '';
    });
    document.getElementById('final-grade').innerText = '0';
    document.getElementById('ww-percentage').innerText = '0%';
    document.getElementById('pt-percentage').innerText = '0%';
    document.getElementById('ex-percentage').innerText = '0%';

    document.querySelectorAll('.score-table').forEach(table => {
        const rows = table.querySelectorAll('tbody tr');
        rows[1].querySelectorAll('td:not(.label)').forEach(c => c.innerText = '0');
    });
}

// ==========================================
// INITIAL LOAD
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
    refreshStudentDropdown();
    calculateFinalGrade();
});