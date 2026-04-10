import { Button } from 'antd';

const HeaderInfo = ({
  title,
  subtitle,
  btnText = null,
  btnIcon = null,
  SubAction = null,
}) => {
  return (
    <>
      <div className='flex justify-between items-center bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
        <div className='w-full flex flex-col gap-1'>
          <span className='text-xl font-semibold'>{title}</span>
          <span className='text-sm text-[#4B5563]'>{subtitle}</span>
        </div>
        <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
          {btnText && (
            <Button
              type='primary'
              icon={btnIcon}
              className='bg-[#22AD5C] hover:!bg-[#1e9650]  rounded-lg border-none font-medium p-5 shadow-sm flex items-center'
            >
              {btnText}
            </Button>
          )}
          <div className='w-full md:w-auto'>{SubAction && SubAction}</div>
        </div>
      </div>
    </>
  );
};

export default HeaderInfo;
