import { useEffect, useState } from 'react'
import {
  Container,
  Box,
  Typography,
  Grid,
  Paper,
  Avatar,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete
} from '@mui/material'
import SchoolIcon from '@mui/icons-material/School'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import LocalPhoneIcon from '@mui/icons-material/LocalPhone'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import EditIcon from '@mui/icons-material/Edit'
import SearchIcon from '@mui/icons-material/Search'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import { fetchSchoolsAPI, createSchoolAPI, fetchCitiesAPI, fetchDistrictsAPI, updateSchoolAPI } from '~/apis/schoolApi'
import { uploadFileAPI } from '~/apis/commonApi'
import { resolveFileUrl } from '~/utils/formatters'
import { toast } from 'react-toastify'
import Authorized from '~/components/AccessControl/Authorized'
import { useSelector } from 'react-redux'
import { InputAdornment } from '@mui/material'

const COLORS = {
  primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  bg: '#f8fafc'
}

function SchoolSelection({ onSelectSchool }) {
  const [schools, setSchools] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [newSchool, setNewSchool] = useState({ Name: '', Address: '', Phone: '', IdCity: '', IdDistrict: '' })
  const [submitting, setSubmitting] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')
  const [editingSchoolId, setEditingSchoolId] = useState(null)

  const [thumbnailPreview, setThumbnailPreview] = useState('')
  const [thumbnailFile, setThumbnailFile] = useState(null)

  // Location data
  const [cities, setCities] = useState([])
  const [districts, setDistricts] = useState([])

  const role = useSelector(state => state.user.currentUser?.role?.toUpperCase())
  const assignedSchoolIds = useSelector(state => state.user.currentUser?.assignedSchoolIds)
  const allowedSchoolIds = assignedSchoolIds || []

  const filteredSchools = schools.filter(s => {
    const term = searchQuery.toLowerCase()
    const matchesTerm = (s.Name || '').toLowerCase().includes(term) || (s.Address || '').toLowerCase().includes(term)
    const isAllowed = role === 'ADMIN' || allowedSchoolIds.length === 0 || allowedSchoolIds.includes(s.Id)
    return matchesTerm && isAllowed
  })

  const loadSchools = () => {
    setLoading(true)
    fetchSchoolsAPI().then(data => {
      setSchools(data)
      setLoading(false)
    })
  }

  const loadCities = async () => {
    try {
      const data = await fetchCitiesAPI()
      setCities(data)
    } catch (error) {
      console.error(error)
    }
  }

  const loadDistricts = async (cityId) => {
    if (!cityId) {
      setDistricts([])
      return
    }
    try {
      const data = await fetchDistrictsAPI(cityId)
      setDistricts(data)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    loadSchools()
    loadCities()
  }, [])

  const handleCityChange = (e) => {
    const cityId = e.target.value
    setNewSchool({ ...newSchool, IdCity: cityId, IdDistrict: '' })
    loadDistricts(cityId)
  }

  const handleOpenCreate = () => {
    setEditingSchoolId(null)
    setNewSchool({ Name: '', Address: '', Phone: '', IdCity: '', IdDistrict: '' })
    setThumbnailPreview('')
    setThumbnailFile(null)
    setOpen(true)
  }

  const handleEditClick = (e, school) => {
    e.stopPropagation()
    setEditingSchoolId(school.Id)
    setNewSchool({
      Name: school.Name || '',
      Address: school.Address || '',
      Phone: school.Phone || '',
      IdCity: school.IdCity || '',
      IdDistrict: school.IdDistrict || ''
    })
    if (school.IdCity) loadDistricts(school.IdCity)
    setThumbnailPreview(school.Thumbnail ? resolveFileUrl(school.Thumbnail) : '')
    setThumbnailFile(null)
    setOpen(true)
  }

  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const localUrl = URL.createObjectURL(file)
    setThumbnailPreview(localUrl)
    setThumbnailFile(file)
  }

  const handleSubmit = async () => {
    if (!newSchool.Name) return toast.error('Tên trường học/cơ sở là bắt buộc')
    if (!newSchool.IdCity) return toast.error('Vui lòng chọn Tỉnh/Thành phố')
    if (!newSchool.IdDistrict) return toast.error('Vui lòng chọn Quận/Huyện')
    if (!newSchool.Address) return toast.error('Vui lòng nhập địa chỉ chi tiết')

    setSubmitting(true)
    try {
      let finalThumbnail = editingSchoolId
        ? (schools.find(s => s.Id === editingSchoolId)?.Thumbnail || null)
        : null

      // Check if user cleared preview
      if (!thumbnailPreview) {
        finalThumbnail = null
      }

      if (thumbnailFile) {
        try {
          const uploadRes = await uploadFileAPI(thumbnailFile, 'school_thumbnails')
          finalThumbnail = uploadRes.url
        } catch (err) {
          toast.error('Lỗi khi tải ảnh lên hệ thống')
          setSubmitting(false)
          return
        }
      }

      const payload = {
        ...newSchool,
        Thumbnail: finalThumbnail
      }

      if (editingSchoolId) {
        await updateSchoolAPI(editingSchoolId, payload)
        toast.success('Cập nhật cơ sở thành công')
      } else {
        await createSchoolAPI(payload)
        toast.success('Tạo cơ sở mới thành công')
      }
      setOpen(false)
      loadSchools()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading && schools.length === 0) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, background: COLORS.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Lựa chọn cơ sở / trường học của bạn
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Chọn một cơ sở để quản lý trang tổng quan và hoạt động học tập
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <TextField
            placeholder="Tìm kiếm theo tên trường hoặc địa chỉ..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            variant="outlined"
            sx={{ width: '100%', maxWidth: '600px', '& .MuiOutlinedInput-root': { borderRadius: '20px', bgcolor: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="primary" />
                </InputAdornment>
              )
            }}
          />
        </Box>
      </Box>

      <Grid container spacing={4}>
        {filteredSchools.map((school) => (
          <Grid item xs={12} md={4} key={school.Id}>
            <Paper
              elevation={0}
              onClick={() => onSelectSchool(school)}
              sx={{
                p: 4, borderRadius: '24px', cursor: 'pointer', border: '1px solid #e2e8f0',
                transition: '0.4s', textAlign: 'center', height: '100%', position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                ...(school.Thumbnail ? {
                  backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.85) 100%), url(${resolveFileUrl(school.Thumbnail)})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  color: 'white'
                } : {
                  bgcolor: 'white'
                }),
                '&:hover': {
                  transform: 'translateY(-10px)',
                  boxShadow: '0 40px 80px rgba(0,0,0,0.15)',
                  borderColor: '#6366f1'
                },
                '&:hover .edit-btn': { opacity: 1 }
              }}
            >
              <Authorized right="ManageUsers">
                <IconButton
                  className="edit-btn"
                  onClick={(e) => handleEditClick(e, school)}
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    opacity: 0,
                    transition: '0.2s',
                    bgcolor: school.Thumbnail ? 'rgba(255, 255, 255, 0.2)' : '#f1f5f9',
                    color: school.Thumbnail ? '#ffffff' : 'primary.main',
                    backdropFilter: school.Thumbnail ? 'blur(4px)' : 'none',
                    '&:hover': {
                      bgcolor: school.Thumbnail ? 'rgba(255, 255, 255, 0.35)' : '#e2e8f0'
                    }
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Authorized>

              <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar sx={{
                  width: 80,
                  height: 80,
                  bgcolor: school.Thumbnail ? 'rgba(255, 255, 255, 0.15)' : '#f1f5f9',
                  color: school.Thumbnail ? '#ffffff' : '#6366f1',
                  mx: 'auto',
                  mb: 3,
                  backdropFilter: school.Thumbnail ? 'blur(4px)' : 'none',
                  border: school.Thumbnail ? '1px solid rgba(255, 255, 255, 0.3)' : 'none'
                }}>
                  <SchoolIcon sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant="h5" sx={{
                  fontWeight: 800,
                  mb: 2,
                  color: school.Thumbnail ? '#ffffff' : 'text.primary',
                  textShadow: school.Thumbnail ? '0 2px 4px rgba(0,0,0,0.5)' : 'none'
                }}>
                  {school.Name}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center', mb: 3 }}>
                  <Typography variant="body2" sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    color: school.Thumbnail ? 'rgba(255, 255, 255, 0.9)' : 'text.secondary',
                    textShadow: school.Thumbnail ? '0 1px 2px rgba(0,0,0,0.5)' : 'none'
                  }}>
                    <LocationOnIcon fontSize="inherit" /> {school.Address}
                    {school.District && school.City ? `, ${school.District.Name}, ${school.City.Name}` : ''}
                  </Typography>
                  <Typography variant="body2" sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    color: school.Thumbnail ? 'rgba(255, 255, 255, 0.9)' : 'text.secondary',
                    textShadow: school.Thumbnail ? '0 1px 2px rgba(0,0,0,0.5)' : 'none'
                  }}>
                    <LocalPhoneIcon fontSize="inherit" /> {school.Phone}
                  </Typography>
                </Box>
              </Box>

              <Button
                variant="contained"
                fullWidth
                sx={{
                  borderRadius: '12px', py: 1.5, fontWeight: 'bold',
                  background: school.Thumbnail ? 'rgba(255, 255, 255, 0.25)' : COLORS.primary,
                  color: '#ffffff',
                  backdropFilter: school.Thumbnail ? 'blur(8px)' : 'none',
                  border: school.Thumbnail ? '1px solid rgba(255, 255, 255, 0.4)' : 'none',
                  boxShadow: school.Thumbnail ? '0 4px 20px rgba(0,0,0,0.2)' : 'none',
                  '&:hover': {
                    background: school.Thumbnail ? 'rgba(255, 255, 255, 0.4)' : COLORS.primary,
                    opacity: 0.9,
                    borderColor: school.Thumbnail ? 'rgba(255, 255, 255, 0.6)' : 'none'
                  }
                }}
              >
              Truy cập bảng điều khiển
              </Button>
            </Paper>
          </Grid>
        ))}

        {/* Add New School Card */}
        <Authorized right="ManageUsers">
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              onClick={handleOpenCreate}
              sx={{
                p: 4, borderRadius: '24px', cursor: 'pointer', border: '2px dashed #e2e8f0',
                transition: '0.4s', textAlign: 'center', height: '100%',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                bgcolor: 'rgba(0,0,0,0.01)',
                '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.05)', borderColor: '#6366f1' }
              }}
            >
              <Avatar sx={{ width: 80, height: 80, bgcolor: '#fffbeb', color: '#f59e0b', mb: 3 }}>
                <AddIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#475569' }}>Thêm trường mới</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Đăng ký một cơ sở mới</Typography>
            </Paper>
          </Grid>
        </Authorized>
      </Grid>

      {/* Create/Edit School Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }
        }}
      >
        {/* Banner header preview / upload interactive zone */}
        <Box
          sx={{
            width: '100%',
            height: '200px',
            position: 'relative',
            backgroundImage: thumbnailPreview
              ? `linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%), url(${thumbnailPreview})`
              : 'linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'flex-end',
            p: 3,
            color: 'white'
          }}
        >
          {/* Close button top-right */}
          <IconButton
            onClick={() => setOpen(false)}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              bgcolor: 'rgba(0, 0, 0, 0.4)',
              color: 'white',
              backdropFilter: 'blur(4px)',
              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.6)' }
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>

          {/* Delete Thumbnail Button (only visible if preview exists) */}
          {thumbnailPreview && (
            <IconButton
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setThumbnailPreview('')
                setThumbnailFile(null)
              }}
              sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                bgcolor: 'rgba(220, 38, 38, 0.7)',
                color: 'white',
                backdropFilter: 'blur(4px)',
                '&:hover': { bgcolor: 'rgba(220, 38, 38, 0.9)' }
              }}
              title="Xóa ảnh nền"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )}

          {/* Header Title */}
          <Box sx={{ flexGrow: 1, pr: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
              {editingSchoolId ? 'Cập nhật thông tin cơ sở' : 'Đăng ký trường mới'}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8, textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
              {editingSchoolId ? 'Chỉnh sửa và lưu lại thông tin trường học' : 'Đăng ký cơ sở giáo dục mới vào hệ thống'}
            </Typography>
          </Box>

          {/* Upload Button */}
          <Button
            component="label"
            variant="contained"
            startIcon={<CloudUploadIcon />}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.25)',
              color: 'white',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              borderRadius: '20px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.8rem',
              px: 2,
              py: 0.5,
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.4)',
                borderColor: 'white'
              }
            }}
          >
            Tải ảnh nền
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleThumbnailChange}
            />
          </Button>
        </Box>

        <DialogContent sx={{ p: 4, pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Tên cơ sở / Trường"
              fullWidth
              value={newSchool.Name}
              onChange={e => setNewSchool({ ...newSchool, Name: e.target.value })}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SchoolIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                )
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px' } }}
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  options={cities}
                  getOptionLabel={option => option.Name || ''}
                  value={cities.find(c => String(c.Id) === String(newSchool.IdCity)) || null}
                  onChange={(event, newValue) => {
                    const cityId = newValue ? newValue.Id : ''
                    setNewSchool({ ...newSchool, IdCity: cityId, IdDistrict: '' })
                    loadDistricts(cityId)
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Tỉnh/Thành phố"
                      placeholder="Chọn Tỉnh/Thành..."
                      InputProps={{
                        ...params.InputProps,
                        sx: { borderRadius: '14px' }
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  disabled={!newSchool.IdCity}
                  options={districts}
                  getOptionLabel={option => option.Name || ''}
                  value={districts.find(d => String(d.Id) === String(newSchool.IdDistrict)) || null}
                  onChange={(event, newValue) => {
                    setNewSchool({ ...newSchool, IdDistrict: newValue ? newValue.Id : '' })
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Quận/Huyện"
                      placeholder="Chọn Quận/Huyện..."
                      InputProps={{
                        ...params.InputProps,
                        sx: { borderRadius: '14px' }
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>

            <TextField
              label="Địa chỉ chi tiết (Số nhà, đường...)"
              fullWidth
              value={newSchool.Address}
              onChange={e => setNewSchool({ ...newSchool, Address: e.target.value })}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOnIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                )
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px' } }}
            />

            <TextField
              label="Số điện thoại"
              fullWidth
              value={newSchool.Phone}
              onChange={e => setNewSchool({ ...newSchool, Phone: e.target.value })}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocalPhoneIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                )
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px' } }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 4, pt: 0, justifyContent: 'flex-end', gap: 1.5 }}>
          <Button
            onClick={() => setOpen(false)}
            sx={{
              fontWeight: 700,
              color: '#64748b',
              borderRadius: '12px',
              px: 3,
              '&:hover': { bgcolor: '#f1f5f9' }
            }}
          >
            Hủy bỏ
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
            sx={{
              borderRadius: '12px',
              px: 4,
              py: 1,
              fontWeight: 800,
              background: COLORS.primary,
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
              '&:hover': {
                opacity: 0.9,
                boxShadow: '0 6px 20px rgba(99, 102, 241, 0.6)'
              }
            }}
          >
            {submitting ? 'Đang lưu...' : (editingSchoolId ? 'Lập tức cập nhật' : 'Đăng ký ngay')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default SchoolSelection
