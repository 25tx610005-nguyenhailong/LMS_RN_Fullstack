import { useNavigate } from 'react-router-dom'
import AppBar from '~/components/AppBar/AppBar'
import SchoolSelection from './SchoolSelection'
import { Box } from '@mui/material'

function Home() {
  const navigate = useNavigate()

  const handleSelectSchool = (school) => {
    navigate(`/school/${school.Id}/overview`)
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f8fafc' }}>
      <AppBar />
      <Box sx={{ flex: 1 }}>
        <SchoolSelection onSelectSchool={handleSelectSchool} />
      </Box>
    </Box>
  )
}

export default Home
