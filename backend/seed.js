const db = require('./src/models');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function seed() {
  try {
    await db.sequelize.sync({ force: true });
    console.log('✅ Database flushed and synced.');

    // ── Users ──────────────────────────────────────────────────────────────
    const admin = await db.User.create({
      first_name: 'Admin',
      last_name: 'User',
      email: 'admin@ascend.rw',
      password_hash: bcrypt.hashSync('admin123', 8),
      role: 'admin',
    });

    const mentor = await db.User.create({
      first_name: 'Eric',
      last_name: 'Kagame',
      email: 'eric@ascend.rw',
      password_hash: bcrypt.hashSync('mentor123', 8),
      role: 'mentor',
      phone_number: '+250788000001',
    });

    const student1 = await db.User.create({
      first_name: 'Amina',
      last_name: 'Uwimana',
      email: 'amina@ascend.rw',
      password_hash: bcrypt.hashSync('amina123', 8),
      role: 'student',
      dob: '2005-05-15',
      national_id: '1200580012345678',
      phone_number: '+250788123456',
    });

    const student2 = await db.User.create({
      first_name: 'Jean',
      last_name: 'Mutabazi',
      email: 'jean@ascend.rw',
      password_hash: bcrypt.hashSync('jean123', 8),
      role: 'student',
      dob: '2003-09-20',
      national_id: '1200380098765432',
      phone_number: '+250722987654',
    });

    const employer = await db.User.create({
      first_name: 'Rwanda',
      last_name: 'Tech Ltd',
      email: 'hr@rwandatech.rw',
      password_hash: bcrypt.hashSync('employer123', 8),
      role: 'employer',
      phone_number: '+250788500000',
    });

    console.log('✅ Users created.');

    // ── Modules ─────────────────────────────────────────────────────────────
    const m1 = await db.Module.create({
      title: 'Introduction to Computer Literacy',
      description: 'Basics of using a computer, keyboard, and mouse.',
      language: 'Kinyarwanda',
      duration_minutes: 60,
    });

    const m2 = await db.Module.create({
      title: 'English for the Workplace',
      description: 'Professional communication in English.',
      language: 'English',
      duration_minutes: 90,
    });

    const m3 = await db.Module.create({
      title: 'Digital Financial Services',
      description: 'Using mobile money and digital banking in Rwanda.',
      language: 'Kinyarwanda',
      duration_minutes: 45,
    });

    console.log('✅ Modules created.');

    // ── Module 1 Content ────────────────────────────────────────────────────
    const note1 = await db.Content.create({
      module_id: m1.module_id,
      title: 'Lesson 1: Hardware Basics',
      content_type: 'note',
      content_data: 'Hardware refers to the physical components of a computer: monitor, keyboard, mouse, CPU, and memory. Each part has a specific role in making the computer work.',
      order_index: 1,
      created_by: admin.user_id,
    });

    const note2 = await db.Content.create({
      module_id: m1.module_id,
      title: 'Lesson 2: Software Basics',
      content_type: 'note',
      content_data: 'Software is the set of instructions that tells the hardware what to do. Operating systems like Windows manage all the software and hardware on a computer.',
      order_index: 2,
      created_by: admin.user_id,
    });

    const quiz1 = await db.Content.create({
      module_id: m1.module_id,
      title: 'Module 1 Quiz',
      content_type: 'quiz',
      content_data: 'Test your knowledge of computer basics.',
      order_index: 3,
      created_by: admin.user_id,
    });

    const exam1 = await db.Content.create({
      module_id: m1.module_id,
      title: 'Module 1 Final Exam',
      content_type: 'exam',
      content_data: 'Final assessment for Computer Literacy.',
      order_index: 4,
      created_by: admin.user_id,
    });

    // ── Module 1 Quiz Questions ─────────────────────────────────────────────
    await db.Question.create({
      content_id: quiz1.content_id,
      question_text: 'Which component is responsible for processing data?',
      question_type: 'MCQ',
      options: ['Monitor', 'Keyboard', 'CPU', 'Mouse'],
      correct_answer: 'CPU',
      marks: 5,
    });

    await db.Question.create({
      content_id: quiz1.content_id,
      question_text: 'True or False: A keyboard is an input device.',
      question_type: 'TF',
      options: ['True', 'False'],
      correct_answer: 'True',
      marks: 5,
    });

    // ── Module 1 Exam Questions ─────────────────────────────────────────────
    await db.Question.create({
      content_id: exam1.content_id,
      question_text: 'What does CPU stand for?',
      question_type: 'MCQ',
      options: ['Central Processing Unit', 'Computer Personal Unit', 'Central Program Utility', 'Core Processing Unit'],
      correct_answer: 'Central Processing Unit',
      marks: 10,
    });

    await db.Question.create({
      content_id: exam1.content_id,
      question_text: 'Which key is used to delete text to the right of the cursor?',
      question_type: 'MCQ',
      options: ['Backspace', 'Delete', 'Escape', 'Enter'],
      correct_answer: 'Delete',
      marks: 10,
    });

    await db.Question.create({
      content_id: exam1.content_id,
      question_text: 'An operating system is a type of hardware. True or False?',
      question_type: 'TF',
      options: ['True', 'False'],
      correct_answer: 'False',
      marks: 10,
    });

    console.log('✅ Module 1 content and questions created.');

    // ── Module 2 Content ────────────────────────────────────────────────────
    const note3 = await db.Content.create({
      module_id: m2.module_id,
      title: 'Lesson 1: Workplace Greetings',
      content_type: 'note',
      content_data: 'Professional greetings are important. Examples: "Good morning, how may I help you?" and "Thank you for your time." Always maintain a polite and clear tone.',
      order_index: 1,
      created_by: admin.user_id,
    });

    const exam2 = await db.Content.create({
      module_id: m2.module_id,
      title: 'Module 2 Final Exam',
      content_type: 'exam',
      content_data: 'Final assessment for English for the Workplace.',
      order_index: 2,
      created_by: admin.user_id,
    });

    await db.Question.create({
      content_id: exam2.content_id,
      question_text: 'Which phrase is a professional greeting?',
      question_type: 'MCQ',
      options: ['Hey you!', 'Good morning, how may I help you?', 'What do you want?', 'Yo!'],
      correct_answer: 'Good morning, how may I help you?',
      marks: 10,
    });

    await db.Question.create({
      content_id: exam2.content_id,
      question_text: 'True or False: Using polite language at work is important.',
      question_type: 'TF',
      options: ['True', 'False'],
      correct_answer: 'True',
      marks: 10,
    });

    console.log('✅ Module 2 content and questions created.');

    // ── Student Progress ────────────────────────────────────────────────────
    const progress1 = await db.Progress.create({
      student_id: student1.user_id,
      module_id: m1.module_id,
      status: 'completed',
      score: 90,
      flagged: false,
      started_at: new Date('2026-03-01'),
      completed_at: new Date('2026-03-05'),
    });

    const progress2 = await db.Progress.create({
      student_id: student1.user_id,
      module_id: m2.module_id,
      status: 'in_progress',
      started_at: new Date('2026-03-06'),
    });

    const progress3 = await db.Progress.create({
      student_id: student2.user_id,
      module_id: m1.module_id,
      status: 'in_progress',
      score: 40,
      flagged: true,
      started_at: new Date('2026-03-10'),
    });

    console.log('✅ Student progress records created.');

    // ── Certificate for Student 1 ───────────────────────────────────────────
    const certToken = uuidv4();
    const cert1 = await db.Certificate.create({
      student_id: student1.user_id,
      module_id: m1.module_id,
      qr_code: certToken,
      issued_at: new Date('2026-03-05'),
    });

    console.log(`✅ Certificate issued. Verify at: /api/verify/${certToken}`);

    // ── Attempt Records ─────────────────────────────────────────────────────
    await db.Attempt.create({
      student_id: student1.user_id,
      content_id: exam1.content_id,
      score: 27,
      answers: { [exam1.content_id]: 'Central Processing Unit' },
      attempted_at: new Date('2026-03-05'),
      completed_at: new Date('2026-03-05'),
    });

    await db.Attempt.create({
      student_id: student2.user_id,
      content_id: quiz1.content_id,
      score: 5,
      answers: { [quiz1.content_id]: 'CPU' },
      attempted_at: new Date('2026-03-11'),
      completed_at: new Date('2026-03-11'),
    });

    console.log('✅ Attempt records created.');

    // ── Mentorship ──────────────────────────────────────────────────────────
    const mentorship1 = await db.Mentorship.create({
      mentor_id: mentor.user_id,
      student_id: student1.user_id,
      flagged: false,
      notes: 'Amina is progressing well. She completed Module 1 with a high score.',
    });

    const mentorship2 = await db.Mentorship.create({
      mentor_id: mentor.user_id,
      student_id: student2.user_id,
      flagged: true,
      notes: 'Jean struggled on the quiz. Schedule a review session.',
    });

    console.log('✅ Mentorship records created.');

    // ── Employer Interactions ───────────────────────────────────────────────
    await db.Interaction.create({
      employer_id: employer.user_id,
      student_id: student1.user_id,
      interaction_type: 'selection',
      content: 'We have reviewed your profile and are interested in your candidacy.',
    });

    await db.Interaction.create({
      employer_id: employer.user_id,
      student_id: student1.user_id,
      interaction_type: 'message',
      content: 'Hello Amina, congratulations on completing the Computer Literacy module! We would like to discuss a potential opportunity with you.',
    });

    await db.Interaction.create({
      employer_id: employer.user_id,
      student_id: student1.user_id,
      interaction_type: 'interview',
      content: 'Please join us for a virtual interview via Google Meet.',
      scheduled_at: new Date('2026-04-05T10:00:00'),
    });

    await db.Interaction.create({
      employer_id: employer.user_id,
      student_id: student1.user_id,
      interaction_type: 'feedback',
      content: 'Amina demonstrated strong initiative and good communication skills during the interview. Highly recommended.',
    });

    console.log('✅ Employer interaction records created.');

    console.log('\n🎉 Seeding completed successfully!\n');
    console.log('──────────────────────────────────────────────');
    console.log('  Test Credentials:');
    console.log('  Admin:    admin@ascend.rw        / admin123');
    console.log('  Mentor:   eric@ascend.rw         / mentor123');
    console.log('  Student:  amina@ascend.rw        / amina123');
    console.log('  Student:  jean@ascend.rw         / jean123');
    console.log('  Employer: hr@rwandatech.rw       / employer123');
    console.log('──────────────────────────────────────────────');
    console.log(`  Cert verify URL: /api/verify/${certToken}`);
    console.log('──────────────────────────────────────────────\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seed();
