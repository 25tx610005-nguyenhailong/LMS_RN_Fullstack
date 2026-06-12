import { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import {
  Box, Typography, Grid, Paper, Button, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, List, ListItem, ListItemText,
  Accordion, AccordionSummary, AccordionDetails,
  Stack, Avatar, Chip, CircularProgress, alpha, useTheme, Divider,
  Tooltip, MenuItem, Select, FormControl, InputLabel
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import TopicIcon from '@mui/icons-material/Topic'
import AssignmentIcon from '@mui/icons-material/Assignment'
import SaveIcon from '@mui/icons-material/Save'
import LayersIcon from '@mui/icons-material/Layers'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import FilePresentIcon from '@mui/icons-material/FilePresent'
import ImageIcon from '@mui/icons-material/Image'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import MovieIcon from '@mui/icons-material/Movie'
import AttachmentIcon from '@mui/icons-material/Attachment'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import AudiotrackIcon from '@mui/icons-material/Audiotrack'

// Helper to get appropriate icon based on file extension
const getFileIcon = (fileName) => {
  const ext = fileName.split('.').pop().toLowerCase()
  switch (ext) {
  case 'pdf':
    return <FilePresentIcon sx={{ fontSize: 16 }} />
  case 'doc':
  case 'docx':
    return <FilePresentIcon sx={{ fontSize: 16 }} />
  case 'mp4':
  case 'mov':
    return <MovieIcon sx={{ fontSize: 16 }} />
  case 'mp3':
  case 'wav':
  case 'ogg':
    return <AudiotrackIcon sx={{ fontSize: 16 }} />
  case 'png':
  case 'jpg':
  case 'jpeg':
  case 'gif':
    return <ImageIcon sx={{ fontSize: 16 }} />
  default:
    return <FilePresentIcon sx={{ fontSize: 16 }} />
  }
}
import { fetchMaterialsAPI, createMaterialAPI, updateMaterialAPI, deleteMaterialAPI,
  createThemeAPI, createManyThemesAPI, updateThemeAPI, deleteThemeAPI,
  createLessonAPI, createManyLessonsAPI, updateLessonAPI, deleteLessonAPI,
  deleteFileAPI } from '~/apis/materialApi'
import { uploadFileAPI } from '~/apis/commonApi'
import { fetchLevelsAPI } from '~/apis/courseApi'
import { toast } from 'react-toastify'
import { resolveFileUrl } from '~/utils/formatters'
// Lesson resource APIs
import { uploadLessonResourceAPI, listLessonResourcesAPI, updateLessonResourceAPI, deleteLessonResourceAPI } from '~/apis/materialApi'

import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import ContentPasteIcon from '@mui/icons-material/ContentPaste'

function SchoolMaterials() {
  const theme = useTheme()
  const { currentUser } = useSelector((state) => state.user)
  const role = currentUser?.role?.toUpperCase()
  const isTeacher = role === 'TEACHER'

  const [materials, setMaterials] = useState([])
  const [levels, setLevels] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMaterial, setSelectedMaterial] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [pendingMaterialFile, setPendingMaterialFile] = useState(null)
  const [pendingLessonFile, setPendingLessonFile] = useState(null)
  const fileInputRef = useRef(null)

  // Modals
  const [openMaterialModal, setOpenMaterialModal] = useState(false)
  const [openThemeModal, setOpenThemeModal] = useState(false)
  const [openLessonModal, setOpenLessonModal] = useState(false)

  // Edit states
  const [editingMaterial, setEditingMaterial] = useState(null)
  const [editingTheme, setEditingTheme] = useState(null)
  const [editingLesson, setEditingLesson] = useState(null)

  // Form States
  const [materialForm, setMaterialForm] = useState({ Name: '', ImageUrl: '', IdLevel: '' })
  const [themeForm, setThemeForm] = useState({ Name: '', Title: '', Priority: 0, FolderName: '' })
  const [lessonForm, setLessonForm] = useState({ Name: '', Title: '', Priority: 0, FolderName: '', FileName: '' })
  const [activeThemeId, setActiveThemeId] = useState(null)
  // Resources for selected lesson
  const [lessonResources, setLessonResources] = useState([])

  // Resource dialog states
  const [openResourceModal, setOpenResourceModal] = useState(false)
  const [selectedLessonForResources, setSelectedLessonForResources] = useState(null)
  const [filesToUpload, setFilesToUpload] = useState([])
  const [editingResourceId, setEditingResourceId] = useState(null)
  const [editingResourceName, setEditingResourceName] = useState('')
  const [resourceUploading, setResourceUploading] = useState(false)
  const [openPreviewModal, setOpenPreviewModal] = useState(false)
  const [previewResource, setPreviewResource] = useState(null)

  // Bulk states
  const [bulkMode, setBulkMode] = useState(false)
  const [bulkThemeList, setBulkThemeList] = useState([{ Name: '', Title: '', Priority: 1 }])

  // Bulk states for Lessons
  const [bulkLessonMode, setBulkLessonMode] = useState(false)
  const [bulkLessonList, setBulkLessonList] = useState([{ Name: '', Title: '', Priority: 1, File: null, FileName: '' }])

  // Theme text parsing states
  const [parseThemeText, setParseThemeText] = useState('')
  const [showParseThemeArea, setShowParseThemeArea] = useState(false)

  // Lesson text parsing states
  const [parseLessonText, setParseLessonText] = useState('')
  const [showParseLessonArea, setShowParseLessonArea] = useState(false)


  const loadInitialData = async () => {
    setLoading(true)
    try {
      const [matData, levelData] = await Promise.all([
        fetchMaterialsAPI(),
        fetchLevelsAPI()
      ])
      setMaterials(matData)
      setLevels(levelData)
      if (matData.length > 0) {
        if (!selectedMaterial) setSelectedMaterial(matData[0])
        else {
          const updated = matData.find(m => m.Id === selectedMaterial.Id)
          if (updated) setSelectedMaterial(updated)
        }
      }
    } catch (error) {
      toast.error('Không thể tải danh sách dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadInitialData() }, [])

  // Automatically fetch resources for all lessons of the selected material
  useEffect(() => {
    if (selectedMaterial) {
      selectedMaterial.MaterialTheme?.forEach(themeItem => {
        themeItem.MaterialLesson?.forEach(lesson => {
          fetchLessonResources(lesson.Id)
        })
      })
    }
  }, [selectedMaterial])

  // MATERIAL CRUD
  const handleOpenMaterial = (m = null) => {
    if (m) {
      setEditingMaterial(m)
      setMaterialForm({ Name: m.Name, ImageUrl: m.ImageUrl || '', IdLevel: m.IdLevel || '' })
    } else {
      setEditingMaterial(null)
      setMaterialForm({ Name: '', ImageUrl: '', IdLevel: '' })
    }
    setOpenMaterialModal(true)
    setPendingMaterialFile(null)
  }

  const handleSaveMaterial = async () => {
    try {
      setUploading(true)
      let finalForm = { ...materialForm }

      // Upload if there's a pending file
      if (pendingMaterialFile) {
        const matFolder = editingMaterial?.FolderName || 'new_material'
        const folder = `materials/${matFolder}`
        const oldPath = editingMaterial?.ImageUrl || null

        const res = await uploadFileAPI(pendingMaterialFile, folder, oldPath)
        finalForm.ImageUrl = res.url
      }
      // Case 2: Image was cleared but no new file uploaded
      else if (editingMaterial?.ImageUrl && !materialForm.ImageUrl) {
        await deleteFileAPI(editingMaterial.ImageUrl)
      }

      if (editingMaterial) {
        await updateMaterialAPI(editingMaterial.Id, finalForm)
        toast.success('Đã cập nhật giáo trình')
      } else {
        await createMaterialAPI(finalForm)
        toast.success('Đã tạo giáo trình mới')
      }
      setOpenMaterialModal(false)
      setPendingMaterialFile(null)
      loadInitialData()
    } catch (error) {
      toast.error('Lỗi thao tác giáo trình')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteMaterial = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa giáo trình này?')) return
    try {
      await deleteMaterialAPI(id)
      toast.success('Đã xóa giáo trình')
      if (selectedMaterial?.Id === id) setSelectedMaterial(null)
      loadInitialData()
    } catch (error) {
      toast.error('Lỗi khi xóa giáo trình')
    }
  }

  // THEME CRUD
  const handleOpenTheme = (t = null) => {
    setBulkMode(false)
    const existingCount = selectedMaterial?.MaterialTheme?.length || 0
    setBulkThemeList([{ Name: `Chương ${existingCount + 1}`, Title: '', Priority: existingCount + 1 }])
    setParseThemeText('')
    setShowParseThemeArea(false)
    if (t) {
      setEditingTheme(t)
      setThemeForm({ Name: t.Name, Title: t.Title || '', Priority: t.Priority || 0, FolderName: t.FolderName || '' })
    } else {
      setEditingTheme(null)
      setThemeForm({ Name: `Chương ${existingCount + 1}`, Title: '', Priority: existingCount + 1, FolderName: '' })
    }
    setOpenThemeModal(true)
  }

  const handleAddBulkRow = () => {
    const existingCount = selectedMaterial?.MaterialTheme?.length || 0
    const nextIndex = existingCount + bulkThemeList.length + 1
    setBulkThemeList([...bulkThemeList, { Name: `Chương ${nextIndex}`, Title: '', Priority: nextIndex }])
  }

  const handleRemoveBulkRow = (index) => {
    if (bulkThemeList.length === 1) return
    const newList = [...bulkThemeList]
    newList.splice(index, 1)
    setBulkThemeList(newList)
  }

  const handleBulkChange = (index, field, val) => {
    const newList = [...bulkThemeList]
    newList[index][field] = val
    setBulkThemeList(newList)
  }

  const handleParseThemes = () => {
    if (!parseThemeText.trim()) {
      toast.warning('Vui lòng nhập văn bản cần trích xuất!')
      return
    }
    const lines = parseThemeText.split('\n').map(l => l.trim()).filter(l => l.length > 0)
    const existingCount = selectedMaterial?.MaterialTheme?.length || 0

    const parsed = lines.map((line, idx) => {
      const parts = line.split(/[:\-–]/)
      let name = ''
      let title = ''
      const priority = existingCount + bulkThemeList.filter(t => t.Name).length + idx + 1
      if (parts.length >= 2) {
        name = parts[0].trim()
        title = parts.slice(1).join(':').trim()
      } else {
        name = `Chương ${priority}`
        title = line.trim()
      }
      return { Name: name, Title: title, Priority: priority }
    })

    const isFirstRowEmpty = bulkThemeList.length === 1 && !bulkThemeList[0].Name && !bulkThemeList[0].Title
    if (isFirstRowEmpty) {
      setBulkThemeList(parsed)
    } else {
      setBulkThemeList([...bulkThemeList, ...parsed])
    }
    setParseThemeText('')
    setShowParseThemeArea(false)
    toast.success(`Đã trích xuất ${parsed.length} chương thành công!`)
  }

  const handleSaveTheme = async () => {
    try {
      if (bulkMode && !editingTheme) {
        const hasInvalidRow = bulkThemeList.some(
          t => (t.Name.trim() !== '' && t.Title.trim() === '') || (t.Name.trim() === '' && t.Title.trim() !== '')
        )
        if (hasInvalidRow) {
          toast.error('Vui lòng nhập đầy đủ cả Tên chương và Tiêu đề cho các dòng đã điền!')
          return
        }

        const themesToSend = bulkThemeList
          .filter(t => t.Name.trim() !== '')
          .map(t => ({
            Name: t.Name.trim(),
            Title: t.Title.trim(),
            Priority: parseInt(t.Priority) || 0
          }))

        if (themesToSend.length === 0) {
          toast.warning('Vui lòng nhập ít nhất một chương học!')
          return
        }
        await createManyThemesAPI({ materialId: selectedMaterial.Id, themeNames: themesToSend })
        toast.success(`Đã thêm nhanh ${themesToSend.length} chương`)
      } else if (editingTheme) {
        if (!themeForm.Name.trim()) {
          toast.error('Vui lòng nhập tên chương!')
          return
        }
        if (!themeForm.Title.trim()) {
          toast.error('Vui lòng nhập tiêu đề chương (Title)!')
          return
        }
        await updateThemeAPI(editingTheme.Id, themeForm)
        toast.success('Đã cập nhật chương')
      } else {
        if (!themeForm.Name.trim()) {
          toast.error('Vui lòng nhập tên chương!')
          return
        }
        if (!themeForm.Title.trim()) {
          toast.error('Vui lòng nhập tiêu đề chương (Title)!')
          return
        }
        await createThemeAPI({ ...themeForm, IdMaterial: selectedMaterial.Id })
        toast.success('Đã thêm chương mới')
      }
      setOpenThemeModal(false)
      loadInitialData()
    } catch (error) {
      toast.error('Lỗi thao tác chương học')
    }
  }

  const handleDeleteTheme = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa chương này?')) return
    try {
      await deleteThemeAPI(id)
      toast.success('Đã xóa chương')
      loadInitialData()
    } catch (error) {
      toast.error('Lỗi khi xóa chương')
    }
  }

  // LESSON CRUD
  const handleOpenLesson = (l = null, themeId = null) => {
    setBulkLessonMode(false)
    setParseLessonText('')
    setShowParseLessonArea(false)

    const parentTheme = selectedMaterial?.MaterialTheme?.find(t => t.Id === (l ? l.IdTheme : themeId))
    const existingCount = parentTheme?.MaterialLesson?.length || 0

    if (l) {
      setEditingLesson(l)
      setLessonForm({
        Name: l.Name,
        Title: l.Title || '',
        Priority: l.Priority || 0,
        FolderName: l.FolderName || '',
        FileName: l.FileName || ''
      })
      setActiveThemeId(l.IdTheme)
      fetchLessonResources(l.Id)
    } else {
      setEditingLesson(null)
      setLessonForm({ Name: `Lesson ${existingCount + 1}`, Title: '', Priority: existingCount + 1, FolderName: '', FileName: '' })
      setBulkLessonList([{ Name: `Lesson ${existingCount + 1}`, Title: '', Priority: existingCount + 1, File: null, FileName: '' }])
      setActiveThemeId(themeId)
      setLessonResources([])
    }
    setOpenLessonModal(true)
    setPendingLessonFile(null)
  }

  const handleAddBulkLessonRow = () => {
    const parentTheme = selectedMaterial?.MaterialTheme?.find(t => t.Id === activeThemeId)
    const existingCount = parentTheme?.MaterialLesson?.length || 0
    const nextIndex = existingCount + bulkLessonList.length + 1
    setBulkLessonList([...bulkLessonList, { Name: `Lesson ${nextIndex}`, Title: '', Priority: nextIndex, File: null, FileName: '' }])
  }

  const handleRemoveBulkLessonRow = (index) => {
    if (bulkLessonList.length === 1) return
    const newList = [...bulkLessonList]
    newList.splice(index, 1)
    setBulkLessonList(newList)
  }

  const handleBulkLessonChange = (index, field, val) => {
    const newList = [...bulkLessonList]
    newList[index][field] = val
    setBulkLessonList(newList)
  }

  const handleBulkLessonFileChange = (index, file) => {
    const newList = [...bulkLessonList]
    if (file) {
      newList[index].File = file
      newList[index].FileName = file.name
      if (!newList[index].Title) {
        const cleanName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name
        newList[index].Title = cleanName
      }
    } else {
      newList[index].File = null
      newList[index].FileName = ''
    }
    setBulkLessonList(newList)
  }

  const handleBulkLessonMultipleFiles = (files) => {
    const parentTheme = selectedMaterial?.MaterialTheme?.find(t => t.Id === activeThemeId)
    const existingCount = parentTheme?.MaterialLesson?.length || 0

    const newRows = Array.from(files).map((file, idx) => {
      const cleanName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name
      const nextIndex = existingCount + bulkLessonList.filter(l => l.Name).length + idx + 1
      return {
        Name: `Lesson ${nextIndex}`,
        Title: cleanName,
        Priority: nextIndex,
        File: file,
        FileName: file.name
      }
    })

    const isFirstRowEmpty = bulkLessonList.length === 1 && !bulkLessonList[0].Name && !bulkLessonList[0].Title && !bulkLessonList[0].File
    if (isFirstRowEmpty) {
      setBulkLessonList(newRows)
    } else {
      setBulkLessonList([...bulkLessonList, ...newRows])
    }
  }

  const handleParseLessons = () => {
    if (!parseLessonText.trim()) {
      toast.warning('Vui lòng nhập văn bản cần trích xuất!')
      return
    }
    const lines = parseLessonText.split('\n').map(l => l.trim()).filter(l => l.length > 0)
    const parentTheme = selectedMaterial?.MaterialTheme?.find(t => t.Id === activeThemeId)
    const existingCount = parentTheme?.MaterialLesson?.length || 0

    const parsed = lines.map((line, idx) => {
      const parts = line.split(/[:\-–]/)
      let name = ''
      let title = ''
      const priority = existingCount + bulkLessonList.filter(l => l.Name).length + idx + 1
      if (parts.length >= 2) {
        name = parts[0].trim()
        title = parts.slice(1).join(':').trim()
      } else {
        name = `Lesson ${priority}`
        title = line.trim()
      }
      return { Name: name, Title: title, Priority: priority, File: null, FileName: '' }
    })

    const isFirstRowEmpty = bulkLessonList.length === 1 && !bulkLessonList[0].Name && !bulkLessonList[0].Title && !bulkLessonList[0].File
    if (isFirstRowEmpty) {
      setBulkLessonList(parsed)
    } else {
      setBulkLessonList([...bulkLessonList, ...parsed])
    }
    setParseLessonText('')
    setShowParseLessonArea(false)
    toast.success(`Đã trích xuất ${parsed.length} bài học thành công!`)
  }


  const handleViewPdf = (lesson) => {
    if (!lesson.FileName) return
    const matFolder = selectedMaterial.FolderName || `M${selectedMaterial.Id}`
    const themeFolder = lesson.MaterialTheme?.FolderName || `T${lesson.IdTheme}`
    const lessonFolder = lesson.FolderName || `L${lesson.Id}`
    const fullUrl = resolveFileUrl(`/uploads/materials/${matFolder}/${themeFolder}/${lessonFolder}/${lesson.FileName}`)
    window.open(fullUrl, '_blank')
  }

  const handleSaveLesson = async () => {
    if (bulkLessonMode && !editingLesson) {
      const hasInvalidRow = bulkLessonList.some(
        l => (l.Name.trim() !== '' && l.Title.trim() === '') || (l.Name.trim() === '' && l.Title.trim() !== '')
      )
      if (hasInvalidRow) {
        toast.error('Vui lòng nhập đầy đủ cả Tên bài và Tiêu đề cho các dòng đã điền!')
        return
      }

      const lessonsToCreate = bulkLessonList
        .filter(l => l.Name.trim() !== '')
        .map(l => ({
          Name: l.Name.trim(),
          Title: l.Title.trim(),
          Priority: parseInt(l.Priority) || 0,
          FileName: l.FileName || '',
          File: l.File
        }))

      if (lessonsToCreate.length === 0) {
        toast.warning('Vui lòng nhập ít nhất một bài học!')
        return
      }

      try {
        setUploading(true)
        const lessonsData = lessonsToCreate.map(l => ({
          Name: l.Name,
          Title: l.Title,
          Priority: l.Priority,
          FileName: l.FileName
        }))
        const createdLessons = await createManyLessonsAPI({ themeId: activeThemeId, lessons: lessonsData })

        const parentTheme = selectedMaterial.MaterialTheme.find(t => t.Id === activeThemeId)
        if (parentTheme) {
          const matFolder = selectedMaterial.FolderName || `M${selectedMaterial.Id}`
          const themeFolder = parentTheme.FolderName || `T${parentTheme.Id}`

          for (let i = 0; i < createdLessons.length; i++) {
            const created = createdLessons[i]
            const originalItem = lessonsToCreate[i]

            if (originalItem.File) {
              const lessonFolder = created.FolderName || `L${created.Id}`
              const folder = `materials/${matFolder}/${themeFolder}/${lessonFolder}`
              await uploadFileAPI(originalItem.File, folder)
            }
          }
        }

        toast.success(`Đã thêm nhanh ${createdLessons.length} bài học`)
        setOpenLessonModal(false)
        loadInitialData()
      } catch (error) {
        toast.error('Lỗi thao tác thêm hàng loạt bài học')
      } finally {
        setUploading(false)
      }
    } else {
      if (!lessonForm.Name.trim()) {
        toast.error('Vui lòng nhập tên bài học!')
        return
      }
      if (!lessonForm.Title.trim()) {
        toast.error('Vui lòng nhập tiêu đề bài học!')
        return
      }
      try {
        setUploading(true)
        let finalForm = { ...lessonForm }
        let createdLesson = null

        if (!editingLesson) {
          const lessonToCreate = { ...finalForm, FileName: '', IdMaterialTheme: activeThemeId }
          createdLesson = await createLessonAPI(lessonToCreate)
        }

        if (pendingLessonFile && activeThemeId) {
          const parentTheme = selectedMaterial.MaterialTheme.find(t => t.Id === activeThemeId)
          if (parentTheme) {
            const matFolder = selectedMaterial.FolderName || `M${selectedMaterial.Id}`
            const themeFolder = parentTheme.FolderName || `T${parentTheme.Id}`
            const lessonFolder = editingLesson
              ? (editingLesson.FolderName || `L${editingLesson.Id}`)
              : (createdLesson.FolderName || `L${createdLesson.Id}`)

            const folder = `materials/${matFolder}/${themeFolder}/${lessonFolder}`
            const oldPath = editingLesson?.FileName
              ? `uploads/materials/${matFolder}/${themeFolder}/${lessonFolder}/${editingLesson.FileName}`
              : null

            await uploadFileAPI(pendingLessonFile, folder, oldPath)

            if (editingLesson) {
              finalForm.FileName = pendingLessonFile.name
            } else {
              await updateLessonAPI(createdLesson.Id, { FileName: pendingLessonFile.name })
            }
          }
        }
        else if (editingLesson?.FileName && !lessonForm.FileName) {
          const matFolder = selectedMaterial.FolderName || `M${selectedMaterial.Id}`
          const parentTheme = selectedMaterial.MaterialTheme?.find(t => t.Id === editingLesson.IdTheme)
          const themeFolder = parentTheme?.FolderName || `T${editingLesson.IdTheme}`
          const lessonFolder = editingLesson.FolderName || `L${editingLesson.Id}`
          const oldPath = `uploads/materials/${matFolder}/${themeFolder}/${lessonFolder}/${editingLesson.FileName}`
          await deleteFileAPI(oldPath)
        }

        if (editingLesson) {
          await updateLessonAPI(editingLesson.Id, { ...finalForm, IdMaterialTheme: activeThemeId })
          toast.success('Đã cập nhật bài học')
        } else {
          toast.success('Đã thêm bài học mới')
        }
        setOpenLessonModal(false)
        setPendingLessonFile(null)
        loadInitialData()
      } catch (error) {
        toast.error('Lỗi thao tác bài học')
      } finally {
        setUploading(false)
      }
    }
  }


  const handleDeleteLesson = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài học này?')) return
    try {
      await deleteLessonAPI(id)
      toast.success('Đã xóa bài học')
      loadInitialData()
    } catch (error) {
      toast.error('Lỗi khi xóa bài học')
    }
  }

  const handleFileChange = (e, formType) => {
    const file = e.target.files[0]
    if (!file) return

    if (formType === 'material') {
      setPendingMaterialFile(file)
      setMaterialForm(prev => ({ ...prev, ImageUrl: URL.createObjectURL(file) }))
    } else if (formType === 'lesson') {
      setPendingLessonFile(file)
      setLessonForm(prev => ({ ...prev, FileName: file.name }))
    }
  }

  // Fetch lesson resources for a lesson
  const fetchLessonResources = async (lessonId) => {
    try {
      const res = await listLessonResourcesAPI(lessonId)
      // Ensure we replace resources for this lesson only
      setLessonResources(prev => {
        const filtered = prev.filter(r => r.lessonId !== lessonId)
        return [...filtered, ...res]
      })
    } catch (e) {
      toast.error('Không thể tải tài nguyên bài học')
    }
  }

  // Helper for formatting file sizes
  const formatBytes = (bytes, decimals = 2) => {
    if (!bytes) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
  }

  // Helper for formatting uploadedAt timestamp
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

  // Open the resource management modal for a lesson
  const handleOpenResourceManage = (lesson) => {
    setSelectedLessonForResources(lesson)
    setFilesToUpload([])
    setEditingResourceId(null)
    setEditingResourceName('')
    setOpenResourceModal(true)
    fetchLessonResources(lesson.Id)
  }

  // File change handler for dropzone / file input
  const handleChooseResourceFiles = (e) => {
    const selectedFiles = Array.from(e.target.files)
    setFilesToUpload(prev => [...prev, ...selectedFiles])
    e.target.value = ''
  }

  // Remove a file from pending upload list
  const handleRemoveFileFromUploadList = (index) => {
    setFilesToUpload(prev => prev.filter((_, i) => i !== index))
  }

  // Batch upload pending files
  const handleBatchUploadResources = async () => {
    if (filesToUpload.length === 0 || !selectedLessonForResources) return
    setResourceUploading(true)
    try {
      const formData = new FormData()
      filesToUpload.forEach(file => {
        formData.append('files', file)
      })
      await uploadLessonResourceAPI(selectedLessonForResources.Id, formData)
      toast.success('Tải tài nguyên lên thành công')
      setFilesToUpload([])
      fetchLessonResources(selectedLessonForResources.Id)
    } catch (err) {
      toast.error('Lỗi tải tài nguyên lên')
    } finally {
      setResourceUploading(false)
    }
  }

  // Start renaming resource
  const handleStartRenameResource = (res) => {
    setEditingResourceId(res.id)
    setEditingResourceName(res.resourceName)
  }

  // Save renamed resource
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
    } catch (err) {
      toast.error('Lỗi đổi tên tài nguyên')
    }
  }

  const handleCancelRenameResource = () => {
    setEditingResourceId(null)
  }

  // Delete a resource from Dialog
  const handleDeleteResource = async (res) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài nguyên này?')) return
    try {
      await deleteLessonResourceAPI(selectedLessonForResources.Id, res.id)
      toast.success('Đã xóa tài nguyên')
      fetchLessonResources(selectedLessonForResources.Id)
    } catch (err) {
      toast.error('Lỗi khi xóa tài nguyên')
    }
  }

  // Handler for deleting a lesson resource from inline grid
  const handleDeleteLessonResource = async (resourceId, lessonId) => {
    if (!window.confirm('Bạn có chắc muốn xóa tài nguyên này?')) return
    try {
      await deleteLessonResourceAPI(lessonId, resourceId)
      toast.success('Đã xóa tài nguyên')
      fetchLessonResources(lessonId)
    } catch (err) {
      toast.error('Lỗi xóa tài nguyên')
    }
  }
  const handleOpenPreview = (item, isLesson = false) => {
    if (isLesson) {
      const matFolder = selectedMaterial.FolderName || `M${selectedMaterial.Id}`
      const themeFolder = item.MaterialTheme?.FolderName || `T${item.IdTheme}`
      const lessonFolder = item.FolderName || `L${item.Id}`
      const filePath = `/uploads/materials/${matFolder}/${themeFolder}/${lessonFolder}/${item.FileName}`
      setPreviewResource({
        resourceName: item.FileName,
        filePath: filePath
      })
    } else {
      setPreviewResource(item)
    }
    setOpenPreviewModal(true)
  }

  // Preview content renderer based on file extension
  const renderPreviewContent = (res) => {
    if (!res) return null
    const url = resolveFileUrl(res.filePath || res.ResourceUrl)
    const ext = res.resourceName.split('.').pop().toLowerCase()

    switch (ext) {
    case 'pdf':
      return (
        <Box sx={{ width: '100%', height: '70vh', overflow: 'hidden', borderRadius: '12px' }}>
          <iframe
            src={url}
            width="100%"
            height="100%"
            style={{ border: 'none' }}
            title="PDF Preview"
          />
        </Box>
      )
    case 'mp4':
    case 'mov':
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', bgcolor: 'black', borderRadius: '12px', overflow: 'hidden' }}>
          <video
            src={url}
            controls
            style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain' }}
          />
        </Box>
      )
    case 'mp3':
    case 'wav':
    case 'ogg':
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4, bgcolor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
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
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2, bgcolor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <Box
            component="img"
            src={url}
            alt={res.resourceName}
            sx={{ maxHeight: '70vh', maxWidth: '100%', objectFit: 'contain', borderRadius: '8px', boxShadow: 3 }}
          />
        </Box>
      )
    case 'doc':
    case 'docx': {
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      if (!isLocalhost) {
        return (
          <Box sx={{ width: '100%', height: '70vh', overflow: 'hidden', borderRadius: '12px' }}>
            <iframe
              src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`}
              width="100%"
              height="100%"
              style={{ border: 'none' }}
              title="Office Document Preview"
            />
          </Box>
        )
      }
      return (
        <Box sx={{ p: 5, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
          <FilePresentIcon sx={{ fontSize: 80, color: '#3b82f6', mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
              Tài liệu Microsoft Word
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
              Để xem trước tài liệu Word (.doc/.docx) trên localhost, vui lòng tải về máy. Khi hệ thống được deploy lên Internet, tài liệu sẽ hiển thị trực quan thông qua Office Online.
          </Typography>
          <Button
            variant="contained"
            startIcon={<OpenInNewIcon />}
            onClick={() => window.open(url, '_blank')}
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}
          >
              Tải tài liệu xuống
          </Button>
        </Box>
      )
    }
    default:
      return (
        <Box sx={{ p: 5, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
          <FilePresentIcon sx={{ fontSize: 80, color: '#64748b', mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
              Định dạng không hỗ trợ xem trước
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Bạn vẫn có thể tải tệp tin này về máy để xem.
          </Typography>
          <Button
            variant="contained"
            startIcon={<OpenInNewIcon />}
            onClick={() => window.open(url, '_blank')}
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}
          >
              Tải tệp xuống
          </Button>
        </Box>
      )
    }
  }

  if (loading && materials.length === 0) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
  }

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: '24px', border: '1px solid #e2e8f0', height: '100%', bgcolor: 'white' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Bộ giáo trình</Typography>
              {!isTeacher && (
                <Button
                  variant="contained" size="small" startIcon={<AddIcon />}
                  onClick={() => handleOpenMaterial()}
                  sx={{ borderRadius: '10px', textTransform: 'none', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}
                >
                  Tạo mới
                </Button>
              )}
            </Box>

            <List spacing={1}>
              {materials.map((m) => (
                <ListItem
                  key={m.Id}
                  button
                  selected={selectedMaterial?.Id === m.Id}
                  onClick={() => setSelectedMaterial(m)}
                  sx={{
                    borderRadius: '16px', mb: 1, px: 2,
                    '&.Mui-selected': { bgcolor: alpha('#6366f1', 0.1), color: 'primary.main' }
                  }}
                >
                  <Avatar
                    src={resolveFileUrl(m.ImageUrl)}
                    sx={{ mr: 2, width: 40, height: 40, bgcolor: selectedMaterial?.Id === m.Id ? 'primary.main' : '#f1f5f9', color: selectedMaterial?.Id === m.Id ? 'white' : '#64748b' }}
                  >
                    <MenuBookIcon />
                  </Avatar>
                  <ListItemText
                    primary={m.Name}
                    secondary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="caption" color="text.secondary">{m.MaterialTheme?.length || 0} chương</Typography>
                        {m.Level && <Chip label={m.Level.Name} size="small" sx={{ height: 16, fontSize: '0.6rem', bgcolor: alpha('#f59e0b', 0.1) }} />}
                      </Stack>
                    }
                    primaryTypographyProps={{ fontWeight: 700, fontSize: '0.95rem' }}
                    secondaryTypographyProps={{ component: 'div' }}
                  />
                  {!isTeacher && (
                    <Box className="actions" sx={{ display: 'flex' }}>
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleOpenMaterial(m) }}><EditIcon sx={{ fontSize: 18 }} /></IconButton>
                      <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleDeleteMaterial(m.Id) }}><DeleteIcon sx={{ fontSize: 18 }} /></IconButton>
                    </Box>
                  )}
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          {selectedMaterial ? (
            <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', border: '1px solid #e2e8f0', bgcolor: 'white' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
                <Stack direction="row" spacing={3} alignItems="center">
                  {selectedMaterial.ImageUrl && (
                    <Box
                      component="img" src={resolveFileUrl(selectedMaterial.ImageUrl)}
                      sx={{ width: 80, height: 110, borderRadius: '12px', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                    />
                  )}
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="h5" sx={{ fontWeight: 900, color: '#1e293b' }}>{selectedMaterial.Name}</Typography>
                      {selectedMaterial.Level && <Chip label={selectedMaterial.Level.Name} size="small" color="primary" sx={{ fontWeight: 700 }} />}
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Mã tài liệu: MATERIAL-00{selectedMaterial.Id}</Typography>
                  </Box>
                </Stack>
                {!isTeacher && (
                  <Button
                    variant="outlined" startIcon={<AddIcon />}
                    onClick={() => handleOpenTheme()}
                    sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}
                  >
                    Thêm chương học
                  </Button>
                )}
              </Box>

              <Divider sx={{ mb: 4 }} />

              <Stack spacing={2}>
                {selectedMaterial.MaterialTheme?.map((themeItem) => (
                  <Accordion
                    key={themeItem.Id}
                    elevation={0}
                    sx={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '16px !important',
                      overflow: 'hidden',
                      mb: 1,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:before': { display: 'none' },
                      '&:hover': {
                        borderColor: alpha('#6366f1', 0.5),
                        boxShadow: '0 10px 25px rgba(99, 102, 241, 0.08)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: alpha('#6366f1', 0.1), color: '#6366f1' }}><TopicIcon fontSize="small" /></Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography sx={{ fontWeight: 800, color: '#334155' }}>
                            {themeItem.Name}{themeItem.Title ? `: ${themeItem.Title}` : ''}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={1} sx={{ mr: 2 }}>
                          {!isTeacher && (
                            <>
                              <Button
                                size="small" startIcon={<AddIcon />}
                                onClick={(e) => { e.stopPropagation(); handleOpenLesson(null, themeItem.Id) }}
                                sx={{ textTransform: 'none', fontWeight: 700 }}
                              >
                                Thêm bài
                              </Button>
                              <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleOpenTheme(themeItem) }}><EditIcon sx={{ fontSize: 18 }} /></IconButton>
                              <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleDeleteTheme(themeItem.Id) }}><DeleteIcon sx={{ fontSize: 18 }} /></IconButton>
                            </>
                          )}
                        </Stack>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: 3, pb: 3, bgcolor: '#fcfdfe' }}>
                      <List sx={{ width: '100%' }}>
                        {themeItem.MaterialLesson?.map((lesson) => (
                          <ListItem
                            key={lesson.Id}
                            sx={{
                              p: 2,
                              mb: 1.5,
                              bgcolor: 'white',
                              borderRadius: '16px',
                              border: '1px solid #f1f5f9',
                              borderLeft: '4px solid #10b981',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'flex-start',
                              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                              '&:hover': {
                                borderColor: '#e2e8f0',
                                boxShadow: '0 6px 18px rgba(0,0,0,0.05)',
                                transform: 'translateX(6px)',
                                borderLeftColor: '#059669'
                              }
                            }}
                          >

                            <Box sx={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                              <Avatar sx={{ width: 28, height: 28, mr: 2, bgcolor: alpha('#10b981', 0.1), color: '#10b981' }}><AssignmentIcon sx={{ fontSize: 16 }} /></Avatar>
                              <ListItemText
                                sx={{ flexGrow: 1, mr: 2 }}
                                primary={<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                  <Typography variant="body2" sx={{ fontWeight: 900, color: 'primary.main' }}>{lesson.Name}:</Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{lesson.Title}</Typography>
                                </Box>}
                                secondary={lesson.FileName && (() => {
                                  const ext = lesson.FileName.split('.').pop().toLowerCase()
                                  const isImg = ['png', 'jpg', 'jpeg', 'gif'].includes(ext)
                                  return (
                                    <Chip
                                      icon={isImg ? <ImageIcon /> : <FilePresentIcon />}
                                      label={lesson.FileName}
                                      size="small"
                                      variant="outlined"
                                      onClick={() => handleOpenPreview(lesson, true)}
                                      sx={{ mt: 0.5, height: 24, fontSize: '0.7rem', cursor: 'pointer', '&:hover': { bgcolor: '#f1f5f9' } }}
                                    />
                                  )
                                })()}
                                secondaryTypographyProps={{ component: 'div' }}
                              />
                              <Stack direction="row" spacing={1} alignItems="center">
                                {!isTeacher && (
                                  <>
                                    <Tooltip title="Sửa thông tin bài học">
                                      <IconButton size="small" onClick={() => handleOpenLesson(lesson)}>
                                        <EditIcon sx={{ fontSize: 18 }} />
                                      </IconButton>
                                    </Tooltip>
                                    <IconButton size="small" color="error" onClick={() => handleDeleteLesson(lesson.Id)}>
                                      <DeleteIcon sx={{ fontSize: 18 }} />
                                    </IconButton>
                                    <Tooltip title="Quản lý tài nguyên bài học">
                                      <IconButton size="small" color="primary" onClick={() => handleOpenResourceManage(lesson)}>
                                        <AttachmentIcon sx={{ fontSize: 18 }} />
                                      </IconButton>
                                    </Tooltip>
                                  </>
                                )}
                              </Stack>
                            </Box>
                            <Grid container spacing={1} sx={{ mt: 1, pl: 6 }}>
                              {lessonResources.filter(r => r.lessonId === lesson.Id).map(res => (
                                <Grid item key={res.id} xs="auto">
                                  <Paper sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1, borderRadius: 2, background: alpha(theme.palette.secondary.main, 0.05), '&:hover': { boxShadow: 4 } }} elevation={0}>
                                    <Avatar sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1), width: 24, height: 24 }}>
                                      {getFileIcon(res.resourceName)}
                                    </Avatar>
                                    <Typography variant="body2" sx={{ flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 150 }}>{res.resourceName}</Typography>
                                    <IconButton size="small" onClick={() => handleOpenPreview(res)}>
                                      <OpenInNewIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                    {!isTeacher && (
                                      <IconButton size="small" color="error" onClick={() => handleDeleteLessonResource(res.id, lesson.Id)}>
                                        <DeleteIcon sx={{ fontSize: 16 }} />
                                      </IconButton>
                                    )}
                                  </Paper>
                                </Grid>
                              ))}
                            </Grid>
                          </ListItem>
                        ))}
                      </List>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Stack>
            </Paper>
          ) : (
            <Box sx={{ height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed #e2e8f0', borderRadius: '24px', bgcolor: '#f8fafc' }}>
              <MenuBookIcon sx={{ fontSize: 60, color: '#e2e8f0', mb: 2 }} />
              <Typography color="text.secondary" sx={{ fontWeight: 600 }}>Chọn một bộ giáo trình để bắt đầu biên soạn</Typography>
            </Box>
          ) }

        </Grid>
      </Grid>

      {/* CREATE/EDIT MATERIAL MODAL */}
      <Dialog open={openMaterialModal} onClose={() => setOpenMaterialModal(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '24px' } }}>
        <DialogTitle sx={{ fontWeight: 900 }}>{editingMaterial ? 'Cập nhật giáo trình' : 'Tạo giáo trình mới'}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField label="Tên giáo trình" fullWidth value={materialForm.Name} onChange={e => setMaterialForm({ ...materialForm, Name: e.target.value })} />

            <FormControl fullWidth>
              <InputLabel>Cấp độ (Level)</InputLabel>
              <Select
                value={materialForm.IdLevel}
                label="Cấp độ (Level)"
                onChange={e => setMaterialForm({ ...materialForm, IdLevel: e.target.value })}
              >
                {levels.map(l => <MenuItem key={l.Id} value={l.Id}>{l.Name}</MenuItem>)}
              </Select>
            </FormControl>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>Ảnh bìa (Thumbnail)</Typography>
              <Box sx={{ p: 3, border: '2px dashed #e2e8f0', borderRadius: '16px', textAlign: 'center', bgcolor: '#f8fafc' }}>
                {materialForm.ImageUrl ? (
                  <Box sx={{ position: 'relative' }}>
                    <Box component="img" src={resolveFileUrl(materialForm.ImageUrl)} sx={{ width: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '12px' }} />
                    <Button
                      size="small" color="error" variant="contained"
                      onClick={() => {
                        setMaterialForm({ ...materialForm, ImageUrl: '' })
                        setPendingMaterialFile(null)
                      }}
                      sx={{ position: 'absolute', top: 10, right: 10 }}
                    >Xóa</Button>
                  </Box>
                ) : (
                  <>
                    <input type="file" accept="image/*" style={{ display: 'none' }} id="up-thumb" onChange={(e) => handleFileChange(e, 'material')} />
                    <label htmlFor="up-thumb">
                      <Button component="span" startIcon={uploading ? <CircularProgress size={20} /> : <ImageIcon />}>Tải ảnh bìa</Button>
                    </label>
                  </>
                )}
              </Box>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenMaterialModal(false)} sx={{ textTransform: 'none', fontWeight: 700 }}>Hủy</Button>
          <Button variant="contained" onClick={handleSaveMaterial} sx={{ borderRadius: '12px', px: 4, textTransform: 'none', fontWeight: 800, background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}>Lưu</Button>
        </DialogActions>
      </Dialog>

      {/* CREATE/EDIT LESSON MODAL */}
      <Dialog
        open={openLessonModal}
        onClose={() => setOpenLessonModal(false)}
        maxWidth={bulkLessonMode && !editingLesson ? 'md' : 'sm'}
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
            border: '1px solid rgba(255,255,255,0.7)'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 900, display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 2, borderBottom: '1px solid #f1f5f9' }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', width: 40, height: 40 }}>
              <AssignmentIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#1e293b' }}>
                {editingLesson ? (isTeacher ? 'Cập nhật tài liệu đính kèm bài học' : 'Cập nhật bài học') : 'Thêm bài học mới'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {editingLesson ? 'Điều chỉnh thông tin và tệp bài học' : 'Biên soạn nội dung bài học mới'}
              </Typography>
            </Box>
          </Stack>
          {!editingLesson && (
            <Button
              size="small"
              variant="outlined"
              onClick={() => setBulkLessonMode(!bulkLessonMode)}
              sx={{
                textTransform: 'none',
                borderRadius: '10px',
                fontWeight: 700,
                borderWidth: '1.5px',
                '&:hover': { borderWidth: '1.5px' }
              }}
            >
              {bulkLessonMode ? 'Thêm 1 bài học' : 'Thêm nhanh nhiều bài'}
            </Button>
          )}
        </DialogTitle>
        <DialogContent sx={{ p: 3, mt: 1 }}>
          {bulkLessonMode && !editingLesson ? (
            <Stack spacing={3}>
              {/* Drag and Drop multi-upload zone */}
              <Box
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  if (e.dataTransfer.files.length > 0) {
                    handleBulkLessonMultipleFiles(e.dataTransfer.files)
                  }
                }}
                onClick={() => document.getElementById('bulk-lesson-files-upload').click()}
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
              >
                <CloudUploadIcon sx={{ fontSize: 40, color: '#6366f1', mb: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#4f46e5' }}>
                  Kéo thả nhiều file bài học vào đây hoặc bấm để chọn tệp
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Hỗ trợ tải lên hàng loạt tệp tin PDF, Word, hình ảnh. Hệ thống sẽ tự động tạo bài tương ứng.
                </Typography>
                <input
                  type="file"
                  id="bulk-lesson-files-upload"
                  multiple
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files.length > 0) {
                      handleBulkLessonMultipleFiles(e.target.files)
                    }
                  }}
                  accept=".pdf,.png,.jpg,.jpeg,.gif"
                />
              </Box>

              {/* Text Parser Toggle */}
              <Box>
                <Button
                  size="small"
                  variant="text"
                  startIcon={<AutoAwesomeIcon />}
                  onClick={() => setShowParseLessonArea(!showParseLessonArea)}
                  sx={{ textTransform: 'none', fontWeight: 700 }}
                >
                  {showParseLessonArea ? 'Đóng ô dán văn bản nhanh' : 'Trích xuất bài học từ văn bản'}
                </Button>

                {showParseLessonArea && (
                  <Paper sx={{ p: 2, mt: 1, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px' }} elevation={0}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                      Nhập danh sách bài học, mỗi bài trên một dòng. Có thể phân tách Tên và Tiêu đề bằng dấu hai chấm (:). Ví dụ:<br/>
                      <strong>Lesson 1: Vocabulary & Listening</strong><br/>
                      <strong>Lesson 2: Grammar Practice</strong>
                    </Typography>
                    <TextField
                      multiline
                      rows={3}
                      fullWidth
                      variant="outlined"
                      placeholder="Dán văn bản tại đây..."
                      value={parseLessonText}
                      onChange={(e) => setParseLessonText(e.target.value)}
                      sx={{ bgcolor: 'white', mb: 1.5, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                    />
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button size="small" onClick={() => setShowParseLessonArea(false)} sx={{ textTransform: 'none' }}>Hủy</Button>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={handleParseLessons}
                        sx={{ textTransform: 'none', borderRadius: '8px' }}
                      >
                        Trích xuất bài học
                      </Button>
                    </Stack>
                  </Paper>
                )}
              </Box>

              {/* Bulk Lesson Grid / List */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, color: '#475569', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Danh sách bài học ({bulkLessonList.length})</span>
                  {bulkLessonList.some(l => l.File) && (
                    <Chip label="Có tệp đính kèm" color="success" size="small" sx={{ fontWeight: 700 }} />
                  )}
                </Typography>

                <Box sx={{ maxHeight: '350px', overflowY: 'auto', pr: 1 }}>
                  <Stack spacing={2}>
                    {bulkLessonList.map((item, index) => (
                      <Paper
                        key={index}
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: '16px',
                          border: '1px solid #e2e8f0',
                          bgcolor: '#fcfdfe',
                          transition: 'all 0.2s',
                          '&:hover': {
                            borderColor: '#cbd5e1',
                            bgcolor: '#f8fafc',
                            transform: 'translateY(-2px)'
                          }
                        }}
                      >
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={1.5} sm={0.7}>
                            <Avatar sx={{ width: 28, height: 28, fontSize: '0.8rem', bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', fontWeight: 800 }}>
                              {index + 1}
                            </Avatar>
                          </Grid>
                          <Grid item xs={10.5} sm={2.8}>
                            <TextField
                              label="Tên bài"
                              fullWidth
                              size="small"
                              value={item.Name}
                              onChange={(e) => handleBulkLessonChange(index, 'Name', e.target.value)}
                              InputProps={{ sx: { borderRadius: '10px', bgcolor: 'white' } }}
                              InputLabelProps={{
                                sx: {
                                  '&.MuiInputLabel-shrink': {
                                    bgcolor: 'white',
                                    px: 0.8
                                  }
                                }
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <TextField
                              label="Tiêu đề bài học"
                              fullWidth
                              size="small"
                              value={item.Title}
                              onChange={(e) => handleBulkLessonChange(index, 'Title', e.target.value)}
                              InputProps={{ sx: { borderRadius: '10px', bgcolor: 'white' } }}
                              InputLabelProps={{
                                sx: {
                                  '&.MuiInputLabel-shrink': {
                                    bgcolor: 'white',
                                    px: 0.8
                                  }
                                }
                              }}
                            />
                          </Grid>
                          <Grid item xs={5.5} sm={1.5}>
                            <TextField
                              label="Thứ tự"
                              type="number"
                              fullWidth
                              size="small"
                              value={item.Priority}
                              onChange={(e) => handleBulkLessonChange(index, 'Priority', parseInt(e.target.value) || 0)}
                              InputProps={{ sx: { borderRadius: '10px', bgcolor: 'white' } }}
                              InputLabelProps={{
                                sx: {
                                  '&.MuiInputLabel-shrink': {
                                    bgcolor: 'white',
                                    px: 0.8
                                  }
                                }
                              }}
                            />
                          </Grid>
                          <Grid item xs={5.5} sm={2.2}>
                            <input
                              type="file"
                              id={`bulk-row-file-${index}`}
                              style={{ display: 'none' }}
                              onChange={(e) => {
                                if (e.target.files.length > 0) {
                                  handleBulkLessonFileChange(index, e.target.files[0])
                                }
                              }}
                              accept=".pdf,.png,.jpg,.jpeg,.gif"
                            />
                            {item.FileName ? (
                              <Chip
                                icon={<FilePresentIcon />}
                                label={item.FileName}
                                color="primary"
                                variant="outlined"
                                size="small"
                                onDelete={() => handleBulkLessonFileChange(index, null)}
                                sx={{ maxWidth: '100%', borderRadius: '8px' }}
                              />
                            ) : (
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<CloudUploadIcon />}
                                onClick={() => document.getElementById(`bulk-row-file-${index}`).click()}
                                sx={{ textTransform: 'none', borderRadius: '8px', borderStyle: 'dashed', width: '100%' }}
                              >
                                Tải tệp lên
                              </Button>
                            )}
                          </Grid>
                          <Grid item xs={1} sm={0.8} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => handleRemoveBulkLessonRow(index)}
                              disabled={bulkLessonList.length === 1}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Grid>
                        </Grid>
                      </Paper>
                    ))}
                  </Stack>
                </Box>

                <Button
                  fullWidth
                  startIcon={<AddIcon />}
                  onClick={handleAddBulkLessonRow}
                  sx={{ mt: 2, border: '1px dashed #cbd5e1', borderRadius: '12px', textTransform: 'none', py: 1, fontWeight: 700 }}
                >
                  Thêm dòng bài học mới
                </Button>
              </Box>
            </Stack>
          ) : (
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Tên bài (VD: Lesson 1)"
                  fullWidth
                  value={lessonForm.Name}
                  onChange={e => setLessonForm({ ...lessonForm, Name: e.target.value })}
                  disabled={isTeacher}
                  InputProps={{ sx: { borderRadius: '12px' } }}
                  InputLabelProps={{
                    sx: {
                      '&.MuiInputLabel-shrink': {
                        bgcolor: 'white',
                        px: 0.8
                      }
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={8}>
                <TextField
                  label="Tiêu đề bài học (VD: Vocabulary)"
                  fullWidth
                  value={lessonForm.Title}
                  onChange={e => setLessonForm({ ...lessonForm, Title: e.target.value })}
                  disabled={isTeacher}
                  InputProps={{ sx: { borderRadius: '12px' } }}
                  InputLabelProps={{
                    sx: {
                      '&.MuiInputLabel-shrink': {
                        bgcolor: 'white',
                        px: 0.8
                      }
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Thứ tự / Tiết học"
                  type="number"
                  fullWidth
                  value={lessonForm.Priority}
                  onChange={e => setLessonForm({ ...lessonForm, Priority: parseInt(e.target.value) || 0 })}
                  disabled={isTeacher}
                  InputProps={{ sx: { borderRadius: '12px' } }}
                  InputLabelProps={{
                    sx: {
                      '&.MuiInputLabel-shrink': {
                        bgcolor: 'white',
                        px: 0.8
                      }
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 800, color: 'text.secondary' }}>Tài liệu đính kèm (PDF / Ảnh)</Typography>
                <Box
                  sx={{
                    p: 4,
                    border: '2px dashed #e2e8f0',
                    borderRadius: '16px',
                    textAlign: 'center',
                    bgcolor: '#f8fafc',
                    cursor: 'pointer',
                    '&:hover': { borderColor: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.01) }
                  }}
                  onClick={() => !lessonForm.FileName && document.getElementById('up-pdf').click()}
                >
                  {lessonForm.FileName ? (
                    <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
                      {(() => {
                        const ext = lessonForm.FileName.split('.').pop().toLowerCase()
                        if (['png', 'jpg', 'jpeg', 'gif'].includes(ext)) {
                          return <ImageIcon color="success" sx={{ fontSize: 36 }} />
                        }
                        return <FilePresentIcon color="primary" sx={{ fontSize: 36 }} />
                      })()}
                      <Box sx={{ textAlign: 'left', flexGrow: 1, overflow: 'hidden' }}>
                        <Typography variant="body2" sx={{ fontWeight: 800, textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{lessonForm.FileName}</Typography>
                        <Typography variant="caption" color="text.secondary">Tệp tin đã đính kèm</Typography>
                      </Box>
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        onClick={(e) => {
                          e.stopPropagation()
                          setLessonForm({ ...lessonForm, FileName: '' })
                          setPendingLessonFile(null)
                        }}
                        sx={{ borderRadius: '8px', textTransform: 'none' }}
                      >
                        Xóa tệp
                      </Button>
                    </Stack>
                  ) : (
                    <>
                      <input type="file" accept=".pdf,.png,.jpg,.jpeg,.gif" style={{ display: 'none' }} id="up-pdf" onChange={(e) => handleFileChange(e, 'lesson')} />
                      <CloudUploadIcon sx={{ fontSize: 48, color: '#94a3b8', mb: 1 }} />
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>Tải tệp tin bài học lên</Typography>
                      <Typography variant="caption" color="text.secondary">Hỗ trợ định dạng PDF, PNG, JPG tối đa 50MB</Typography>
                    </>
                  )}
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #f1f5f9' }}>
          <Button onClick={() => setOpenLessonModal(false)} sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '10px', px: 3 }}>Hủy</Button>
          <Button
            variant="contained"
            onClick={handleSaveLesson}
            disabled={uploading}
            sx={{
              borderRadius: '12px',
              px: 4,
              textTransform: 'none',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)'
            }}
          >
            {uploading ? <CircularProgress size={20} color="inherit" /> : (bulkLessonMode && !editingLesson ? `Lưu tất cả (${bulkLessonList.filter(l => l.Name.trim() !== '').length} bài)` : 'Lưu bài học')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* CREATE/EDIT THEME MODAL */}
      <Dialog
        open={openThemeModal}
        onClose={() => setOpenThemeModal(false)}
        maxWidth={bulkMode && !editingTheme ? 'md' : 'sm'}
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
            border: '1px solid rgba(255,255,255,0.7)'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 900, display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 2, borderBottom: '1px solid #f1f5f9' }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', width: 40, height: 40 }}>
              <TopicIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#1e293b' }}>
                {editingTheme ? 'Sửa chương học' : 'Thêm chương học mới'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {editingTheme ? 'Cập nhật tiêu đề chương học' : 'Tạo thêm các chương học chính'}
              </Typography>
            </Box>
          </Stack>
          {!editingTheme && (
            <Button
              size="small"
              variant="outlined"
              onClick={() => setBulkMode(!bulkMode)}
              sx={{
                textTransform: 'none',
                borderRadius: '10px',
                fontWeight: 700,
                borderWidth: '1.5px',
                '&:hover': { borderWidth: '1.5px' }
              }}
            >
              {bulkMode ? 'Thêm 1 chương' : 'Thêm danh sách nhiều chương'}
            </Button>
          )}
        </DialogTitle>
        <DialogContent sx={{ p: 3, mt: 1 }}>
          {bulkMode && !editingTheme ? (
            <Stack spacing={3}>
              {/* Text Parser Toggle */}
              <Box>
                <Button
                  size="small"
                  variant="text"
                  startIcon={<AutoAwesomeIcon />}
                  onClick={() => setShowParseThemeArea(!showParseThemeArea)}
                  sx={{ textTransform: 'none', fontWeight: 700 }}
                >
                  {showParseThemeArea ? 'Đóng ô dán văn bản nhanh' : 'Trích xuất chương học từ văn bản'}
                </Button>

                {showParseThemeArea && (
                  <Paper sx={{ p: 2, mt: 1, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px' }} elevation={0}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                      Nhập danh sách chương, mỗi chương trên một dòng. Có thể phân tách Tên chương và Tiêu đề bằng dấu hai chấm (:). Ví dụ:<br/>
                      <strong>Chương 1: Giới thiệu chung</strong><br/>
                      <strong>Chương 2: Luyện kỹ năng nghe</strong>
                    </Typography>
                    <TextField
                      multiline
                      rows={3}
                      fullWidth
                      variant="outlined"
                      placeholder="Dán văn bản chương học tại đây..."
                      value={parseThemeText}
                      onChange={(e) => setParseThemeText(e.target.value)}
                      sx={{ bgcolor: 'white', mb: 1.5, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                    />
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button size="small" onClick={() => setShowParseThemeArea(false)} sx={{ textTransform: 'none' }}>Hủy</Button>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={handleParseThemes}
                        sx={{ textTransform: 'none', borderRadius: '8px' }}
                      >
                        Trích xuất chương
                      </Button>
                    </Stack>
                  </Paper>
                )}
              </Box>

              {/* Bulk Theme List */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, color: '#475569' }}>
                  Danh sách chương học ({bulkThemeList.length})
                </Typography>

                <Box sx={{ maxHeight: '350px', overflowY: 'auto', pr: 1 }}>
                  <Stack spacing={2}>
                    {bulkThemeList.map((item, index) => (
                      <Paper
                        key={index}
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: '16px',
                          border: '1px solid #e2e8f0',
                          bgcolor: '#fcfdfe',
                          transition: 'all 0.2s',
                          '&:hover': {
                            borderColor: '#cbd5e1',
                            bgcolor: '#f8fafc',
                            transform: 'translateY(-2px)'
                          }
                        }}
                      >
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={1.5} sm={1}>
                            <Avatar sx={{ width: 28, height: 28, fontSize: '0.8rem', bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', fontWeight: 800 }}>
                              {index + 1}
                            </Avatar>
                          </Grid>
                          <Grid item xs={10.5} sm={3.5}>
                            <TextField
                              label="Tên chương"
                              fullWidth
                              size="small"
                              value={item.Name}
                              onChange={(e) => handleBulkChange(index, 'Name', e.target.value)}
                              InputProps={{ sx: { borderRadius: '10px', bgcolor: 'white' } }}
                              InputLabelProps={{
                                sx: {
                                  '&.MuiInputLabel-shrink': {
                                    bgcolor: 'white',
                                    px: 0.8
                                  }
                                }
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={4.5}>
                            <TextField
                              label="Tiêu đề chương (Title)"
                              fullWidth
                              size="small"
                              value={item.Title}
                              onChange={(e) => handleBulkChange(index, 'Title', e.target.value)}
                              InputProps={{ sx: { borderRadius: '10px', bgcolor: 'white' } }}
                              InputLabelProps={{
                                sx: {
                                  '&.MuiInputLabel-shrink': {
                                    bgcolor: 'white',
                                    px: 0.8
                                  }
                                }
                              }}
                            />
                          </Grid>
                          <Grid item xs={10} sm={2}>
                            <TextField
                              label="Thứ tự"
                              type="number"
                              fullWidth
                              size="small"
                              value={item.Priority}
                              onChange={(e) => handleBulkChange(index, 'Priority', parseInt(e.target.value) || 0)}
                              InputProps={{ sx: { borderRadius: '10px', bgcolor: 'white' } }}
                              InputLabelProps={{
                                sx: {
                                  '&.MuiInputLabel-shrink': {
                                    bgcolor: 'white',
                                    px: 0.8
                                  }
                                }
                              }}
                            />
                          </Grid>
                          <Grid item xs={2} sm={1} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => handleRemoveBulkRow(index)}
                              disabled={bulkThemeList.length === 1}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Grid>
                        </Grid>
                      </Paper>
                    ))}
                  </Stack>
                </Box>

                <Button
                  fullWidth
                  startIcon={<AddIcon />}
                  onClick={handleAddBulkRow}
                  sx={{ mt: 2, border: '1px dashed #cbd5e1', borderRadius: '12px', textTransform: 'none', py: 1, fontWeight: 700 }}
                >
                  Thêm dòng chương học mới
                </Button>
              </Box>
            </Stack>
          ) : (
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Tên chương"
                  fullWidth
                  value={themeForm.Name}
                  onChange={e => setThemeForm({ ...themeForm, Name: e.target.value })}
                  InputProps={{ sx: { borderRadius: '12px' } }}
                  InputLabelProps={{
                    sx: {
                      '&.MuiInputLabel-shrink': {
                        bgcolor: 'white',
                        px: 0.8
                      }
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={8}>
                <TextField
                  label="Tiêu đề chương (Title)"
                  fullWidth
                  value={themeForm.Title}
                  onChange={e => setThemeForm({ ...themeForm, Title: e.target.value })}
                  InputProps={{ sx: { borderRadius: '12px' } }}
                  InputLabelProps={{
                    sx: {
                      '&.MuiInputLabel-shrink': {
                        bgcolor: 'white',
                        px: 0.8
                      }
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Thứ tự"
                  type="number"
                  fullWidth
                  value={themeForm.Priority}
                  onChange={e => setThemeForm({ ...themeForm, Priority: parseInt(e.target.value) || 0 })}
                  InputProps={{ sx: { borderRadius: '12px' } }}
                  InputLabelProps={{
                    sx: {
                      '&.MuiInputLabel-shrink': {
                        bgcolor: 'white',
                        px: 0.8
                      }
                    }
                  }}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #f1f5f9' }}>
          <Button onClick={() => setOpenThemeModal(false)} sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '10px', px: 3 }}>Hủy</Button>
          <Button
            variant="contained"
            onClick={handleSaveTheme}
            sx={{
              borderRadius: '12px',
              px: 4,
              textTransform: 'none',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)'
            }}
          >
            {bulkMode && !editingTheme ? `Lưu tất cả (${bulkThemeList.filter(t => t.Name.trim() !== '').length} chương)` : 'Lưu chương'}
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
                onClick={() => document.getElementById('dialog-resource-files').click()}
              >
                <CloudUploadIcon sx={{ fontSize: 48, color: '#6366f1', mb: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Nhấp để chọn file từ thiết bị
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Hỗ trợ: PDF, Word, Video, Ảnh
                </Typography>
                <input
                  type="file"
                  id="dialog-resource-files"
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
                          {getFileIcon(file.name)}
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
                {lessonResources.filter(r => r.lessonId === selectedLessonForResources?.Id).length === 0 ? (
                  <Box sx={{ py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: '#f8fafc', borderRadius: 4, border: '1px dashed #e2e8f0' }}>
                    <FolderOpenIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 1.5 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Chưa có tài liệu nào
                    </Typography>
                  </Box>
                ) : (
                  <List sx={{ p: 0 }}>
                    {lessonResources.filter(r => r.lessonId === selectedLessonForResources?.Id).map((res) => {
                      const isEditing = editingResourceId === res.id
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
                          <Avatar sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1), width: 36, height: 36 }}>
                            {getFileIcon(res.resourceName)}
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
                                  onClick={() => handleOpenPreview(res)}
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

      {/* DOCUMENT PREVIEW MODAL */}
      <Dialog
        open={openPreviewModal}
        onClose={() => setOpenPreviewModal(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>
            Xem trước: {previewResource?.resourceName}
          </Typography>
          <IconButton onClick={() => setOpenPreviewModal(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', p: 2 }}>
          {renderPreviewContent(previewResource)}
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button
            variant="outlined"
            startIcon={<OpenInNewIcon />}
            onClick={() => window.open(resolveFileUrl(previewResource?.filePath || previewResource?.ResourceUrl), '_blank')}
            sx={{ textTransform: 'none', borderRadius: '12px', px: 3, mr: 'auto', fontWeight: 700 }}
          >
            Mở trong tab mới
          </Button>
          <Button
            onClick={() => setOpenPreviewModal(false)}
            variant="contained"
            sx={{ textTransform: 'none', borderRadius: '12px', px: 3, fontWeight: 700, background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default SchoolMaterials
