import HeaderInfo from '@app/components/HeaderInfo';

const QuestionLayout = ({ title, subtitle, children }) => {
  return (
    <>
      <HeaderInfo title={title} subtitle={subtitle} />
      <div className='p-4'>{children}</div>
    </>
  );
};

export default QuestionLayout;
