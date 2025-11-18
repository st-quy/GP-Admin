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
    ],
  },
];

export default PrivateRoute;
