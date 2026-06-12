import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import {
  Box, Typography, Accordion, AccordionSummary, AccordionDetails,
  List, ListItem, ListItemIcon, ListItemText, IconButton, Tooltip, Chip,
  Paper, alpha, useTheme, Grid, Stack, Avatar, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress
} from '@mui/material'
import { useOutletContext } from 'react-router-dom'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline'
import FilePresentIcon from '@mui/icons-material/FilePresent'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import MovieIcon from '@mui/icons-material/Movie'
import ImageIcon from '@mui/icons-material/Image'
import CloseIcon from '@mui/icons-material/Close'
import AttachmentIcon from '@mui/icons-material/Attachment'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import AudiotrackIcon from '@mui/icons-material/Audiotrack'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import SaveIcon from '@mui/icons-material/Save'
import CheckIcon from '@mui/icons-material/Check'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'

import { toast } from 'react-toastify'
import {
  listLessonResourcesAPI,
  updateLessonAPI,
  uploadLessonResourceAPI,
  updateLessonResourceAPI,
  deleteLessonResourceAPI
} from '~/apis/materialApi'
import { uploadFileAPI, deleteFileAPI } from '~/apis/commonApi'
import { resolveFileUrl } from '~/utils/formatters'

// Helper for formatting file sizes
const formatBytes = (bytes, decimals = 2) => {
  if (!bytes) return ''
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

// Helper to get appropriate icon, background, border and text colors based on file extension
const getFileConfig = (fileName) => {
  const ext = fileName ? fileName.split('.').pop().toLowerCase() : ''
  const configs = {
    pdf: {
      icon: <FilePresentIcon sx={{ fontSize: 16 }} />,
      bgColor: 'rgba(239, 68, 68, 0.03)',
      borderColor: 'rgba(239, 68, 68, 0.12)',
      textColor: '#b91c1c',
      iconColor: '#ef4444'
    },
    doc: {
      icon: <FilePresentIcon sx={{ fontSize: 16 }} />,
      bgColor: 'rgba(59, 130, 246, 0.03)',
      borderColor: 'rgba(59, 130, 246, 0.12)',
      textColor: '#1d4ed8',
      iconColor: '#3b82f6'
    },
    docx: {
      icon: <FilePresentIcon sx={{ fontSize: 16 }} />,
      bgColor: 'rgba(59, 130, 246, 0.03)',
      borderColor: 'rgba(59, 130, 246, 0.12)',
      textColor: '#1d4ed8',
      iconColor: '#3b82f6'
    },
    mp4: {
      icon: <MovieIcon sx={{ fontSize: 16 }} />,
      bgColor: 'rgba(139, 92, 246, 0.03)',
      borderColor: 'rgba(139, 92, 246, 0.12)',
      textColor: '#6d28d9',
      iconColor: '#8b5cf6'
    },
    mov: {
      icon: <MovieIcon sx={{ fontSize: 16 }} />,
      bgColor: 'rgba(139, 92, 246, 0.03)',
      borderColor: 'rgba(139, 92, 246, 0.12)',
      textColor: '#6d28d9',
      iconColor: '#8b5cf6'
    },
    png: {
      icon: <ImageIcon sx={{ fontSize: 16 }} />,
      bgColor: 'rgba(34, 197, 94, 0.03)',
      borderColor: 'rgba(34, 197, 94, 0.12)',
      textColor: '#15803d',
      iconColor: '#22c55e'
    },
    jpg: {
      icon: <ImageIcon sx={{ fontSize: 16 }} />,
      bgColor: 'rgba(34, 197, 94, 0.03)',
      borderColor: 'rgba(34, 197, 94, 0.12)',
      textColor: '#15803d',
      iconColor: '#22c55e'
    },
    jpeg: {
      icon: <ImageIcon sx={{ fontSize: 16 }} />,
      bgColor: 'rgba(34, 197, 94, 0.03)',
      borderColor: 'rgba(34, 197, 94, 0.12)',
      textColor: '#15803d',
      iconColor: '#22c55e'
    },
    gif: {
      icon: <ImageIcon sx={{ fontSize: 16 }} />,
      bgColor: 'rgba(34, 197, 94, 0.03)',
      borderColor: 'rgba(34, 197, 94, 0.12)',
      textColor: '#15803d',
      iconColor: '#22c55e'
    },
    mp3: {
      icon: <AudiotrackIcon sx={{ fontSize: 16 }} />,
      bgColor: 'rgba(236, 72, 153, 0.03)',
      borderColor: 'rgba(236, 72, 153, 0.12)',
      textColor: '#be185d',
      iconColor: '#ec4899'
    },
    wav: {
      icon: <AudiotrackIcon sx={{ fontSize: 16 }} />,
      bgColor: 'rgba(236, 72, 153, 0.03)',
      borderColor: 'rgba(236, 72, 153, 0.12)',
      textColor: '#be185d',
      iconColor: '#ec4899'
    },
    ogg: {
      icon: <AudiotrackIcon sx={{ fontSize: 16 }} />,
      bgColor: 'rgba(236, 72, 153, 0.03)',
      borderColor: 'rgba(236, 72, 153, 0.12)',
      textColor: '#be185d',
      iconColor: '#ec4899'
    }
  }

  return configs[ext] || {
    icon: <AttachmentIcon sx={{ fontSize: 16 }} />,
    bgColor: '#f8fafc',
    borderColor: '#e2e8f0',
    textColor: '#334155',
    iconColor: '#64748b'
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function CourseOverview() {
  const { course, reloadCourse } = useOutletContext()
  const theme = useTheme()

  const { currentUser } = useSelector((state) => state.user)
  const role = currentUser?.role?.toUpperCase()
  const isTeacher = role === 'TEACHER'
  const isAdmin = role === 'ADMIN'
  const isStaff = isAdmin || isTeacher

  const [lessonResources, setLessonResources] = useState({})
  const [selectedResource, setSelectedResource] = useState(null)
  const [expandedTheme, setExpandedTheme] = useState({})

  // File upload states for lesson file (PDF / Audio)
  const [openLessonModal, setOpenLessonModal] = useState(false)
  const [selectedLessonForEdit, setSelectedLessonForEdit] = useState(null)
  const [currentMaterialForEdit, setCurrentMaterialForEdit] = useState(null)
  const [lessonForm, setLessonForm] = useState({ FileName: '' })
  const [pendingLessonFile, setPendingLessonFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  // Lesson Resource modal states
  const [openResourceModal, setOpenResourceModal] = useState(false)
  const [selectedLessonForResources, setSelectedLessonForResources] = useState(null)
  const [filesToUpload, setFilesToUpload] = useState([])
  const [editingResourceId, setEditingResourceId] = useState(null)
  const [editingResourceName, setEditingResourceName] = useState('')
  const [resourceUploading, setResourceUploading] = useState(false)

  // Fetch resources for all lessons when the course data is loaded
  useEffect(() => {
    if (course?.CourseMaterial) {
      course.CourseMaterial.forEach((cm) => {
        cm.Material?.MaterialTheme?.forEach((themeItem) => {
          themeItem.MaterialLesson?.forEach((lesson) => {
            fetchLessonResources(lesson.Id)
          })
        })
      })
    }
  }, [course])

  const fetchLessonResources = async (lessonId) => {
    try {
      const res = await listLessonResourcesAPI(lessonId, course?.Id)
      setLessonResources((prev) => ({
        ...prev,
        [lessonId]: res
      }))
    } catch (error) {
      console.error(`Error fetching resources for lesson ${lessonId}:`, error)
    }
  }

  // Lesson File edit handlers
  const handleOpenLessonEdit = (lesson, material) => {
    setSelectedLessonForEdit(lesson)
    setCurrentMaterialForEdit(material)
    setLessonForm({ FileName: lesson.FileName || '' })
    setPendingLessonFile(null)
    setOpenLessonModal(true)
  }

  const handleLessonFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setPendingLessonFile(file)
    setLessonForm({ FileName: file.name })
  }

  const handleSaveLesson = async () => {
    try {
      setUploading(true)
      let finalForm = { ...lessonForm }

      if (pendingLessonFile) {
        const matFolder = currentMaterialForEdit?.FolderName || `M${currentMaterialForEdit?.Id}`
        const themeFolder = selectedLessonForEdit?.MaterialTheme?.FolderName || `T${selectedLessonForEdit?.IdTheme}`
        const lessonFolder = selectedLessonForEdit?.FolderName || `L${selectedLessonForEdit?.Id}`

        const folder = `materials/${matFolder}/${themeFolder}/${lessonFolder}`
        const oldPath = selectedLessonForEdit?.FileName
          ? `uploads/materials/${matFolder}/${themeFolder}/${lessonFolder}/${selectedLessonForEdit.FileName}`
          : null

        await uploadFileAPI(pendingLessonFile, folder, oldPath)
        finalForm.FileName = pendingLessonFile.name
      }
      else if (selectedLessonForEdit?.FileName && !lessonForm.FileName) {
        const matFolder = currentMaterialForEdit?.FolderName || `M${currentMaterialForEdit?.Id}`
        const themeFolder = selectedLessonForEdit?.MaterialTheme?.FolderName || `T${selectedLessonForEdit?.IdTheme}`
        const lessonFolder = selectedLessonForEdit?.FolderName || `L${selectedLessonForEdit?.Id}`
        const oldPath = `uploads/materials/${matFolder}/${themeFolder}/${lessonFolder}/${selectedLessonForEdit.FileName}`
        await deleteFileAPI(oldPath)
      }

      await updateLessonAPI(selectedLessonForEdit.Id, finalForm)
      toast.success('Đã cập nhật tài liệu bài học')
      setOpenLessonModal(false)
      setPendingLessonFile(null)
      if (reloadCourse) reloadCourse()
    } catch (error) {
      toast.error('Lỗi thao tác bài học')
    } finally {
      setUploading(false)
    }
  }

  // Resource handlers
  const handleOpenResourceManage = (lesson) => {
    setSelectedLessonForResources(lesson)
    setFilesToUpload([])
    setEditingResourceId(null)
    setEditingResourceName('')
    setOpenResourceModal(true)
    fetchLessonResources(lesson.Id)
  }

  const handleChooseResourceFiles = (e) => {
    const selectedFiles = Array.from(e.target.files)
    setFilesToUpload(prev => [...prev, ...selectedFiles])
    e.target.value = ''
  }

  const handleRemoveFileFromUploadList = (index) => {
    setFilesToUpload(prev => prev.filter((_, i) => i !== index))
  }

  const handleBatchUploadResources = async () => {
    if (filesToUpload.length === 0 || !selectedLessonForResources) return
    setResourceUploading(true)
    try {
      const formData = new FormData()
      filesToUpload.forEach(file => {
        formData.append('files', file)
      })
      if (course?.Id) {
        formData.append('courseId', course.Id)
      }
      await uploadLessonResourceAPI(selectedLessonForResources.Id, formData)
      toast.success('Tải tài nguyên lên thành công')
      setFilesToUpload([])
      fetchLessonResources(selectedLessonForResources.Id)
      if (reloadCourse) reloadCourse()
    } catch (err) {
      toast.error('Lỗi tải tài nguyên lên')
    } finally {
      setResourceUploading(false)
    }
  }

  const handleStartRenameResource = (res) => {
    setEditingResourceId(res.id)
    setEditingResourceName(res.resourceName)
  }

  const handleSaveRenameResource = async (res) => {
    if (!editingResourceName.trim()) {
      toast.error('Tên tài nguyên không được để trống')
      return
    }
    try {
      await updateLessonResourceAPI(selectedLessonForResources.Id, res.id, { ResourceName: editingResourceName })
      toast.success('Đã cập nhật tên tài nguyên')
      setEditingResourceId(null)
      fetchLessonResources(selectedLessonForResources.Id)
      if (reloadCourse) reloadCourse()
    } catch (err) {
      toast.error('Lỗi đổi tên tài nguyên')
    }
  }

  const handleCancelRenameResource = () => {
    setEditingResourceId(null)
  }

  const handleDeleteResource = async (res) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài nguyên này?')) return
    try {
      await deleteLessonResourceAPI(selectedLessonForResources.Id, res.id)
      toast.success('Đã xóa tài nguyên')
      fetchLessonResources(selectedLessonForResources.Id)
      if (reloadCourse) reloadCourse()
    } catch (err) {
      toast.error('Lỗi khi xóa tài nguyên')
    }
  }

  const handleSelectResourceForLesson = (lesson, material) => {
    if (!lesson.FileName) return
    const matFolder = material.FolderName || `M${material.Id}`
    const themeFolder = lesson.MaterialTheme?.FolderName || `T${lesson.IdTheme}`
    const lessonFolder = lesson.FolderName || `L${lesson.Id}`
    const filePath = `/uploads/materials/${matFolder}/${themeFolder}/${lessonFolder}/${lesson.FileName}`
    setSelectedResource({
      resourceName: lesson.FileName,
      filePath: filePath
    })
  }

  const handleAccordionChange = (themeId) => (event, isExpanded) => {
    setExpandedTheme(prev => ({
      ...prev,
      [themeId]: isExpanded
    }))
  }

  // Preview content renderer based on file extension
  const renderPreviewContent = (res) => {
    if (!res) return null
    const url = resolveFileUrl(res.filePath || res.ResourceUrl)
    const ext = res.resourceName.split('.').pop().toLowerCase()

    switch (ext) {
    case 'pdf':
      return (
        <Box sx={{ width: '100%', height: '100%', overflow: 'hidden', borderRadius: '16px' }}>
          <iframe
            src={url}
            width="100%"
            height="100%"
            style={{ border: 'none', borderRadius: '16px' }}
            title="PDF Preview"
          />
        </Box>
      )
    case 'mp4':
    case 'mov':
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: 'black', borderRadius: '16px', height: '100%', overflow: 'hidden' }}>
          <video
            src={url}
            controls
            style={{ width: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '16px' }}
          />
        </Box>
      )
    case 'mp3':
    case 'wav':
    case 'ogg':
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4, bgcolor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', height: '100%' }}>
          <audio
            src={url}
            controls
            style={{ width: '80%' }}
          />
        </Box>
      )
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 1, bgcolor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', height: '100%' }}>
          <Box
            component="img"
            src={url}
            alt={res.resourceName}
            sx={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}
          />
        </Box>
      )
    case 'doc':
    case 'docx':
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      if (!isLocalhost) {
        return (
          <Box sx={{ width: '100%', height: '100%', overflow: 'hidden', borderRadius: '16px' }}>
            <iframe
              src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`}
              width="100%"
              height="100%"
              style={{ border: 'none', borderRadius: '16px' }}
              title="Office Document Preview"
            />
          </Box>
        )
      }
      return (
        <Box sx={{ p: 5, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1', width: '100%' }}>
          <FilePresentIcon sx={{ fontSize: 70, color: '#3b82f6', mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, fontSize: '1rem' }}>
              Tài liệu Microsoft Word
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 360, mx: 'auto', fontSize: '0.8rem' }}>
              Để xem trước tài liệu Word (.doc/.docx) trên localhost, vui lòng tải về máy. Khi hệ thống được deploy lên Internet, tài liệu sẽ hiển thị trực quan thông qua Office Online.
          </Typography>
          <Button
            variant="contained"
            startIcon={<OpenInNewIcon />}
            onClick={() => window.open(url, '_blank')}
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, fontSize: '0.8rem' }}
          >
              Tải tài liệu xuống
          </Button>
        </Box>
      )
    default:
      return (
        <Box sx={{ p: 5, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1', width: '100%' }}>
          <FilePresentIcon sx={{ fontSize: 70, color: '#64748b', mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, fontSize: '1rem' }}>
              Định dạng không hỗ trợ xem trước
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontSize: '0.8rem' }}>
              Bạn vẫn có thể tải tệp tin này về máy để xem.
          </Typography>
          <Button
            variant="contained"
            startIcon={<OpenInNewIcon />}
            onClick={() => window.open(url, '_blank')}
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, fontSize: '0.8rem' }}
          >
              Tải tệp xuống
          </Button>
        </Box>
      )
    }
  }

  return (
    <Box sx={{ p: 1.5 }}>
      <Grid container spacing={2.5}>
        {/* LEFT COLUMN: Course Material, Themes, Lessons and resources (3/12 grid - 25% width) */}
        <Grid item xs={12} lg={3}>
          {course.CourseMaterial?.map((cm) => (
            <Box key={cm.Id} sx={{ mb: 3 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 1.8,
                  mb: 2.5,
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(79, 70, 229, 0.1) 100%)',
                  border: '1px solid rgba(99, 102, 241, 0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.8,
                  boxShadow: '0 4px 14px rgba(99, 102, 241, 0.04)'
                }}
              >
                <Avatar
                  src={cm.Material?.ImageUrl ? resolveFileUrl(cm.Material.ImageUrl) : undefined}
                  variant="rounded"
                  sx={{
                    bgcolor: '#6366f1',
                    color: 'white',
                    width: 38,
                    height: 52,
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
                    border: '1px solid rgba(99, 102, 241, 0.15)',
                    '& img': { objectFit: 'cover' }
                  }}
                >
                  <MenuBookIcon sx={{ fontSize: 18 }} />
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#4f46e5',
                      fontWeight: 800,
                      fontSize: '0.65rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      display: 'block',
                      mb: 0.5
                    }}
                  >
                    Giáo trình học tập
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: '#312e81',
                      fontWeight: 900,
                      fontSize: '1.05rem',
                      letterSpacing: '-0.025em',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      lineHeight: 1.2
                    }}
                  >
                    {cm.Material?.Name}
                  </Typography>
                </Box>
              </Paper>
              {cm.Material?.MaterialTheme?.map((themeItem) => {
                const isExpanded = expandedTheme[themeItem.Id]
                return (
                  <Accordion
                    key={themeItem.Id}
                    elevation={0}
                    onChange={handleAccordionChange(themeItem.Id)}
                    sx={{
                      mb: 1.5,
                      borderRadius: '16px !important',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.01)',
                      transition: 'all 0.25s ease',
                      borderLeft: isExpanded ? '4px solid #6366f1' : '1px solid #e2e8f0',
                      '&:hover': {
                        boxShadow: '0 6px 16px rgba(99, 102, 241, 0.05)',
                        borderColor: '#cbd5e1'
                      },
                      '&:before': { display: 'none' }
                    }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#6366f1', fontSize: 20 }} />} sx={{ minHeight: 48, '& .MuiAccordionSummary-content': { margin: '10px 0' } }}>
                      <Typography sx={{ fontWeight: 800, color: '#1e293b', fontSize: '0.925rem', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {themeItem.Name}{themeItem.Title ? ` - ${themeItem.Title}` : ''}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 0, bgcolor: '#fafafa' }}>
                      <List sx={{ pt: 0, pb: 0.5 }}>
                        {themeItem.MaterialLesson?.map((lesson) => (
                          <ListItem
                            key={lesson.Id}
                            sx={{
                              borderTop: '1px solid #f1f5f9',
                              py: 2,
                              px: 2,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'flex-start',
                              transition: 'background-color 0.2s',
                              '&:hover': {
                                bgcolor: alpha('#6366f1', 0.02)
                              }
                            }}
                          >
                            {/* Lesson Title Row */}
                            <Box sx={{ display: 'flex', width: '100%', alignItems: 'center', gap: 1, mb: 1 }}>
                              <ListItemIcon sx={{ minWidth: 28 }}>
                                <Avatar sx={{ bgcolor: alpha('#6366f1', 0.08), color: '#6366f1', width: 24, height: 24 }}>
                                  <PlayCircleOutlineIcon sx={{ fontSize: 16 }} />
                                </Avatar>
                              </ListItemIcon>
                              <ListItemText
                                primary={`${lesson.Name}${lesson.Title ? ` - ${lesson.Title}` : ''}`}
                                primaryTypographyProps={{ fontWeight: 800, color: '#334155', fontSize: '0.85rem', lineHeight: 1.3 }}
                              />
                              {isStaff && (
                                <Stack direction="row" spacing={0.5}>
                                  <Tooltip title="Cập nhật tài liệu đính kèm">
                                    <IconButton size="small" onClick={() => handleOpenLessonEdit(lesson, cm.Material)}>
                                      <CloudUploadIcon sx={{ fontSize: 16, color: '#4f46e5' }} />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Quản lý tài nguyên bổ sung">
                                    <IconButton size="small" onClick={() => handleOpenResourceManage(lesson)}>
                                      <AttachmentIcon sx={{ fontSize: 16, color: '#0ea5e9' }} />
                                    </IconButton>
                                  </Tooltip>
                                </Stack>
                              )}
                            </Box>

                            {/* Main Lesson File Chip */}
                            {lesson.FileName && (() => {
                              const isMainFileActive = selectedResource && selectedResource.resourceName === lesson.FileName && selectedResource.filePath.includes(lesson.FileName)
                              const ext = lesson.FileName.split('.').pop().toLowerCase()
                              const isImg = ['png', 'jpg', 'jpeg', 'gif'].includes(ext)
                              const fileConfig = getFileConfig(lesson.FileName)
                              const chipLabel = isImg ? 'Hình ảnh bài học' : 'PDF bài học'

                              return (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, width: '100%', pl: 3.5, mb: 1.5 }}>
                                  <Chip
                                    icon={isImg ? <ImageIcon sx={{ color: `${fileConfig.iconColor} !important`, fontSize: 14 }} /> : <FilePresentIcon sx={{ color: `${fileConfig.iconColor} !important`, fontSize: 14 }} />}
                                    label={chipLabel}
                                    size="small"
                                    onClick={() => handleSelectResourceForLesson(lesson, cm.Material)}
                                    sx={{
                                      cursor: 'pointer',
                                      fontWeight: 700,
                                      borderRadius: '8px',
                                      bgcolor: isMainFileActive ? alpha(fileConfig.iconColor, 0.15) : fileConfig.bgColor,
                                      color: fileConfig.textColor,
                                      border: `1px solid ${isMainFileActive ? fileConfig.iconColor : fileConfig.borderColor}`,
                                      transition: 'all 0.2s',
                                      fontSize: '0.75rem',
                                      height: 24,
                                      '&:hover': {
                                        bgcolor: alpha(fileConfig.iconColor, 0.1),
                                        borderColor: fileConfig.iconColor
                                      }
                                    }}
                                  />
                                  <Tooltip title="Mở trong tab mới">
                                    <IconButton
                                      size="small"
                                      onClick={() => {
                                        const matFolder = cm.Material.FolderName || `M${cm.Material.Id}`
                                        const themeFolder = lesson.MaterialTheme?.FolderName || `T${lesson.IdTheme}`
                                        const lessonFolder = lesson.FolderName || `L${lesson.Id}`
                                        const fullUrl = resolveFileUrl(`/uploads/materials/${matFolder}/${themeFolder}/${lessonFolder}/${lesson.FileName}`)
                                        window.open(fullUrl, '_blank')
                                      }}
                                      sx={{
                                        color: fileConfig.iconColor,
                                        width: 24,
                                        height: 24,
                                        bgcolor: alpha(fileConfig.iconColor, 0.05),
                                        '&:hover': { bgcolor: alpha(fileConfig.iconColor, 0.1) }
                                      }}
                                    >
                                      <OpenInNewIcon sx={{ fontSize: 12 }} />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              )
                            })()}

                            {/* Lesson Resources List */}
                            {lessonResources[lesson.Id] && lessonResources[lesson.Id].length > 0 && (
                              <Box sx={{ width: '100%', pl: 3.5, pr: 0.5 }}>
                                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5, mb: 1, textTransform: 'uppercase', fontSize: '0.625rem', letterSpacing: '0.03em' }}>
                                  <AttachmentIcon sx={{ fontSize: 12, color: '#6366f1' }} /> Tài liệu bổ sung
                                </Typography>

                                <Stack spacing={0.75} sx={{ width: '100%' }}>
                                  {lessonResources[lesson.Id].map((res) => {
                                    const fileConfig = getFileConfig(res.resourceName)
                                    const isSubActive = selectedResource && (selectedResource.id === res.id || selectedResource.resourceName === res.resourceName)
                                    return (
                                      <Paper
                                        key={res.id}
                                        onClick={() => setSelectedResource(res)}
                                        sx={{
                                          p: 0.8,
                                          py: 0.6,
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: 1,
                                          borderRadius: '8px',
                                          border: `1px solid ${isSubActive ? fileConfig.iconColor : fileConfig.borderColor}`,
                                          background: isSubActive ? alpha(fileConfig.iconColor, 0.06) : 'white',
                                          boxShadow: isSubActive ? `0 2px 6px ${alpha(fileConfig.iconColor, 0.08)}` : 'none',
                                          cursor: 'pointer',
                                          transition: 'all 0.15s ease-in-out',
                                          '&:hover': {
                                            borderColor: fileConfig.iconColor,
                                            background: alpha(fileConfig.iconColor, 0.02)
                                          }
                                        }}
                                        elevation={0}
                                      >
                                        <Avatar
                                          sx={{
                                            bgcolor: alpha(fileConfig.iconColor, 0.08),
                                            color: fileConfig.iconColor,
                                            width: 24,
                                            height: 24
                                          }}
                                        >
                                          {fileConfig.icon}
                                        </Avatar>
                                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                          <Typography
                                            variant="caption"
                                            sx={{
                                              fontWeight: 700,
                                              color: fileConfig.textColor,
                                              display: 'block',
                                              overflow: 'hidden',
                                              textOverflow: 'ellipsis',
                                              whiteSpace: 'nowrap',
                                              fontSize: '0.725rem'
                                            }}
                                          >
                                            {res.resourceName}
                                          </Typography>
                                          {res.fileSize && (
                                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.05, fontSize: '0.575rem', fontWeight: 500 }}>
                                              {formatBytes(res.fileSize)}
                                            </Typography>
                                          )}
                                        </Box>
                                        <Tooltip title="Mở tab mới">
                                          <IconButton
                                            size="small"
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              window.open(resolveFileUrl(res.filePath || res.ResourceUrl), '_blank')
                                            }}
                                            sx={{
                                              color: fileConfig.textColor,
                                              opacity: 0.5,
                                              width: 20,
                                              height: 20,
                                              '&:hover': { opacity: 1, bgcolor: alpha(fileConfig.iconColor, 0.08) }
                                            }}
                                          >
                                            <OpenInNewIcon sx={{ fontSize: 11 }} />
                                          </IconButton>
                                        </Tooltip>
                                      </Paper>
                                    )
                                  })}
                                </Stack>
                              </Box>
                            )}
                          </ListItem>
                        ))}
                      </List>
                    </AccordionDetails>
                  </Accordion>
                )
              })}
            </Box>
          ))}
        </Grid>

        {/* RIGHT COLUMN: Sticky File Preview Panel (9/12 grid - 75% width) */}
        <Grid
          item
          xs={12}
          lg={9}
          sx={{
            position: { lg: 'sticky' },
            top: { lg: '24px' },
            height: { lg: 'calc(100vh - 120px)' },
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Paper
            elevation={0}
            sx={{
              flexGrow: 1,
              border: '1px solid #e2e8f0',
              borderRadius: '24px',
              p: 2.5,
              bgcolor: 'white',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.02)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            {selectedResource ? (
              <>
                <Box sx={{ pb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '75%', color: '#1e293b', fontSize: '0.875rem' }}>
                    {selectedResource.resourceName}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<OpenInNewIcon />}
                      onClick={() => window.open(resolveFileUrl(selectedResource.filePath || selectedResource.ResourceUrl), '_blank')}
                      sx={{ textTransform: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.75rem', py: 0.5 }}
                    >
                      Mở tab mới
                    </Button>
                    <IconButton
                      size="small"
                      onClick={() => setSelectedResource(null)}
                      sx={{ bgcolor: '#f8fafc', border: '1px solid #e2e8f0', '&:hover': { bgcolor: '#f1f5f9' } }}
                    >
                      <CloseIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Stack>
                </Box>
                <Box sx={{ flexGrow: 1, pt: 2, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  {renderPreviewContent(selectedResource)}
                </Box>
              </>
            ) : (
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 4, bgcolor: '#f8fafc', borderRadius: '18px', border: '1px dashed #cbd5e1' }}>
                <Avatar sx={{ bgcolor: alpha('#6366f1', 0.08), color: '#6366f1', width: 56, height: 56, mb: 2 }}>
                  <AttachmentIcon sx={{ fontSize: 26 }} />
                </Avatar>
                <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#1e293b', mb: 1, fontSize: '0.9rem' }}>
                  Trình xem tài liệu trực quan
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ maxWidth: 280, fontSize: '0.8rem' }}>
                  Vui lòng chọn một tài liệu ở danh mục bên trái để bắt đầu xem trực tiếp nội dung giảng dạy.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* EDIT LESSON FILE MODAL */}
      <Dialog
        open={openLessonModal}
        onClose={() => setOpenLessonModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '24px' } }}
      >
        <DialogTitle sx={{ fontWeight: 900 }}>Cập nhật tài liệu đính kèm bài học</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              Bài học: {selectedLessonForEdit?.Name} - {selectedLessonForEdit?.Title}
            </Typography>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>Tài liệu đính kèm (PDF / Audio)</Typography>
              <Box sx={{ p: 3, border: '2px dashed #e2e8f0', borderRadius: '16px', textAlign: 'center', bgcolor: '#f8fafc' }}>
                {lessonForm.FileName ? (
                  <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
                    {(() => {
                      const ext = lessonForm.FileName.split('.').pop().toLowerCase()
                      if (['png', 'jpg', 'jpeg', 'gif'].includes(ext)) {
                        return <ImageIcon color="success" sx={{ fontSize: 32 }} />
                      }
                      return <FilePresentIcon color="primary" sx={{ fontSize: 32 }} />
                    })()}
                    <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>{lessonForm.FileName}</Typography>
                    <Button
                      size="small" color="error"
                      onClick={() => {
                        setLessonForm({ FileName: '' })
                        setPendingLessonFile(null)
                      }}
                    >Xóa</Button>
                  </Stack>
                ) : (
                  <>
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.gif"
                      style={{ display: 'none' }}
                      id="up-pdf-overview"
                      onChange={handleLessonFileChange}
                    />
                    <label htmlFor="up-pdf-overview">
                      <Button component="span" startIcon={uploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}>Tải tệp tin bài học</Button>
                    </label>
                  </>
                )}
              </Box>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenLessonModal(false)} sx={{ textTransform: 'none', fontWeight: 700 }}>Hủy</Button>
          <Button
            variant="contained"
            onClick={handleSaveLesson}
            disabled={uploading}
            sx={{ borderRadius: '12px', px: 4, textTransform: 'none', fontWeight: 800, background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}
          >
            Lưu tài liệu
          </Button>
        </DialogActions>
      </Dialog>

      {/* MANAGE LESSON RESOURCES MODAL */}
      <Dialog
        open={openResourceModal}
        onClose={() => setOpenResourceModal(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <AttachmentIcon color="primary" />
            <Typography variant="h6" component="div" sx={{ fontWeight: 900 }}>
              Quản lý tài nguyên: {selectedLessonForResources?.Name} - {selectedLessonForResources?.Title}
            </Typography>
          </Stack>
          <IconButton onClick={() => setOpenResourceModal(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
          <Grid container spacing={3}>
            {/* Upload Section */}
            <Grid item xs={12} md={5}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, color: 'text.secondary' }}>
                Tải lên tài nguyên mới
              </Typography>

              <Box
                sx={{
                  border: '2px dashed #6366f1',
                  borderRadius: '16px',
                  bgcolor: alpha('#6366f1', 0.02),
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: alpha('#6366f1', 0.05),
                    borderColor: '#4f46e5'
                  }
                }}
                onClick={() => document.getElementById('dialog-resource-files-overview').click()}
              >
                <CloudUploadIcon sx={{ fontSize: 48, color: '#6366f1', mb: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Nhấp để chọn file từ thiết bị
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Hỗ trợ: PDF, Word, Video, Ảnh, Audio
                </Typography>
                <input
                  type="file"
                  id="dialog-resource-files-overview"
                  multiple
                  style={{ display: 'none' }}
                  onChange={handleChooseResourceFiles}
                  accept=".pdf,.doc,.docx,.mp4,.mov,.mp3,.wav,.ogg,.png,.jpg,.jpeg,.gif"
                />
              </Box>

              {/* Selected Files List */}
              {filesToUpload.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Tệp đã chọn ({filesToUpload.length})</span>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={handleBatchUploadResources}
                      disabled={resourceUploading}
                      sx={{ textTransform: 'none', borderRadius: '8px', px: 2, background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}
                    >
                      {resourceUploading ? <CircularProgress size={16} color="inherit" /> : 'Tải lên tất cả'}
                    </Button>
                  </Typography>
                  <List sx={{ maxHeight: 200, overflow: 'auto', bgcolor: '#f8fafc', borderRadius: 2, p: 1 }}>
                    {filesToUpload.map((file, idx) => (
                      <ListItem
                        key={idx}
                        secondaryAction={
                          <IconButton edge="end" size="small" onClick={() => handleRemoveFileFromUploadList(idx)}>
                            <CloseIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        }
                        sx={{ p: 1, py: 0.5 }}
                      >
                        <Avatar sx={{ width: 24, height: 24, mr: 1.5, bgcolor: '#e0e7ff', color: '#6366f1' }}>
                          {getFileConfig(file.name).icon}
                        </Avatar>
                        <ListItemText
                          primary={file.name}
                          primaryTypographyProps={{ variant: 'caption', fontWeight: 700, sx: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 } }}
                          secondary={formatBytes(file.size)}
                          secondaryTypographyProps={{ variant: 'caption' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Grid>

            {/* Existing Resources List */}
            <Grid item xs={12} md={7}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, color: 'text.secondary' }}>
                Danh sách tài liệu đã tải lên
              </Typography>

              <Box sx={{ maxHeight: 380, overflow: 'auto', pr: 1 }}>
                {!lessonResources[selectedLessonForResources?.Id] || lessonResources[selectedLessonForResources?.Id].length === 0 ? (
                  <Box sx={{ py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: '#f8fafc', borderRadius: 4, border: '1px dashed #e2e8f0' }}>
                    <FolderOpenIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 1.5 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Chưa có tài liệu nào
                    </Typography>
                  </Box>
                ) : (
                  <List sx={{ p: 0 }}>
                    {lessonResources[selectedLessonForResources?.Id].map((res) => {
                      const isEditing = editingResourceId === res.id
                      const fileConfig = getFileConfig(res.resourceName)
                      return (
                        <Paper
                          key={res.id}
                          sx={{
                            p: 1.5,
                            mb: 1.5,
                            borderRadius: 3,
                            border: '1px solid #f1f5f9',
                            background: alpha(theme.palette.secondary.main, 0.02),
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            boxShadow: 'none',
                            '&:hover': {
                              background: alpha(theme.palette.secondary.main, 0.04),
                              borderColor: '#e2e8f0'
                            }
                          }}
                        >
                          <Avatar sx={{ bgcolor: alpha(fileConfig.iconColor, 0.1), color: fileConfig.iconColor, width: 36, height: 36 }}>
                            {fileConfig.icon}
                          </Avatar>

                          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                            {isEditing ? (
                              <Stack direction="row" spacing={1} alignItems="center">
                                <TextField
                                  size="small"
                                  value={editingResourceName}
                                  onChange={(e) => setEditingResourceName(e.target.value)}
                                  fullWidth
                                  variant="outlined"
                                  autoFocus
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: 2,
                                      bgcolor: 'white'
                                    }
                                  }}
                                />
                                <IconButton size="small" color="primary" onClick={() => handleSaveRenameResource(res)}>
                                  <CheckIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                                <IconButton size="small" onClick={handleCancelRenameResource}>
                                  <CloseIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                              </Stack>
                            ) : (
                              <>
                                <Typography variant="body2" sx={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {res.resourceName}
                                </Typography>
                                <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                                  <Typography variant="caption" color="text.secondary">
                                    {formatBytes(res.fileSize)}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    • {formatDate(res.uploadedAt)}
                                  </Typography>
                                </Stack>
                              </>
                            )}
                          </Box>

                          {!isEditing && (
                            <Stack direction="row" spacing={0.5}>
                              <Tooltip title="Đổi tên">
                                <IconButton size="small" onClick={() => handleStartRenameResource(res)}>
                                  <EditIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Xem trước tài liệu">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => setSelectedResource(res)}
                                >
                                  <OpenInNewIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Xóa">
                                <IconButton size="small" color="error" onClick={() => handleDeleteResource(res)}>
                                  <DeleteIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          )}
                        </Paper>
                      )
                    })}
                  </List>
                )}
              </Box>
            </Grid>

          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button
            onClick={() => setOpenResourceModal(false)}
            sx={{ textTransform: 'none', borderRadius: '12px', px: 3, fontWeight: 700 }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default CourseOverview
