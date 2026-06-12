const getSequenceValue = (value, fallback) => {
  const sequence = Number(value);
  return Number.isFinite(sequence) ? sequence : fallback;
};

export const sortBySequence = (items = []) =>
  [...items]
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const sequenceDiff =
        getSequenceValue(a.item?.Sequence ?? a.item?.sequence, a.index) -
        getSequenceValue(b.item?.Sequence ?? b.item?.sequence, b.index);
      return sequenceDiff || a.index - b.index;
    })
    .map(({ item }) => item);

export const normalizeExamDataSequence = data => {
  if (!data || !Array.isArray(data.Sections)) {
    return data;
  }

  return {
    ...data,
    Sections: sortBySequence(data.Sections).map(section => ({
      ...section,
      Parts: sortBySequence(section.Parts || []).map(part => ({
        ...part,
        Questions: sortBySequence(part.Questions || [])
      }))
    }))
  };
};
