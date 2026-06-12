import { useEffect, useState, useRef } from 'react'
import {
  Container,
  Box,
  Typography,
  Paper,
  Tab,
  Tabs,
  CircularProgress,
  Breadcrumbs,
  Link,
  Button,
  Grid,
  Avatar
} from '@mui/material'
import { useNavigate, useLocation, useParams, Outlet } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SchoolIcon from '@mui/icons-material/School'
import PeopleIcon from '@mui/icons-material/People'
import ClassIcon from '@mui/icons-material/Class'
import LocalPhoneIcon from '@mui/icons-material/LocalPhone'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import BarChartIcon from '@mui/icons-material/BarChart'
import SettingsIcon from '@mui/icons-material/Settings'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import AddIcon from '@mui/icons-material/Add'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import PaymentsIcon from '@mui/icons-material/Payments'
import { fetchSchoolDashboardAPI } from '~/apis/schoolApi'
import AppBar from '~/components/AppBar/AppBar'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '~/redux/user/userSlice'
import { resolveFileUrl } from '~/utils/formatters'

const COLORS = {
  primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  bg: '#f8fafc'
}

function SchoolDashboard() {
  const { schoolId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const currentUser = useSelector(selectCurrentUser)
  const role = currentUser?.role?.toUpperCase()

  const [data, setData] = useState({ statistics: {}, teachers: [], classes: [] })
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

  useEffect(() => {
    if (schoolId) {
      setLoading(true)
      fetchSchoolDashboardAPI(schoolId).then(res => {
        setData(res)
        setLoading(false)
      })
    }
  }, [schoolId])

  const currentPath = location.pathname.split('/').pop()
  const [tabValue, setTabValue] = useState(0)

  const tabs = [
    { label: 'Tổng hợp', icon: <BarChartIcon />, path: 'overview', roles: ['ADMIN', 'TEACHER'] },
    { label: 'Giáo viên', icon: <PeopleIcon />, path: 'teachers', roles: ['ADMIN'] },
    { label: 'Học viên', icon: <SchoolIcon />, path: 'students', roles: ['ADMIN', 'TEACHER'] },
    { label: 'Lớp học', icon: <ClassIcon />, path: 'classes', roles: ['ADMIN', 'TEACHER', 'STUDENT'] },
    { label: 'Tài liệu', icon: <MenuBookIcon />, path: 'materials', roles: ['ADMIN', 'TEACHER'] },
    { label: 'Lịch học', icon: <CalendarMonthIcon />, path: 'schedule', roles: ['ADMIN', 'TEACHER', 'STUDENT'] },
    { label: 'Lương', icon: <PaymentsIcon />, path: 'salary', roles: ['ADMIN', 'TEACHER'] },
    { label: 'Cài đặt', icon: <SettingsIcon />, path: 'settings', roles: ['ADMIN'] }
  ]

  const filteredTabs = tabs.filter(tab => tab.roles.includes(role) || role === 'ADMIN')

  useEffect(() => {
    // Logic để xác định tab nào đang active dựa trên URL
    let index = filteredTabs.findIndex(t => location.pathname.endsWith(`/${t.path}`))

    // Xử lý các trường hợp đặc biệt (ví dụ: tạo lớp học thì active tab Lớp học)
    if (index === -1) {
      if (location.pathname.includes('/create-class') || location.pathname.includes('/edit-class')) {
        index = filteredTabs.findIndex(t => t.path === 'classes')
      }
    }

    if (index !== -1) setTabValue(index)
  }, [location.pathname, filteredTabs])

  // Redirect if user lands on a tab/subroute they don't have access to (like overview for Student)
  useEffect(() => {
    if (loading || !role) return
    const hasAccess = filteredTabs.some(t => location.pathname.endsWith(`/${t.path}`))
    const isSubClassPage = location.pathname.includes('/create-class') || location.pathname.includes('/edit-class')
    const hasClassAccess = filteredTabs.some(t => t.path === 'classes')

    if (!hasAccess && !(isSubClassPage && hasClassAccess) && filteredTabs.length > 0) {
      navigate(`/school/${schoolId}/${filteredTabs[0].path}`, { replace: true })
    }
  }, [location.pathname, filteredTabs, loading, schoolId, navigate, role])

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
    navigate(`/school/${schoolId}/${filteredTabs[newValue].path}`)
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
            {filteredTabs.map((tab, index) => (
              <Tab key={index} icon={tab.icon} iconPosition="start" label={tab.label} sx={{ '& .MuiSvgIcon-root': { fontSize: 18 } }} />
            ))}
          </Tabs>
        )}
      </AppBar>
      <Box
        sx={{
          pt: 2,
          pb: 5.5,
          px: 3,
          color: 'white',
          position: 'relative',
          ...(data.school?.Thumbnail ? {
            backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.75) 100%), url(${resolveFileUrl(data.school.Thumbnail)})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          } : {
            background: COLORS.primary
          })
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={3} alignItems="center">
            {/* Left Column: Info & Navigation */}
            <Grid item xs={12} md={7} lg={8}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {/* Top row with back button and breadcrumbs */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ArrowBackIcon sx={{ fontSize: '0.875rem' }} />}
                    onClick={() => navigate('/home')}
                    sx={{
                      color: 'white',
                      borderColor: data.school?.Thumbnail ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.3)',
                      textTransform: 'none',
                      fontWeight: 700,
                      borderRadius: '10px',
                      px: 1.5,
                      py: 0.25,
                      fontSize: '0.75rem',
                      bgcolor: data.school?.Thumbnail ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.08)',
                      backdropFilter: data.school?.Thumbnail ? 'blur(4px)' : 'none',
                      height: '28px',
                      '&:hover': {
                        borderColor: 'white',
                        bgcolor: data.school?.Thumbnail ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.18)'
                      }
                    }}
                  >
                    Quay lại trang chủ
                  </Button>
                  <Breadcrumbs
                    separator="›"
                    sx={{
                      color: 'rgba(255,255,255,0.75)',
                      '& .MuiTypography-root, & .MuiLink-root': {
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        textShadow: data.school?.Thumbnail ? '0 1px 2px rgba(0,0,0,0.6)' : 'none'
                      },
                      '& .MuiBreadcrumbs-separator': { color: 'rgba(255,255,255,0.5)' }
                    }}
                  >
                    <Link underline="hover" color="inherit" sx={{ cursor: 'pointer' }} onClick={() => navigate('/home')}>
                      Trang chủ
                    </Link>
                    <Typography color="inherit">{data.school?.Name || 'Trường học'}</Typography>
                  </Breadcrumbs>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5, flexWrap: 'wrap' }}>
                  <Avatar
                    sx={{
                      width: 44,
                      height: 44,
                      bgcolor: data.school?.Thumbnail ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.15)',
                      color: 'white',
                      border: data.school?.Thumbnail ? '1.5px solid rgba(255, 255, 255, 0.4)' : '1.5px solid rgba(255, 255, 255, 0.25)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)',
                      backdropFilter: data.school?.Thumbnail ? 'blur(4px)' : 'none'
                    }}
                  >
                    <SchoolIcon sx={{ fontSize: 22 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{
                      fontWeight: 800,
                      letterSpacing: '-0.5px',
                      textShadow: data.school?.Thumbnail ? '0 2px 4px rgba(0,0,0,0.6)' : '0 2px 4px rgba(0,0,0,0.05)',
                      mb: 0.5
                    }}>
                      {data.school?.Name || 'Tên trường'}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.75,
                        bgcolor: data.school?.Thumbnail ? 'rgba(0, 0, 0, 0.45)' : 'rgba(255, 255, 255, 0.1)',
                        border: data.school?.Thumbnail ? '1px solid rgba(255, 255, 255, 0.15)' : 'none',
                        backdropFilter: data.school?.Thumbnail ? 'blur(4px)' : 'none',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: '8px'
                      }}>
                        <LocationOnIcon sx={{ fontSize: 13, color: '#f43f5e' }} />
                        <Typography variant="caption" sx={{
                          fontWeight: 600,
                          color: 'rgba(255, 255, 255, 0.9)',
                          textShadow: data.school?.Thumbnail ? '0 1px 2px rgba(0,0,0,0.3)' : 'none'
                        }}>
                          {data.school?.Address || 'Địa chỉ'}
                          {data.school?.District && data.school?.City ? `, ${data.school.District.Name}, ${data.school.City.Name}` : ''}
                        </Typography>
                      </Box>
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.75,
                        bgcolor: data.school?.Thumbnail ? 'rgba(0, 0, 0, 0.45)' : 'rgba(255, 255, 255, 0.1)',
                        border: data.school?.Thumbnail ? '1px solid rgba(255, 255, 255, 0.15)' : 'none',
                        backdropFilter: data.school?.Thumbnail ? 'blur(4px)' : 'none',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: '8px'
                      }}>
                        <LocalPhoneIcon sx={{ fontSize: 13, color: '#3b82f6' }} />
                        <Typography variant="caption" sx={{
                          fontWeight: 600,
                          color: 'rgba(255, 255, 255, 0.9)',
                          textShadow: data.school?.Thumbnail ? '0 1px 2px rgba(0,0,0,0.3)' : 'none'
                        }}>
                          {data.school?.Phone || 'Số điện thoại'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Grid>

            {/* Right Column: Glassmorphic Quick Statistics */}
            <Grid item xs={12} md={5} lg={4}>
              <Box
                sx={{
                  bgcolor: data.school?.Thumbnail ? 'rgba(0, 0, 0, 0.45)' : 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(12px)',
                  borderRadius: '20px',
                  border: data.school?.Thumbnail ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(255, 255, 255, 0.18)',
                  py: 1.5,
                  px: 2.5,
                  display: 'flex',
                  justifyContent: 'space-around',
                  alignItems: 'center',
                  boxShadow: '0 12px 32px rgba(0, 0, 0, 0.15)',
                  mt: { xs: 2, md: 0 }
                }}
              >
                {/* Stat Item: Classes */}
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" sx={{
                    fontWeight: 800,
                    color: 'white',
                    mb: 0.25,
                    textShadow: data.school?.Thumbnail ? '0 2px 4px rgba(0,0,0,0.5)' : '0 2px 4px rgba(0,0,0,0.05)'
                  }}>
                    {data.statistics?.classesCount || 0}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center', fontSize: '0.7rem' }}>
                    <ClassIcon sx={{ fontSize: 12 }} /> Lớp học
                  </Typography>
                </Box>

                {/* Vertical Divider */}
                <Box sx={{ width: '1px', height: '30px', bgcolor: 'rgba(255, 255, 255, 0.2)' }} />

                {/* Stat Item: Teachers */}
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" sx={{
                    fontWeight: 800,
                    color: 'white',
                    mb: 0.25,
                    textShadow: data.school?.Thumbnail ? '0 2px 4px rgba(0,0,0,0.5)' : '0 2px 4px rgba(0,0,0,0.05)'
                  }}>
                    {data.statistics?.teachersCount || 0}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center', fontSize: '0.7rem' }}>
                    <PeopleIcon sx={{ fontSize: 12 }} /> Giáo viên
                  </Typography>
                </Box>

                {/* Vertical Divider */}
                <Box sx={{ width: '1px', height: '30px', bgcolor: 'rgba(255, 255, 255, 0.2)' }} />

                {/* Stat Item: Students */}
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" sx={{
                    fontWeight: 800,
                    color: 'white',
                    mb: 0.25,
                    textShadow: data.school?.Thumbnail ? '0 2px 4px rgba(0,0,0,0.5)' : '0 2px 4px rgba(0,0,0,0.05)'
                  }}>
                    {data.statistics?.studentsCount || 0}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center', fontSize: '0.7rem' }}>
                    <SchoolIcon sx={{ fontSize: 12 }} /> Học viên
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
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
              '& .MuiTab-root': { minHeight: 48, textTransform: 'none', fontWeight: 600, mx: 0.5, px: 2.5, borderRadius: '12px', fontSize: '0.875rem' }
            }}
          >
            {filteredTabs.map((tab, index) => (
              <Tab key={index} icon={tab.icon} iconPosition="start" label={tab.label} sx={{ '& .MuiSvgIcon-root': { fontSize: 20 } }} />
            ))}
          </Tabs>
        </Paper>

        <Box>
          <Outlet context={{ data, loading }} />
        </Box>
      </Container>
    </Box>
  )
}

export default SchoolDashboard
