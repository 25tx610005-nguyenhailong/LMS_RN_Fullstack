import { useState, useEffect } from 'react'
import AppBar from '~/components/AppBar/AppBar'
import {
  Container, Box, Tab, Grid, Paper, Avatar, Tooltip, Typography, Chip, Divider, Stack, IconButton
} from '@mui/material'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import SecurityIcon from '@mui/icons-material/Security'
import PersonIcon from '@mui/icons-material/Person'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AccountTab from './AccountTab'
import SecurityTab from './SecurityTab'
import { styled } from '@mui/material/styles'
import { useSelector, useDispatch } from 'react-redux'
import { selectCurrentUser, updateUserAPI } from '~/redux/user/userSlice'
import { singleFileValidator } from '~/utils/validators'
import { resolveFileUrl } from '~/utils/formatters'
import { toast } from 'react-toastify'

const TABS = {
  ACCOUNT: 'account',
  SECURITY: 'security'
}

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1
})

function Settings() {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const currentUser = useSelector(selectCurrentUser)

  // Store referrer path to sessionStorage to prevent state loss on re-renders, hard refreshes, or updates
  useEffect(() => {
    if (location.state?.from) {
      sessionStorage.setItem('profile_from_path', location.state.from)
    }
  }, [location.state?.from])

  const fromPath = location.state?.from || sessionStorage.getItem('profile_from_path')

  const getDefaultTab = () => {
    if (location.pathname.includes(TABS.SECURITY)) return TABS.SECURITY
    return TABS.ACCOUNT
  }

  const [activeTab, setActiveTab] = useState(getDefaultTab())

  useEffect(() => {
    setActiveTab(getDefaultTab())
  }, [location.pathname])

  const handleChangeTab = (event, selectedTab) => {
    setActiveTab(selectedTab)
  }

  const uploadAvatar = (e) => {
    const file = e.target?.files[0]
    if (!file) return

    const error = singleFileValidator(file)
    if (error) {
      toast.error(error)
      return
    }

    let reqData = new FormData()
    reqData.append('avatar', file)

    toast.promise(
      dispatch(updateUserAPI(reqData)),
      { pending: 'Đang tải ảnh lên...' }
    ).then((res) => {
      if (!res.error) {
        toast.success('Cập nhật ảnh đại diện thành công!')
      }
      e.target.value = ''
    })
  }

  return (
    <Container disableGutters maxWidth={false} sx={{ bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <AppBar />
      <TabContext value={activeTab}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'white' }}>
          <Container maxWidth="lg">
            <TabList onChange={handleChangeTab}>
              <Tab
                label='Tài khoản'
                value={TABS.ACCOUNT}
                icon={<PersonIcon />}
                iconPosition='start'
                component={Link}
                to='/settings/account'
                state={{ from: fromPath }}
                sx={{ textTransform: 'none', fontWeight: 700 }}
              />
              <Tab
                label='Bảo mật'
                value={TABS.SECURITY}
                icon={<SecurityIcon />}
                iconPosition='start'
                component={Link}
                to='/settings/security'
                state={{ from: fromPath }}
                sx={{ textTransform: 'none', fontWeight: 700 }}
              />
            </TabList>
          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ py: 4 }}>

          {/* Nút quay lại màn hình trước đó */}
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
            <IconButton
              onClick={() => fromPath ? navigate(fromPath) : navigate(-1)}
              sx={{
                bgcolor: 'white',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: '#f1f5f9',
                  transform: 'translateX(-4px)'
                }
              }}
            >
              <ArrowBackIcon sx={{ color: '#475569' }} />
            </IconButton>
            <Typography component="span" sx={{ ml: 1.5, fontWeight: 700, color: '#475569' }}>
              Quay lại
            </Typography>
          </Box>

          <Grid container spacing={4}>

            {/* PERSISTENT LEFT COLUMN: AVATAR CARD */}
            <Grid item xs={12} md={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: '24px',
                  border: '1px solid #e2e8f0',
                  bgcolor: 'white',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.01)'
                }}
              >
                <Box sx={{ position: 'relative', mb: 3 }}>
                  <Avatar
                    src={resolveFileUrl(currentUser?.avatar)}
                    alt={currentUser?.fullName || currentUser?.displayName}
                    sx={{
                      width: 130,
                      height: 130,
                      border: '4px solid #f1f5f9',
                      boxShadow: '0 8px 24px rgba(99, 102, 241, 0.12)'
                    }}
                  />
                  <Tooltip title="Tải ảnh mới làm avatar">
                    <IconButton
                      component="label"
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 4,
                        bgcolor: '#6366f1',
                        color: 'white',
                        border: '3px solid white',
                        boxShadow: 2,
                        width: 38,
                        height: 38,
                        '&:hover': {
                          bgcolor: '#4f46e5'
                        }
                      }}
                    >
                      <PhotoCameraIcon sx={{ fontSize: 18 }} />
                      <VisuallyHiddenInput type="file" onChange={uploadAvatar} />
                    </IconButton>
                  </Tooltip>
                </Box>

                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', mb: 0.5 }}>
                  {currentUser?.fullName || currentUser?.displayName || 'Chưa cập nhật'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  @{currentUser?.username}
                </Typography>

                {currentUser?.role && (
                  <Chip
                    label={currentUser.role.toUpperCase()}
                    color="primary"
                    sx={{
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      px: 1.5,
                      height: 26,
                      background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                      boxShadow: '0 2px 8px rgba(99, 102, 241, 0.2)'
                    }}
                  />
                )}

                <Divider sx={{ width: '100%', my: 3 }} />

                <Stack spacing={2} sx={{ width: '100%', textAlign: 'left' }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>EMAIL</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', wordBreak: 'break-all' }}>
                      {currentUser?.email}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>SỐ ĐIỆN THOẠI</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569' }}>
                      {currentUser?.phone || 'Chưa cập nhật'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>ĐỊA CHỈ</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569' }}>
                      {currentUser?.address || 'Chưa cập nhật'}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>

            {/* RIGHT COLUMN: ACTIVE TAB COMPONENT */}
            <Grid item xs={12} md={8}>
              <TabPanel value={TABS.ACCOUNT} sx={{ p: 0 }}>
                <AccountTab />
              </TabPanel>
              <TabPanel value={TABS.SECURITY} sx={{ p: 0 }}>
                <SecurityTab />
              </TabPanel>
            </Grid>

          </Grid>
        </Container>
      </TabContext>
    </Container>
  )
}

export default Settings
