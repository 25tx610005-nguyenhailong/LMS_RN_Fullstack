import Joi from 'joi'
import { EMAIL_RULE, EMAIL_RULE_MESSAGE } from '~/utils/validators'
import { GET_DB } from '~/config/prisma'

const ACCOUNT_COLLECTION_SCHEMA = Joi.object({
  Id: Joi.string().required(), // UniqueIdentifier (UUID)
  UserName: Joi.string().required().min(3).max(100).trim().strict(),
  FullName: Joi.string().allow(null, '').max(100).trim().strict(),
  BirthDay: Joi.date().allow(null),
  IdGender: Joi.number().integer().allow(null),
  Password: Joi.string().required().max(128),
  PasswordSalt: Joi.string().required().max(128),
  Active: Joi.boolean().default(false),
  ActiveToken: Joi.string().allow(null),
  Phone: Joi.string().allow(null, '').max(11),
  Email: Joi.string().required().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE).max(100),
  Provider: Joi.string().allow(null, '').max(20),
  Address: Joi.string().allow(null, '').max(500),
  IdCity: Joi.number().integer().allow(null),
  IdDistrict: Joi.number().integer().allow(null),
  LinkAvatar: Joi.string().allow(null, '').max(500),
  Deleted: Joi.number().integer().default(0),
  Created_By: Joi.string().allow(null, '').max(50),
  Created_Date: Joi.date().default(Date.now),
  Modified_By: Joi.string().allow(null, '').max(50),
  Modified_Date: Joi.date().allow(null)
})

const INVALID_UPDATE_FIELDS = ['Id', 'UserName', 'Created_Date', 'roleName', 'salary', 'certificates']

const validateBeforeCreate = async (data) => {
  return await ACCOUNT_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    return await GET_DB().account.create({
      data: validData
    })
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (accountId) => {
  try {
    return await GET_DB().account.findUnique({
      where: { Id: accountId }
    })
  } catch (error) { throw new Error(error) }
}

const findOneByEmail = async (emailValue) => {
  try {
    return await GET_DB().account.findFirst({
      where: { Email: emailValue }
    })
  } catch (error) { throw new Error(error) }
}

const findOneByUsername = async (usernameValue) => {
  try {
    return await GET_DB().account.findFirst({
      where: { UserName: usernameValue },
      include: {
        AccountInRole: {
          include: { AccountRole: true }
        }
      }
    })
  } catch (error) { throw new Error(error) }
}

const update = async (accountId, updateData) => {
  try {
    const dataToUpdate = { ...updateData }
    Object.keys(dataToUpdate).forEach(fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete dataToUpdate[fieldName]
      }
    })

    return await GET_DB().account.update({
      where: { Id: accountId },
      data: {
        ...dataToUpdate,
        Modified_Date: new Date()
      }
    })
  } catch (error) {
    throw new Error(error)
  }
}

