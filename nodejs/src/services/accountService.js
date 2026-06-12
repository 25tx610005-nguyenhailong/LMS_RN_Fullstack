import { accountModel } from '~/models/accountModel'
import bcrypt from 'bcryptjs'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { v4 as uuidv4 } from 'uuid'
import { GET_DB } from '~/config/prisma'
import { pickUser } from '~/utils/formatters'
import { WEBSITE_DOMAIN } from '~/utils/constants'
import { BrevoProvider } from '~/providers/BrevoProvider'
import { env } from '~/config/environment'
import { JwtProvider } from '~/providers/JwtProvider'
import { LocalUploadProvider } from '~/providers/LocalUploadProvider'
import { securityUtils } from '~/utils/security'

const createNew = async (reqBody) => {
  try {
    const existUser = await accountModel.findOneByEmail(reqBody.email)
    if (existUser) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email already exists!')
    }

    const { password, passwordSalt } = securityUtils.hashPassword(reqBody.password)
    const nameFromEmail = reqBody.email.split('@')[0]

    const newUser = {
      Id: uuidv4(),
      UserName: reqBody.userName || nameFromEmail,
      Email: reqBody.email,
      Password: password,
      PasswordSalt: passwordSalt,
      FullName: reqBody.fullName || reqBody.userName || nameFromEmail,
      Phone: reqBody.phone || null,
      Address: reqBody.address || null,
      BirthDay: reqBody.birthDay ? new Date(reqBody.birthDay) : null,
      IdGender: reqBody.idGender || null,
      IdAccountType: reqBody.idAccountType || null,
      ActiveToken: uuidv4(),
      Active: false,
      Created_By: 'System'
    }

    const createdUser = await accountModel.createNew(newUser)

    const verificationLink = `${WEBSITE_DOMAIN}/account/verification?email=${createdUser.Email}&token=${createdUser.ActiveToken}`
    const customSubject = 'LMS Project: Please verify your email before using our service.'
    const htmlContent = `
      <h3>Here is your verification link</h3>
      <h3>${verificationLink}</h3>
      <h3>Sincerely,</br> - Longnh - </h3>
    `
    await BrevoProvider.sendEmail(createdUser.Email, customSubject, htmlContent)
    return pickUser(createdUser)
  } catch (error) { throw error }
}

const verifyAccount = async (reqBody) => {
  try {
    const existUser = await accountModel.findOneByEmail(reqBody.email)
    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    if (existUser.Active) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is already active!')
    if (reqBody.token !== existUser.ActiveToken) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Token is invalid!')

    const updateData = {
      Active: true,
      ActiveToken: null
    }
    const updatedUser = await accountModel.update(existUser.Id, updateData)
    return pickUser(updatedUser)
  } catch (error) { throw error }
}

const login = async (reqBody) => {
  try {
    const existUser = await accountModel.findOneByUsername(reqBody.userName)
    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    if (!existUser.Active) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is not active!')

    if (!securityUtils.comparePassword(reqBody.password, existUser.Password, existUser.PasswordSalt)) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your password is incorrect!')
    }

    const userInfo = { id: existUser.Id, email: existUser.Email, userName: existUser.UserName }
    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      env.ACCESS_TOKEN_LIFE
    )
    const refreshToken = await JwtProvider.generateToken(
      userInfo,
      env.REFRESH_TOKEN_SECRET_SIGNATURE,
      env.REFRESH_TOKEN_LIFE
    )

    // Lấy danh sách quyền của người dùng
    const userRights = await accountModel.getRightsByAccountId(existUser.Id)
    // Lấy danh sách vai trò của người dùng
    const userRoles = existUser.AccountInRole.map(air => air.AccountRole.Name)

    return { accessToken, refreshToken, rights: userRights, role: userRoles[0], roles: userRoles, ...pickUser(existUser) }
  } catch (error) { throw error }
}

const refreshToken = async (clientRefreshToken) => {
  try {
    const refreshTokenDecoded = await JwtProvider.verifyToken(
      clientRefreshToken,
      env.REFRESH_TOKEN_SECRET_SIGNATURE
    )
    const userInfo = {
      id: refreshTokenDecoded.id,
      email: refreshTokenDecoded.email
    }

    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      env.ACCESS_TOKEN_LIFE
    )
    return { accessToken }
  } catch (error) { throw error }
}

