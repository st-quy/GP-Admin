import TeacherManagement from "@features/teacher/ui/TeacherManagement";
import React from "react";
const TeacherAccountManagement = () => {
  return (
    <div className="px-8 mt-8">
      <h1 className="text-2xl font-bold">Teacher Account Management</h1>
      <p className="text-gray-500">Manage and organize teacher account.</p>

      <div className="mt-6">
        <TeacherManagement />
      </div>
    </div>
  );
};

export default TeacherAccountManagement;
