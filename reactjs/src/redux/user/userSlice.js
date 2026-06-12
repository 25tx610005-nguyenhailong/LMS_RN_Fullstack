import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'react-toastify'
import authorizedAxiosInstance from '~/utils/authorizeAxios'
import { API_ROOT } from '~/utils/constants'


//Khởi tạo giá trị 1 cái Slice trong redux
const initialState = {
  currentUser: null
}

//Gọi api bất đồng bộ và cập nhật dữ liệu vào Redux, dùng middleware creatAsyncThunk va extraReducers
export const loginUserAPI = createAsyncThunk(
  'user/loginUserAPI',
  async (data) => {
    const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/accounts/login`, data)
    //axios trả về kết quả qua property của nó là data
    return response.data
  }
)

export const updateUserAPI = createAsyncThunk(
  'user/updateUserAPI',
  async (data) => {
    const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/accounts/update`, data)
    return response.data
  }
)

export const logoutUserAPI = createAsyncThunk(
  'user/logoutUserAPI',
  async (showSuccessMessage = true) => {
    const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/accounts/logout`)
    if (showSuccessMessage) {
      toast.success('Logged out successfully!')
    }
    return response.data
  }
)

export const registerUserAPI = createAsyncThunk(
  'user/registerUserAPI',
  async (data) => {
    const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/accounts/register`, data)
    toast.success('Account created successfully! Please check and verify your account before logging in!', { theme: 'colored' })
    return response.data
  }
)

export const verifyUserAPI = createAsyncThunk(
  'user/verifyUserAPI',
  async (data) => {
    const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/accounts/verify`, data)
    toast.success('Account verified successfully! Now you can login to enjoy our services! Have a good day!', { theme: 'colored' })
    return response.data
  }
)

export const refreshTokenAPI = async () => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/accounts/refresh_token`)
  return response.data
}


//Khởi tạo 1 cái Slice trong kho lưu trữ - Redux store
export const userSlice = createSlice({
  name: 'user',
  initialState,
  //Reducers nơi xử lý dữ liệu đồng bộ
  reducers: {},
  //ExtraRudecers: Nơi xử lý dữ liệu bất đồng bộ
  extraReducers: (builder) => {
    builder.addCase(loginUserAPI.fulfilled, (state, action) => {
      //action.payload chính là cái response.data ở trên
      const user = action.payload
      //update lại dữ liệu của currentActiveBoard
      state.currentUser = user
    })
    builder.addCase(logoutUserAPI.fulfilled, (state) => {
      state.currentUser = null
    })
    builder.addCase(updateUserAPI.fulfilled, (state, action) => {
      const user = action.payload
      state.currentUser = {
        ...state.currentUser,
        ...user
      }
    })
  }
})

// Action creators are generated for each case reducer function
// export const {} = userSlice.actions

//Selectors: nơi dành cho các components bên dưới gọi bằng hook useSelector() để lấy dữ liệu từ trong kho redux store ra sử dụng
export const selectCurrentUser = (state) => {
  return state.user.currentUser
}

// export default userReducer.reducer
export const userReducer = userSlice.reducer