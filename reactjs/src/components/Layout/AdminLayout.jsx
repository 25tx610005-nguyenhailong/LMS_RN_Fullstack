import { useState } from 'react'
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Typography, Avatar, IconButton, Divider,
  useTheme, useMediaQuery, AppBar as MuiAppBar, Toolbar
} from '@mui/material'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import DashboardIcon from '@mui/icons-material/Dashboard'
import PeopleIcon from '@mui/icons-material/People'
import SchoolIcon from '@mui/icons-material/School'
import SettingsIcon from '@mui/icons-material/Settings'
import MenuIcon from '@mui/icons-material/Menu'
import LogoutIcon from '@mui/icons-material/Logout'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import { useSelector, useDispatch } from 'react-redux'
import { selectCurrentUser, logoutUserAPI } from '~/redux/user/userSlice'
import { toast } from 'react-toastify'

const DRAWER_WIDTH = 280

function AdminLayout() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [open, setOpen] = useState(!isMobile)
  const navigate = useNavigate()
  const location = useLocation()
  const currentUser = useSelector(selectCurrentUser)
  const dispatch = useDispatch()

  const menuItems = [
    { text: 'Tổng quan', icon: <DashboardIcon />, path: '/admin/dashboard' },
    { text: 'Quản lý người dùng', icon: <PeopleIcon />, path: '/admin/users' },
    { text: 'Hệ thống trường', icon: <SchoolIcon />, path: '/home' },
    { text: 'Cài đặt hệ thống', icon: <SettingsIcon />, path: '/admin/settings' }
  ]

  const handleLogout = () => {
    dispatch(logoutUserAPI())
    toast.success('Đã đăng xuất')
    navigate('/login')
  }

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#1e293b', color: 'white' }}>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>A</Avatar>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>Antigravity</Typography>
          <Typography variant="caption" sx={{ opacity: 0.7 }}>Hệ thống quản trị</Typography>
        </Box>
      </Box>

      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', mb: 2 }} />

      <List sx={{ px: 2, flex: 1 }}>
        {menuItems.map((item) => {
          const active = location.pathname === item.path
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: '12px',
                  bgcolor: active ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                  color: active ? '#60a5fa' : 'rgba(255,255,255,0.7)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: active ? 700 : 500 }} />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>

      <Box sx={{ p: 2 }}>
        <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', mb: 2 }} />
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout} sx={{ borderRadius: '12px', color: '#f87171' }}>
            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Đăng xuất" primaryTypographyProps={{ fontWeight: 700 }} />
          </ListItemButton>
        </ListItem>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
      {/* Sidebar for Desktop */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: open ? DRAWER_WIDTH : 80,
            transition: theme.transitions.create('width', { duration: 300 }),
            '& .MuiDrawer-paper': {
              width: open ? DRAWER_WIDTH : 80,
              border: 'none',
              transition: theme.transitions.create('width', { duration: 300 }),
              overflowX: 'hidden'
            }
          }}
          open={open}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Sidebar for Mobile */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={open}
          onClose={() => setOpen(false)}
          sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH, border: 'none' } }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <MuiAppBar
          position="sticky"
          sx={{
            bgcolor: 'white', color: '#1e293b', boxShadow: 'none',
            borderBottom: '1px solid #e2e8f0'
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton onClick={() => setOpen(!open)} sx={{ mr: 2 }}>
                {open && !isMobile ? <ChevronLeftIcon /> : <MenuIcon />}
              </IconButton>
              <Typography variant="h6" sx={{ fontWeight: 800, display: { xs: 'none', sm: 'block' } }}>
                {menuItems.find(i => i.path === location.pathname)?.text || 'Trang quản trị'}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{currentUser?.FullName || currentUser?.UserName}</Typography>
                <Typography variant="caption" color="text.secondary">Quản trị hệ thống</Typography>
              </Box>
              <Avatar
                src={currentUser?.LinkAvatar}
                sx={{ width: 40, height: 40, cursor: 'pointer', border: '2px solid #e2e8f0' }}
                onClick={() => navigate('/settings/account', { state: { from: location.pathname } })}
              />
            </Box>
          </Toolbar>
        </MuiAppBar>

        <Box sx={{ flex: 1, p: { xs: 2, md: 3 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}

export default AdminLayout
