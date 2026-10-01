import { lazy, Suspense } from "react";
import LoadingSpinner from "./components/loadingspinner.jsx";
import { Login } from "./pages/login";
import HeroSection from "./pages/student/heroSection";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import RootError from "./routeerror.jsx";
import Courses from "./pages/student/courses";
import MyLearning from "./pages/student/myLearning";
import Profile from "./pages/student/Profile.jsx";
import CourseDetail from "./pages/student/courseDetail";
import SearchPage from "./pages/student/searchpage";
import Wishlist from "./pages/student/Wishlist.jsx";
import { AuthenticatedUser, AdminRoute, ProtectedRoute } from "./components/ProtectedRoutes.jsx";
import PurchaseCourseProtectedRoute from "./components/PurchaseCourseProtectedRoute.jsx"
import { ThemeProvider } from "@/components/ThemeProvider.jsx"

// Admin pages, the dashboard charts and the video player are loaded only when needed,
// so students download a much smaller first bundle.
const Sidebar = lazy(() => import("./pages/admin/sidebar.jsx"));
const CourseTable = lazy(() => import("./pages/admin/course/coursetable"));
const Dashboard = lazy(() => import("./pages/admin/dashboard"));
const AddCourse = lazy(() => import("./pages/admin/course/AddCourse"));
const EditCourse = lazy(() => import("./pages/admin/course/Editcourse").then((m) => ({ default: m.EditCourse })));
const CreateLecture = lazy(() => import("./pages/admin/lecture/createLecture"));
const EditLecture = lazy(() => import("./pages/admin/lecture/editlecture"));
const CourseProgress = lazy(() => import("./pages/student/courseprogress"));

const withSuspense = (node) => <Suspense fallback={<LoadingSpinner />}>{node}</Suspense>;

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <RootError />,
    children: [
      {
        index: true,
        element: (
          <>
            <HeroSection />
            <Courses />
          </>
        ),
      },
      {
        path: "login",
        element: (
          <AuthenticatedUser>
            <Login />
          </AuthenticatedUser>
        ),
      },
      {
        path: "my-learning",
        element: (
          <ProtectedRoute>
            <MyLearning />
          </ProtectedRoute>
        ),
      },
      {
        path: "wishlist",
        element: (
          <ProtectedRoute><Wishlist /></ProtectedRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "course/search",
        element: (
          <ProtectedRoute>
            <SearchPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "course-detail/:courseId",
        element: (
          <ProtectedRoute>
            <CourseDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: "course-progress/:courseId",
        element: (
          <ProtectedRoute>
            <PurchaseCourseProtectedRoute>
            {withSuspense(<CourseProgress />)}
          </PurchaseCourseProtectedRoute>
          </ProtectedRoute>
        ),
      },
      // admin routes start here
      {
        path: "admin",
        element: (
          <AdminRoute>
            {withSuspense(<Sidebar />)}
          </AdminRoute>
        ),
        children: [
          {
            path: "dashboard",
            element: withSuspense(<Dashboard />),
          },
          {
            path: "course",
            element: withSuspense(<CourseTable />),
          },
          {
            path: "course/create",
            element: withSuspense(<AddCourse />),
          },
          {
            path: "course/:courseId",
            element: withSuspense(<EditCourse />),
          },
          {
            path: "course/:courseId/lecture",
            element: withSuspense(<CreateLecture />),
          },
          {
            path: "course/:courseId/lecture/:lectureId",
            element: withSuspense(<EditLecture />),
          },
        ],
      },
    ],
  },
]);

function App() {
  return (
    <main>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">

      <RouterProvider router={appRouter} />
      
      </ThemeProvider>
    </main>
  );
}

export default App;