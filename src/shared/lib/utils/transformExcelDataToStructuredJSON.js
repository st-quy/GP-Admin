import { v4 as uuidv4 } from "uuid";

export const transformExcelDataToStructuredJSON = (data) => {
  const header = data[0];
  const rows = data.slice(1);

  const skillMap = {}; // { READING: { ID, Name, createdAt, Parts: [...] }, ... }

  rows.forEach((row) => {
    const [
      topicName,
      skillName,
      part,
      subPart,
      questionType,
      sequence,
      audioLink,
      imageLink,
      question,
      questionContent,
      correctAnswer,
      subQuestion,
      groupQuestion,
    ] = row;

    if (!skillMap[skillName]) {
      skillMap[skillName] = {
        ID: uuidv4(),
        Name: skillName.toUpperCase(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        Parts: [],
      };
    }

    // tạo key duy nhất cho mỗi part
    const partKey = `${topicName}-${skillName}-${part}-${subPart}`;
    let partObj = skillMap[skillName].Parts.find((p) => p.__key === partKey);

    if (!partObj) {
      partObj = {
        __key: partKey, // dùng để tìm lại, sau sẽ xóa đi
        ID: uuidv4(),
        Content: part,
        SubContent: subPart || null,
        Sequence: skillMap[skillName].Parts.length + 1,
        Questions: [],
      };
      skillMap[skillName].Parts.push(partObj);
    }

    partObj.Questions.push({
      ID: uuidv4(),
      Type: questionType,
      Sequence: Number(sequence) || partObj.Questions.length + 1,
      Content: question,
      SubContent: subQuestion || null,
      GroupContent: groupQuestion || null,
      AudioKeys: audioLink || null,
      ImageKeys: imageLink || null,
      AnswerContent: {
        content: questionContent,
        correctAnswer: correctAnswer,
        audio: audioLink,
        image: imageLink,
        partID: partObj.ID,
        type: questionType,
      },
    });
  });

  // Xoá __key tạm
  Object.values(skillMap).forEach((skill) => {
    skill.Parts.forEach((part) => {
      delete part.__key;
    });
  });

  // Trả về theo dạng bạn cần
  return {
    ID: uuidv4(),
    Name: rows[0]?.[0] || "Untitled Topic",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    Skills: Object.values(skillMap),
  };
};

export const transformListeningData = (data) => {
  const listeningSkill = data.Skills.find(
    (skill) => skill.Name === "LISTENING"
  );
  if (!listeningSkill) return null;

  const topicID = data.ID;
  const createdAt = data.createdAt;
  const updatedAt = data.updatedAt;

  // ------------------------
  // 1. MULTIPLE CHOICE
  // ------------------------
  function extractOptionMap(answerText) {
    // Chuẩn hóa linebreak: thay tất cả \r\n, \r, \n → \n
    const normalized = answerText?.replace(/\r\n|\r|\n/g, "\n") || "";

    const lines = normalized.split("\n");
    const map = {};
    lines.forEach((line) => {
      const match = line.match(/^([A-Z])\.\s*(.+)$/);
      if (match) {
        const key = match[1];
        const value = match[2].trim();
        map[key] = value; // hoặc `${key}. ${value}` nếu bạn muốn giữ A./B./C.
      }
    });
    return map;
  }

  function transformMultipleChoice(q, part) {
    const optionMap = extractOptionMap(q.AnswerContent?.content || "");
    const correctKey = q.AnswerContent?.correctAnswer;
    const correctAnswer = optionMap[correctKey] || correctKey;

    return {
      ID: q.ID,
      Type: q.Type,
      AudioKeys: q.AnswerContent?.audio || "",
      ImageKeys: q.AnswerContent?.image || null,
      SkillID: listeningSkill.ID,
      PartID: part.ID,
      Sequence: q.Sequence,
      Content: q.Content,
      SubContent: q.SubContent || null,
      GroupContent: {
        title: q.Content,
        audioKey: "",
      },
      AnswerContent: {
        content: q.Content,
        groupContent: {
          title: q.Content,
          audioKey: "",
        },
        options: Object.values(optionMap),
        correctAnswer,
        partID: part.ID,
        type: q.Type,
        audioKeys: q.AnswerContent?.audio || "",
      },
      createdAt,
      updatedAt,
      Skill: {
        ID: listeningSkill.ID,
        Name: listeningSkill.Name,
        createdAt: listeningSkill.createdAt,
        updatedAt: listeningSkill.updatedAt,
      },
      Part: {
        ID: part.ID,
        Content: part.Content,
        SubContent: null,
        Sequence: part.Sequence,
        TopicID: topicID,
        createdAt: part.createdAt || createdAt,
        updatedAt: part.updatedAt || updatedAt,
      },
    };
  }

  // ------------------------
  // 2. DROPDOWN LIST
  // ------------------------
  function transformDropdownCombined(q) {
    const lines = q.AnswerContent.content?.split("\n") || [];
    const leftItems = [];
    const rightItemSet = new Set();

    lines.forEach((line) => {
      const [left, right] = line.split("|").map((s) => s.trim());
      if (left) leftItems.push(left);

      const matches = right?.match(/[A-Z]\.\s*([^/]+)/g);
      if (matches) {
        matches.forEach((m) => {
          const val = m.replace(/^[A-Z]\.\s*/, "").trim();
          rightItemSet.add(val);
        });
      }
    });

    const rightItems = Array.from(rightItemSet);
    const correctRaw = q.AnswerContent.correctAnswer || "";

    const correctAnswerArray = correctRaw.split("\n").map((line) => {
      const [key, letter] = line.split("|").map((s) => s.trim());
      const index = letter?.charCodeAt(0) - 65;
      return {
        key,
        value: rightItems[index] || letter,
      };
    });

    return { leftItems, rightItems, correctAnswer: correctAnswerArray };
  }

  function transformDropdownList(q, part) {
    const content = q.Content;
    const audio =
      typeof q.AnswerContent?.audio === "string"
        ? q.AnswerContent.audio
        : q.AnswerContent?.audio?.text || "";

    let leftItems = q.AnswerContent.leftItems || [];
    let rightItems = q.AnswerContent.rightItems || [];
    let correctAnswer = [];

    if (leftItems.length === 0 || rightItems.length === 0) {
      const result = transformDropdownCombined(q);
      leftItems = result.leftItems;
      rightItems = result.rightItems;
      correctAnswer = result.correctAnswer;
    } else {
      const correctRaw = q.AnswerContent.correctAnswer || "";
      correctAnswer = correctRaw.split("\n").map((line) => {
        const [key, val] = line.split("|").map((s) => s.trim());
        const index = val.charCodeAt(0) - 65;
        return {
          key,
          value: rightItems[index] || val,
        };
      });
    }

    return {
      ID: q.ID,
      Type: "dropdown-list",
      AudioKeys: audio,
      ImageKeys: null,
      SkillID: q.SkillID,
      PartID: part.ID,
      Sequence: q.Sequence,
      Content: content,
      SubContent: q.SubContent,
      GroupContent: {
        title: content,
        audioKey: "",
      },
      AnswerContent: {
        content,
        groupContent: {
          title: content,
          audioKey: "",
        },
        leftItems,
        rightItems,
        correctAnswer,
        partID: part.ID,
        type: "dropdown-list",
        audioKeys: {
          text: audio,
          hyperlink: q.AnswerContent?.audioKeys?.hyperlink || "",
        },
      },
      createdAt: q.createdAt,
      updatedAt: q.updatedAt,
      Skill: q.Skill,
      Part: part,
    };
  }

  // ------------------------
  // 3. LISTENING GROUP
  // ------------------------
  function transformListeningGroupQuestion(q, part) {
    const audio =
      typeof q.AudioKeys === "string"
        ? q.AudioKeys
        : typeof q.AnswerContent?.audioKeys === "string"
          ? q.AnswerContent.audioKeys
          : q.AnswerContent?.audioKeys?.text || "";

    const groupTitle = q.Content || "Listen and answer the questions";
    const groupAudioKey =
      q.GroupContent?.audioKey || q.AnswerContent?.groupContent?.audioKey || "";

    const existingListContent =
      q.GroupContent?.listContent ||
      q.AnswerContent?.groupContent?.listContent ||
      [];

    if (existingListContent.length > 0) {
      const normalizedList = existingListContent.map((item, idx) => ({
        ID: item.ID ?? idx + 1,
        content: item.content,
        options: item.options,
        correctAnswer: item.correctAnswer,
        type: "listening-questions-group",
        partID: part.ID,
      }));

      return {
        ID: q.ID,
        Type: "listening-questions-group",
        AudioKeys: audio,
        ImageKeys: null,
        SkillID: q.SkillID,
        PartID: part.ID,
        Sequence: q.Sequence,
        Content: groupTitle,
        SubContent: q.SubContent || null,
        GroupContent: {
          title: groupTitle,
          audioKey: groupAudioKey,
          listContent: normalizedList,
        },
        AnswerContent: {
          content: groupTitle,
          groupContent: {
            title: groupTitle,
            audioKey: groupAudioKey,
            listContent: normalizedList,
          },
          partID: part.ID,
          type: "listening-questions-group",
          audioKeys: audio,
        },
        createdAt: q.createdAt,
        updatedAt: q.updatedAt,
        Skill: q.Skill,
        Part: part,
      };
    }

    const rawContent = q.AnswerContent?.content || "";
    const rawAnswer = q.AnswerContent?.correctAnswer || "";

    const subGroups = rawContent
      .split(/Option\s*\d+:/i)
      .map((s) => s.trim())
      .filter(Boolean);

    const rawAnswersMap = {};
    rawAnswer.split("\n").forEach((line) => {
      const match = line.match(/(\d+)\s*\|\s*([A-Z])/i);
      if (match) {
        const questionNum = parseInt(match[1], 10);
        const letter = match[2].toUpperCase();
        rawAnswersMap[questionNum] = letter;
      }
    });

    const listContent = subGroups.map((block, index) => {
      const questionMatch = block.match(/^\d+[:.)]?\s*(.*?)(\n|$)/);
      const content = questionMatch ? questionMatch[1].trim() : "";

      const optionLines = block
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => /^[A-Z]\.\s*/.test(line));

      const options = optionLines.map((line) =>
        line.replace(/^[A-Z]\.\s*/, "").trim()
      );

      const correctLetter = rawAnswersMap[index + 1];
      const correctAnswer =
        correctLetter &&
        {
          A: options[0],
          B: options[1],
          C: options[2],
          D: options[3],
        }[correctLetter];

      return {
        ID: index + 1,
        content,
        options,
        correctAnswer: correctAnswer || "",
        type: "listening-questions-group",
        partID: part.ID,
      };
    });

    return {
      ID: q.ID,
      Type: "listening-questions-group",
      AudioKeys: audio,
      ImageKeys: null,
      SkillID: q.SkillID,
      PartID: part.ID,
      Sequence: q.Sequence,
      Content: groupTitle,
      SubContent: q.SubContent || null,
      GroupContent: {
        title: groupTitle,
        audioKey: "",
        listContent,
      },
      AnswerContent: {
        content: groupTitle,
        groupContent: {
          title: groupTitle,
          audioKey: "",
          listContent,
        },
        partID: part.ID,
        type: "listening-questions-group",
        audioKeys: audio,
      },
      createdAt: q.createdAt,
      updatedAt: q.updatedAt,
      Skill: q.Skill,
      Part: part,
    };
  }

  // ------------------------
  // AUTO DETECT
  // ------------------------
  function transformQuestion(q, part) {
    if (q.Type === "dropdown-list") {
      return transformDropdownList(q, part);
    } else if (q.Type === "listening-questions-group") {
      return transformListeningGroupQuestion(q, part);
    } else {
      return transformMultipleChoice(q, part);
    }
  }

  // ------------------------
  // MAIN RETURN
  // ------------------------
  return {
    ID: topicID || null,
    Name: data.Name || null,
    createdAt,
    updatedAt,
    Parts: listeningSkill.Parts.map((part) => ({
      ID: part.ID,
      Content: part.Content,
      SubContent: null,
      Sequence: part.Sequence,
      TopicID: topicID,
      createdAt: part.createdAt || createdAt,
      updatedAt: part.updatedAt || updatedAt,
      Questions: part.Questions.map((q) => transformQuestion(q, part)),
    })),
  };
};

