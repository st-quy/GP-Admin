// @shared/utils/calculatePoints.js

export function calculatePoints({ items, skillName, pointsPerQuestion = 1 }) {
  let totalPoints = 0;
  const logs = [];

  items.forEach((item) => {
    if (!item) return;

    const {
      questionId,
      type,
      skillType,
      correctContent,
      rawStudentAnswer,
    } = item;

    if (!rawStudentAnswer) return;

    // Filter by skill if skillType exists
    if (skillType && skillName && skillType !== skillName) {
      return;
    }

    let isCorrect = false;

    const logItem = {
      questionId,
      type,
      studentAnswer: null,
      correctAnswer: null,
      result: "incorrect",
      pointAdded: 0,
    };

    // =====================================
    // MULTIPLE CHOICE
    // =====================================
    if (type === "multiple-choice") {
      const stu = rawStudentAnswer.trim();

      let cor = null;

      if (Array.isArray(correctContent)) {
        cor = correctContent[0]?.correctAnswer ?? null;
      } else {
        cor = correctContent?.correctAnswer ?? null;
      }

      if (typeof cor === "string") cor = cor.trim();

      logItem.studentAnswer = stu;
      logItem.correctAnswer = cor;

      if (stu && cor && stu === cor) {
        isCorrect = true;
        totalPoints += pointsPerQuestion;
      }
    }

    // =====================================
    // MATCHING
    // =====================================
    else if (type === "matching") {
      const studentAnswers = JSON.parse(rawStudentAnswer);
      const correctAnswers = correctContent.correctAnswer;

      logItem.studentAnswer = studentAnswers;
      logItem.correctAnswer = correctAnswers;

      correctAnswers.forEach((correct) => {
        const matched = studentAnswers.find(
          (s) =>
            s.left.trim() === correct.left.trim() &&
            s.right.trim() === correct.right.trim()
        );
        if (matched) {
          isCorrect = true;
          totalPoints += pointsPerQuestion;
        }
      });
    }

    // =====================================
    // ORDERING
    // =====================================
    else if (type === "ordering") {
      const studentAnswers = JSON.parse(rawStudentAnswer).sort(
        (a, b) => a.value - b.value
      );
      const correctAnswers = correctContent.correctAnswer;

      logItem.studentAnswer = studentAnswers;
      logItem.correctAnswer = correctAnswers;

      const minLength = Math.min(studentAnswers.length, correctAnswers.length);

      for (let i = 0; i < minLength; i++) {
        if (
          studentAnswers[i].key.trim() === correctAnswers[i].key.trim()
        ) {
          isCorrect = true;
          totalPoints += pointsPerQuestion;
        }
      }
    }

    // =====================================
    // DROPDOWN LIST
    // =====================================
    else if (type === "dropdown-list") {
      const studentAnswers = JSON.parse(rawStudentAnswer).map((item) => ({
        key: String(item.key).split(".")[0].trim(),
        value: String(item.value).trim(),
      }));

      const correctAnswersInclude0 = correctContent.correctAnswer.map((item) => ({
        key: String(item.key).trim(),
        value: String(item.value).trim(),
      }));

      const correctAnswers = correctAnswersInclude0.filter(
        (item) => item.key !== "0"
      );

      logItem.studentAnswer = studentAnswers;
      logItem.correctAnswer = correctAnswers;

      correctAnswers.forEach((correct, index) => {
        const student = studentAnswers[index];
        if (
          student &&
          student.key === correct.key &&
          student.value === correct.value
        ) {
          isCorrect = true;
          totalPoints += pointsPerQuestion;
        }
      });
    }

    // =====================================
    // LISTENING GROUP
    // =====================================
    else if (type === "listening-questions-group") {
      const studentAnswers = JSON.parse(rawStudentAnswer);
      const correctList = correctContent.groupContent.listContent;

      logItem.studentAnswer = studentAnswers;
      logItem.correctAnswer = correctList;

      correctList.forEach((q) => {
        const stu = studentAnswers.find((x) => x.ID === q.ID);

        if (stu && stu.answer.trim() === q.correctAnswer.trim()) {
          isCorrect = true;
          totalPoints += pointsPerQuestion;
        }
      });
    }

    // =====================================
    // FINALIZE
    // =====================================
    logItem.result = isCorrect ? "correct" : "incorrect";
    logItem.pointAdded = isCorrect ? pointsPerQuestion : 0;

    logs.push(logItem);
  });

  totalPoints = parseFloat(totalPoints.toFixed(1));

  return {
    points: totalPoints,
    tracking: logs,
  };
}