const getRightsByAccountId = async (accountId) => {
  try {
    const account = await GET_DB().account.findUnique({
      where: { Id: accountId },
      include: {
        AccountInRole: {
          where: { Deleted: 0 },
          include: {
            AccountRole: {
              where: { Deleted: 0 },
              include: {
                AccountRightInRole: {
                  where: { Deleted: 0 },
                  include: {
                    AccountRight: {
                      where: { Deleted: 0 }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!account) return []

    const rights = new Set()
    account.AccountInRole.forEach(air => {
      air.AccountRole.AccountRightInRole.forEach(arrir => {
        if (arrir.AccountRight?.RightsName) {
          rights.add(arrir.AccountRight.RightsName)
        }
      })
    })

    return Array.from(rights)
  } catch (error) {
    throw new Error(error)
  }
}

const getAllUsers = async ({ page = 1, limit = 10, search = '', role = '' }) => {
  try {
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const take = parseInt(limit)

    const where = {
      AND: [
        {
          OR: [
            { Deleted: 0 },
            { Deleted: null }
          ]
        }
      ]
    }

    if (search) {
      where.AND.push({
        OR: [
          { UserName: { contains: search } },
          { FullName: { contains: search } },
          { Email: { contains: search } }
        ]
      })
    }

    if (role) {
      where.AND.push({
        AccountInRole: { some: { AccountRole: { Name: role } } }
      })
    }

    const [users, total] = await Promise.all([
      GET_DB().account.findMany({
        where,
        skip,
        take,
        include: {
          AccountSalary: true,
          AccountInRole: {
            include: { AccountRole: true }
          }
        },
        orderBy: { Created_Date: 'desc' }
      }),
      GET_DB().account.count({ where })
    ])

    return { users, total }
  } catch (error) { throw new Error(error) }
}

const createWithRole = async (data, roleName, schoolId = null, extraData = {}) => {
  try {
    const validData = await validateBeforeCreate(data)
    return await GET_DB().$transaction(async (tx) => {
      // 1. Create Account
      const createdAccount = await tx.account.create({ data: validData })
      const creator = data.Created_By || 'System'

      // 2. Assign Role (AccountInRole)
      const role = await tx.accountRole.findFirst({ where: { Name: roleName } })
      if (role) {
        await tx.accountInRole.create({
          data: {
            IdAccount: createdAccount.Id,
            IdAccountRole: role.Id,
            Deleted: 0,
            Created_By: creator
          }
        })
      }

      // 3. Link to School (SchoolTeacher)
      if (schoolId) {
        await tx.schoolTeacher.create({
          data: {
            IdSchool: parseInt(schoolId),
            IdAccount: createdAccount.Id,
            Deleted: 0,
            Created_By: creator
          }
        })
      }

      // 4. Initialize AccountSalary
      const salaryData = extraData.salary || {}
      if (roleName && roleName.toUpperCase() === 'TEACHER') {
        await tx.accountSalary.create({
          data: {
            IdAccount: createdAccount.Id,
            TypeTeacher: 1, // Enforced to 1 (Official Teacher)
            TypeSalary: parseInt(salaryData.typeSalary || salaryData.TypeSalary) || 1, // Determined by client (1: Fixed, 2: Hourly)
            IdMonetaryUnit: (salaryData.idMonetaryUnit || salaryData.IdMonetaryUnit) ? parseInt(salaryData.idMonetaryUnit || salaryData.IdMonetaryUnit) : 1,
            SalaryPerMonth: (salaryData.salaryPerMonth || salaryData.SalaryPerMonth) ? parseFloat(salaryData.salaryPerMonth || salaryData.SalaryPerMonth) : 0,
            SalaryPerHour: (salaryData.salaryPerHour || salaryData.SalaryPerHour) ? parseFloat(salaryData.salaryPerHour || salaryData.SalaryPerHour) : 0,
            WarrantyHours: (salaryData.warrantyHours || salaryData.WarrantyHours) ? parseInt(salaryData.warrantyHours || salaryData.WarrantyHours) : 0,
            IdPaymentMethod: (salaryData.idPaymentMethod !== undefined && salaryData.idPaymentMethod !== null && salaryData.idPaymentMethod !== '') ? parseInt(salaryData.idPaymentMethod) : (salaryData.IdPaymentMethod ? parseInt(salaryData.IdPaymentMethod) : null),
            NumberAccountBank: (salaryData.bankAccount || salaryData.NumberAccountBank) ? parseInt(salaryData.bankAccount || salaryData.NumberAccountBank) : null,
            Deleted: 0,
            Created_By: creator,
            Created_Date: new Date()
          }
        })
      }

      // 6. Initialize AccountWorkingTime
      const workingTimes = extraData.workingTimes || []
      if (workingTimes.length > 0) {
        // Validate overlaps
        for (let i = 0; i < workingTimes.length; i++) {
          for (let j = i + 1; j < workingTimes.length; j++) {
            if (workingTimes[i].DayOfWeek === workingTimes[j].DayOfWeek) {
              if (workingTimes[i].FromTime < workingTimes[j].ToTime && workingTimes[i].ToTime > workingTimes[j].FromTime) {
                const dayName = workingTimes[i].DayOfWeek === 1 ? 'Chủ Nhật' : `Thứ ${workingTimes[i].DayOfWeek}`
                throw new Error(`Lịch dạy ngày ${dayName} bị trùng lặp khung giờ (${workingTimes[i].FromTime}-${workingTimes[i].ToTime} và ${workingTimes[j].FromTime}-${workingTimes[j].ToTime})`)
              }
            }
          }
        }

        for (const wt of workingTimes) {
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
              IdAccount: createdAccount.Id,
              DayOfWeek: wt.DayOfWeek,
              FromTime: fromDate,
              ToTime: toDate,
              Deleted: 0,
              Created_By: creator,
              Created_Date: new Date()
            }
          })
        }
      }

      // 7. Initialize AccountCertificate
      const certificates = extraData.certificates || []
      if (certificates.length > 0) {
        for (const cert of certificates) {
          await tx.accountCertificate.create({
            data: {
              IdAccount: createdAccount.Id,
              CertificateName: cert.name || cert.CertificateName,
              Organization: cert.org || cert.Organization,
              IssueDate: cert.issueDate ? new Date(cert.issueDate) : (cert.IssueDate ? new Date(cert.IssueDate) : null),
              ExpiryDate: cert.expiryDate ? new Date(cert.expiryDate) : (cert.ExpiryDate ? new Date(cert.ExpiryDate) : null),
              Description: cert.description || cert.Description,
              CreatedBy: creator,
              CreatedDate: new Date()
            }
          })
        }
      }

      return createdAccount
    })
  } catch (error) { throw new Error(error) }
}

const getTeachers = async ({ page = 1, limit = 10, search = '', teacherType = '', address = '', active = '', cityId = '', districtId = '' }) => {
  try {
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const take = parseInt(limit)

    const where = {
      AND: [
        {
          OR: [
            { Deleted: 0 },
            { Deleted: null }
          ]
        },
        { AccountInRole: { some: { AccountRole: { Name: 'TEACHER' } } } }
      ]
    }

    if (search) {
      where.OR = [
        { FullName: { contains: search } },
        { UserName: { contains: search } },
        { Email: { contains: search } }
      ]
    }

    if (address) {
      where.Address = { contains: address }
    }

    if (teacherType) {
      where.AccountSalary = { some: { TypeSalary: parseInt(teacherType) } }
    }

    if (active === 'true' || active === '1') {
      where.Active = true
    } else if (active === 'false' || active === '0') {
      where.Active = false
    }

    if (cityId) {
      where.IdCity = parseInt(cityId)
    }

    if (districtId) {
      where.IdDistrict = parseInt(districtId)
    }

    const [teachers, total] = await Promise.all([
      GET_DB().account.findMany({
        where,
        skip,
        take,
        include: {
          AccountSalary: true,
          AccountWorkingTime: { where: { OR: [{ Deleted: 0 }, { Deleted: null }] } },
          AccountCertificate: true,
          AccountInRole: { include: { AccountRole: true } }
        },
        orderBy: { Created_Date: 'desc' }
      }),
      GET_DB().account.count({ where })
    ])

    return { teachers, total }
  } catch (error) {
    throw new Error(error)
  }
}

const getUserStats = async () => {
  try {
    const notDeleted = {
      OR: [
        { Deleted: 0 },
        { Deleted: null }
      ]
    }
    const [total, active, teachers, students] = await Promise.all([
      GET_DB().account.count({ where: notDeleted }),
      GET_DB().account.count({ where: { ...notDeleted, Active: true } }),
      GET_DB().account.count({ where: { ...notDeleted, AccountInRole: { some: { AccountRole: { Name: 'Teacher' } } } } }),
      GET_DB().account.count({ where: { ...notDeleted, AccountInRole: { some: { AccountRole: { Name: 'Student' } } } } })
    ])
    return { total, active, teachers, students }
  } catch (error) { throw new Error(error) }
}

const deleteAccount = async (accountId) => {
  try {
    return await GET_DB().account.update({
      where: { Id: accountId },
      data: { Deleted: 1 }
    })
  } catch (error) { throw new Error(error) }
}

export const accountModel = {
  createNew,
  update,
  findOneById,
  findOneByEmail,
  findOneByUsername,
  getRightsByAccountId,
  getAllUsers,
  getTeachers,
  getUserStats,
  createWithRole,
  deleteAccount
}