export const transformGrammarData = (data) => {
  const grammarSkill = data.Skills.find((skill) =>
    skill.Name.toLowerCase().includes("grammar")
  );
  if (!grammarSkill) return null;

  const topicID = grammarSkill.TopicID || "unknown-topic-id";
  const topicName = grammarSkill.Name || "GRAMMAR AND VOCABULARY";

  const fullParts = grammarSkill.Parts.map((part) => {
    const partID = part.ID;

    const questions = part.Questions.map((q) => {
      const question = {
        ID: q.ID,
        Type: q.Type,
        AudioKeys: q.AudioKeys ?? null,
        ImageKeys: q.ImageKeys ?? null,
        SkillID: grammarSkill.ID,
        PartID: partID,
        Sequence: q.Sequence,
        Content: q.Content,
        SubContent: q.SubContent ?? null,
        GroupContent: q.GroupContent ?? null,
      };

      if (q.Type === "multiple-choice") {
        const options = q.AnswerContent.content
          .split("\n")
          .filter(Boolean)
          .map((line) => {
            const [key, ...rest] = line.split(".");
            return {
              key: key.trim(),
              value: rest.join(".").trim(),
            };
          });

        const correctValue =
          options.find(
            (opt) => opt.key === q.AnswerContent.correctAnswer.trim()
          )?.value || "";

        question.AnswerContent = {
          title: q.Content,
          options,
          correctAnswer: correctValue,
        };
      }

      if (q.Type === "matching") {
        const rawContent = q.AnswerContent.content || "";

        // Tách raw theo các phần Contents: và Options:
        const leftMatch = rawContent.match(/Contents:\s*([\s\S]*?)Options:/);
        const rightMatch = rawContent.match(/Options:\s*([\s\S]*)/);

        const leftLines = leftMatch
          ? leftMatch[1]
              .trim()
              .split("\n")
              .map((line) => line.trim())
          : [];

        const rightLines = rightMatch
          ? rightMatch[1]
              .trim()
              .split("\n")
              .map((line) => line.trim())
          : [];

        // Parse: "1. choose" => "choose", "A. train" => "train"
        const leftItems = leftLines.map((item) =>
          item.replace(/^\d+\.\s*/, "").trim()
        );
        const rightItems = rightLines.map((item) =>
          item.replace(/^[A-Z]\.\s*/, "").trim()
        );

        // Tạo bản đồ lookup từ chỉ số sang giá trị thực
        const leftMap = Object.fromEntries(
          leftLines
            .map((line) => {
              const match = line.match(/^(\d+)\.\s*(.*)$/);
              return match ? [match[1], match[2].trim()] : [null, null];
            })
            .filter(([k, v]) => k && v)
        );

        const rightMap = Object.fromEntries(
          rightLines
            .map((line) => {
              const match = line.match(/^([A-Z])\.\s*(.*)$/);
              return match ? [match[1], match[2].trim()] : [null, null];
            })
            .filter(([k, v]) => k && v)
        );

        // Convert correctAnswer like "1 | A" => { left: "choose", right: "train" }
        const correctAnswer = q.AnswerContent.correctAnswer
          .split("\n")
          .filter(Boolean)
          .map((line) => {
            const [leftCode, rightCode] = line.split("|").map((s) => s.trim());
            return {
              left: leftMap[leftCode] || "",
              right: rightMap[rightCode] || "",
            };
          });

        question.AnswerContent = {
          leftItems,
          rightItems,
          correctAnswer,
        };
      }

      return question;
    });

    return {
      ID: partID,
      Content: part.Content ?? `Part ${part.Sequence}`,
      SubContent: part.SubContent ?? null,
      Sequence: part.Sequence,
      TopicID: topicID,
      createdAt: part.createdAt ?? new Date().toISOString(),
      updatedAt: part.updatedAt ?? new Date().toISOString(),
      Questions: questions,
    };
  });
console.log("partGrama", fullParts)
  return {
    ID: topicID || null,
    Name: topicName || null,
    createdAt: grammarSkill.createdAt ?? new Date().toISOString(),
    updatedAt: grammarSkill.updatedAt ?? new Date().toISOString(),
    Parts: fullParts,
  };
};

