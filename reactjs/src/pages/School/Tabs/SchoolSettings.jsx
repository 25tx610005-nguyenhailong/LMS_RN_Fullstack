import { useEffect, useState } from 'react'
import {
  Grid, Paper, Box, Typography, TextField, MenuItem, Button,
  Stack, Avatar, IconButton, Divider, CircularProgress, Alert, Tooltip, alpha, useTheme, Autocomplete
} from '@mui/material'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import SchoolIcon from '@mui/icons-material/School'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import SaveIcon from '@mui/icons-material/Save'
import UndoIcon from '@mui/icons-material/Undo'
import PhoneIcon from '@mui/icons-material/Phone'
import PlaceIcon from '@mui/icons-material/Place'
import LocationCityIcon from '@mui/icons-material/LocationCity'
import MapIcon from '@mui/icons-material/Map'
import { fetchSchoolSettingsAPI, updateSchoolSettingsAPI, fetchCitiesAPI, fetchDistrictsAPI } from '~/apis/schoolApi'

const PERIOD_DURATION_OPTIONS = [30, 35, 40, 45, 50, 55, 60]

const gradientPrimary = 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'

function SchoolSettings() {
  const theme = useTheme()
  const { schoolId } = useParams()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [cities, setCities] = useState([])
  const [districts, setDistricts] = useState([])
  const [isLocked, setIsLocked] = useState(false)

  // School general info and periods settings state
  const [schoolData, setSchoolData] = useState({
    Name: '',
    Phone: '',
    Address: '',
    IdCity: '',
    IdDistrict: ''
  })
  const [periodDuration, setPeriodDuration] = useState(45)
  const [periods, setPeriods] = useState([])

  // Backup state for undo/cancel action
  const [backupData, setBackupData] = useState(null)

  // Fetch initial school settings, periods, and city metadata
  useEffect(() => {
    if (schoolId) {
      setLoading(true)
      Promise.all([
        fetchSchoolSettingsAPI(schoolId),
        fetchCitiesAPI()
      ])
        .then(([settings, citiesData]) => {
          setCities(citiesData)

          const fetchedSchool = settings.school || {}
          const fetchedPeriods = settings.periods || []
          const fetchedIsLocked = settings.isLocked || false

          const initialSchoolData = {
            Name: fetchedSchool.Name || '',
            Phone: fetchedSchool.Phone || '',
            Address: fetchedSchool.Address || '',
            IdCity: fetchedSchool.IdCity || '',
            IdDistrict: fetchedSchool.IdDistrict || ''
          }

          setSchoolData(initialSchoolData)
          setPeriods(fetchedPeriods)
          setIsLocked(fetchedIsLocked)

          // Set period duration from the first period, or default to 45
          const firstPeriodDuration = fetchedPeriods[0]?.Time || 45
          setPeriodDuration(firstPeriodDuration)

          // Save backup
          setBackupData({
            school: initialSchoolData,
            periods: fetchedPeriods,
            duration: firstPeriodDuration,
            isLocked: fetchedIsLocked
          })
        })
        .catch(err => {
          console.error(err)
          toast.error('Lỗi khi tải thông tin cấu hình trường học')
        })
        .finally(() => setLoading(false))
    }
  }, [schoolId])

  // Fetch districts reactively when selected city changes
  useEffect(() => {
    if (schoolData.IdCity) {
      fetchDistrictsAPI(schoolData.IdCity)
        .then(res => setDistricts(res))
        .catch(err => console.error(err))
    } else {
      setDistricts([])
    }
  }, [schoolData.IdCity])

  // Time conversion helpers
  const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0
    const [hours, minutes] = timeStr.split(':').map(Number)
    return hours * 60 + minutes
  }

  const calculateToTime = (fromTimeStr, durationMinutes) => {
    if (!fromTimeStr || !durationMinutes) return ''
    const [hours, minutes] = fromTimeStr.split(':').map(Number)
    const totalMinutes = hours * 60 + minutes + Number(durationMinutes)
    const endHours = Math.floor(totalMinutes / 60) % 24
    const endMinutes = totalMinutes % 60
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`
  }

  // Handle changing start time ("Từ") on a period
  const handleFromTimeChange = (index, value) => {
    const updated = [...periods]
    updated[index].FromTime = value
    updated[index].ToTime = calculateToTime(value, periodDuration)
    setPeriods(updated)
  }

  // Handle changing lesson/period duration
  const handlePeriodDurationChange = (newDuration) => {
    setPeriodDuration(newDuration)
    // Recalculate end times for all periods
    const updated = periods.map(p => ({
      ...p,
      Time: newDuration,
      ToTime: p.FromTime ? calculateToTime(p.FromTime, newDuration) : p.ToTime
    }))
    setPeriods(updated)
  }

  // Add a new period (tiết học)
  const handleAddPeriod = () => {
    if (isLocked) return

    const nextIndex = periods.length + 1

    // Automatically estimate a starting time (e.g. after the last period, or standard morning start 07:30)
    let estimatedStart = '07:30'
    if (periods.length > 0) {
      const lastPeriod = periods[periods.length - 1]
      if (lastPeriod.ToTime) {
        const [h, m] = lastPeriod.ToTime.split(':').map(Number)
        const breakTime = 5 // 5 minutes break
        const totalMin = h * 60 + m + breakTime
        const estH = Math.floor(totalMin / 60) % 24
        const estM = totalMin % 60
        estimatedStart = `${String(estH).padStart(2, '0')}:${String(estM).padStart(2, '0')}`
      }
    }

    const newPeriod = {
      Indexes: nextIndex,
      Time: periodDuration,
      FromTime: estimatedStart,
      ToTime: calculateToTime(estimatedStart, periodDuration)
    }

    setPeriods([...periods, newPeriod])
    toast.info(`Đã thêm Tiết ${nextIndex}`)
  }

  // Remove a period and adjust remaining Indexes sequentially
  const handleRemovePeriod = (index) => {
    if (isLocked) return

    const filtered = periods.filter((_, i) => i !== index)
    const adjusted = filtered.map((p, i) => ({
      ...p,
      Indexes: i + 1
    }))
    setPeriods(adjusted)
  }

  // Overlap checker: returns boolean array of period indexes that are overlapping
  const checkOverlaps = () => {
    const overlapFlags = new Array(periods.length).fill(false)
    for (let i = 0; i < periods.length; i++) {
      const p1 = periods[i]
      if (!p1.FromTime || !p1.ToTime) continue
      const start1 = timeToMinutes(p1.FromTime)
      const end1 = timeToMinutes(p1.ToTime)

      for (let j = i + 1; j < periods.length; j++) {
        const p2 = periods[j]
        if (!p2.FromTime || !p2.ToTime) continue
        const start2 = timeToMinutes(p2.FromTime)
        const end2 = timeToMinutes(p2.ToTime)

        // Standard time interval intersection: [s1, e1] intersects [s2, e2]
        if (start1 < end2 && start2 < end1) {
          overlapFlags[i] = true
          overlapFlags[j] = true
        }
      }
    }
    return overlapFlags
  }

  const overlaps = checkOverlaps()
  const hasOverlapError = overlaps.some(flag => flag)

  // Reset changes to database backup
  const handleCancelChanges = () => {
    if (backupData) {
      setSchoolData(backupData.school)
      setPeriods(backupData.periods)
      setPeriodDuration(backupData.duration)
      setIsLocked(backupData.isLocked)
      toast.success('Đã hoàn tác toàn bộ thay đổi cấu hình!')
    }
  }

  // Save all settings (school info + periods)
  const handleSaveSettings = async () => {
    // Basic validation
    if (!schoolData.Name.trim()) {
      toast.warn('Vui lòng điền tên trường học')
      return
    }

    if (!isLocked && hasOverlapError) {
      toast.error('Không thể lưu cài đặt khi có tiết học bị trùng lặp thời gian!')
      return
    }

    setSaving(true)
    try {
      const payload = {
        ...schoolData,
        periods: isLocked ? [] : periods.map(p => ({
          Indexes: p.Indexes,
          Time: periodDuration,
          FromTime: p.FromTime,
          ToTime: p.ToTime
        }))
      }

      const res = await updateSchoolSettingsAPI(schoolId, payload)
      toast.success('🎉 Đã cập nhật cấu hình trường học thành công!')

      // Update backup to the new saved state
      const updatedSchool = res.school || schoolData
      const updatedPeriods = res.periods || periods
      const updatedIsLocked = res.isLocked || isLocked
      const newBackup = {
        school: {
          Name: updatedSchool.Name || '',
          Phone: updatedSchool.Phone || '',
          Address: updatedSchool.Address || '',
          IdCity: updatedSchool.IdCity || '',
          IdDistrict: updatedSchool.IdDistrict || ''
        },
        periods: updatedPeriods,
        duration: periodDuration,
        isLocked: updatedIsLocked
      }
      setBackupData(newBackup)
      setIsLocked(updatedIsLocked)

      // Reload to propagate new details (like school name and address) to parent layout
      window.location.reload()
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Gặp lỗi trong quá trình lưu cấu hình')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <CircularProgress size={50} thickness={4} />
      </Box>
    )
  }

  return (
    <Box sx={{ pb: 4 }}>
      <Grid container spacing={3}>
        {/* Left Column: General School Information & Duration settings */}
        <Grid item xs={12} md={5}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
            <SchoolIcon color="primary" sx={{ fontSize: 20 }} /> Thông Tin Chung
          </Typography>

          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              bgcolor: 'white',
              boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
            }}
          >
            <Stack spacing={2.5}>
              <TextField
                label="Tên trường học"
                fullWidth
                size="small"
                value={schoolData.Name}
                onChange={e => setSchoolData({ ...schoolData, Name: e.target.value })}
                InputProps={{
                  startAdornment: <SchoolIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 18 }} />,
                  sx: { borderRadius: '12px' }
                }}
              />

              <TextField
                label="Số điện thoại"
                fullWidth
                size="small"
                value={schoolData.Phone}
                onChange={e => setSchoolData({ ...schoolData, Phone: e.target.value })}
                InputProps={{
                  startAdornment: <PhoneIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 18 }} />,
                  sx: { borderRadius: '12px' }
                }}
              />

              <TextField
                label="Địa chỉ chi tiết"
                fullWidth
                size="small"
                value={schoolData.Address}
                onChange={e => setSchoolData({ ...schoolData, Address: e.target.value })}
                InputProps={{
                  startAdornment: <PlaceIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 18 }} />,
                  sx: { borderRadius: '12px' }
                }}
              />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Autocomplete
                    options={cities}
                    getOptionLabel={option => option.Name || ''}
                    value={cities.find(city => city.Id === schoolData.IdCity) || null}
                    onChange={(event, newValue) => {
                      setSchoolData({ ...schoolData, IdCity: newValue ? newValue.Id : '', IdDistrict: '' })
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Tỉnh / Thành phố"
                        placeholder="Chọn Tỉnh / Thành..."
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <>
                              <LocationCityIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 18 }} />
                              {params.InputProps.startAdornment}
                            </>
                          ),
                          sx: { borderRadius: '12px' }
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Autocomplete
                    disabled={!schoolData.IdCity}
                    options={districts}
                    getOptionLabel={option => option.Name || ''}
                    value={districts.find(d => d.Id === schoolData.IdDistrict) || null}
                    onChange={(event, newValue) => {
                      setSchoolData({ ...schoolData, IdDistrict: newValue ? newValue.Id : '' })
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Quận / Huyện"
                        placeholder="Chọn Quận / Huyện..."
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <>
                              <MapIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 18 }} />
                              {params.InputProps.startAdornment}
                            </>
                          ),
                          sx: { borderRadius: '12px' }
                        }}
                      />
                    )}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 0.5 }} />

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: '#475569', display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.8rem' }}>
                  <AccessTimeIcon sx={{ fontSize: 16 }} /> Thời lượng mặc định / 1 tiết học
                </Typography>
                <TextField
                  select
                  fullWidth
                  size="small"
                  value={periodDuration}
                  onChange={e => handlePeriodDurationChange(Number(e.target.value))}
                  disabled={isLocked}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      height: '40px'
                    },
                    '& .MuiSelect-select': {
                      display: 'flex',
                      alignItems: 'center',
                      py: 0,
                      height: '100%'
                    }
                  }}
                >
                  {PERIOD_DURATION_OPTIONS.map(opt => (
                    <MenuItem key={opt} value={opt}>{opt} phút</MenuItem>
                  ))}
                </TextField>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', px: 0.5, fontSize: '0.7rem' }}>
                  {isLocked ? (
                    <span style={{ color: theme.palette.warning.main, fontWeight: 700 }}>
                      * Đã khóa cấu hình do có lớp đã xếp lịch.
                    </span>
                  ) : (
                    '* Thời lượng này sẽ được dùng để tự động tính thời gian học (Từ -> Đến) của các tiết bên cột phải.'
                  )}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Right Column: Periods timeline configurer */}
        <Grid item xs={12} md={7}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTimeIcon color="primary" sx={{ fontSize: 20 }} /> Cấu Hình Tiết Học
            </Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={handleAddPeriod}
              disabled={isLocked}
              sx={{
                borderRadius: '10px',
                fontWeight: 800,
                textTransform: 'none',
                background: isLocked ? '#cbd5e1' : gradientPrimary,
                boxShadow: isLocked ? 'none' : '0 4px 12px rgba(99, 102, 241, 0.2)',
                '&:hover': {
                  background: isLocked ? '#cbd5e1' : gradientPrimary
                }
              }}
            >
              Thêm Tiết Học
            </Button>
          </Box>

          {isLocked && (
            <Alert severity="warning" icon={<WarningAmberIcon />} sx={{ mb: 2, borderRadius: '12px', py: 0.5, px: 2, fontWeight: 600, fontSize: '0.8rem' }}>
              Thông báo: Thời lượng học và danh sách tiết học đã bị khóa (không thể chỉnh sửa) vì trường này đã có lớp học được xếp lịch học chi tiết.
            </Alert>
          )}

          {!isLocked && hasOverlapError && (
            <Alert severity="error" icon={<WarningAmberIcon />} sx={{ mb: 2, borderRadius: '12px', py: 0.5, px: 2, fontWeight: 600, fontSize: '0.8rem' }}>
              Cảnh báo: Phát hiện các tiết học bị trùng lặp hoặc chồng lấn thời gian với nhau. Vui lòng kiểm tra lại giờ bắt đầu (các tiết viền đỏ).
            </Alert>
          )}

          {periods.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: '16px',
                border: '2px dashed #cbd5e1',
                bgcolor: 'transparent',
                textAlign: 'center'
              }}
            >
              <Typography color="text.secondary" sx={{ fontWeight: 600, mb: 2, fontSize: '0.85rem' }}>Trường chưa có tiết học nào được tạo.</Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon />}
                onClick={handleAddPeriod}
                disabled={isLocked}
                sx={{ borderRadius: '10px', fontWeight: 800, textTransform: 'none', borderWidth: '1.5px', '&:hover': { borderWidth: '1.5px' } }}
              >
                Tạo tiết học đầu tiên
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={1.5}>
              {periods.map((period, index) => {
                const isOverlapping = !isLocked && overlaps[index]
                return (
                  <Grid item xs={12} sm={6} key={index}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.5,
                        borderRadius: '12px',
                        border: '1.5px solid',
                        borderColor: isOverlapping ? '#ef4444' : '#e2e8f0',
                        bgcolor: isOverlapping ? alpha('#ef4444', 0.02) : (isLocked ? '#f8fafc' : 'white'),
                        transition: 'all 0.2s ease-in-out',
                        position: 'relative',
                        '&:hover': {
                          transform: isLocked ? 'none' : 'translateY(-1px)',
                          boxShadow: isLocked ? 'none' : '0 4px 12px rgba(0,0,0,0.03)',
                          borderColor: isOverlapping ? '#ef4444' : '#cbd5e1'
                        }
                      }}
                    >
                      {/* Header: Title & Info + Delete Button */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar
                            sx={{
                              width: 26,
                              height: 26,
                              bgcolor: isOverlapping ? '#ef4444' : (isLocked ? '#cbd5e1' : alpha(theme.palette.primary.main, 0.1)),
                              color: isOverlapping ? 'white' : (isLocked ? '#475569' : 'primary.main'),
                              fontWeight: 900,
                              fontSize: '0.75rem'
                            }}
                          >
                            {period.Indexes}
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontWeight: 800, color: isLocked ? '#64748b' : '#1e293b', fontSize: '0.8rem', lineHeight: 1.2 }}>
                              Tiết {period.Indexes}
                            </Typography>
                            <Typography sx={{ fontWeight: 600, fontSize: '0.7rem', color: 'text.secondary' }}>
                              {periodDuration} phút
                            </Typography>
                          </Box>
                        </Box>

                        <Tooltip title={isLocked ? 'Lịch học đã bị khóa' : 'Xóa tiết học'}>
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => handleRemovePeriod(index)}
                              disabled={isLocked}
                              sx={{
                                color: '#94a3b8',
                                padding: '2px',
                                '&:hover': { color: '#ef4444', bgcolor: alpha('#ef4444', 0.1) }
                              }}
                            >
                              <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Box>

                      {/* Time Fields */}
                      <Grid container spacing={1.2}>
                        <Grid item xs={6}>
                          <TextField
                            label="Từ"
                            type="time"
                            size="small"
                            fullWidth
                            value={period.FromTime || ''}
                            onChange={e => handleFromTimeChange(index, e.target.value)}
                            disabled={isLocked}
                            InputLabelProps={{ shrink: true }}
                            InputProps={{
                              sx: { borderRadius: '8px', fontSize: '0.8rem' }
                            }}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <Tooltip title="Tự động tính dựa theo thời lượng">
                            <TextField
                              label="Đến"
                              type="time"
                              size="small"
                              fullWidth
                              disabled
                              value={period.ToTime || ''}
                              InputLabelProps={{ shrink: true }}
                              InputProps={{
                                sx: { borderRadius: '8px', bgcolor: '#f1f5f9', fontSize: '0.8rem' }
                              }}
                            />
                          </Tooltip>
                        </Grid>
                      </Grid>

                      {isOverlapping && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1, color: '#ef4444' }}>
                          <WarningAmberIcon sx={{ fontSize: 12 }} />
                          <Typography sx={{ fontWeight: 700, fontSize: '0.65rem' }}>
                            Trùng thời gian học!
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                )
              })}
            </Grid>
          )}
        </Grid>
      </Grid>

      {/* Action Bar - Styled inline at the bottom of the container */}
      <Box
        sx={{
          mt: 4,
          pt: 2.5,
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 2
        }}
      >
        <Button
          variant="outlined"
          size="small"
          startIcon={<UndoIcon sx={{ fontSize: 18 }} />}
          onClick={handleCancelChanges}
          disabled={saving}
          sx={{
            borderRadius: '10px',
            px: 3.5,
            py: 1,
            fontWeight: 800,
            textTransform: 'none',
            borderWidth: '1.5px',
            borderColor: '#cbd5e1',
            color: '#64748b',
            '&:hover': { borderWidth: '1.5px', borderColor: '#94a3b8', bgcolor: '#f8fafc' }
          }}
        >
          Hủy Thay Đổi
        </Button>
        <Button
          variant="contained"
          size="small"
          startIcon={<SaveIcon sx={{ fontSize: 18 }} />}
          onClick={handleSaveSettings}
          disabled={saving || (!isLocked && hasOverlapError)}
          sx={{
            borderRadius: '10px',
            px: 4.5,
            py: 1,
            fontWeight: 800,
            textTransform: 'none',
            background: (!isLocked && hasOverlapError) ? '#cbd5e1' : gradientPrimary,
            boxShadow: (!isLocked && hasOverlapError) ? 'none' : '0 4px 12px rgba(99, 102, 241, 0.25)',
            '&:hover': {
              background: (!isLocked && hasOverlapError) ? '#cbd5e1' : gradientPrimary,
              opacity: 0.95
            }
          }}
        >
          {saving ? 'Đang Lưu...' : 'Lưu Cài Đặt'}
        </Button>
      </Box>
    </Box>
  )
}

export default SchoolSettings

