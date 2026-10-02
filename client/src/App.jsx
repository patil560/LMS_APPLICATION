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

// =====================================================
// LAZY LOADING - Admin pages & heavy components
// =====================================================
// These are only downloaded when student/admin actually needs them
const Sidebar = lazy(() => import("./pages/admin/sidebar.jsx"));
const CourseTable = lazy(() => import("./pages/admin/course/coursetable"));
const Dashboard = lazy(() => import("./pages/admin/dashboard"));
const AddCourse = lazy(() => import("./pages/admin/course/AddCourse"));
const EditCourse = lazy(() => 
  import("./pages/admin/course/Editcourse").then((m) => ({ default: m.EditCourse }))
);
const CreateLecture = lazy(() => import("./pages/admin/lecture/createLecture"));
const EditLecture = lazy(() => import("./pages/admin/lecture/editlecture"));
const CourseProgress = lazy(() => import("./pages/student/courseprogress"));

// =====================================================
// HELPER: Wrap components with Suspense
// =====================================================
// This shows loading spinner while lazy components are downloading
const withSuspense = (node) => (
  <Suspense fallback={<LoadingSpinner />}>
    {node}
  </Suspense>
);

// =====================================================
// ROUTER CONFIGURATION (PRODUCTION READY)
// =====================================================
const appRouter = createBrowserRouter([
  // =====================================================
  // ROUTE 1: LOGIN PAGE (TOP LEVEL - NOT in MainLayout)
  // =====================================================
  // Unauthenticated users see ONLY this page
  // No header, no nav, no layout - just login form
  {
    path: "/login",
    element: (
      <AuthenticatedUser>
        <Login />
      </AuthenticatedUser>
    ),
    errorElement: <RootError />,
  },

  // =====================================================
  // ROUTE 2: MAIN APP (All other routes)
  // =====================================================
  // Protected at parent level - checks auth BEFORE MainLayout loads
  {
    path: "/",
    element: (
      // This ProtectedRoute wrapper is the KEY CHANGE
      // It checks authentication BEFORE rendering MainLayout
      // If not authenticated → redirects to /login
      // If authenticated → renders MainLayout + child routes
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    errorElement: <RootError />,
    children: [
      // =====================================================
      // HOME PAGE (/)
      // =====================================================
      // Only accessible if user is logged in
      {
        index: true,
        element: (
          <>
            <HeroSection />
            <Courses /> {/* Database fetch - only happens if logged in */}
          </>
        ),
      },

      // =====================================================
      // MY LEARNING PAGE (/my-learning)
      // =====================================================
      {
        path: "my-learning",
        element: withSuspense(<MyLearning />),
      },

      // =====================================================
      // WISHLIST PAGE (/wishlist)
      // =====================================================
      {
        path: "wishlist",
        element: withSuspense(<Wishlist />),
      },

      // =====================================================
      // PROFILE PAGE (/profile)
      // =====================================================
      {
        path: "profile",
        element: withSuspense(<Profile />),
      },

      // =====================================================
      // SEARCH PAGE (/course/search)
      // =====================================================
      {
        path: "course/search",
        element: withSuspense(<SearchPage />),
      },

      // =====================================================
      // COURSE DETAIL PAGE (/course-detail/:courseId)
      // =====================================================
      {
        path: "course-detail/:courseId",
        element: withSuspense(<CourseDetail />),
      },

      // =====================================================
      // COURSE PROGRESS PAGE (/course-progress/:courseId)
      // =====================================================
      // Extra protection: Only users who purchased this course can view
      {
        path: "course-progress/:courseId",
        element: (
          <PurchaseCourseProtectedRoute>
            {withSuspense(<CourseProgress />)}
          </PurchaseCourseProtectedRoute>
        ),
      },

      // =====================================================
      // ADMIN ROUTES (/admin/*)
      // =====================================================
      // Only admin/teachers can access
      {
        path: "admin",
        element: (
          <AdminRoute>
            {withSuspense(<Sidebar />)}
          </AdminRoute>
        ),
        children: [
          // Admin Dashboard
          {
            path: "dashboard",
            element: withSuspense(<Dashboard />),
          },

          // Course Management Table
          {
            path: "course",
            element: withSuspense(<CourseTable />),
          },

          // Create New Course
          {
            path: "course/create",
            element: withSuspense(<AddCourse />),
          },

          // Edit Existing Course
          {
            path: "course/:courseId",
            element: withSuspense(<EditCourse />),
          },

          // Create Lecture
          {
            path: "course/:courseId/lecture",
            element: withSuspense(<CreateLecture />),
          },

          // Edit Lecture
          {
            path: "course/:courseId/lecture/:lectureId",
            element: withSuspense(<EditLecture />),
          },
        ],
      },
    ],
  },
]);

// =====================================================
// APP COMPONENT
// =====================================================
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