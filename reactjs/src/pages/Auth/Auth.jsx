import { useLocation, Navigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import LoginForm from './LoginForm'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '~/redux/user/userSlice'

function Auth() {
  const location = useLocation()
  const isRegister = location.pathname === '/register'

  const currentUser = useSelector(selectCurrentUser)
  if (currentUser) {
    return <Navigate to='/' replace={true} />
  }

  // Redirect to login if user tries to access register route
  if (isRegister) {
    return <Navigate to='/login' replace={true} />
  }

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0B0F19',
        overflow: 'hidden',
        fontFamily: '"Outfit", "Inter", sans-serif'
      }}
    >
      {/* Background Glowing Orb 1 */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          right: '15%',
          width: { xs: '250px', md: '450px' },
          height: { xs: '250px', md: '450px' },
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(118, 75, 162, 0.4) 0%, rgba(118, 75, 162, 0) 70%)',
          filter: 'blur(60px)',
          zIndex: 1,
          animation: 'float-slow 20s infinite ease-in-out',
          '@keyframes float-slow': {
            '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
            '50%': { transform: 'translate(40px, -60px) scale(1.15)' }
          }
        }}
      />

      {/* Background Glowing Orb 2 */}
      <Box
        sx={{
          position: 'absolute',
          bottom: '10%',
          left: '15%',
          width: { xs: '250px', md: '400px' },
          height: { xs: '250px', md: '400px' },
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(21, 101, 192, 0.3) 0%, rgba(21, 101, 192, 0) 70%)',
          filter: 'blur(50px)',
          zIndex: 1,
          animation: 'float-medium 15s infinite ease-in-out',
          '@keyframes float-medium': {
            '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
            '50%': { transform: 'translate(-30px, 40px) scale(1.1)' }
          }
        }}
      />

      {/* Background Subtle Grid Effect */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(transparent 50%, rgba(11, 15, 25, 0.8) 100%), linear-gradient(rgba(255, 255, 255, 0.007) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.007) 1px, transparent 1px)',
          backgroundSize: '100% 100%, 40px 40px, 40px 40px',
          zIndex: 2
        }}
      />

      {/* Inner Container to align card above glowing elements */}
      <Box sx={{ zIndex: 3, position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
        <LoginForm />
      </Box>
    </Box>
  )
}

export default Auth