const update = async (userId, reqBody, userAvaterFile) => {
  try {
    const existUser = await accountModel.findOneById(userId)
    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    if (!existUser.Active) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is not active!')

    let updatedUser = {}
    if (reqBody.current_password && reqBody.new_password) {
      if (!securityUtils.comparePassword(reqBody.current_password, existUser.Password, existUser.PasswordSalt)) {
        throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your current_password is incorrect!')
      }
      const { password, passwordSalt } = securityUtils.hashPassword(reqBody.new_password)
      updatedUser = await accountModel.update(userId, {
        Password: password,
        PasswordSalt: passwordSalt
      })
    }
    else if (userAvaterFile) {
      const uploadResult = await LocalUploadProvider.uploadFile(userAvaterFile.buffer, 'users', userAvaterFile.originalname)

      // Delete old avatar if exists
      if (existUser.LinkAvatar) {
        await LocalUploadProvider.deleteFile(existUser.LinkAvatar)
      }

      updatedUser = await accountModel.update(userId, {
        LinkAvatar: uploadResult.secure_url
      })
    }
    else {
      if (reqBody.email && reqBody.email !== existUser.Email) {
        const existEmail = await accountModel.findOneByEmail(reqBody.email)
        if (existEmail) {
          throw new ApiError(StatusCodes.CONFLICT, 'Email đã được đăng ký bởi tài khoản khác!')
        }
      }

      updatedUser = await accountModel.update(userId, {
        FullName: reqBody.displayName || reqBody.fullName,
        Email: reqBody.email,
        Phone: reqBody.phone,
        Address: reqBody.address
      })
    }

    const userRoles = await GET_DB().accountInRole.findMany({
      where: { IdAccount: userId, Deleted: 0 },
      include: { AccountRole: true }
    })
    const userRights = await accountModel.getRightsByAccountId(userId)
    const roleName = userRoles.map(air => air.AccountRole.Name)[0]
    const rolesArray = userRoles.map(air => air.AccountRole.Name)

    const isStudent = rolesArray.some(r => r.toUpperCase() === 'STUDENT')
    if (isStudent && (reqBody.displayName || reqBody.fullName)) {
      await GET_DB().accountStudent.updateMany({
        where: { IdAccount: userId, Deleted: 0 },
        data: {
          Name: reqBody.displayName || reqBody.fullName,
          Modified_By: 'Self',
          Modified_Date: new Date()
        }
      })
    }

    return {
      role: roleName,
      roles: rolesArray,
      rights: userRights,
      ...pickUser(updatedUser)
    }
  } catch (error) { throw error }
}

const createTeacher = async (reqBody, schoolId, extraData) => {
  try {
    const { email, fullName, password, phone, address, userName } = reqBody
    const existUser = await accountModel.findOneByEmail(email)
    if (existUser) throw new ApiError(StatusCodes.CONFLICT, 'Email đã tồn tại!')

    if (userName) {
      const existUserName = await accountModel.findOneByUsername(userName)
      if (existUserName) throw new ApiError(StatusCodes.CONFLICT, 'Tên đăng nhập đã tồn tại!')
    }

    // Generate Salt/Hash password
    const salt = bcrypt.genSaltSync(10)
    const hashedPassword = bcrypt.hashSync(password || 'teacher123', salt)

    const newUser = {
      Id: uuidv4(),
      UserName: reqBody.userName || email.split('@')[0],
      Email: email,
      Password: hashedPassword,
      PasswordSalt: salt,
      FullName: fullName,
      Phone: phone || null,
      Address: address || null,
      IdCity: reqBody.idCity ? parseInt(reqBody.idCity) : null,
      IdDistrict: reqBody.idDistrict ? parseInt(reqBody.idDistrict) : null,
      IdGender: reqBody.idGender ? parseInt(reqBody.idGender) : null,
      BirthDay: reqBody.birthDay ? new Date(reqBody.birthDay) : null,
      Active: true,
      Created_By: 'Admin',
      Created_Date: new Date()
    }
    const createdTeacher = await accountModel.createWithRole(newUser, 'TEACHER', schoolId, extraData)
    return pickUser(createdTeacher)
  } catch (error) { throw error }
}

