import { useEffect, useState } from 'react'
import {
  Container, Typography, Paper, TextField, Box, Button,
  Grid, MenuItem, Select, FormControl, InputLabel,
  Divider, Stack, Avatar, IconButton, Switch, FormControlLabel, Autocomplete
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SaveIcon from '@mui/icons-material/Save'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import BadgeIcon from '@mui/icons-material/Badge'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import SecurityIcon from '@mui/icons-material/Security'
import ContactPageIcon from '@mui/icons-material/ContactPage'
import { useNavigate, useParams } from 'react-router-dom'
import { createUserAPI, updateUserAPI, fetchReferenceDataAPI, fetchUserByIdAPI } from '~/apis/adminApi'
import { fetchCitiesAPI, fetchDistrictsAPI } from '~/apis/schoolApi'
import { toast } from 'react-toastify'

function AccountForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [refData, setRefData] = useState({ genders: [], paymentMethods: [], monetaryUnits: [] })
  const [cities, setCities] = useState([])
  const [districts, setDistricts] = useState([])

  const [formData, setFormData] = useState({
    UserName: '',
    Email: '',
    FullName: '',
    Password: '',
    Phone: '',
    BirthDay: '',
    IdGender: '',
    Address: '',
    IdCity: '',
    IdDistrict: '',
    roleName: 'Student',
    Active: true,
    salary: {
      TypeSalary: 1,
      TypeTeacher: 1, // 1: Fulltime, 2: Partime
      IdMonetaryUnit: 1, // 1: VND, 2: USD
      SalaryPerMonth: 0,
      SalaryPerHour: 0,
      SalaryPerPeriod: 0,
      WarrantyHours: 0,
      IdPaymentMethod: '',
      NumberAccountBank: ''
    },
    certificates: []
  })

  useEffect(() => {
    const loadRefs = async () => {
      try {
        const [refs, cityList] = await Promise.all([fetchReferenceDataAPI(), fetchCitiesAPI()])
        setRefData(refs)
        setCities(cityList)

        if (id) {
          const user = await fetchUserByIdAPI(id)
          if (user) {
            setFormData(prev => ({
              ...prev,
              ...user,
              Password: '',
              roleName: user.AccountInRole?.[0]?.AccountRole?.Name || 'Student',
              salary: user.AccountSalary?.[0] || prev.salary,
              certificates: user.AccountCertificate || []
            }))
            if (user.IdCity) loadDistricts(user.IdCity)
          }
        }
      } catch (error) {
        toast.error('Lỗi khi tải dữ liệu khởi tạo')
      }
    }
    loadRefs()
  }, [id])

  const loadDistricts = async (cityId) => {
    try {
      const list = await fetchDistrictsAPI(cityId)
      setDistricts(list)
    } catch (error) {
      toast.error('Lỗi khi tải danh sách Quận/Huyện')
    }
  }

  const handleCityChange = (e) => {
    const cityId = e.target.value
    setFormData({ ...formData, IdCity: cityId, IdDistrict: '' })
    loadDistricts(cityId)
  }

  const handleAddCertificate = () => {
    setFormData({
      ...formData,
      certificates: [...formData.certificates, { CertificateName: '', Organization: '', IssueDate: '', ExpiryDate: '', Description: '' }]
    })
  }

  const handleRemoveCertificate = (index) => {
    const newCerts = [...formData.certificates]
    newCerts.splice(index, 1)
    setFormData({ ...formData, certificates: newCerts })
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      if (id) {
        await updateUserAPI(id, formData)
        toast.success('Cập nhật thành công')
      } else {
        await createUserAPI(formData)
        toast.success('Tạo tài khoản thành công')
      }
      navigate('/admin/users')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi lưu dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth={false} sx={{ pb: 5, pt: 2 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <IconButton size="small" onClick={() => navigate('/admin/users')} sx={{ bgcolor: 'white', boxShadow: 1 }}>
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
            {id ? 'Chỉnh sửa tài khoản' : 'Tạo tài khoản mới'}
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Stack spacing={2}>
            <Paper sx={{ p: 2, borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <SecurityIcon color="primary" fontSize="small" />
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Tài khoản</Typography>
              </Box>
              <Stack spacing={2}>
                <TextField
                  fullWidth size="small" label="Tên đăng nhập" required disabled={!!id}
                  value={formData.UserName} onChange={e => setFormData({ ...formData, UserName: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                />
                <TextField
                  fullWidth size="small" label="Email" required
                  value={formData.Email} onChange={e => setFormData({ ...formData, Email: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                />
                <TextField
                  fullWidth size="small" label={id ? 'Mật khẩu mới' : 'Mật khẩu'} required={!id} type="password"
                  value={formData.Password} onChange={e => setFormData({ ...formData, Password: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                />
                <FormControl fullWidth size="small">
                  <InputLabel>Vai trò</InputLabel>
                  <Select
                    value={formData.roleName} label="Vai trò"
                    onChange={e => setFormData({ ...formData, roleName: e.target.value })}
                    sx={{ borderRadius: '8px' }}
                  >
                    <MenuItem value="Admin">Admin</MenuItem>
                    <MenuItem value="Teacher">Giáo viên</MenuItem>
                    <MenuItem value="Student">Học viên</MenuItem>
                  </Select>
                </FormControl>
                <FormControlLabel
                  control={<Switch size="small" checked={formData.Active} onChange={e => setFormData({ ...formData, Active: e.target.checked })} />}
                  label={<Typography variant="caption">Hoạt động</Typography>}
                  sx={{ ml: 0 }}
                />
              </Stack>
            </Paper>

            <Paper sx={{ p: 2, borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <ContactPageIcon color="primary" fontSize="small" />
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Liên hệ</Typography>
              </Box>
              <Stack spacing={2}>
                <TextField
                  fullWidth size="small" label="Số điện thoại"
                  value={formData.Phone} onChange={e => setFormData({ ...formData, Phone: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                />
                <TextField
                  fullWidth size="small" label="Địa chỉ" multiline rows={1}
                  value={formData.Address} onChange={e => setFormData({ ...formData, Address: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                />
                <Autocomplete
                  options={cities}
                  getOptionLabel={option => option.Name || ''}
                  value={cities.find(c => String(c.Id) === String(formData.IdCity)) || null}
                  onChange={(event, newValue) => {
                    const cityId = newValue ? newValue.Id : ''
                    setFormData({ ...formData, IdCity: cityId, IdDistrict: '' })
                    loadDistricts(cityId)
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Tỉnh/Thành"
                      placeholder="Chọn Tỉnh/Thành..."
                      size="small"
                      InputProps={{
                        ...params.InputProps,
                        sx: { borderRadius: '8px' }
                      }}
                    />
                  )}
                />
                <Autocomplete
                  disabled={!formData.IdCity}
                  options={districts}
                  getOptionLabel={option => option.Name || ''}
                  value={districts.find(d => String(d.Id) === String(formData.IdDistrict)) || null}
                  onChange={(event, newValue) => {
                    setFormData({ ...formData, IdDistrict: newValue ? newValue.Id : '' })
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Quận/Huyện"
                      placeholder="Chọn Quận/Huyện..."
                      size="small"
                      InputProps={{
                        ...params.InputProps,
                        sx: { borderRadius: '8px' }
                      }}
                    />
                  )}
                />
              </Stack>
            </Paper>
          </Stack>
        </Grid>

        <Grid item xs={12} md={8}>
          <Stack spacing={2}>
            <Paper sx={{ p: 2, borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <BadgeIcon color="primary" fontSize="small" />
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Cá nhân</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth size="small" label="Họ và tên" required
                    value={formData.FullName} onChange={e => setFormData({ ...formData, FullName: e.target.value })}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth size="small" label="Ngày sinh" type="date" InputLabelProps={{ shrink: true }}
                    value={formData.BirthDay ? formData.BirthDay.split('T')[0] : ''}
                    onChange={e => setFormData({ ...formData, BirthDay: e.target.value })}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Giới tính</InputLabel>
                    <Select
                      value={formData.IdGender} label="Giới tính"
                      onChange={e => setFormData({ ...formData, IdGender: e.target.value })}
                      sx={{ borderRadius: '8px' }}
                    >
                      {refData.genders.map(g => <MenuItem key={g.Id} value={g.Id}>{g.Name}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>

            {formData.roleName === 'Teacher' && (
              <>
                <Paper sx={{ p: 2, borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <AccountBalanceIcon color="primary" fontSize="small" />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Lương & Thanh toán</Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Loại giáo viên</InputLabel>
                        <Select
                          value={formData.salary.TypeTeacher} label="Loại giáo viên"
                          onChange={e => {
                            const val = parseInt(e.target.value)
                            setFormData({
                              ...formData,
                              salary: {
                                ...formData.salary,
                                TypeTeacher: val,
                                TypeSalary: val === 1 ? 1 : 2
                              }
                            })
                          }}
                          sx={{ borderRadius: '8px' }}
                        >
                          <MenuItem value={1}>Cơ hữu (Full-time)</MenuItem>
                          <MenuItem value={2}>Thỉnh giảng (Part-time)</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Đơn vị tiền tệ</InputLabel>
                        <Select
                          value={formData.salary.IdMonetaryUnit} label="Đơn vị tiền tệ"
                          onChange={e => setFormData({ ...formData, salary: { ...formData.salary, IdMonetaryUnit: e.target.value } })}
                          sx={{ borderRadius: '8px' }}
                        >
                          {refData.monetaryUnits?.map(mu => (
                            <MenuItem key={mu.Id} value={mu.Id}>{mu.Name}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    {formData.salary.TypeTeacher === 1 ? (
                      <>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth size="small" label="Lương/Tháng" type="number"
                            value={formData.salary.SalaryPerMonth}
                            onChange={e => setFormData({ ...formData, salary: { ...formData.salary, SalaryPerMonth: e.target.value } })}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth size="small" label="Giờ đảm bảo (Warranty)" type="number"
                            value={formData.salary.WarrantyHours}
                            onChange={e => setFormData({ ...formData, salary: { ...formData.salary, WarrantyHours: e.target.value } })}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth size="small" label="Lương/Giờ (Tính Overtime)" type="number"
                            value={formData.salary.SalaryPerHour}
                            onChange={e => setFormData({ ...formData, salary: { ...formData.salary, SalaryPerHour: e.target.value } })}
                          />
                        </Grid>
                      </>
                    ) : (
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth size="small" label="Lương/Giờ" type="number"
                          value={formData.salary.SalaryPerHour}
                          onChange={e => setFormData({ ...formData, salary: { ...formData.salary, SalaryPerHour: e.target.value } })}
                        />
                      </Grid>
                    )}

                    <Grid item xs={12} sm={formData.salary.TypeTeacher === 1 ? 8 : 4}>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Thanh toán</InputLabel>
                          <Select
                            value={formData.salary.IdPaymentMethod} label="Thanh toán"
                            onChange={e => setFormData({ ...formData, salary: { ...formData.salary, IdPaymentMethod: e.target.value } })}
                          >
                            {refData.paymentMethods.map(pm => <MenuItem key={pm.Id} value={pm.Id}>{pm.Name}</MenuItem>)}
                          </Select>
                        </FormControl>
                        <TextField
                          fullWidth size="small" label="STK Ngân hàng"
                          value={formData.salary.NumberAccountBank}
                          onChange={e => setFormData({ ...formData, salary: { ...formData.salary, NumberAccountBank: e.target.value } })}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>

                <Paper sx={{ p: 2, borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Bằng cấp & Chứng chỉ</Typography>
                    <Button size="small" startIcon={<AddIcon />} onClick={handleAddCertificate} sx={{ fontWeight: 700 }}>
                      Thêm mới
                    </Button>
                  </Box>
                  {formData.certificates.map((cert, index) => (
                    <Box key={index} sx={{ p: 1.5, mb: 1.5, bgcolor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                        <IconButton size="small" color="error" onClick={() => handleRemoveCertificate(index)}><DeleteIcon fontSize="inherit" /></IconButton>
                      </Box>
                      <Grid container spacing={1.5}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth label="Tên chứng chỉ" size="small"
                            value={cert.CertificateName}
                            onChange={e => {
                              const newCerts = [...formData.certificates]
                              newCerts[index].CertificateName = e.target.value
                              setFormData({ ...formData, certificates: newCerts })
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth label="Tổ chức cấp" size="small"
                            value={cert.Organization}
                            onChange={e => {
                              const newCerts = [...formData.certificates]
                              newCerts[index].Organization = e.target.value
                              setFormData({ ...formData, certificates: newCerts })
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth label="Ngày cấp" type="date" size="small" InputLabelProps={{ shrink: true }}
                            value={cert.IssueDate ? cert.IssueDate.split('T')[0] : ''}
                            onChange={e => {
                              const newCerts = [...formData.certificates]
                              newCerts[index].IssueDate = e.target.value
                              setFormData({ ...formData, certificates: newCerts })
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth label="Ngày hết hạn" type="date" size="small" InputLabelProps={{ shrink: true }}
                            value={cert.ExpiryDate ? cert.ExpiryDate.split('T')[0] : ''}
                            onChange={e => {
                              const newCerts = [...formData.certificates]
                              newCerts[index].ExpiryDate = e.target.value
                              setFormData({ ...formData, certificates: newCerts })
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                </Paper>
              </>
            )}
          </Stack>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
        <Button
          variant="outlined" size="small" onClick={() => navigate('/admin/users')}
          sx={{ borderRadius: '8px', px: 4, fontWeight: 700, textTransform: 'none' }}
        >
          Hủy bỏ
        </Button>
        <Button
          variant="contained" size="small" startIcon={<SaveIcon />} onClick={handleSave} disabled={loading}
          sx={{ borderRadius: '8px', px: 6, fontWeight: 700, textTransform: 'none' }}
        >
          {loading ? 'Đang lưu...' : 'Lưu thông tin'}
        </Button>
      </Box>
    </Container>
  )
}

export default AccountForm
