import axios from 'axios'
import { toast } from 'react-toastify'
import { interceptorLoadingElements } from '~/utils/formatters'
import { refreshTokenAPI } from '~/apis'
import { logoutUserAPI } from '~/redux/user/userSlice'

//Giai phap injectStore: https://redux.js.org/faq/code-structure#how-can-i-use-the-redux-store-in-non-component-files
let axiosReduxStore
export const injectStore = mainStore => {
  axiosReduxStore = mainStore
}

//Khởi tạo một đối tượng Axios (authorizedAxiosInstance) để custom và cấu hình chung dự án
let authorizedAxiosInstance = axios.create()
//Thời gian chờ tối đa 1 request: 10 phút
authorizedAxiosInstance.defaults.timeout = 1000 * 60 * 10
//withCredentials: Cho phép axios tự động gửi cookie trong mỗi request lên BE (lưu JWT tokens)
authorizedAxiosInstance.defaults.withCredentials = true

//Cấu hình Interceptor
// Add a request interceptor
authorizedAxiosInstance.interceptors.request.use((config) => {
  // Do something before request is sent
  //chặn spam click
  interceptorLoadingElements(true)
  return config
}, (error) => {
  // Do something with request error
  return Promise.reject(error)
})

//Khởi tạo promise cho việc call api refresh_token
let refershTokenPromise = null
// Add a response interceptor
authorizedAxiosInstance.interceptors.response.use((response) => {
  //chặn spam click
  interceptorLoadingElements(false)
  return response
}, (error) => {
  //chặn spam click
  interceptorLoadingElements(false)

  //401 => logout
  if (error?.response?.status === 401) {
    axiosReduxStore.dispatch(logoutUserAPI(false))
  }
  //410 => Refresh_token
  const originalRequests = error.config
  // console.log('originalRequests', originalRequests)
  if (error?.response?.status === 410 && !originalRequests._retry) {
    originalRequests._retry = true
    if (!refershTokenPromise) {
      refershTokenPromise = refreshTokenAPI()
        .then(data => {
          return data?.accesstoken
        })
        .catch((error) => {
          //Nếu có lỗi => logout
          axiosReduxStore.dispatch(logoutUserAPI(false))
          return Promise.reject(error)
        })
        .finally(() => {
          //Dù có lỗi hay ko vẫn gán refershTokenPromise = null
          refershTokenPromise = null
        })
    }
    // eslint-disable-next-line no-unused-vars
    return refershTokenPromise.then(accesstoken => {
      //Nếu cần lưu thêm token thì xử lý ở đây
      console.log('originalRequests', originalRequests)
      //Gọi lại những api ban đầu bị lỗi
      return authorizedAxiosInstance(originalRequests)
    })
  }

  let errorMessage = error?.message
  if (error.response?.data?.message) {
    errorMessage = error.response?.data?.message
  }

  if (error?.response?.status !== 410) {
    toast.error(errorMessage)
  }

  return Promise.reject(error)
})

export default authorizedAxiosInstance
