import HeaderInfo from '@app/components/HeaderInfo';
import TeacherManagement from '@features/teacher/ui/TeacherManagement';
import { Card } from 'antd';
import React from 'react';
const TeacherAccountManagement = () => {
  return (
    <div className=''>
      <HeaderInfo
        title='Teacher Account Management'
        subtitle='Manage and organize teacher account.'
      />
      <Card className='m-4'>
        <TeacherManagement />
      </Card>
    </div>
  );
};

export default TeacherAccountManagement;
