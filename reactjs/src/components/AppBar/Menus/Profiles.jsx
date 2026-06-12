import React from 'react'
import Box from '@mui/material/Box'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import ListItemIcon from '@mui/material/ListItemIcon'
import Avatar from '@mui/material/Avatar'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import PersonAdd from '@mui/icons-material/PersonAdd'
import Settings from '@mui/icons-material/Settings'
import Logout from '@mui/icons-material/Logout'
import { useSelector, useDispatch } from 'react-redux'
import { selectCurrentUser, logoutUserAPI } from '~/redux/user/userSlice'
import { useConfirm } from 'material-ui-confirm'
import { Link, useLocation } from 'react-router-dom'
import { resolveFileUrl } from '~/utils/formatters'

function Profiles() {
  const location = useLocation()
  const [anchorEl, setAnchorEl] = React.useState(null)
  const open = Boolean(anchorEl)
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const dispatch = useDispatch()
  const currentUser = useSelector(selectCurrentUser)
  const confirmLogout = useConfirm()
  const handleLogout = () => {
    confirmLogout({
      title: 'Đăng xuất khỏi tài khoản của bạn?',
      confirmationText: 'Xác nhận',
      cancellationText: 'Hủy',
      confirmationButtonProps: { color: 'secondary', variant: 'outlined' },
      cancellationButtonProps: { color: 'inherit' },
      allowClose: false,
      buttonOrder: ['confirm', 'cancel']
    })
      .then(() => {
        dispatch(logoutUserAPI())
      })
      .catch(() => {})
  }

  return (
    <Box>
      <Tooltip title='Cài đặt tài khoản'>
        <IconButton
          onClick={handleClick}
          size='small'
          sx={{ padding: 0 }}
          aria-controls={open ? 'basic-menu-profiles' : undefined}
          aria-haspopup='true'
          aria-expanded={open ? 'true' : undefined}
        >
          <Avatar sx={{ width: 36, height: 36 }} src={resolveFileUrl(currentUser?.avatar)} />
        </IconButton>
      </Tooltip>
      <Menu
        id='basic-menu-profiles'
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button-profiles'
        }}
      >
        <Link
          to='/settings/account'
          state={{ from: location.pathname }}
          style={{
            color: 'inherit'
          }}
        >
          <MenuItem
            sx={{
              '&:hover': { color: 'success.light' }
            }}
          >
            <Avatar sx={{ width: 28, height: 28, mr: 2 }} src={resolveFileUrl(currentUser?.avatar)} /> Hồ sơ cá nhân
          </MenuItem>
        </Link>
        <Divider />
        <MenuItem
          onClick={handleLogout}
          sx={{
            '&:hover': {
              color: 'warning.dark',
              '& .logout-icon': { color: 'warning.dark' }
            }
          }}
        >
          <ListItemIcon>
            <Logout className='logout-icon' fontSize='small' />
          </ListItemIcon>
          Đăng xuất
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default Profiles