const updateTeacher = async (id, reqBody) => {
  try {
    const { salary, certificates } = reqBody

    const existingTeacher = await GET_DB().account.findUnique({ where: { Id: id } })
    if (!existingTeacher) throw new ApiError(StatusCodes.NOT_FOUND, 'Tài khoản giáo viên không tồn tại!')

    if (reqBody.email && reqBody.email !== existingTeacher.Email) {
      const existEmail = await GET_DB().account.findFirst({
        where: { Email: reqBody.email, Deleted: 0 }
      })
      if (existEmail) throw new ApiError(StatusCodes.CONFLICT, 'Email đã tồn tại!')
    }

    return await GET_DB().$transaction(async (tx) => {
      // 1. Update Account Profile
      const updatedAccount = await tx.account.update({
        where: { Id: id },
        data: {
          FullName: reqBody.fullName,
          Email: reqBody.email,
          Phone: reqBody.phone,
          Address: reqBody.address,
          IdCity: reqBody.idCity ? parseInt(reqBody.idCity) : null,
          IdDistrict: reqBody.idDistrict ? parseInt(reqBody.idDistrict) : null,
          IdGender: reqBody.idGender ? parseInt(reqBody.idGender) : null,
          BirthDay: reqBody.birthDay ? new Date(reqBody.birthDay) : null,
          LinkAvatar: reqBody.linkAvatar || reqBody.LinkAvatar,
          Modified_By: 'Admin',
          Modified_Date: new Date()
        }
      })

      // 2. Update Salary
      if (salary) {
        // Xóa cũ tạo mới hoặc update nếu tồn tại
        const existingSalary = await tx.accountSalary.findFirst({ where: { IdAccount: id, Deleted: 0 } })
        const salaryPayload = {
          TypeTeacher: 1, // Enforced to 1 (Official Teacher)
          TypeSalary: parseInt(salary.typeSalary || salary.TypeSalary) || 1, // Determined by client input (1: Fixed, 2: Hourly)
          IdMonetaryUnit: (salary.idMonetaryUnit || salary.IdMonetaryUnit) ? parseInt(salary.idMonetaryUnit || salary.IdMonetaryUnit) : 1,
          SalaryPerMonth: (salary.salaryPerMonth || salary.SalaryPerMonth) ? parseFloat(salary.salaryPerMonth || salary.SalaryPerMonth) : 0,
          SalaryPerHour: (salary.salaryPerHour || salary.SalaryPerHour) ? parseFloat(salary.salaryPerHour || salary.SalaryPerHour) : 0,
          WarrantyHours: (salary.warrantyHours || salary.WarrantyHours) ? parseInt(salary.warrantyHours || salary.WarrantyHours) : 0,
          IdPaymentMethod: (salary.idPaymentMethod !== undefined && salary.idPaymentMethod !== null && salary.idPaymentMethod !== '') ? parseInt(salary.idPaymentMethod) : (salary.IdPaymentMethod ? parseInt(salary.IdPaymentMethod) : null),
          NumberAccountBank: (salary.bankAccount || salary.NumberAccountBank) ? parseInt(salary.bankAccount || salary.NumberAccountBank) : null,
          Modified_By: 'Admin',
          Modified_Date: new Date()
        }

        if (existingSalary) {
          await tx.accountSalary.update({
            where: { Id: existingSalary.Id },
            data: salaryPayload
          })
        } else {
          await tx.accountSalary.create({
            data: {
              ...salaryPayload,
              IdAccount: id,
              Deleted: 0,
              Created_By: 'Admin',
              Created_Date: new Date()
            }
          })
        }
      }

      // 3. Update Certificates (Hard delete sync as schema lacks Deleted column)
      if (certificates) {
        // Xóa tất cả chứng chỉ cũ của user này và tạo lại (Hard delete)
        await tx.accountCertificate.deleteMany({ where: { IdAccount: id } })

        if (certificates.length > 0) {
          const certData = certificates.map(cert => ({
            IdAccount: id,
            CertificateName: cert.name || cert.CertificateName,
            Organization: cert.org || cert.Organization,
            IssueDate: cert.issueDate ? new Date(cert.issueDate) : (cert.IssueDate ? new Date(cert.IssueDate) : null),
            ExpiryDate: cert.expiryDate ? new Date(cert.expiryDate) : (cert.ExpiryDate ? new Date(cert.ExpiryDate) : null),
            Description: cert.description || cert.Description,
            CreatedBy: 'Admin',
            CreatedDate: new Date()
          }))
          await tx.accountCertificate.createMany({ data: certData })
        }
      }

      // 4. Update Working Times (Soft delete sync)
      if (reqBody.workingTimes) {
        const wtList = reqBody.workingTimes
        for (let i = 0; i < wtList.length; i++) {
          for (let j = i + 1; j < wtList.length; j++) {
            if (wtList[i].DayOfWeek === wtList[j].DayOfWeek) {
              if (wtList[i].FromTime < wtList[j].ToTime && wtList[i].ToTime > wtList[j].FromTime) {
                const dayName = wtList[i].DayOfWeek === 1 ? 'Chủ Nhật' : `Thứ ${wtList[i].DayOfWeek}`
                throw new ApiError(StatusCodes.BAD_REQUEST, `Lịch dạy ngày ${dayName} bị trùng lặp khung giờ (${wtList[i].FromTime}-${wtList[i].ToTime} và ${wtList[j].FromTime}-${wtList[j].ToTime})`)
              }
            }
          }
        }
        await tx.accountWorkingTime.updateMany({
          where: { IdAccount: id, Deleted: { not: 1 } },
          data: {
            Deleted: 1,
            Modified_By: 'Admin',
            Modified_Date: new Date()
          }
        })

        for (const wt of reqBody.workingTimes) {
          let fromDate = null
          let toDate = null

          if (wt.FromTime) {
            const [h, m] = wt.FromTime.split(':').map(Number)
            fromDate = new Date(Date.UTC(1970, 0, 1, h, m))
          }
          if (wt.ToTime) {
            const [h, m] = wt.ToTime.split(':').map(Number)
            toDate = new Date(Date.UTC(1970, 0, 1, h, m))
          }

          await tx.accountWorkingTime.create({
            data: {
              IdAccount: id,
              DayOfWeek: wt.DayOfWeek,
              FromTime: fromDate,
              ToTime: toDate,
              Deleted: 0,
              Created_By: 'Admin',
              Created_Date: new Date()
            }
          })
        }
      }

      return pickUser(updatedAccount)
    })
  } catch (error) { throw error }
}

