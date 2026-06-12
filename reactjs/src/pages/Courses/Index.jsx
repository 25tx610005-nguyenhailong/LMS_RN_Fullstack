import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, useLocation, Outlet } from 'react-router-dom'
import moment from 'moment'
import {
  Container,
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  Breadcrumbs,
  Link,
  Avatar,
  Button
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import AssignmentIcon from '@mui/icons-material/Assignment'
import HowToRegIcon from '@mui/icons-material/HowToReg'
import AssessmentIcon from '@mui/icons-material/Assessment'
import PeopleIcon from '@mui/icons-material/People'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import ContactPhoneIcon from '@mui/icons-material/ContactPhone'
import SettingsIcon from '@mui/icons-material/Settings'
import LocalPhoneIcon from '@mui/icons-material/LocalPhone'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import ClassIcon from '@mui/icons-material/Class'
import { fetchCourseDetailsAPI } from '~/apis/courseApi'
import AppBar from '~/components/AppBar/AppBar'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '~/redux/user/userSlice'
import { resolveFileUrl } from '~/utils/formatters'

const COLORS = {
  primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  bg: '#f8fafc'
}

function CourseIndex() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const currentUser = useSelector(selectCurrentUser)
  const userRole = currentUser?.role?.toUpperCase()

  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)

  const tabsRef = useRef(null)
  const [isSticky, setIsSticky] = useState(false)

  // Scroll listener to detect when tabs container touches or goes past AppBar (64px)
  useEffect(() => {
    const handleScroll = () => {
      if (tabsRef.current) {
        const rect = tabsRef.current.getBoundingClientRect()
        if (rect.top <= 64) {
          setIsSticky(true)
        } else {
          setIsSticky(false)
        }
      }
    }
    window.addEventListener('scroll', handleScroll)
    // Run once initially to check scroll position on mount
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const [reloadKey, setReloadKey] = useState(0)
  const reloadCourse = () => setReloadKey(prev => prev + 1)

  useEffect(() => {
    fetchCourseDetailsAPI(id).then(data => {
      setCourse(data)
      setLoading(false)
    })
  }, [id, reloadKey])

  const currentPath = location.pathname.split('/').pop()
  const [tabValue, setTabValue] = useState(0)
  const tabs = [
    { label: 'Lịch học', icon: <CalendarMonthIcon />, path: 'schedule' },
    { label: 'Bài tập', icon: <AssignmentIcon />, path: 'assignments' },
    { label: 'Điểm danh', icon: <HowToRegIcon />, path: 'attendance' },
    { label: 'Đánh giá học sinh', icon: <AssessmentIcon />, path: 'evaluation' },
    ...(userRole !== 'STUDENT' ? [{ label: 'Học viên', icon: <PeopleIcon />, path: 'students' }] : []),
    { label: 'Tài liệu', icon: <MenuBookIcon />, path: 'overview' },
    { label: 'Liên hệ', icon: <ContactPhoneIcon />, path: 'contact' },
    ...(userRole !== 'STUDENT' ? [{ label: 'Cài đặt', icon: <SettingsIcon />, path: 'settings' }] : [])
  ]

  useEffect(() => {
    const index = tabs.findIndex(t => t.path === currentPath)
    if (index !== -1) setTabValue(index)
  }, [currentPath])

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
    navigate(`/courses/${id}/${tabs[newValue].path}`)
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: COLORS.bg, pb: 10 }}>
      <AppBar>
        {isSticky && (
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            TabIndicatorProps={{ style: { display: 'none' } }}
            sx={{
              minHeight: 40,
              '& .Mui-selected': { background: COLORS.primary, color: 'white !important', borderRadius: '10px', boxShadow: '0 4px 12px rgba(118, 75, 162, 0.2)' },
              '& .MuiTab-root': { minHeight: 40, textTransform: 'none', fontWeight: 600, mx: 0.5, px: 2, borderRadius: '10px', fontSize: '0.85rem' }
            }}
          >
            {tabs.map((tab, index) => (
              <Tab key={index} icon={tab.icon} iconPosition="start" label={tab.label} sx={{ '& .MuiSvgIcon-root': { fontSize: 18 } }} />
            ))}
          </Tabs>
        )}
      </AppBar>

      {/* Compact Premium Header */}
      <Box
        sx={{
          pt: 2,
          pb: 5.5,
          px: 3,
          color: 'white',
          position: 'relative',
          ...(course?.Thumbnail ? {
            backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.75) 100%), url(${resolveFileUrl(course.Thumbnail)})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          } : {
            background: COLORS.primary
          })
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {/* Top row with back button and breadcrumbs */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<ArrowBackIcon sx={{ fontSize: '0.875rem' }} />}
                onClick={() => navigate(`/school/${course?.IdSchool}/overview`)}
                sx={{
                  color: 'white',
                  borderColor: course?.Thumbnail ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.3)',
                  textTransform: 'none',
                  fontWeight: 700,
                  borderRadius: '10px',
                  px: 1.5,
                  py: 0.25,
                  fontSize: '0.75rem',
                  bgcolor: course?.Thumbnail ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: course?.Thumbnail ? 'blur(4px)' : 'none',
                  height: '28px',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: course?.Thumbnail ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.18)'
                  }
                }}
              >
                Quay lại trường học
              </Button>

              <Breadcrumbs
                separator="›"
                sx={{
                  color: 'rgba(255,255,255,0.75)',
                  '& .MuiTypography-root, & .MuiLink-root': {
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    textShadow: course?.Thumbnail ? '0 1px 2px rgba(0,0,0,0.6)' : 'none'
                  },
                  '& .MuiBreadcrumbs-separator': {
                    color: 'rgba(255,255,255,0.5)'
                  }
                }}
              >
                <Link underline="hover" color="inherit" sx={{ cursor: 'pointer' }} onClick={() => navigate(`/school/${course?.IdSchool}/overview`)}>
                  {course?.School?.Name || 'Trường học'}
                </Link>
                <Typography color="inherit">{course?.Name}</Typography>
              </Breadcrumbs>
            </Box>

            {/* Title & Metadata chips */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5, flexWrap: 'wrap' }}>
              <Avatar
                sx={{
                  width: 44,
                  height: 44,
                  bgcolor: course?.Thumbnail ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.15)',
                  color: 'white',
                  border: course?.Thumbnail ? '1.5px solid rgba(255, 255, 255, 0.4)' : '1.5px solid rgba(255, 255, 255, 0.25)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)',
                  backdropFilter: course?.Thumbnail ? 'blur(4px)' : 'none'
                }}
              >
                <ClassIcon sx={{ fontSize: 22 }} />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{
                  fontWeight: 800,
                  letterSpacing: '-0.5px',
                  textShadow: course?.Thumbnail ? '0 2px 4px rgba(0,0,0,0.6)' : '0 2px 4px rgba(0,0,0,0.05)',
                  mb: 0.5
                }}>
                  {course?.Name}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.75,
                      bgcolor: course?.Thumbnail ? 'rgba(0, 0, 0, 0.45)' : 'rgba(255, 255, 255, 0.1)',
                      border: course?.Thumbnail ? '1px solid rgba(255, 255, 255, 0.15)' : 'none',
                      backdropFilter: course?.Thumbnail ? 'blur(4px)' : 'none',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: '8px'
                    }}
                  >
                    <LocationOnIcon sx={{ fontSize: 13, color: '#ff4d6d' }} />
                    <Typography variant="caption" sx={{
                      fontWeight: 600,
                      color: 'rgba(255, 255, 255, 0.9)',
                      textShadow: course?.Thumbnail ? '0 1px 2px rgba(0,0,0,0.3)' : 'none'
                    }}>
                      {course?.School?.Address || 'Vũng Tàu'}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.75,
                      bgcolor: course?.Thumbnail ? 'rgba(0, 0, 0, 0.45)' : 'rgba(255, 255, 255, 0.1)',
                      border: course?.Thumbnail ? '1px solid rgba(255, 255, 255, 0.15)' : 'none',
                      backdropFilter: course?.Thumbnail ? 'blur(4px)' : 'none',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: '8px'
                    }}
                  >
                    <LocalPhoneIcon sx={{ fontSize: 13, color: '#3b82f6' }} />
                    <Typography variant="caption" sx={{
                      fontWeight: 600,
                      color: 'rgba(255, 255, 255, 0.9)',
                      textShadow: course?.Thumbnail ? '0 1px 2px rgba(0,0,0,0.3)' : 'none'
                    }}>
                      {course?.School?.Phone || '0929213512'}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.75,
                      bgcolor: course?.Thumbnail ? 'rgba(0, 0, 0, 0.45)' : 'rgba(255, 255, 255, 0.1)',
                      border: course?.Thumbnail ? '1px solid rgba(255, 255, 255, 0.15)' : 'none',
                      backdropFilter: course?.Thumbnail ? 'blur(4px)' : 'none',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: '8px'
                    }}
                  >
                    <CalendarMonthIcon sx={{ fontSize: 13, color: '#00f5d4' }} />
                    <Typography variant="caption" sx={{
                      fontWeight: 600,
                      color: 'rgba(255, 255, 255, 0.9)',
                      textShadow: course?.Thumbnail ? '0 1px 2px rgba(0,0,0,0.3)' : 'none'
                    }}>
                      Lịch học: {course?.StartDate ? moment(course.StartDate).format('DD/MM/YYYY') : '--'} - {course?.EndDate ? moment(course.EndDate).format('DD/MM/YYYY') : '--'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ mt: -4, position: 'relative', zIndex: 2 }}>
        <Paper
          ref={tabsRef}
          elevation={0}
          sx={{
            borderRadius: '16px',
            p: 0.5,
            mb: 3,
            bgcolor: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            border: '1px solid rgba(255,255,255,0.3)',
            visibility: isSticky ? 'hidden' : 'visible'
          }}
        >
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            TabIndicatorProps={{ style: { display: 'none' } }}
            sx={{
              minHeight: 48,
              '& .Mui-selected': { background: COLORS.primary, color: 'white !important', borderRadius: '12px', boxShadow: '0 4px 12px rgba(118, 75, 162, 0.3)' },
              '& .MuiTab-root': { minHeight: 48, textTransform: 'none', fontWeight: 600, mx: 0.5, px: 2.5, borderRadius: '12px', fontSize: '0.875rem', transition: '0.2s' }
            }}
          >
            {tabs.map((tab, index) => (
              <Tab key={index} icon={tab.icon} iconPosition="start" label={tab.label} sx={{ '& .MuiSvgIcon-root': { fontSize: 20 } }} />
            ))}
          </Tabs>
        </Paper>

        <Box>
          <Outlet context={{ course, reloadCourse }} />
        </Box>
      </Container>
    </Box>
  )
}

export default CourseIndex
