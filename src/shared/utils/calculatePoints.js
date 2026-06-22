// @shared/utils/calculatePoints.js

export function calculatePoints({ items, skillName, pointsPerQuestion = 1 }) {
  let totalPoints = 0;
  const logs = [];

  items.forEach((item) => {
    if (!item) return;

    const { questionId, type, skillType, correctContent, rawStudentAnswer } =
      item;

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
        if (studentAnswers[i].key.trim() === correctAnswers[i].key.trim()) {
          isCorrect = true;
          totalPoints += pointsPerQuestion;
        }
      }
    }

    // =====================================
    // DROPDOWN LIST
    // =====================================
    else if (type === "dropdown-list") {
      const parsedStudent = JSON.parse(rawStudentAnswer);

      // normalize & remove example (key "0") from student answers
      const studentAnswers = parsedStudent
        .map((item) => ({
          key: String(item.key).split(".")[0].trim(),
          value: String(item.value).trim(),
        }))
        .filter((item) => item.key !== "0");

      // normalize & remove example (key "0") from correct answers
      const correctAnswers = (correctContent.correctAnswer || [])
        .map((item) => ({
          key: String(item.key).trim(),
          value: String(item.value).trim(),
        }))
        .filter((item) => item.key !== "0");

      logItem.studentAnswer = studentAnswers;
      logItem.correctAnswer = correctAnswers;

      let pointAdded = 0;

      correctAnswers.forEach((correct) => {
        let student = studentAnswers.find((s) => s.key === correct.key);

        if (!student) {
          const numericKey = Number(correct.key);
          if (
            Number.isInteger(numericKey) &&
            numericKey > 0 &&
            correctContent &&
            Array.isArray(correctContent.leftItems)
          ) {
            const leftItemText = correctContent.leftItems[numericKey - 1];
            if (leftItemText) {
              const normalizedLeftItem = String(leftItemText).split(".")[0].trim();
              const fullLeftItem = String(leftItemText).trim();
              student = studentAnswers.find(
                (s) =>
                  String(s.key).trim() === normalizedLeftItem ||
                  String(s.key).trim() === fullLeftItem ||
                  String(leftItemText).trim().startsWith(String(s.key).trim())
              );
            }
          }
        }

        if (student && student.value === correct.value) {
          isCorrect = true;
          totalPoints += pointsPerQuestion; // each real gap = 50/29
          pointAdded += pointsPerQuestion;
        }
      });

      logItem.pointAdded = pointAdded;
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
