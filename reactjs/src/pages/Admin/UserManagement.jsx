import { useEffect, useState } from 'react'
import {
  Container, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Avatar, Chip, TextField, Box, Button,
  IconButton, InputAdornment, Grid, MenuItem, Select, FormControl, InputLabel,
  Pagination, CircularProgress, Tooltip, Divider, Stack
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import FilterListIcon from '@mui/icons-material/FilterList'
import EmailIcon from '@mui/icons-material/Email'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import PeopleIcon from '@mui/icons-material/People'
import SchoolIcon from '@mui/icons-material/School'
import WorkIcon from '@mui/icons-material/Work'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { fetchAllUsersAPI, fetchUserStatsAPI, deleteUserAPI } from '~/apis/adminApi'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { resolveFileUrl } from '~/utils/formatters'

function StatCard({ title, value, icon, color }) {
  return (
    <Paper sx={{
      p: 2, borderRadius: '16px', display: 'flex', alignItems: 'center', gap: 1.5,
      boxShadow: '0 2px 10px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9'
    }}>
      <Avatar sx={{ bgcolor: `${color}10`, color: color, width: 40, height: 40 }}>
        {icon}
      </Avatar>
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{title}</Typography>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', lineHeight: 1.2 }}>{value}</Typography>
      </Box>
    </Paper>
  )
}

function UserManagement() {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState({ total: 0, active: 0, teachers: 0, students: 0 })
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')

  const limit = 10

  const loadData = async () => {
    setLoading(true)
    try {
      const [userData, statsData] = await Promise.all([
        fetchAllUsersAPI({ page, limit, search, role }),
        fetchUserStatsAPI()
      ])
      setUsers(userData.users)
      setTotal(userData.total)
      setStats(statsData)
    } catch (error) {
      toast.error('Lỗi khi tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [page, role])

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      setPage(1)
      loadData()
    }
  }

  const handleAddUser = () => {
    navigate('/admin/users/create')
  }

  const handleEditUser = (user) => {
    navigate(`/admin/users/edit/${user.Id}`)
  }

  const handleDelete = async (userId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) {
      try {
        await deleteUserAPI(userId)
        toast.success('Đã xóa tài khoản')
        loadData()
      } catch (error) {
        toast.error('Lỗi khi xóa tài khoản')
      }
    }
  }

  return (
    <Container maxWidth={false} sx={{ py: 2 }}>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Tổng tài khoản" value={stats.total} icon={<PeopleIcon fontSize="small" />} color="#6366f1" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Đang hoạt động" value={stats.active} icon={<CheckCircleIcon fontSize="small" />} color="#10b981" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Giáo viên" value={stats.teachers} icon={<WorkIcon fontSize="small" />} color="#f59e0b" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Học viên" value={stats.students} icon={<SchoolIcon fontSize="small" />} color="#3b82f6" />
        </Grid>
      </Grid>

      <Paper sx={{ p: 2, mb: 3, borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterListIcon color="primary" fontSize="small" />
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Bộ lọc & Tìm kiếm</Typography>
          </Box>
          <Button
            variant="contained" size="small" startIcon={<PersonAddIcon />} onClick={handleAddUser}
            sx={{ borderRadius: '8px', px: 2, fontWeight: 700, textTransform: 'none' }}
          >
            Thêm tài khoản
          </Button>
        </Box>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth size="small" placeholder="Tìm kiếm... (Enter)"
              value={search} onChange={e => setSearch(e.target.value)} onKeyDown={handleSearch}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
                sx: { borderRadius: '8px', bgcolor: '#f8fafc' }
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Vai trò</InputLabel>
              <Select
                value={role} label="Vai trò" onChange={e => { setRole(e.target.value); setPage(1) }}
                sx={{ borderRadius: '8px', bgcolor: '#f8fafc' }}
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="Admin">Admin</MenuItem>
                <MenuItem value="Teacher">Giáo viên</MenuItem>
                <MenuItem value="Student">Học viên</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth variant="contained" size="small" onClick={() => { setPage(1); loadData() }}
              sx={{ borderRadius: '8px', height: '40px', fontWeight: 700, bgcolor: '#1e293b' }}
            >
              Lọc
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper} sx={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
        <Table
          size="small"
          sx={{
            '& .MuiTableCell-root': {
              borderRight: '1px solid #e2e8f0',
              borderBottom: '1px solid #e2e8f0'
            },
            '& .MuiTableCell-root:last-child': {
              borderRight: 'none'
            }
          }}
        >
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 800, py: 1.5 }}>Hồ sơ</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Liên hệ</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Vai trò</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Trạng thái</TableCell>
              <TableCell sx={{ fontWeight: 800 }} align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} align="center" sx={{ py: 5 }}><CircularProgress size={24} /></TableCell></TableRow>
            ) : users.length === 0 ? (
              <TableRow><TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                <Typography variant="body2" color="text.secondary">Không tìm thấy kết quả</Typography>
              </TableCell></TableRow>
            ) : users.map((user) => (
              <TableRow key={user.Id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar src={resolveFileUrl(user.LinkAvatar)} sx={{ width: 32, height: 32, fontSize: '0.8rem' }}>
                      {user.UserName?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>{user.UserName}</Typography>
                      <Typography variant="caption" color="text.secondary">{user.FullName || 'N/A'}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Stack spacing={0}>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>{user.Email}</Typography>
                    {user.Phone && <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>{user.Phone}</Typography>}
                  </Stack>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {user.AccountInRole?.map(air => (
                      <Chip key={air.Id} label={air.AccountRole?.Name} size="small" sx={{ fontSize: '0.7rem', height: 20, fontWeight: 700 }} />
                    ))}
                    {user.AccountInRole?.some(air => air.AccountRole?.Name === 'Teacher') && user.AccountSalary?.[0]?.TypeTeacher && (
                      <Chip
                        label={user.AccountSalary[0].TypeTeacher === 1 ? 'Cơ hữu (Full-time)' : 'Thỉnh giảng (Part-time)'}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: 20, fontWeight: 700, color: user.AccountSalary[0].TypeTeacher === 1 ? '#1d4ed8' : '#c2410c', borderColor: user.AccountSalary[0].TypeTeacher === 1 ? '#dbeafe' : '#ffedd5', borderRadius: '4px' }}
                      />
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.Active ? 'Đang hoạt động' : 'Bị khóa'}
                    size="small"
                    color={user.Active ? 'success' : 'default'}
                    variant="outlined"
                    sx={{ fontSize: '0.7rem', height: 20, fontWeight: 700 }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                    <IconButton size="small" onClick={() => handleEditUser(user)} sx={{ color: '#3b82f6' }}>
                      <EditIcon fontSize="inherit" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(user.Id)} sx={{ color: '#ef4444' }}>
                      <DeleteIcon fontSize="inherit" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
        <Pagination
          count={Math.ceil(total / limit)} page={page}
          onChange={(e, v) => setPage(v)} size="small" color="primary"
        />
      </Box>
    </Container>
  )
}

export default UserManagement