const deleteTeacher = async (id) => {
  try {
    await accountModel.update(id, { Deleted: 1 })
  } catch (error) { throw error }
}

const getTeachers = async (params) => {
  try {
    return await accountModel.getTeachers(params)
  } catch (error) { throw error }
}

const getAllUsers = async (params) => {
  try {
    return await accountModel.getAllUsers(params)
  } catch (error) { throw error }
}

const getUserById = async (userId) => {
  try {
    return await GET_DB().account.findUnique({
      where: { Id: userId },
      include: {
        AccountInRole: { include: { AccountRole: true } },
        AccountSalary: true,
        AccountCertificate: true
      }
    })
  } catch (error) { throw error }
}

const createUser = async (fullData) => {
  try {
    const { roleName, salary, certificates, ...userData } = fullData

    // Generate Salt/Hash password
    const salt = bcrypt.genSaltSync(10)
    const hashedPassword = bcrypt.hashSync(userData.Password, salt)

    const finalData = {
      ...userData,
      Password: hashedPassword,
      PasswordSalt: salt,
      Active: userData.Active ?? true,
      Deleted: 0,
      Created_Date: new Date()
    }

    return await accountModel.createWithRole(finalData, roleName, null, { salary, certificates })
  } catch (error) { throw error }
}

const getUserStats = async () => {
  try {
    return await accountModel.getUserStats()
  } catch (error) { throw error }
}

const updateUser = async (userId, fullData) => {
  try {
    const { roleName, salary, certificates, AccountInRole, AccountSalary, AccountCertificate, ...updateData } = fullData

    const finalData = { ...updateData }

    if (finalData.Password) {
      const salt = bcrypt.genSaltSync(10)
      finalData.Password = bcrypt.hashSync(finalData.Password, salt)
      finalData.PasswordSalt = salt
    } else {
      delete finalData.Password
      delete finalData.PasswordSalt
    }

    if (finalData.BirthDay) {
      finalData.BirthDay = new Date(finalData.BirthDay)
    }

    // Clean up relation objects that might come from frontend
    delete finalData.AccountInRole
    delete finalData.AccountSalary
    delete finalData.AccountCertificate

    return await accountModel.update(userId, finalData)
  } catch (error) { throw error }
}

const deleteUser = async (userId) => {
  try {
    return await accountModel.deleteAccount(userId)
  } catch (error) { throw error }
}

export const accountService = {
  createNew,
  verifyAccount,
  login,
  refreshToken,
  update,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getTeachers,
  getAllUsers,
  createUser,
  getUserStats,
  updateUser,
  deleteUser,
  getUserById
}