export const transformReadingData = (data) => {
  const readingSkill = data.Skills.find((skill) =>
    skill.Name.toLowerCase().includes("reading")
  );
  if (!readingSkill) return null;

  const topicID = data.ID;
  const topicName = data.Name;

  const parts = readingSkill.Parts.map((part) => {
    const isSpecialPart3 = /^Part 3:/i.test(part.Content?.trim());

    const questions = part.Questions.map((q) => {
      const question = {
        ID: q.ID,
        Type: q.Type,
        AudioKeys: q.AudioKeys ?? null,
        ImageKeys: q.ImageKeys ?? null,
        SkillID: readingSkill.ID,
        PartID: part.ID,
        Sequence: q.Sequence,
        Content: q.Content,
        SubContent: part.SubContent ?? null,
        GroupContent: q.GroupContent ?? null,
        createdAt: q.createdAt ?? new Date().toISOString(),
        updatedAt: q.updatedAt ?? new Date().toISOString(),
        AnswerContent: {}, // xử lý bên dưới
      };

      const raw = q.AnswerContent ?? {};
      const type = q.Type;

      // ✅ CASE ĐẶC BIỆT: PART 3
      if (isSpecialPart3 && type === "dropdown-list") {
        const content = q.Content;
        const lines = raw.content?.split("\n").filter(Boolean) ?? [];

        const leftItems = [];
        const rightSet = new Set();

        lines.forEach((line) => {
          const [left, right] = line.split("|").map((s) => s.trim());
          if (left) leftItems.push(left);
          if (right) {
            const options = right
              .split("/")
              .map((opt) => opt.replace(/^[A-D]\.\s*/, "").trim());
            options.forEach((opt) => rightSet.add(opt));
          }
        });

        const rightItems = Array.from(rightSet);

        const correctAnswer = [];
        const rawCorrect = raw.correctAnswer;

        if (typeof rawCorrect === "string") {
          rawCorrect
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean)
            .forEach((entry) => {
              const [key, letter] = entry.split("|").map((s) => s.trim());
              const index = letter?.toUpperCase().charCodeAt(0) - 65;
              const valueRaw = rightItems[index];
              const value = valueRaw?.replace(/^[A-D]\.\s*/, "").trim(); // ⬅️ XÓA "B. " hoặc "C. " khỏi đáp án
              if (key && value) {
                correctAnswer.push({ key, value });
              }
            });
        }

        question.AnswerContent = {
          content,
          leftItems,
          rightItems,
          correctAnswer,
          partID: part.ID,
          type,
        };
      }

      // ✅ CASE DROPDOWN-LIST THƯỜNG
      else if (type === "dropdown-list") {
        const optionRegex = /(\d+)\.\s*\(([^)]+)\)/g;
        const options = [];

        let match;
        while ((match = optionRegex.exec(q.Content)) !== null) {
          const key = match[1];
          const values = match[2].split("/").map((v) => v.trim());
          options.push({ key, value: values });
        }

        const correctAnswer = [];
        const rawCorrect = raw.correctAnswer;

        if (typeof rawCorrect === "string") {
          rawCorrect
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean)
            .forEach((entry) => {
              const [key, letter] = entry.split("|").map((s) => s.trim());
              const option = options.find((opt) => opt.key === key);
              const index = letter?.toUpperCase().charCodeAt(0) - 65;
              const value = option?.value?.[index] ?? null;
              if (key && value) {
                correctAnswer.push({ key, value });
              }
            });
        } else if (Array.isArray(rawCorrect)) {
          rawCorrect.forEach((item) => {
            if (item?.key && item?.value) {
              correctAnswer.push({ key: item.key, value: item.value });
            }
          });
        }

        question.AnswerContent = {
          content: raw.content ?? q.Content,
          options,
          correctAnswer,
          partID: part.ID,
          type,
        };
      }

      // ✅ CASE ORDERING
      else if (type === "ordering") {
        const lines = raw.content?.split("\n") ?? [];
        const options = lines
          .map((line) => line.replace(/^[A-Z]\.\s*/, "").trim())
          .filter(Boolean);

        const correctAnswer = [];
        if (typeof raw.correctAnswer === "string") {
          raw.correctAnswer
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean)
            .forEach((line) => {
              const [num, label] = line.split("|").map((s) => s.trim());
              const index = label.charCodeAt(0) - 65;
              const key = options[index];
              if (key && num) {
                correctAnswer.push({
                  key,
                  value: parseInt(num),
                });
              }
            });
        }

        question.AnswerContent = {
          content: raw.content ?? q.Content,
          options,
          correctAnswer,
          partID: part.ID,
          type,
        };
      }

      // ✅ CASE MATCHING
      else if (type === "matching") {
        const content = raw.content ?? q.Content;
        const leftMatch = content.match(/Contents:\s*([\s\S]*?)Options:/);
        const rightMatch = content.match(/Options:\s*([\s\S]*)/);

        const leftItems = leftMatch
          ? leftMatch[1]
              .trim()
              .split("\n")
              .map((item) => item.replace(/^\d+\.\s*/, "").trim())
          : [];

        const rightItems = rightMatch
          ? rightMatch[1]
              .trim()
              .split("\n")
              .map((item) => item.replace(/^[A-Z]\.\s*/, "").trim())
          : [];

        const correctAnswer = [];
        if (typeof raw.correctAnswer === "string") {
          raw.correctAnswer
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean)
            .forEach((line) => {
              const [leftCode, rightCode] = line
                .split("|")
                .map((s) => s.trim());
              const left = leftItems[parseInt(leftCode) - 1];
              const right = rightItems[rightCode.charCodeAt(0) - 65];
              if (left && right) {
                correctAnswer.push({ left, right });
              }
            });
        }

        question.AnswerContent = {
          content,
          leftItems,
          rightItems,
          correctAnswer,
          partID: part.ID,
          type,
        };
      }

      return question;
    });

    return {
      ID: part.ID,
      Content: part.Content,
      SubContent: part.SubContent ?? null,
      Sequence: part.Sequence,
      TopicID: topicID,
      createdAt: part.createdAt ?? new Date().toISOString(),
      updatedAt: part.updatedAt ?? new Date().toISOString(),
      Questions: questions,
    };
  });
  console.log("partreading", parts)
  return {
    ID: topicID || null,
    Name: topicName || null,
    createdAt: data.createdAt ?? new Date().toISOString(),
    updatedAt: data.updatedAt ?? new Date().toISOString(),
    Parts: parts,
  };
  
};

