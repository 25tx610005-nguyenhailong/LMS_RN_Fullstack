import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: {
      main: '#1565c0'
    },
    secondary: {
      main: '#764ba2'
    }
  },
  typography: {
    fontFamily: '"Outfit", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 13, // Global scaling base font size (default is 14)
    body1: {
      fontSize: '0.875rem', // ~14px (default is 16px)
      lineHeight: 1.5
    },
    body2: {
      fontSize: '0.8rem', // ~12.8px (default is 14px)
      lineHeight: 1.43
    },
    button: {
      textTransform: 'none',
      fontWeight: 600
    }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          '*::-webkit-scrollbar': {
            width: '8px',
            height: '8px'
          },
          '*::-webkit-scrollbar-thumb': {
            backgroundColor: '#dcdde1',
            borderRadius: '8px'
          },
          '*::-webkit-scrollbar-thumb:hover': {
            backgroundColor: 'white'
          }
        }
      }
    }
  }
})

console.log('DEBUG: theme object created:', theme)

export default theme
