import { useState, useEffect } from 'react'
import { useSearchParams, Navigate } from 'react-router-dom'
import { verifyUserAPI } from '~/apis'
import PageLoadingSpinner from '~/components/Loading/PageLoadingSpinner'
import { useDispatch } from 'react-redux'

function AccountVerification() {
  let [searchParams] = useSearchParams()
  //   const email = searchParams.get('email')
  //   const token = searchParams.get('token')
  const { email, token } = Object.fromEntries([...searchParams])
  const [verified, setVerified] = useState(false)
  const dispatch = useDispatch()

  // Gọi API để verify tài khoản
  useEffect(() => {
    if (email && token) {
      dispatch(verifyUserAPI({ email, token })).unwrap().then(() => {
        // Nếu như gọi API verify account thành công thì gán biến verified = true
        setVerified(true)
      })
    }
  }, [dispatch, email, token])

  // Nếu url có vấn đề, không tồn tại 1 trong 2 giá trị email hoặc token thì đá ra trang 404 luôn
  if (!email || !token) {
    return <Navigate to='/404' />
  }

  // Nếu chưa verify xong thì hiện loading
  if (!verified) {
    return <PageLoadingSpinner caption='Verifying your account...' />
  }

  // Cuối cùng nếu không gặp vấn đề gì + với verify thành công thì điều hướng về trang login cùng giá trị verifiedEmail
  return <Navigate to={`/login?verifiedEmail=${email}`} />
}

export default AccountVerification
