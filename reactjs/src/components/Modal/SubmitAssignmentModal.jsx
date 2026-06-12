import { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { submitAssignmentAPI } from '~/apis/assignmentApi'
import { toast } from 'react-toastify'

function SubmitAssignmentModal({ open, onClose, assignment, courseId, onSuccess }) {
  const [fileUrl, setFileUrl] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!fileUrl) {
      toast.error('Please provide a file URL!')
      return
    }

    setLoading(true)
    try {
      await submitAssignmentAPI({
        IdCourse: courseId,
        IdAssignment: assignment.Id,
        FileUrl: fileUrl,
        FileName: fileUrl.split('/').pop() || 'assignment_file'
      })
      toast.success('Assignment submitted successfully!')
      onSuccess()
      onClose()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Error submitting assignment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 'bold' }}>
        Submit Work: {assignment?.AssignmentTitle}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Please provide the link to your assignment (e.g., Google Drive, Github, or Cloudinary link).
          </Typography>
          <TextField
            fullWidth
            label="File URL"
            placeholder="https://..."
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
            disabled={loading}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Now'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default SubmitAssignmentModal
