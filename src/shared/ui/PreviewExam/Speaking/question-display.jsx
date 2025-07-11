const QuestionDisplay = ({ data }) => {
  const imageUrl = data?.Questions[0]?.ImageKeys;
  const isPart4 = data.Content?.toLowerCase().startsWith("part 4");
  return (
    <div className="flex w-full bg-white gap-6 items-center">
      {imageUrl && (
        <div className="mb-4 flex justify-center">
          <div className="w-full max-w-lg">
            <div className="-inset-1 rounded-2xl bg-[#003087] opacity-10" />
            <img
              src={imageUrl}
              alt="Question visual"
              className="h-auto min-h-[160px] w-full rounded-2xl object-contain shadow-lg transition-transform duration-300 hover:scale-105 lg:min-h-[220px]"
            />
          </div>
        </div>
      )}

      <div className="rounded-2xl bg-gray-50 p-4 shadow-lg w-full">
        <>
          <div className="mb-4 flex items-center justify-between lg:mb-6">
            <span className="rounded-xl bg-[#003087] px-4 py-1 text-base font-semibold text-white lg:px-6 lg:py-2 lg:text-xl">
              Questions
            </span>
          </div>
          <div className="grid grid-cols-1 gap-2 lg:gap-4">
            {data.Questions.map((question, index) => (
              <div
                key={index}
                className="group relative rounded-xl bg-white p-3 shadow-md transition-all duration-300 hover:shadow-lg lg:p-4"
              >
                <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-[#003087]/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="absolute left-0 top-0 h-full w-1 rounded-l-xl bg-[#003087] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="flex items-start gap-2 lg:gap-4">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#003087] text-xs font-bold text-white lg:h-8 lg:w-8 lg:text-sm">
                    {isPart4 ? "+" : index + 1}
                  </div>
                  <p className="text-base leading-relaxed text-gray-800 lg:text-xl">
                    {question.Content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      </div>
    </div>
  );
};

export default QuestionDisplay;
