import { Typography } from 'antd';

const { Title, Text } = Typography;

const QuestionLayout = ({ title, subtitle, children }) => {
  return (
    <div className='w-[90%] max-w-[1476px] mx-auto py-8 space-y-6'>
      <div>
        <Title level={3} className='!m-0 !font-bold !text-[#111928]'>
          {title}
        </Title>
        <Text className='text-[#6B7280] text-[16px]'>{subtitle}</Text>
      </div>
      {children}
    </div>
  );
};

export default QuestionLayout;
