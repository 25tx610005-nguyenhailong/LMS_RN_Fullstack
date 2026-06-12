USE [LearningManagementSystem]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Account](
	[Id] [uniqueidentifier] NOT NULL,
	[UserName] [nvarchar](100) NULL,
	[FullName] [nvarchar](100) NULL,
	[BirthDay] [date] NULL,
	[IdGender] [int] NULL,
	[PasswordSalt] [nvarchar](128) NULL,
	[Password] [nvarchar](128) NULL,
	[Active] [bit] NULL,
	[ActiveToken] [uniqueidentifier] NULL,
	[Phone] [nvarchar](11) NULL,
	[Email] [nvarchar](100) NULL,
	[Provider] [nvarchar](20) NULL,
	[Address] [nvarchar](500) NULL,
	[IdCity] [int] NULL,
	[IdDistrict] [int] NULL,
	[IdAccountType] [int] NULL,
	[LinkAvatar] [nvarchar](500) NULL,
	[Deleted] [int] NULL,
	[Created_By] [nvarchar](50) NULL,
	[Created_Date] [datetime] NULL,
	[Modified_By] [nvarchar](50) NULL,
	[Modified_Date] [datetime] NULL,
 CONSTRAINT [PK_Account] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[AccountCertificate](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[IdAccount] [uniqueidentifier] NULL,
	[CertificateName] [nvarchar](255) NULL,
	[Organization] [nvarchar](255) NULL,
	[IssueDate] [date] NULL,
	[ExpiryDate] [date] NULL,
	[Description] [nvarchar](500) NULL,
	[FileUrl] [nvarchar](500) NULL,
	[CreatedDate] [datetime] NULL,
	[CreatedBy] [nvarchar](100) NULL,
 CONSTRAINT [PK_AccountCertificate] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[AccountInRole](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[IdAccount] [uniqueidentifier] NULL,
	[IdAccountRole] [int] NULL,
	[Deleted] [int] NULL,
	[Created_By] [nvarchar](50) NULL,
	[Created_Date] [datetime] NULL,
	[Modified_By] [nvarchar](50) NULL,
	[Modified_Date] [datetime] NULL,
 CONSTRAINT [PK_AccountInRole] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[AccountRight](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Indexes] [int] NULL,
	[RightsName] [nvarchar](50) NULL,
	[Label] [nvarchar](50) NULL,
	[RightsDescription] [nvarchar](500) NULL,
	[IdRightCategory] [int] NULL,
	[Action] [nvarchar](50) NULL,
	[Controller] [nvarchar](50) NULL,
	[Area] [nvarchar](50) NULL,
	[IsDefault] [bit] NULL,
	[OrderIndex] [int] NULL,
	[Deleted] [int] NULL,
	[Created_By] [nvarchar](50) NULL,
	[Created_Date] [datetime] NULL,
	[Modified_By] [nvarchar](50) NULL,
	[Modified_Date] [datetime] NULL,
 CONSTRAINT [PK_AccountRight] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[AccountRightInRole](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[IdAccountRole] [int] NULL,
	[IdAccountRight] [int] NULL,
	[Deleted] [int] NULL,
	[Created_By] [nvarchar](50) NULL,
	[Created_Date] [datetime] NULL,
	[Modified_By] [nvarchar](50) NULL,
	[Modified_Date] [datetime] NULL,
 CONSTRAINT [PK_AccountRightInRole] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[AccountRole](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Name] [nvarchar](100) NULL,
	[Deleted] [int] NULL,
	[Created_By] [nvarchar](50) NULL,
	[Created_Date] [datetime] NULL,
	[Modified_By] [nvarchar](50) NULL,
	[Modified_Date] [datetime] NULL,
 CONSTRAINT [PK_AccountRole] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[AccountSalary](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[IdAccount] [uniqueidentifier] NULL,
	[TypeSalary] [tinyint] NULL,
	[TypeTeacher] [tinyint] NULL,
	[TypePaySalary] [tinyint] NULL,
	[IdMonetaryUnit] [tinyint] NULL,
	[SalaryPerPeriod] [decimal](10, 0) NULL,
	[SalaryPerHour] [decimal](10, 0) NULL,
	[SalaryPerMonth] [decimal](10, 0) NULL,
	[WarrantyHours] [int] NULL,
	[IdPaymentMethod] [int] NULL,
	[NumberAccountBank] [int] NULL,
	[Deleted] [int] NULL,
	[Created_By] [nvarchar](50) NULL,
	[Created_Date] [datetime] NULL,
	[Modified_By] [nvarchar](50) NULL,
	[Modified_Date] [datetime] NULL,
 CONSTRAINT [PK_AccountSalary] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[AccountStudent](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[IdAccount] [uniqueidentifier] NULL,
	[Name] [nvarchar](50) NULL,
	[Gender] [int] NULL,
	[BirthDay] [date] NULL,
	[Deleted] [int] NULL,
	[Created_By] [nvarchar](50) NULL,
	[Created_Date] [datetime] NULL,
	[Modified_By] [nvarchar](50) NULL,
	[Modified_Date] [datetime] NULL,
 CONSTRAINT [PK_AccountStudent] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[AccountStudentParent](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[IdAccountStudent] [int] NULL,
	[Name] [nvarchar](50) NULL,
	[FullName] [nvarchar](100) NULL,
	[BirthDay] [datetime] NULL,
	[IdGender] [int] NULL,
	[Phone] [nvarchar](11) NULL,
	[Email] [nvarchar](100) NULL,
	[Address] [nvarchar](500) NULL,
	[IdCity] [int] NULL,
	[IdDistrict] [int] NULL,
	[Deleted] [int] NULL,
	[Created_By] [nvarchar](50) NULL,
	[Created_Date] [datetime] NULL,
	[Modified_By] [nvarchar](50) NULL,
	[Modified_Date] [datetime] NULL,
 CONSTRAINT [PK_AccountStudentParent] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[AccountType](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Name] [nvarchar](100) NULL,
	[Deleted] [int] NULL,
	[Created_By] [nvarchar](50) NULL,
	[Created_Date] [datetime] NULL,
	[Modified_By] [nvarchar](50) NULL,
	[Modified_Date] [datetime] NULL,
 CONSTRAINT [PK_AccountType] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[AccountWorkingTime](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[IdAccount] [uniqueidentifier] NULL,
	[DayOfWeek] [tinyint] NULL,
	[FromTime] [time](7) NULL,
	[ToTime] [time](7) NULL,
	[Deleted] [int] NULL,
	[Created_By] [nvarchar](50) NULL,
	[Created_Date] [datetime] NULL,
	[Modified_By] [nvarchar](50) NULL,
	[Modified_Date] [datetime] NULL,
 CONSTRAINT [PK_AccountWorkingTime] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[City](
	[Id] [int] NOT NULL,
	[Name] [nvarchar](50) NULL,
	[Deleted] [int] NULL,
	[Created_By] [nvarchar](50) NULL,
	[Created_Date] [datetime] NULL,
	[Modified_By] [nvarchar](50) NULL,
	[Modified_Date] [datetime] NULL,
 CONSTRAINT [PK_City] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Course](
	[Id] [nvarchar](20) NOT NULL,
	[Name] [nvarchar](200) NULL,
	[IdSchool] [int] NOT NULL,
	[IdLevel] [int] NOT NULL,
	[LinkEnrol] [nvarchar](500) NULL,
	[IsOnline] [bit] NULL,
	[LinkOnline] [varchar](500) NULL,
	[Thumbnail] [varchar](500) NULL,
	[Deleted] [int] NULL,
	[Created_By] [nvarchar](50) NULL,
	[Created_Date] [datetime] NULL,
	[Modified_By] [nvarchar](50) NULL,
	[Modified_Date] [datetime] NULL,
 CONSTRAINT [PK_Course] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CourseAssignment](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[IdCourse] [nvarchar](20) NULL,
	[AssignmentTitle] [nvarchar](500) NULL,
	[AssignmentFile] [nvarchar](500) NULL,
	[AssignmentDescription] [nvarchar](max) NULL,
	[StartDate] [datetime] NULL,
	[CloseDate] [datetime] NULL,
	[IdTheme] [int] NULL,
	[IdLesson] [int] NULL,
	[ExampleType] [int] NULL,
	[Deleted] [int] NULL,
	[Created_By] [nvarchar](50) NULL,
	[Created_Date] [datetime] NULL,
	[Modified_By] [nvarchar](50) NULL,
	[Modified_Date] [datetime] NULL,
 CONSTRAINT [PK_Assignment] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CourseAssignmentStudent](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[IdAssignment] [int] NULL,
	[IdAccountStudent] [uniqueidentifier] NULL,
	[IsAsign] [int] NULL,
	[Deleted] [int] NULL,
	[Created_By] [nvarchar](50) NULL,
	[Created_Date] [datetime] NULL,
	[Modified_By] [nvarchar](50) NULL,
	[Modified_Date] [datetime] NULL,
 CONSTRAINT [PK_AssignmentStudent] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CourseAssignmentStudentEvaluation](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[IdCourseAssignmentStudent] [int] NULL,
	[IdAccountStudent] [uniqueidentifier] NULL,
	[Score] [float] NULL,
	[Remake] [nvarchar](max) NULL,
	[Deleted] [int] NULL,
	[Created_By] [nvarchar](50) NULL,
	[Created_Date] [datetime] NULL,
	[Modified_By] [nvarchar](50) NULL,
	[Modified_Date] [datetime] NULL,
 CONSTRAINT [PK_CourseAssignmentStudentEvaluation] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CourseAssignmentSubmission](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[IdCourse] [nvarchar](20) NULL,
	[IdCourseAssignmentStudent] [int] NULL,
	[IdAccountStudent] [uniqueidentifier] NULL,
	[FileUrl] [nvarchar](500) NULL,
	[FileName] [nvarchar](250) NULL,
	[IsLate] [bit] NULL,
	[Deleted] [int] NULL,
	[Created_By] [nvarchar](50) NULL,
	[Created_Date] [datetime] NULL,
	[Modified_By] [nvarchar](50) NULL,
	[Modified_Date] [datetime] NULL,
 CONSTRAINT [PK_CourseAssignmentSubmission] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CourseAttendanceStudent](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[IdAccount] [uniqueidentifier] NULL,
	[IdAccountChildren] [int] NULL,
	[IdCourse] [nvarchar](20) NULL,
	[IdLevel] [int] NULL,
	[IdTheme] [int] NULL,
	[IdLesson] [int] NULL,
	[StartDate] [datetime] NULL,
	[Status] [tinyint] NULL,
	[Deleted] [int] NULL,
	[Created_By] [nvarchar](50) NULL,
	[Created_Date] [datetime] NULL,
	[Modified_By] [nvarchar](50) NULL,
	[Modified_Date] [datetime] NULL,
 CONSTRAINT [PK_CourseAttendanceStudent] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CourseAttendanceTeacher](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[IdAccount] [uniqueidentifier] NULL,
	[IdCourse] [nvarchar](20) NULL,
	[IdLevel] [int] NULL,
	[IdTheme] [int] NULL,
	[IdLesson] [int] NULL,
	[StartDate] [datetime] NULL,
	[Deleted] [int] NULL,
	[Created_By] [nvarchar](50) NULL,
	[Created_Date] [datetime] NULL,
	[Modified_By] [nvarchar](50) NULL,
	[Modified_Date] [datetime] NULL,
 CONSTRAINT [PK_CourseAttendanceTeacher] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CourseMaterial](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[IdCourse] [nvarchar](20) NULL,
	[IdMaterial] [int] NULL,
	[Deleted] [int] NULL,
	[Created_By] [nvarchar](50) NULL,
	[Created_Date] [datetime] NULL,
	[Modified_By] [nvarchar](50) NULL,
	[Modified_Date] [datetime] NULL,
 CONSTRAINT [PK_CourseMaterial] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CourseSchedule](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[IdCourse] [nvarchar](20) NULL,
	[IdAccountTeacher] [uniqueidentifier] NULL,
	[FromDate] [date] NULL,
	[ToDate] [date] NULL,
	[Schedule] [nvarchar](7) NULL,
	[FromTime] [time](7) NULL,
	[ToTime] [time](7) NULL,
	[Deleted] [int] NULL,
	[Created_By] [nvarchar](50) NULL,
	[Created_Date] [datetime] NULL,
	[Modified_By] [nvarchar](50) NULL,
	[Modified_Date] [datetime] NULL,
 CONSTRAINT [PK_CourseSchedule] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CourseScheduleDetail](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[IdCourseSchedule] [int] NULL,
	[IdCourse] [nvarchar](20) NULL,
	[IdAccountTeacher] [uniqueidentifier] NULL,
	[Date] [date] NULL,
	[FromTime] [time](7) NULL,
	[ToTime] [time](7) NULL,
	[FromPeriodIndexes] [int] NULL,
	[ToPeriodIndexes] [int] NULL,
	[Status] [tinyint] NULL,
	[Deleted] [int] NULL,
	[Created_By] [nvarchar](50) NULL,
	[Created_Date] [datetime] NULL,
	[Modified_By] [nvarchar](50) NULL,
	[Modified_Date] [datetime] NULL,
 CONSTRAINT [PK_CourseScheduleDetail] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CourseStudent](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[IdCourse] [nvarchar](20) NULL,
	[IdAccountStudent] [uniqueidentifier] NULL,
	[IsApprove] [int] NULL,
	[ApproveDate] [datetime] NULL,
	[Deleted] [int] NULL,
	[Created_By] [nvarchar](50) NULL,
	[Modified_By] [nvarchar](50) NULL,
	[Modified_Date] [datetime] NULL,
	[Created_Date] [datetime] NULL,
 CONSTRAINT [PK_CourseStudent] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CourseStudentStatus](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[IdCourseStudent] [int] NULL,
	[Note] [nvarchar](500) NULL,
	[Status] [int] NULL,
	[Deleted] [int] NULL,
	[Created_By] [nvarchar](50) NULL,
	[Created_Date] [datetime] NULL,
	[Modified_By] [nvarchar](50) NULL,
	[Modified_Date] [datetime] NULL,
 CONSTRAINT [PK_CourseStudentDetail] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CurrencyExchange](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Currency] [nvarchar](100) NULL,
	[ExchangeRate] [decimal](10, 0) NULL,
	[Deleted] [int] NULL,
	[Created_By] [nvarchar](50) NULL,
	[Created_Date] [datetime] NULL,
	[Modified_By] [nvarchar](50) NULL,
	[Modified_Date] [datetime] NULL,
 CONSTRAINT [PK_MonetaryExchange] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[District](
	[Id] [int] NOT NULL,
	[Name] [nvarchar](50) NULL,
	[IdCity] [int] NULL,
	[Deleted] [int] NULL,
	[Created_By] [nvarchar](50) NULL,
	[Created_Date] [datetime] NULL,
	[Modified_By] [nvarchar](50) NULL,
	[Modified_Date] [datetime] NULL,
 CONSTRAINT [PK_District] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Gender](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Name] [nvarchar](30) NULL,
	[Deleted] [int] NULL,
	[Created_By] [nvarchar](50) NULL,
	[Created_Date] [datetime] NULL,
	[Modified_By] [nvarchar](50) NULL,
	[Modified_Date] [datetime] NULL,
 CONSTRAINT [PK_Gender] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Level](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Name] [nvarchar](100) NULL,
	[Deleted] [int] NULL,
	[Created_By] [nvarchar](50) NULL,
	[Created_Date] [datetime] NULL,
	[Modified_By] [nvarchar](50) NULL,
	[Modified_Date] [datetime] NULL,
 CONSTRAINT [PK_LevelCategory] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Material](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Name] [nvarchar](100) NULL,
	[IdLevel] [int] NULL,
	[IdTheme] [int] NULL,
	[IdLesson] [int] NULL,
	[Types] [int] NULL,
	[ImageUrl] [nvarchar](255) NULL,
	[Deleted] [int] NULL,
	[Created_By] [nvarchar](50) NULL,
	[Created_Date] [datetime] NULL,
	[Modified_By] [nvarchar](50) NULL,
	[Modified_Date] [datetime] NULL,
 CONSTRAINT [PK_Material] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MaterialLesson](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[IdMaterial] [int] NULL,
	[IdLesson] [int] NULL,
	[Name] [nvarchar](100) NULL,
	[IdLevel] [int] NULL,
	[IdTheme] [int] NULL,
	[FolderName] [nvarchar](50) NULL,
	[Priority] [int] NULL,
	[Deleted] [int] NULL,
	[Created_By] [nvarchar](50) NULL,
	[Created_Date] [datetime] NULL,
	[Modified_By] [nvarchar](50) NULL,
	[Modified_Date] [datetime] NULL,
 CONSTRAINT [PK_MaterialLesson] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MaterialTheme](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[IdMaterial] [int] NULL,
	[IdTheme] [int] NULL,
	[Name] [nvarchar](100) NULL,
	[Title] [nvarchar](100) NULL,
	[IdLevel] [int] NULL,
	[Version] [int] NULL,
	[Priority] [int] NULL,
	[FolderName] [nvarchar](255) NULL,
	[Deleted] [int] NULL,
	[Created_By] [nvarchar](50) NULL,
	[Created_Date] [datetime] NULL,
	[Modified_By] [nvarchar](50) NULL,
	[Modified_Date] [datetime] NULL,
 CONSTRAINT [PK_MaterialTheme] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PaymentMethod](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Name] [nvarchar](100) NULL,
	[Deleted] [int] NULL,
	[Created_By] [nvarchar](50) NULL,
	[Created_Date] [datetime] NULL,
	[Modified_By] [nvarchar](50) NULL,
	[Modified_Date] [datetime] NULL,
 CONSTRAINT [PK_MethodPayment] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[School](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Name] [nvarchar](100) NULL,
	[Phone] [nvarchar](11) NULL,
	[Address] [nvarchar](500) NULL,
	[IdCity] [int] NULL,
	[IdDistrict] [int] NULL,
	[Deleted] [int] NULL,
	[Created_By] [nvarchar](50) NULL,
	[Created_Date] [datetime] NULL,
	[Modified_By] [nvarchar](50) NULL,
	[Modified_Date] [datetime] NULL,
 CONSTRAINT [PK_School] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[AccountCertificate]  WITH CHECK ADD  CONSTRAINT [FK_AccountCertificate_Account] FOREIGN KEY([IdAccount])
REFERENCES [dbo].[Account] ([Id])
GO
ALTER TABLE [dbo].[AccountInRole]  WITH CHECK ADD  CONSTRAINT [FK_AccountInRole_Account] FOREIGN KEY([IdAccount])
REFERENCES [dbo].[Account] ([Id])
GO
ALTER TABLE [dbo].[AccountInRole]  WITH CHECK ADD  CONSTRAINT [FK_AccountInRole_AccountRole] FOREIGN KEY([IdAccountRole])
REFERENCES [dbo].[AccountRole] ([Id])
GO
ALTER TABLE [dbo].[AccountRightInRole]  WITH CHECK ADD  CONSTRAINT [FK_AccountRightInRole_AccountRight] FOREIGN KEY([IdAccountRight])
REFERENCES [dbo].[AccountRight] ([Id])
GO
ALTER TABLE [dbo].[AccountRightInRole]  WITH CHECK ADD  CONSTRAINT [FK_AccountRightInRole_AccountRole] FOREIGN KEY([IdAccountRole])
REFERENCES [dbo].[AccountRole] ([Id])
GO
ALTER TABLE [dbo].[AccountSalary]  WITH CHECK ADD  CONSTRAINT [FK_AccountSalary_Account] FOREIGN KEY([IdAccount])
REFERENCES [dbo].[Account] ([Id])
GO
ALTER TABLE [dbo].[AccountStudent]  WITH CHECK ADD  CONSTRAINT [FK_AccountStuddent_Account] FOREIGN KEY([IdAccount])
REFERENCES [dbo].[Account] ([Id])
GO
ALTER TABLE [dbo].[AccountStudentParent]  WITH CHECK ADD  CONSTRAINT [FK_AccountStuddentParent_AccountStuddent] FOREIGN KEY([IdAccountStudent])
REFERENCES [dbo].[AccountStudent] ([Id])
GO
ALTER TABLE [dbo].[AccountWorkingTime]  WITH CHECK ADD  CONSTRAINT [FK_AccountWorkingTime_Account] FOREIGN KEY([IdAccount])
REFERENCES [dbo].[Account] ([Id])
GO
ALTER TABLE [dbo].[Course]  WITH CHECK ADD  CONSTRAINT [FK_Course_Level] FOREIGN KEY([IdLevel])
REFERENCES [dbo].[Level] ([Id])
GO
ALTER TABLE [dbo].[Course]  WITH CHECK ADD  CONSTRAINT [FK_Course_School] FOREIGN KEY([IdSchool])
REFERENCES [dbo].[School] ([Id])
GO
ALTER TABLE [dbo].[CourseAssignment]  WITH CHECK ADD  CONSTRAINT [FK_CourseAssignment_Course] FOREIGN KEY([IdCourse])
REFERENCES [dbo].[Course] ([Id])
GO
ALTER TABLE [dbo].[CourseAssignmentStudent]  WITH CHECK ADD  CONSTRAINT [FK_CourseAssignmentStudent_CourseAssignment] FOREIGN KEY([IdAssignment])
REFERENCES [dbo].[CourseAssignment] ([Id])
GO
ALTER TABLE [dbo].[CourseAssignmentStudentEvaluation]  WITH CHECK ADD  CONSTRAINT [FK_CourseAssignmentStudentEvaluation_CourseAssignmentStudent] FOREIGN KEY([IdCourseAssignmentStudent])
REFERENCES [dbo].[CourseAssignmentStudent] ([Id])
GO
ALTER TABLE [dbo].[CourseAssignmentSubmission]  WITH CHECK ADD  CONSTRAINT [FK_CourseAssignmentSubmission_CourseAssignmentStudent] FOREIGN KEY([IdCourseAssignmentStudent])
REFERENCES [dbo].[CourseAssignmentStudent] ([Id])
GO
ALTER TABLE [dbo].[CourseAttendanceStudent]  WITH CHECK ADD  CONSTRAINT [FK_CourseAttendanceStudent_Course] FOREIGN KEY([IdCourse])
REFERENCES [dbo].[Course] ([Id])
GO
ALTER TABLE [dbo].[CourseAttendanceTeacher]  WITH CHECK ADD  CONSTRAINT [FK_CourseAttendanceTeacher_Course] FOREIGN KEY([IdCourse])
REFERENCES [dbo].[Course] ([Id])
GO
ALTER TABLE [dbo].[CourseMaterial]  WITH CHECK ADD  CONSTRAINT [FK_CourseMaterial_Course] FOREIGN KEY([IdCourse])
REFERENCES [dbo].[Course] ([Id])
GO
ALTER TABLE [dbo].[CourseMaterial]  WITH CHECK ADD  CONSTRAINT [FK_CourseMaterial_Material] FOREIGN KEY([IdMaterial])
REFERENCES [dbo].[Material] ([Id])
GO
ALTER TABLE [dbo].[CourseSchedule]  WITH CHECK ADD  CONSTRAINT [FK_CourseSchedule_Course] FOREIGN KEY([IdCourse])
REFERENCES [dbo].[Course] ([Id])
GO
ALTER TABLE [dbo].[CourseScheduleDetail]  WITH CHECK ADD  CONSTRAINT [FK_CourseScheduleDetail_CourseSchedule] FOREIGN KEY([IdCourseSchedule])
REFERENCES [dbo].[CourseSchedule] ([Id])
GO
ALTER TABLE [dbo].[CourseStudent]  WITH CHECK ADD  CONSTRAINT [FK_CourseStudent_Course] FOREIGN KEY([IdCourse])
REFERENCES [dbo].[Course] ([Id])
GO
ALTER TABLE [dbo].[CourseStudentStatus]  WITH CHECK ADD  CONSTRAINT [FK_CourseStudentStatus_CourseStudent] FOREIGN KEY([IdCourseStudent])
REFERENCES [dbo].[CourseStudent] ([Id])
GO
ALTER TABLE [dbo].[District]  WITH CHECK ADD  CONSTRAINT [FK_District_City] FOREIGN KEY([IdCity])
REFERENCES [dbo].[City] ([Id])
GO
ALTER TABLE [dbo].[Material]  WITH CHECK ADD  CONSTRAINT [FK_Material_Level] FOREIGN KEY([IdLevel])
REFERENCES [dbo].[Level] ([Id])
GO
ALTER TABLE [dbo].[MaterialLesson]  WITH CHECK ADD  CONSTRAINT [FK_MaterialLesson_Material] FOREIGN KEY([IdMaterial])
REFERENCES [dbo].[Material] ([Id])
GO
ALTER TABLE [dbo].[MaterialLesson]  WITH CHECK ADD  CONSTRAINT [FK_MaterialLesson_MaterialTheme] FOREIGN KEY([IdTheme])
REFERENCES [dbo].[MaterialTheme] ([Id])
GO
ALTER TABLE [dbo].[MaterialTheme]  WITH CHECK ADD  CONSTRAINT [FK_MaterialTheme_Material] FOREIGN KEY([IdMaterial])
REFERENCES [dbo].[Material] ([Id])
GO
