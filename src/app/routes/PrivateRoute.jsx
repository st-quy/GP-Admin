import { lazy } from 'react';
import { ProtectedRoute } from './ProtectedRoute/ProtectedRoute.jsx';
import GradingPage from '@pages/grading/GradingPage.jsx';
import SessionLayout from '../../pages/SessionManagement/SessionLayout.jsx';
import SessionInformation from '@pages/SessionManagement/SessionInformation.jsx';
import { TableType } from '@features/session/constant/TableEnum.js';
const ProfilePage = lazy(() => import('@pages/Profile/index.jsx'));
import Dashboard from '@pages/Dashboard/Dashboard.jsx';
import ClassDetail from '@pages/ClassDetail/ClassDetail.jsx';
import TeacherAccountManagement from '@pages/TeacherManagement/TeacherAccountManagement.jsx';
import ClassManagement from '@pages/ClassManagement/index.jsx';
import RedirectByRole from './RedirectByRole/index.jsx';
import CreateQuestion from '@pages/QuestionBank/components/CreateQuestion.jsx';
import ExamListPage from '@pages/Exam/index.jsx';
const QuestionBank = lazy(() => import('@pages/QuestionBank/index.jsx'));
const QuestionDetail = lazy(() => import('@pages/QuestionBank/QuestionDetail'));
const CreateExamPage = lazy(() => import('@pages/Exam/components/CreateExam.jsx'));

const PrivateRoute = [
  {
    path: '/',
    element: <ProtectedRoute />,
    breadcrumb: 'Home',
    children: [
      {
        index: true,
        element: <RedirectByRole />,
        breadcrumb: 'Dashboard',
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
        breadcrumb: 'Dashboard',
        role: ['admin'],
      },
      {
        path: 'teacher',
        role: ['admin'],
        breadcrumb: 'Teacher',
        element: <TeacherAccountManagement />,
      },
      {
        path: 'class',
        role: ['teacher'],
        breadcrumb: 'Class Management',
        children: [
          {
            index: true,
            element: <ClassManagement />,
          },
          {
            path: ':classId',
            breadcrumb: 'Class Detail',
            children: [
              {
                index: true,
                element: <ClassDetail />,
              },
              {
                path: 'session',
                element: <SessionLayout />,
                children: [
                  {
                    path: ':sessionId',
                    breadcrumb: 'Session Detail',
                    children: [
                      {
                        index: true,
                        element: (
                          <SessionInformation type={TableType.SESSION} />
                        ),
                      },
                      {
                        path: 'student',
                        children: [
                          {
                            path: ':studentId',
                            breadcrumb: 'Student Detail',
                            children: [
                              {
                                index: true,
                                element: (
                                  <SessionInformation
                                    type={TableType.STUDENT}
                                  />
                                ),
                              },
                            ],
                          },
                        ],
                      },
                      {
                        path: 'participant',
                        children: [
                          {
                            path: ':participantId',
                            breadcrumb: 'Participant Detail',
                            children: [
                              {
                                index: true,
                                element: <GradingPage />,
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        path: 'profile',
        breadcrumb: 'Profile',
        children: [
          {
            path: '',
            element: <ProfilePage />,
            breadcrumb: '',
          },
        ],
      },
      {
        path: 'questions',
        breadcrumb: 'Question Bank',
        children: [
          {
            index: true,
            element: <QuestionBank />,
          },
          {
            path: ':id',
            element: <QuestionDetail />,
            breadcrumb: 'Detail',
            role: ['teacher', 'admin', 'superadmin'],
          },
          {
            path: 'create/:skill',
            element: <CreateQuestion />,
            breadcrumb: 'Create New Question ',
            role: ['teacher', 'admin', 'superadmin'],
          },
        ],
      },
      {
        path: 'exam',
        breadcrumb: 'Exam Management',
        children: [
          {
            index: true,
            element: <ExamListPage />,
          },
          {
            path: 'create',
            element: <CreateExamPage />,
            breadcrumb: 'Create New Exam ',
            role: ['teacher', 'admin', 'superadmin'],
          },
        ],
      },
    ],
  },
];

export default PrivateRoute;
