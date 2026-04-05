import TeacherManagement from '@features/teacher/ui/TeacherManagement';
import React from 'react';

const TeacherAccountManagement = () => {
  return (
    <div className="figma-page-container">
      <div className="figma-content-wrapper">
        <div className="py-8">
          <div className="mb-10">
            <h4 className="figma-title">Teacher Account Management</h4>
            <p className="figma-subtitle">Manage and organize teacher account.</p>
          </div>
          <TeacherManagement />
        </div>
      </div>
    </div>
  );
};

export default TeacherAccountManagement;
