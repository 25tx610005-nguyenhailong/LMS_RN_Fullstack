//Redux: StateManager tools
import { configureStore } from '@reduxjs/toolkit'
import { userReducer } from './user/userSlice'
import { notificationsReducer } from './notifications/notificationsSlice'
//Hướng dẫn cấu hình redux-persist
//https://edvins.io/how-to-use-redux-persist-with-redux-toolkit
import storage from 'redux-persist/lib/storage'
import { combineReducers } from 'redux' //redux-toolkit đã có luôn
import { persistReducer } from 'redux-persist'

//Cau hinh persist
const rootPersistConfig = {
  key: 'root', //key cua cai persist do chung ta chi dinh, cu de mac dinh la root
  storage: storage, // Bien storage & tren - luu vao localstorage
  whitelist: ['user'] // dinh nghia cac slice di lieu DUOC PHEP duy tri qua moi lan f5 trinh duyet
  // blacklist: ['user'] // dinh nghia cac slice KHONG BUOC PHEP duy tri qua moi lan f5 trinh duyet
}
//combine cac reducers trong du an
const reducers = combineReducers({
  user: userReducer,
  notifications: notificationsReducer
})

//Thuc hien persist reducers
const persistedReducers = persistReducer(rootPersistConfig, reducers)

export const store = configureStore({
  reducer: persistedReducers,
  // Fix warning error when implement redux-persist
  // https://stackoverflow.com/a/63244831/8324172
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false } )
})