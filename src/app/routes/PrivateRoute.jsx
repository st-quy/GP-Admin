import { lazy } from "react";
import { ProtectedRoute } from "./ProtectedRoute/ProtectedRoute.jsx";
import GradingPage from "@pages/grading/GradingPage.jsx";
import SessionLayout from "../../pages/SessionManagement/SessionLayout.jsx";
import SessionInformation from "@pages/SessionManagement/SessionInformation.jsx";
import { TableType } from "@features/session/constant/TableEnum.js";
const ProfilePage = lazy(() => import("@pages/Profile/index.jsx"));
import Dashboard from "@pages/Dashboard/Dashboard.jsx";
import ClassDetail from "@pages/ClassDetail/ClassDetail.jsx";
import TeacherAccountManagement from "@pages/TeacherManagement/TeacherAccountManagement.jsx";
import ClassManagement from "@pages/ClassManagement/index.jsx";
import RedirectByRole from "./RedirectByRole/index.jsx";
import CreateQuestion from "@pages/QuestionBank/components/CreateQuestion.jsx";
import ExamListPage from "@pages/Exam/index.jsx";
import IntroductionPage from "@pages/MockTest/introduction-page.jsx";
import ListeningPage from '@pages/MockTest/Listening/index.jsx'
import HeadphoneCheck from '@pages/MockTest/Listening/listening-headphonecheck.jsx'
import ListeningIntroduction from '@pages/MockTest/Listening/listening-introduction.jsx'
import ListeningTest from '@pages/MockTest/Listening/listening-test.jsx'
import GrammarPage from '@pages/MockTest/Grammar/index.jsx'
import GrammarIntroduction from '@pages/MockTest/Grammar/grammar-introduction.jsx'
import GrammarTest from '@pages/MockTest/Grammar/grammar-test.jsx'
import ReadingPage from '@pages/MockTest/Reading/index.jsx'
import ReadingIntroduction from '@pages/MockTest/Reading/reading-introduction.jsx'
import ReadingTest from '@pages/MockTest/Reading/reading-test.jsx'
import SpeakingPage from '@pages/MockTest/Speaking/index.jsx'
import MicrophoneCheck from '@pages/MockTest/Speaking/micro-check.jsx'
import SpeakingIntroduction from '@pages/MockTest/Speaking/speaking-introduction.jsx'
import SpeakingParts from '@pages/MockTest/Speaking/speaking-parts.jsx'
import WritingPage from '@pages/MockTest/Writing/index.jsx'
import WritingIntroduction from '@pages/MockTest/Writing/writing-introduction.jsx'
import WritingTest from '@pages/MockTest/Writing/writing-test.jsx'
import TestLayout from '@shared/ui/test-layout'
import WaitingForApproval from '@features/welcome/ui/waiting-for-approval.jsx'
import SubmissionPage from '@pages/MockTest/submission-page.jsx'
const QuestionBank = lazy(() => import("@pages/QuestionBank/index.jsx"));
const QuestionDetail = lazy(() => import("@pages/QuestionBank/QuestionDetail"));
import LocalPointsPage from "@pages/MockTest/LocalPointsPage.jsx";

const PrivateRoute = [
  {
    path: "/",
    element: <ProtectedRoute />,
    breadcrumb: "Home",
    children: [
      {
        index: true,
        element: <RedirectByRole />,
        breadcrumb: "Dashboard",
      },
      {
        path: "dashboard",
        element: <Dashboard />,
        breadcrumb: "Dashboard",
        role: ["admin"],
      },
      {
        path: "teacher",
        role: ["admin"],
        breadcrumb: "Teacher",
        element: <TeacherAccountManagement />,
      },
      {
        path: "class",
        role: ["teacher"],
        breadcrumb: "Class Management",
        children: [
          {
            index: true,
            element: <ClassManagement />,
          },
          {
            path: ":classId",
            breadcrumb: "Class Detail",
            children: [
              {
                index: true,
                element: <ClassDetail />,
              },
              {
                path: "session",
                element: <SessionLayout />,
                children: [
                  {
                    path: ":sessionId",
                    breadcrumb: "Session Detail",
                    children: [
                      {
                        index: true,
                        element: (
                          <SessionInformation type={TableType.SESSION} />
                        ),
                      },
                      {
                        path: "student",
                        children: [
                          {
                            path: ":studentId",
                            breadcrumb: "Student Detail",
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
                        path: "participant",
                        children: [
                          {
                            path: ":participantId",
                            breadcrumb: "Participant Detail",
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
        path: "profile",
        breadcrumb: "Profile",
        children: [
          {
            path: "",
            element: <ProfilePage />,
            breadcrumb: "",
          },
        ],
      },
      {
        path: "questions",
        breadcrumb: "Question Bank",
        children: [
          {
            index: true,
            element: <QuestionBank />,
          },
          {
            path: ":id",
            element: <QuestionDetail />,
            breadcrumb: "Detail",
            role: ["teacher", "admin", "superadmin"],
          },
          {
            path: "create/:skill",
            element: <CreateQuestion />,
            breadcrumb: "Create New Question ",
            role: ["teacher", "admin", "superadmin"],
          },
        ],
      },
      {
        path: "exam",
        breadcrumb: "Exam Management",
        children: [
          {
            index: true,
            element: <ExamListPage />,
          },
        ],
      },
      {
        path: "introduction",
        element: <IntroductionPage />,
      },
      {
        path: 'writing',
        element: <WritingPage />,
        children: [
          {
            index: true,
            element: <WritingIntroduction />
          },
          {
            path: 'test',
            element: (
              <TestLayout>
                <WritingTest />
              </TestLayout>
            )
          }
        ]
      },
      {
        path: 'grammar',
        element: <GrammarPage />,
        children: [
          {
            index: true,
            element: <GrammarIntroduction />
          },
          {
            path: 'test',
            element: (
              // <TestLayout>
              <GrammarTest />
              // </TestLayout>
            )
          }
        ]
      },
      {
        path: 'speaking',
        element: <SpeakingPage />,
        children: [
          {
            index: true,
            element: <SpeakingIntroduction />
          },
          {
            path: 'test/:part',
            element: (
              <TestLayout>
                <SpeakingParts />
              </TestLayout>
            )
          },
          {
            path: 'microphonecheck',
            element: <MicrophoneCheck />
          }
        ]
      },
      {
        path: 'reading',
        element: <ReadingPage />,
        children: [
          {
            index: true,
            element: <ReadingIntroduction />
          },
          {
            path: 'test',
            element: (
              <TestLayout>
                <ReadingTest />
              </TestLayout>
            )
          }
        ]
      },
      {
        path: 'listening',
        element: <ListeningPage />,
        children: [
          {
            index: true,
            element: <ListeningIntroduction />
          },
          {
            path: 'headphonecheck',
            element: <HeadphoneCheck />
          },
          {
            path: 'test',
            element: (
              <TestLayout>
                <ListeningTest />
              </TestLayout>
            )
          }
        ]
      },
      {
        path: '/:topicId/waiting-for-approval/',
        element: <WaitingForApproval />
      },
      {
        path: 'complete-test',
        element: <SubmissionPage />
      },
      {
        path: 'local-points-page',
        element: <LocalPointsPage/>
      },
    ],
  },
];

export default PrivateRoute;
