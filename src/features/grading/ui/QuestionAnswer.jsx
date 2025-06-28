import { Card } from "antd";
import AudioPlayers from "./AudioPlayer";

export const QuestionAnswer = ({
  quesntionsAnswerData = {},
  isSpeaking = false,
  fileName = "",
  speakingPartFour = [],
}) => {
  const studentAnswers = () => {
    if (isSpeaking) {
      if (
        speakingPartFour?.length > 0 &&
        speakingPartFour[0]?.studentAnswer?.AnswerAudio
      ) {
        return (
          <div className="place-self-center self-center">
            <AudioPlayers
              audioUrl={speakingPartFour[0]?.studentAnswer?.AnswerAudio || ""}
              audioFileName={fileName}
            />
          </div>
        );
      }
      if (!quesntionsAnswerData?.studentAnswer?.AnswerAudio) {
        return (
          <div className="whitespace-pre-line">{"No answer available"}</div>
        );
      }

      return (
        <div className="place-self-center self-center">
          <AudioPlayers
            audioUrl={quesntionsAnswerData?.studentAnswer?.AnswerAudio || ""}
            audioFileName={fileName}
          />
        </div>
      );
    }

    return (
      <div className="whitespace-pre-line">
        {quesntionsAnswerData?.studentAnswer?.AnswerText ||
          "No answer available"}
      </div>
    );
  };
  return (
    <Card
      variant="borderless"
      className="rounded-lg overflow-hidden"
      styles={{ body: { padding: 0 } }}
    >
      <div className="bg-[#E6F0FA] px-[4.375rem] py-[2.125rem] leading-6 text-base">
        <div className="flex">
          <div className="font-bold">Question:</div>
          <div>&nbsp;{quesntionsAnswerData?.Content || ""}</div>
        </div>
        {quesntionsAnswerData?.ImageKeys?.length > 0 && (
          <div className="mt-3 flex gap-1 flex-wrap">
            {quesntionsAnswerData?.ImageKeys?.map((image, index) => (
              <img
                key={index}
                src={image || ""}
                alt="speaking image"
                className="w-1/2"
              />
            ))}
          </div>
        )}
        {speakingPartFour[0]?.ImageKeys?.length > 0 && (
          <div className="mt-3 flex gap-1 flex-wrap">
            {speakingPartFour[0]?.ImageKeys?.map((image, index) => (
              <img
                key={index}
                src={image || ""}
                alt="speaking image"
                className="w-1/2"
              />
            ))}
          </div>
        )}
        {speakingPartFour?.length > 0 && (
          <div className="flex flex-col gap-2 py-2">
            {speakingPartFour.map((quest) => (
              <p key={quest.ID}>{quest?.Content || ""}</p>
            ))}
          </div>
        )}
      </div>

      <div className="py-[1.875rem] px-[4.375rem] leading-6 text-base">
        <div className="font-bold mb-2">Student answer:</div>
        {studentAnswers()}
      </div>
    </Card>
  );
};
