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
      <div className='flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white px-6 py-6 border-b border-gray-100'>
        <div className='flex flex-col gap-1 mb-4 lg:mb-0'>
          <h1 className='text-[24px] lg:text-[28px] font-bold text-[#111827] m-0 font-inter leading-tight'>
            {title}
          </h1>
          <p className='text-[14px] lg:text-[16px] text-[#6B7280] font-medium m-0 font-inter'>
            {subtitle}
          </p>
        </div>
        <div className='flex flex-wrap items-center gap-3 w-full lg:w-auto'>
          {btnText && (
            <Button
              type='primary'
              icon={btnIcon}
              className='h-[48px] rounded-full bg-primaryColor hover:!bg-[#002A6B] border-none font-semibold px-6 shadow-sm flex items-center transition-all duration-300'
            >
              {btnText}
            </Button>
          )}
          <div className='w-full lg:w-auto'>{SubAction && SubAction}</div>
        </div>
      </div>
    </>
  );
};

export default HeaderInfo;
