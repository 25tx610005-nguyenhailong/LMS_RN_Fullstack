import Home from '~/pages/Home/Index'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import NotFound from '~/pages/404/NotFound'
import Auth from '~/pages/Auth/Auth'
import AccountVerification from '~/pages/Auth/AccountVerification'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '~/redux/user/userSlice'
import Settings from '~/pages/Settings/Settings'
import CourseDetail from '~/pages/Courses/Index'
import UserManagement from '~/pages/Admin/UserManagement'
import AccountForm from '~/pages/Admin/AccountForm'
import AdminLayout from '~/components/Layout/AdminLayout'
import SchoolDashboard from '~/pages/School/SchoolDashboard'
import Authorized from '~/components/AccessControl/Authorized'
import SchoolOverview from '~/pages/School/Tabs/SchoolOverview'
import SchoolTeachers from '~/pages/School/Tabs/SchoolTeachers'
import SchoolStudents from '~/pages/School/Tabs/SchoolStudents'
import SchoolClasses from '~/pages/School/Tabs/SchoolClasses'
import CreateClass from '~/pages/School/Tabs/CreateClass'
import SchoolMaterials from '~/pages/School/Tabs/SchoolMaterials'
import SchoolSchedule from '~/pages/School/Tabs/SchoolSchedule'
import SchoolSalary from '~/pages/School/Tabs/SchoolSalary'
import SchoolSettings from '~/pages/School/Tabs/SchoolSettings'
import CourseOverview from '~/pages/Courses/Tabs/CourseOverview'
import CourseSchedule from '~/pages/Courses/Tabs/CourseSchedule'
import CourseAssignments from '~/pages/Courses/Tabs/CourseAssignments'
import CourseAttendance from '~/pages/Courses/Tabs/CourseAttendance'
import CourseEvaluation from '~/pages/Courses/Tabs/CourseEvaluation'
import CourseStudents from '~/pages/Courses/Tabs/CourseStudents'
import CourseContact from '~/pages/Courses/Tabs/CourseContact'
import CourseSettings from '~/pages/Courses/Tabs/CourseSettings'
import EnrollClass from '~/pages/Enroll/EnrollClass'

//https://www.robinwieruch.de/react-router-private-routes/
const ProtectedRoute = ({ user }) => {
  if (!user) return <Navigate to='/login' replace={true} />
  return <Outlet />
}
function App() {
  const currentUser = useSelector(selectCurrentUser)

  return (
    <Routes>
      <Route path='/' element={<Navigate to='/home' />} />

      {/* Login rồi mới được truy cập những route bên trong  */}
      <Route element={<ProtectedRoute user={currentUser} />}>
        {/*Outlet của react-router-dom sẽ chạy vào những route trong này  */}
        <Route path='/home' element={<Home />} />
        <Route path='/school/:schoolId' element={<SchoolDashboard />}>
          <Route index element={<Navigate to="overview" />} />
          <Route path='overview' element={<SchoolOverview />} />
          <Route path='teachers' element={<SchoolTeachers />} />
          <Route path='students' element={<SchoolStudents />} />
          <Route path='classes' element={<SchoolClasses />} />
          <Route path='create-class' element={<CreateClass />} />
          <Route path='edit-class/:courseId' element={<CreateClass />} />
          <Route path='materials' element={<SchoolMaterials />} />
          <Route path='schedule' element={<SchoolSchedule />} />
          <Route path='salary' element={<SchoolSalary />} />
          <Route path='settings' element={<SchoolSettings />} />
        </Route>

        {/* Course LMS Routes */}
        <Route path='/courses/:id' element={<CourseDetail />}>
          <Route index element={<Navigate to="schedule" />} />
          <Route path='schedule' element={<CourseSchedule />} />
          <Route path='assignments' element={<CourseAssignments />} />
          <Route path='attendance' element={<CourseAttendance />} />
          <Route path='evaluation' element={<CourseEvaluation />} />
          <Route path='students' element={<CourseStudents />} />
          <Route path='overview' element={<CourseOverview />} />
          <Route path='contact' element={<CourseContact />} />
          <Route path='settings' element={<CourseSettings />} />
        </Route>

        {/* Admin Routes */}
        <Route path='/admin' element={
          <Authorized right="ADMIN_ACCESS">
            <AdminLayout />
          </Authorized>
        }>
          <Route index element={<Navigate to="users" />} />
          <Route path='users' element={<UserManagement />} />
          <Route path='users/create' element={<AccountForm />} />
          <Route path='users/edit/:id' element={<AccountForm />} />
          {/* Dashboard and Settings placeholders can be added here */}
        </Route>

        <Route path='/settings/account' element={<Settings />} />
        <Route path='/settings/security' element={<Settings />} />
      </Route>
      <Route path='/login' element={<Auth />} />
      <Route path='/register' element={<Auth />} />
      <Route path='/enroll/:courseId' element={<EnrollClass />} />
      <Route path='/account/verification' element={<AccountVerification />} />
      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}
export default App