export const transformWritingData = (data) => {
  const writingSkill = data.Skills.find((skill) =>
    skill.Name.toLowerCase().includes("writing")
  );
  if (!writingSkill) return null;

  const topicID = data.ID;
  const topicName = data.Name;

  const parts = writingSkill.Parts.map((part) => {
    const questions = part.Questions.map((q) => {
      return {
        ID: q.ID,
        Type: q.Type, // luôn là "writing"
        AudioKeys: q.AudioKeys ?? null,
        ImageKeys: q.ImageKeys ?? null,
        SkillID: writingSkill.ID,
        PartID: part.ID,
        Sequence: q.Sequence,
        Content: q.Content,
        SubContent: q.SubContent ?? null,
        GroupContent: q.GroupContent ?? null,
        createdAt: q.createdAt ?? new Date().toISOString(),
        updatedAt: q.updatedAt ?? new Date().toISOString(),
        AnswerContent: {
          content: null, // vì không có đáp án mẫu
          partID: part.ID,
          type: "writing",
        },
      };
    });

    return {
      ID: part.ID,
      Content: part.Content,
      SubContent: part.SubContent ?? null,
      Sequence: part.Sequence,
      TopicID: topicID,
      createdAt: part.createdAt ?? new Date().toISOString(),
      updatedAt: part.updatedAt ?? new Date().toISOString(),
      Questions: questions,
    };
  });
  console.log("partwriting", parts)
  return {
    ID: topicID || null,
    Name: topicName || null,
    createdAt: data.createdAt ?? new Date().toISOString(),
    updatedAt: data.updatedAt ?? new Date().toISOString(),
    Parts: parts,
  };
};
