import { Box, Typography, Tooltip, IconButton } from '@mui/material'
import AppsIcon from '@mui/icons-material/Apps'
import SchoolIcon from '@mui/icons-material/School'
import Profiles from './Menus/Profiles'
import { Link } from 'react-router-dom'

function AppBar({ children }) {
  return (
    <Box
      sx={{
        width: '100%',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 3,
        position: 'sticky',
        top: 0,
        zIndex: 1100,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
        transition: 'all 0.3s ease'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
        <Link to='/home' style={{ textDecoration: 'none' }}>
          <Tooltip title='Bảng điều khiển chính'>
            <IconButton size="small" sx={{ color: '#1e293b', '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}>
              <AppsIcon />
            </IconButton>
          </Tooltip>
        </Link>

        <Link to='/home' style={{ textDecoration: 'none' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'rotate(-6deg) scale(1.08)',
                  boxShadow: '0 6px 18px rgba(99, 102, 241, 0.35)'
                }
              }}
            >
              <SchoolIcon sx={{ color: 'white', fontSize: 20 }} />
            </Box>
            <Typography
              variant='h6'
              sx={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: '#0f172a',
                letterSpacing: '-0.6px',
                display: 'flex',
                alignItems: 'center',
                fontFamily: '"Plus Jakarta Sans", "Outfit", "Inter", sans-serif'
              }}
            >
              <span>LMS</span>
              <Box
                component="span"
                sx={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 900,
                  ml: 0.5
                }}
              >
                System
              </Box>
            </Typography>
          </Box>
        </Link>
      </Box>

      {/* Render children (like navigation tabs) in the center of the AppBar */}
      {children && (
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', mx: 4, overflow: 'hidden', height: '100%', alignItems: 'center' }}>
          {children}
        </Box>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
        <Profiles />
      </Box>
    </Box>
  )
}

export default AppBar
