# BÁO CÁO PHÂN TÍCH THIẾT KẾ HỆ THỐNG QUẢN LÝ HỌC TẬP (LEARNING MANAGEMENT SYSTEM - LMS)

---

## 1. MỞ ĐẦU & KHẢO SÁT HỆ THỐNG

### 1.1 Bối cảnh & Lý do chọn đề tài
Trong kỷ nguyên chuyển đổi số, nhu cầu quản trị và tối ưu hóa quy trình dạy học tại các trung tâm giáo dục đang trở nên cấp thiết hơn bao giờ hết. Các cơ sở đào tạo thường gặp khó khăn trong việc kết hợp giữa quản lý lịch học dạy phức tạp, theo dõi điểm danh chuyên cần của học viên, đánh giá định kỳ kết quả học tập và quản lý thù lao, bảng lương cho đội ngũ giáo viên.
Đề tài **"Hệ thống Quản lý Học tập & Đánh giá định kỳ học viên (LMS)"** được lựa chọn nhằm giải quyết các bài toán vận hành thực tế này, hướng tới giao diện người dùng cao cấp (Premium UI/UX), quy trình quản trị mượt mà trên nền tảng Fullstack ReactJS và NodeJS.

### 1.2 Phân tích các phần mềm tương tự

| Tên phần mềm | Tính năng nổi bật | Hạn chế | Bài học rút ra |
| :--- | :--- | :--- | :--- |
| **Canvas LMS** | - Quản lý chương trình đào tạo khoa học.<br>- Hệ thống giao bài tập và chấm điểm cực tốt. | - Quá phức tạp và cồng kềnh đối với các trung tâm quy mô vừa và nhỏ.<br>- Chi phí triển khai cao.<br>- Thiếu tính năng tự động tính toán bảng lương giáo viên dựa trên buổi dạy. | - Cần tối giản hóa quy trình giao diện.<br>- Tích hợp chặt chẽ việc điểm danh xác nhận buổi dạy với thù lao giáo viên. |
| **Moodle** | - Mã nguồn mở, cộng đồng lớn.<br>- Khả năng tùy chỉnh cao, hỗ trợ nhiều plugin. | - Giao diện mặc định lỗi thời, trải nghiệm người dùng kém (UX phức tạp).<br>- Tốc độ tải trang chậm nếu không tối ưu máy chủ.<br>- Yêu cầu trình độ kỹ thuật cao để thiết lập. | - Thiết kế giao diện hiện đại (Modern UI), tối ưu hóa tốc độ tải trang phía Frontend (ReactJS/Vite) và cấu trúc cơ sở dữ liệu. |
| **Google Classroom** | - Giao diện đơn giản, trực quan, dễ dùng.<br>- Tích hợp hoàn hảo với hệ sinh thái Google (Drive, Meet). | - Tính năng đánh giá chuyên sâu và báo cáo định kỳ hạn chế.<br>- Không hỗ trợ quản lý tài chính, phân quyền lớp học và tổ chức cơ sở/trường học. | - Xây dựng các chức năng đánh giá học tập 3 chiều (Chuyên cần, Học lực, Thái độ) kèm biểu đồ chỉ số trực quan. |

### 1.3 Đối tượng người dùng mục tiêu

1. **Quản trị viên (Admin)**:
   * *Đặc điểm*: Người điều hành hệ thống tại trung tâm/nhà trường.
   * *Nhu cầu*: Quản lý danh sách tài khoản, phê duyệt ghi danh học viên, quản lý cơ sở trường học và theo dõi bảng lương của giáo viên.
2. **Giáo viên (Teacher)**:
   * *Đặc điểm*: Người trực tiếp giảng dạy tại các lớp học.
   * *Nhu cầu*: Quản lý lịch dạy, chấm điểm danh học viên từng buổi học, giao và chấm bài tập, cập nhật chương học/bài học và gửi báo cáo đánh giá định kỳ cho học sinh.
3. **Học viên (Student)**:
   * *Đặc điểm*: Người tham gia khóa học.
   * *Nhu cầu*: Theo dõi thời khóa biểu học tập cá nhân, tải tài liệu bài học, làm bài và nộp bài tập trực tuyến, theo dõi kết quả điểm số và nhận xét từ giáo viên.
4. **Phụ huynh (Parent)**:
   * *Đặc điểm*: Người giám hộ của học viên.
   * *Nhu cầu*: Theo dõi tiến độ học tập, điểm số, chuyên cần và nhận xét định kỳ từ giáo viên thông qua liên kết chia sẻ của lớp học.

---

## 2. YÊU CẦU HỆ THỐNG

### 2.2 Yêu cầu chức năng (FR)

| FR-ID | Tên chức năng | Mô tả chi tiết yêu cầu chức năng | Actor chính | Độ ưu tiên |
| :--- | :--- | :--- | :--- | :--- |
| **FR-01** | Đăng nhập tài khoản | Hệ thống cho phép **Người dùng** thực hiện hành động đăng nhập bằng tài khoản được cấp khi nhập đúng thông tin Tên đăng nhập và Mật khẩu tại màn hình đăng nhập. | Admin, Teacher, Student | High |
| **FR-02** | Quản lý cơ sở trường học | Hệ thống cho phép **Admin** thực hiện các hành động tạo mới, cập nhật thông tin (Tên, Địa chỉ, Số điện thoại, Tỉnh/Thành, Quận/Huyện, Ảnh đại diện) cơ sở trường học khi ở giao diện quản trị cơ sở. | Admin | High |
| **FR-03** | Tạo và cấu hình lớp học | Hệ thống cho phép **Admin** tạo mới các lớp học, cấu hình trình độ (Level), phân bổ giáo viên và thiết lập khung lịch học tuần (Thứ, Tiết, Thời gian từ ngày - đến ngày) cho lớp học. | Admin | High |
| **FR-04** | Quản lý lịch học | Hệ thống cho phép **Giáo viên** và **Admin** xem lịch học tổng quát, thực hiện thêm mới, cập nhật hoặc hủy một buổi học chi tiết khi xảy ra thay đổi đột xuất. | Admin, Teacher | Medium |
| **FR-05** | Điểm danh học viên | Hệ thống cho phép **Giáo viên** thực hiện chấm điểm danh (Có mặt / Vắng mặt / Có phép / Muộn) cho toàn bộ học sinh trong lớp học khi buổi dạy diễn ra. | Teacher | High |
| **FR-06** | Giao bài tập | Hệ thống cho phép **Giáo viên** tạo bài tập mới, đính kèm file tài liệu bài tập (PDF, Word, Excel, Hình ảnh, Audio, Video), lựa chọn chủ đề/bài học liên quan, thiết lập ngày bắt đầu/hạn nộp (CloseDate) và chọn danh sách học viên nhận bài. | Teacher | High |
| **FR-07** | Chỉnh sửa & Gia hạn bài tập | Hệ thống cho phép **Giáo viên** cập nhật thông tin bài tập đã giao và gia hạn thời hạn nộp bài (`CloseDate`). Khi gia hạn, hệ thống tự động cập nhật lại trạng thái nộp muộn (`IsLate`) của các bài làm học sinh đã nộp. | Teacher | High |
| **FR-08** | Nộp bài làm | Hệ thống cho phép **Học viên** tải lên tệp bài làm (PDF, Word, Excel, Hình ảnh, Audio, Video, Zip/Rar...) và ghi chú thích khi bài tập còn trong thời hạn nộp hoặc đã quá hạn (được tính là nộp muộn). | Student | High |
| **FR-09** | Chấm điểm bài làm | Hệ thống cho phép **Giáo viên** xem danh sách bài làm đã nộp của học viên, thực hiện chấm điểm số (Hệ 10) và điền nhận xét phản hồi chi tiết cho học viên. | Teacher | High |
| **FR-10** | Đánh giá định kỳ | Hệ thống cho phép **Giáo viên** đánh giá học sinh định kỳ dựa trên các thang điểm đánh giá 5 sao (Chuyên cần, Học lực, Thái độ) và nhập phản hồi chi tiết. | Teacher | Medium |
| **FR-11** | Báo cáo học tập | Hệ thống cho phép **Học viên** (và phụ huynh) xem các biểu đồ đo lường tiến độ học tập (Tỷ lệ chuyên cần, Tỷ lệ nộp bài tập, Điểm số trung bình) và đánh giá của giáo viên. | Student, Parent | Medium |
| **FR-12** | Quản lý thù lao giáo viên | Hệ thống cho phép **Admin** quản lý bảng thù lao giảng dạy, xem chi tiết giờ dạy, lớp phụ trách và tổng thu nhập của từng giáo viên theo tháng. | Admin | Medium |
| **FR-13** | Phân quyền đăng ký | Hệ thống chặn chức năng đăng ký tài khoản tự do trên UI và API của hệ thống để kiểm soát dữ liệu người dùng nội bộ. | Admin | High |
| **FR-14** | Ghi danh lớp học công khai | Hệ thống cung cấp liên kết công khai cho từng lớp học, cho phép phụ huynh và học viên tự điền thông tin đăng ký tài khoản và thông tin học viên để gửi yêu cầu nhập học (chờ duyệt). | Parent, Student | High |

### 2.3 Yêu cầu phi chức năng (NFR)

| NFR-ID | Loại yêu cầu | Mô tả có thể đo lường được | Tiêu chí chấp nhận |
| :--- | :--- | :--- | :--- |
| **NFR-01** | Hiệu năng (Performance) | Thời gian phản hồi của các API chính (Lấy lịch học, Điểm danh học viên, Lưu đánh giá) phải dưới 800ms trong điều kiện kết nối mạng tiêu chuẩn. | - Kết quả đo tải bằng công cụ kiểm thử (như k6/JMeter) đạt 95% request phản hồi < 800ms dưới tải 100 người dùng đồng thời. |
| **NFR-02** | Bảo mật (Security) | Hệ thống phải băm mật khẩu bằng thuật toán an toàn trước khi lưu cơ sở dữ liệu và bảo vệ các API bằng Access Token (JWT) thời hạn ngắn. | - Mật khẩu lưu trữ trong bảng `Account` được mã hóa MD5 kèm chuỗi Salt ngẫu nhiên.<br>- API trả về mã lỗi `403 Forbidden` khi người dùng không có quyền truy cập tương ứng. |
| **NFR-03** | Khả dụng (Usability) | Giao diện phải tương thích tốt trên các độ phân giải màn hình thông dụng (Desktop, Laptop, Tablet, Mobile) với tỷ lệ phông chữ vừa vặn. | - Điểm Lighthouse tối ưu UI/UX đạt tối thiểu 90/100.<br>- Các bảng danh sách lớn hiển thị đầy đủ tiêu đề không bị ngắt dòng nhờ thuộc tính `whiteSpace: 'nowrap'` và có thanh cuộn dọc cố định tiêu đề (`stickyHeader`). |
| **NFR-04** | Trải nghiệm người dùng (UX) | Màn hình đăng nhập sử dụng thiết kế Ambient Neon và Glassmorphism hiện đại, thu hút sự chú ý của người dùng từ cái nhìn đầu tiên. | - Trải nghiệm mượt mà với hiệu ứng di chuyển của glowing orbs qua CSS keyframes.<br>- Mọi form nhập liệu không xảy ra lỗi đường viền bao ngoài đè lên nhãn chữ (notched label overlap). |
| **NFR-05** | Scalability / Độ tin cậy | Hệ thống đảm bảo không xảy ra hiện tượng xóa nhầm dữ liệu học tập lịch sử của học viên (như điểm danh, bài học) khi cập nhật cấu hình lịch lớp học. | - Hệ thống tự so sánh cấu hình lịch học mới và lịch học cũ; chỉ thực hiện thay đổi tái tạo buổi học tương lai khi phát hiện lịch có thay đổi thực sự (ngày, giờ, giáo viên). |

---

## 2.4 USE CASE DIAGRAM TỔNG QUÁT

Dưới đây là sơ đồ Use Case tổng quát thể hiện toàn bộ các tác nhân (Actors) và mối liên kết chức năng, bao gồm các quan hệ `include` và `extend` tiêu biểu:

```mermaid
usecaseDiagram
    actor "Quản trị viên (Admin)" as admin
    actor "Giáo viên (Teacher)" as teacher
    actor "Học viên (Student)" as student
    actor "Phụ huynh (Parent)" as parent

    %% Admin Use Cases
    admin --> (UC-02: Quản lý cơ sở trường học)
    admin --> (UC-03: Cấu hình lịch & Tạo lớp học)
    admin --> (UC-12: Quản lý thù lao giáo viên)
    
    %% Common Auth Use Case
    admin --> (UC-01: Đăng nhập tài khoản)
    teacher --> (UC-01: Đăng nhập tài khoản)
    student --> (UC-01: Đăng nhập tài khoản)

    %% Teacher Use Cases
    teacher --> (UC-04: Quản lý lịch giảng dạy)
    teacher --> (UC-05: Điểm danh học viên)
    teacher --> (UC-06: Giao bài tập học viên)
    teacher --> (UC-09: Chấm điểm bài làm)
    teacher --> (UC-10: Đánh giá định kỳ học lực)

    %% Student Use Cases
    student --> (UC-08: Xem tài liệu & Nộp bài làm)
    student --> (UC-11: Xem Báo cáo học tập cá nhân)
    parent --> (UC-11: Xem Báo cáo học tập cá nhân)
    parent --> (UC-15: Ghi danh lớp học công khai)
    student --> (UC-15: Ghi danh lớp học công khai)

    %% Relationships
    (UC-03: Cấu hình lịch & Tạo lớp học) ..> (UC-02: Quản lý cơ sở trường học) : <<include>>
    (UC-05: Điểm danh học viên) ..> (UC-04: Quản lý lịch giảng dạy) : <<include>>
    (UC-07: Chỉnh sửa & Gia hạn bài tập) ..> (UC-06: Giao bài tập học viên) : <<extend>>
    (UC-09: Chấm điểm bài làm) ..> (UC-08: Xem tài liệu & Nộp bài làm) : <<include>>
    (UC-10: Đánh giá định kỳ học lực) ..> (UC-11: Xem Báo cáo học tập cá nhân) : <<include>>
    (UC-15: Ghi danh lớp học công khai) ..> (UC-01: Đăng nhập tài khoản) : <<extend>>
```

---

## 2.5 ĐẶC TẢ CHI TIẾT CÁC USE CASE TRỌNG TÂM

### Công nghệ sử dụng cho các Use Case:
* **Frontend**: ReactJS, Material-UI (MUI v5), Vite (đóng gói production), Redux Toolkit (quản lý state đăng nhập).
* **Backend**: NodeJS, ExpressJS, Prisma ORM (quản lý truy vấn database).
* **Database**: Microsoft SQL Server.

---

### Use Case 1: UC-03 - Cấu hình lịch & Tạo lớp học

* **Mục đích**: Cung cấp công cụ cho Admin khởi tạo một lớp học mới kèm theo việc phân bổ giáo viên chủ nhiệm và cấu hình chuỗi lịch học hàng tuần tự động sinh ra hàng loạt các buổi học chi tiết trong cơ sở dữ liệu.
* **Vấn đề thực tế cần giải quyết**: Giảm thiểu việc Admin phải tạo thủ công từng buổi học một khi lớp học diễn ra dài ngày (ví dụ khóa học 3 tháng, 6 tháng gồm nhiều buổi).
* **Đối tượng người dùng**: Quản trị viên (Admin).

| Trường | Nội dung đặc tả |
| :--- | :--- |
| **Use Case ID & Tên** | **UC-03: Cấu hình lịch & Tạo lớp học** |
| **Actor** | - Actor chính: Admin<br>- Actor phụ: Giáo viên (được phân bổ dạy) |
| **Mục tiêu** | Khởi tạo lớp học mới và sinh tự động chuỗi buổi học chi tiết dựa trên cấu hình lịch tuần. |
| **Pre-condition** | Admin đã đăng nhập thành công vào hệ thống quản trị, cơ sở trường học và thông tin Giáo viên đã tồn tại trên hệ thống. |
| **Basic Flow** | 1. Admin truy cập chức năng "Tạo lớp học mới".<br>2. Admin nhập các thông tin cơ bản: Tên lớp học, Cấp độ đào tạo, Chọn cơ sở.<br>3. Admin chuyển sang phần "Cấu hình lịch học tuần" và chọn thêm dòng lịch học (Ví dụ: Thứ 2, Tiết 3, Giáo viên giảng dạy).<br>4. Admin chọn Ngày bắt đầu khóa học và Ngày kết thúc khóa học.<br>5. Admin nhấn nút "Xác nhận tạo lớp học".<br>6. Hệ thống thực hiện lưu thông tin lớp học vào DB, đồng thời gọi thuật toán tự động tính toán các ngày thứ trong tuần nằm giữa khoảng ngày bắt đầu - ngày kết thúc để tạo hàng loạt bản ghi buổi học chi tiết (`CourseScheduleDetail`) tương ứng.<br>7. Hệ thống hiển thị thông báo tạo thành công và chuyển về màn hình danh sách lớp học. |
| **Alternative Flow** | *Khóa học ngắn ngày*: Admin có thể chọn không cấu hình lịch tuần, mà tạo lớp trống trước, sau đó tự tay thêm lẻ từng buổi học mong muốn trên giao diện lịch học (`SchoolSchedule`). |
| **Exception Flow** | - **Lỗi trùng lịch giáo viên**: Hệ thống kiểm tra giáo viên được chọn đã có lịch giảng dạy ở lớp khác trong khung giờ đó hay chưa. Nếu có, hệ thống hiển thị cảnh báo "Giáo viên [Tên] đã bị trùng lịch học vào [Khung giờ, Thứ]" và yêu cầu chọn giáo viên hoặc giờ khác.<br>- **Lỗi thiếu thông tin**: Nếu bỏ trống các trường bắt buộc, hệ thống hiển thị thông báo lỗi màu đỏ cạnh ô nhập liệu. |
| **Post-condition** | Lớp học mới được tạo ở trạng thái hoạt động. Toàn bộ lịch học chi tiết được sinh thành công trong database và hiển thị đầy đủ trên thời khóa biểu. |

---

### Use Case 2: UC-05 - Điểm danh học viên lớp học

* **Mục đích**: Giáo viên điểm danh chuyên cần của học viên trong lớp để làm cơ sở đánh giá năng lực học tập và ghi nhận chấm thù lao tính lương cho giáo viên cuối tháng.
* **Vấn đề thực tế cần giải quyết**: Chấm điểm danh thủ công trên giấy dễ thất lạc, khó tổng hợp tỷ lệ đi học của học viên để báo cáo cho phụ huynh.
* **Đối tượng người dùng**: Giáo viên giảng dạy (Teacher), Admin.

| Trường | Nội dung đặc tả |
| :--- | :--- |
| **Use Case ID & Tên** | **UC-05: Điểm danh học viên lớp học** |
| **Actor** | - Actor chính: Giáo viên<br>- Actor phụ: Học viên |
| **Mục tiêu** | Ghi nhận trạng thái đi học của học viên tại từng buổi học cụ thể. |
| **Pre-condition** | Buổi học của lớp học đã được tạo trên lịch dạy, giáo viên được phân công giảng dạy buổi đó đã đăng nhập vào hệ thống. |
| **Basic Flow** | 1. Giáo viên truy cập tab "Thời khóa biểu" và chọn buổi học cần điểm danh.<br>2. Giáo viên chọn tab "Điểm danh".<br>3. Hệ thống hiển thị danh sách học viên đăng ký trong lớp ở dạng bảng cố định 2 chiều (Sticky Left Column cho tên học viên và Sticky Header cho tiêu đề ngày).<br>4. Giáo viên chọn trạng thái đi học (Có mặt / Vắng mặt / Vắng có phép / Đi muộn) tương ứng với từng học viên.<br>5. Giáo viên điền ghi chú thêm (nếu có) và nhấn nút "Lưu điểm danh".<br>6. Hệ thống lưu kết quả điểm danh vào bảng `CourseAttendanceStudent` và hiển thị thông báo lưu thành công.<br>7. Hệ thống tự động tính toán lại Tỷ lệ chuyên cần (%) hiển thị trên báo cáo học tập của học viên. |
| **Alternative Flow** | *Chỉnh sửa điểm danh*: Giáo viên hoặc Admin có thể chọn lại buổi học đã điểm danh trong quá khứ, chỉnh sửa lại trạng thái của học viên bất kỳ và nhấn "Lưu điểm danh" để cập nhật lại dữ liệu. |
| **Exception Flow** | - **Buổi học chưa diễn ra**: Nếu giáo viên cố tình điểm danh cho một buổi học có ngày diễn ra trong tương lai, hệ thống sẽ ẩn các nút lựa chọn điểm danh hoặc hiển thị cảnh báo "Không thể điểm danh trước thời gian diễn ra buổi học!". |
| **Post-condition** | Trạng thái điểm danh của học viên được lưu trữ. Buổi học chuyển sang trạng thái "Đã điểm danh" (màu xanh lá trên thời khóa biểu), thù lao giảng dạy của buổi học được ghi nhận vào bảng lương của giáo viên. |

---

### Use Case 3: UC-07 - Chỉnh sửa & Gia hạn bài tập (Gồm tự động cập nhật trạng thái bài nộp)

* **Mục đích**: Giáo viên cập nhật lại thông tin bài tập (Tiêu đề, mô tả, tệp đính kèm) và gia hạn hạn nộp (`CloseDate`). Khi gia hạn, hệ thống tự động tính toán lại trạng thái nộp trễ của toàn bộ bài làm hiện có của học sinh.
* **Vấn đề thực tế cần giải quyết**: Khi bài tập hết hạn, nhiều học sinh xin nộp bù. Nếu giáo viên gia hạn thủ công mà không cập nhật lại trạng thái bài làm đã nộp trước đó thì các bài nộp đó vẫn bị tính là trễ hạn (IsLate = true) không công bằng với học sinh.
* **Đối tượng người dùng**: Giáo viên giảng dạy (Teacher), Admin.

| Trường | Nội dung đặc tả |
| :--- | :--- |
| **Use Case ID & Tên** | **UC-07: Chỉnh sửa & Gia hạn bài tập** |
| **Actor** | - Actor chính: Giáo viên<br>- Actor phụ: Học viên |
| **Mục tiêu** | Cập nhật thông tin bài tập và tự động điều chỉnh trạng thái nộp trễ (`IsLate`) của học sinh theo hạn nộp mới. |
| **Pre-condition** | Bài tập đã được giao trước đó cho lớp học và giáo viên đã đăng nhập vào hệ thống quản lý bài tập. |
| **Basic Flow** | 1. Giáo viên truy cập tab "Bài tập" của lớp học.<br>2. Giáo viên chọn bài tập cần chỉnh sửa và nhấn nút "Edit" (biểu tượng bút chì xanh).<br>3. Hệ thống hiển thị form điền thông tin cũ của bài tập ở chế độ chỉnh sửa.<br>4. Giáo viên thay đổi ngày hạn nộp (`CloseDate`) sang một thời điểm mới trong tương lai.<br>5. Giáo viên nhấn nút "Cập nhật bài tập".<br>6. Backend chạy một Database Transaction:<br>&nbsp;&nbsp;&nbsp;- Cập nhật thông tin bài tập cơ bản.<br>&nbsp;&nbsp;&nbsp;- Lấy danh sách toàn bộ các bài nộp (`Submission`) hiện tại của học viên đối với bài tập này.<br>&nbsp;&nbsp;&nbsp;- So sánh ngày nộp bài (`Created_Date`) của từng bài nộp với `CloseDate` mới. Nếu ngày nộp bài nhỏ hơn hoặc bằng `CloseDate` mới, cập nhật `IsLate = false` (ngược lại cập nhật `IsLate = true`).<br>7. Hệ thống hiển thị thông báo cập nhật thành công và tự động làm mới giao diện bài tập. |
| **Alternative Flow** | *Không thay đổi hạn nộp*: Nếu giáo viên chỉ sửa tiêu đề hoặc mô tả bài tập mà giữ nguyên hạn nộp, hệ thống sẽ bỏ qua bước tính toán lại trạng thái nộp trễ để tối ưu hiệu năng. |
| **Exception Flow** | - **Lưu rỗng hoặc thiếu thông tin bắt buộc**: Hệ thống ngăn chặn lưu bài tập, hiển thị thông báo cảnh báo "Tiêu đề bài tập không được để trống!". |
| **Post-condition** | Thông tin bài tập mới được ghi nhận. Các bài nộp trước đó của học viên tự động phản ánh trạng thái đi học bình thường (không còn nhãn "Nộp muộn" nếu thời gian nộp nằm trong hạn mới). |

---

### Use Case 4: UC-10 - Đánh giá học sinh định kỳ

* **Mục đích**: Giáo viên gửi báo cáo nhận xét và chấm điểm định kỳ theo 3 khía cạnh cốt lõi (Chuyên cần, Học lực, Thái độ) cho từng học sinh vào cuối khóa học hoặc giữa kỳ.
* **Vấn đề thực tế cần giải quyết**: Báo cáo học tập cuối kỳ của học sinh thường chỉ là điểm số khô khan. Cần một báo cáo đánh giá 3 chiều trực quan kèm lời khuyên cá nhân hóa từ giáo viên.
* **Đối tượng người dùng**: Giáo viên giảng dạy (Teacher), Admin.

| Trường | Nội dung đặc tả |
| :--- | :--- |
| **Use Case ID & Tên** | **UC-10: Đánh giá học sinh định kỳ** |
| **Actor** | - Actor chính: Giáo viên<br>- Actor phụ: Học viên, Phụ huynh (Người nhận đánh giá) |
| **Mục tiêu** | Ghi nhận đánh giá năng lực học tập định kỳ và gửi lời nhận xét tới tài khoản học sinh. |
| **Pre-condition** | Học viên có trạng thái hoạt động trong lớp học, giáo viên phụ trách đã đăng nhập thành công. Giao diện Đánh giá định kỳ đã được mở. |
| **Basic Flow** | 1. Giáo viên truy cập tab "Đánh giá".<br>2. Giao diện hiển thị danh sách học viên bên trái (kèm Avatar chữ/ảnh đại diện) và biểu đồ thống kê học tập tự động tính toán (Tỷ lệ chuyên cần, tỷ lệ nộp bài tập, điểm thi trung bình) bên phải.<br>3. Giáo viên nhấp chọn một học viên trong danh sách.<br>4. Giáo viên chọn số sao từ 1 đến 5 cho 3 tiêu chí: Chuyên cần, Học lực, Thái độ học tập.<br>5. Giáo viên nhập nhận xét chi tiết vào ô phản hồi (hoặc click chọn các mẫu nhận xét nhanh có sẵn ở dưới để tự động điền nhanh).<br>6. Giáo viên nhấn nút "Lưu đánh giá".<br>7. Hệ thống lưu bản ghi đánh giá vào bảng `CourseStudentEvaluation` trong DB và hiển thị thông báo thành công.<br>8. Dữ liệu đánh giá ngay lập tức được cập nhật trên Dashboard học tập của học viên tương ứng. |
| **Alternative Flow** | *Cập nhật đánh giá*: Nếu học viên có tiến bộ vượt bậc sau kỳ kiểm tra bù, giáo viên có thể vào lại form này, cập nhật nâng điểm đánh giá và lưu đè để lưu giữ lịch sử đánh giá mới nhất. |
| **Exception Flow** | - **Lưu đánh giá trống**: Nếu giáo viên chưa chọn bất kỳ học sinh nào từ danh sách bên trái, nút "Lưu đánh giá" sẽ bị ẩn và hiển thị thông báo "Vui lòng chọn học viên để tiến hành đánh giá". |
| **Post-condition** | Bản ghi đánh giá định kỳ của học viên được cập nhật. Học viên đăng nhập bằng tài khoản cá nhân có thể xem chi tiết biểu đồ đánh giá hình sao và lời nhận xét của giáo viên. |

---

### Use Case 5: UC-11 - Xem Báo cáo học tập cá nhân (Học viên & Phụ huynh)

* **Mục đích**: Cho phép học viên và phụ huynh theo dõi tiến độ học tập, xem kết quả điểm số trung bình, tỷ lệ chuyên cần đi học và nhận lời đánh giá từ giáo viên nhằm cải thiện kết quả học tập kịp thời.
* **Vấn đề thực tế cần giải quyết**: Học viên và phụ huynh thường không nắm rõ con em mình đã nghỉ bao nhiêu buổi học, nộp thiếu bao nhiêu bài tập cho tới khi nhận bảng điểm cuối kỳ quá muộn.
* **Đối tượng người dùng**: Học viên (Student), Phụ huynh (Parent).

| Trường | Nội dung đặc tả |
| :--- | :--- |
| **Use Case ID & Tên** | **UC-11: Xem Báo cáo học tập cá nhân** |
| **Actor** | - Actor chính: Học viên, Phụ huynh |
| **Mục tiêu** | Hiển thị biểu đồ thống kê tiến độ học tập và đánh giá định kỳ trực quan cho học viên. |
| **Pre-condition** | Học viên đăng nhập thành công vào tài khoản cá nhân hoặc phụ huynh truy cập qua đường dẫn chia sẻ báo cáo hợp lệ của học sinh. |
| **Basic Flow** | 1. Người dùng chọn lớp học đang tham gia.<br>2. Người dùng nhấp chọn tab "Đánh giá & Báo cáo học tập".<br>3. Hệ thống hiển thị Banner thông tin học viên (Avatar, Tên, mã số học viên).<br>4. Hệ thống tải dữ liệu thống kê từ API và hiển thị thành 3 khối thẻ thống kê trực quan:<br>&nbsp;&nbsp;&nbsp;- **Chuyên cần**: Hiển thị tỷ lệ phần trăm (%) đi học kèm thanh tiến độ đo lường (màu xanh lá nếu >= 80%, màu cam nếu dưới 80%).<br>&nbsp;&nbsp;&nbsp;- **Làm bài tập**: Hiển thị tỷ lệ nộp bài tập về nhà trên tổng số bài đã giao.<br>&nbsp;&nbsp;&nbsp;- **Điểm trung bình**: Tính toán và hiển thị điểm số trung bình hệ 10 của toàn bộ bài nộp.<br>5. Hệ thống hiển thị bảng đánh giá chi tiết (số sao đánh giá) và lời nhận xét chi tiết kèm tên giáo viên đánh giá và ngày giờ cập nhật cuối cùng ở dưới trang. |
| **Alternative Flow** | *Xem qua thiết bị di động*: Do giao diện thiết kế responsive hoàn toàn, phụ huynh xem báo cáo trên điện thoại sẽ tự động co giãn hiển thị gọn gàng theo dạng cột dọc, các khối vòng tròn tiến độ được căn giữa sắc nét. |
| **Exception Flow** | - **Chưa có đánh giá**: Nếu giáo viên chưa tạo bất kỳ đánh giá định kỳ nào cho học sinh này, hệ thống sẽ hiển thị dòng trạng thái thông báo thân thiện: "Giáo viên chưa cập nhật nhận xét định kỳ cho bạn trong khóa học này. Hãy cố gắng hoàn thành tốt bài tập nhé!". |
| **Post-condition** | Học viên/Phụ huynh nắm bắt được kết quả tiến độ học tập chi tiết của mình một cách minh bạch, trực quan. |

---

### Use Case 6: UC-04 - Quản lý lịch học

* **Mục đích**: Cung cấp giao diện lịch biểu giảng dạy cho giáo viên và admin để theo dõi, cập nhật các buổi học chi tiết, ghi chú buổi học, link online, và thực hiện thay đổi buổi học đột xuất.
* **Vấn đề thực tế cần giải quyết**: Khi lớp học đang diễn ra, phát sinh các buổi nghỉ lễ, giáo viên nghỉ ốm cần đổi lịch hoặc dạy thay. Hệ thống phải cho phép điều chỉnh cục bộ buổi học mà không làm xáo trộn lịch học tổng thể của khóa học.
* **Đối tượng người dùng**: Giáo viên (Teacher), Admin.

| Trường | Nội dung đặc tả |
| :--- | :--- |
| **Use Case ID & Tên** | **UC-04: Quản lý lịch học** |
| **Actor** | - Actor chính: Admin, Giáo viên<br>- Actor phụ: Học viên |
| **Mục tiêu** | Xem, cập nhật thông tin buổi học chi tiết (thay đổi giờ, phòng, giáo viên, link học online) và ghi nhận trạng thái buổi học. |
| **Pre-condition** | Buổi học đã được khởi tạo trong lịch lớp học. Người dùng đã đăng nhập và được cấp quyền truy cập lịch học. |
| **Basic Flow** | 1. Người dùng truy cập giao diện Lịch học (`SchoolSchedule` hoặc `CourseSchedule`).<br>2. Hệ thống hiển thị thời khóa biểu dạng tháng/tuần/ngày hoặc danh sách các buổi học chi tiết.<br>3. Admin/Giáo viên nhấp chọn buổi học cụ thể để xem chi tiết.<br>4. Admin chọn nút "Chỉnh sửa buổi học".<br>5. Admin cập nhật thông tin: Đổi ngày, giờ học, đổi phòng học, cập nhật liên kết học online (`LinkOnline`), thay đổi giáo viên dạy thay hoặc thêm ghi chú/nội dung bài giảng.<br>6. Admin nhấn "Lưu thay đổi".<br>7. Hệ thống gọi API `PUT /v1/schedules/detail/:detailId`, cập nhật bảng `CourseScheduleDetail` ở database, đồng thời cập nhật lại bảng tính lương thù lao tương ứng nếu có thay đổi về giáo viên phụ trách.<br>8. Hệ thống hiển thị thông báo lưu thành công và cập nhật lịch hiển thị. |
| **Alternative Flow** | *Huỷ buổi học*: Admin có thể chỉnh sửa trạng thái buổi học sang "Cancelled" (Đã hủy). Hệ thống sẽ chuyển màu buổi học sang xám trên lịch và tự động trừ buổi học đó khỏi bảng đối soát lương giáo viên. |
| **Exception Flow** | - **Trùng lịch dạy**: Nếu thay đổi giờ học hoặc giáo viên dẫn đến trùng với lịch dạy khác của giáo viên được phân công, hệ thống báo lỗi: "Giáo viên đã có lịch dạy khác tại thời điểm này" và ngăn lưu dữ liệu. |
| **Post-condition** | Thông tin buổi học chi tiết được cập nhật. Học sinh và giáo viên thấy lịch mới hiển thị đồng bộ trên thiết bị của họ. |

---

### Use Case 7: UC-12 - Quản lý thù lao giáo viên

* **Mục đích**: Cung cấp công cụ tự động đối soát giờ dạy thực tế của giáo viên, tính toán chi phí lương cứng, lương OT (cho hợp đồng cố định) hoặc lương theo tiết dạy/giờ dạy (cho hợp đồng cộng tác viên) theo từng tháng.
* **Vấn đề thực tế cần giải quyết**: Việc tính lương thủ công cho giáo viên dựa trên sổ chấm công giấy dễ xảy ra sai sót, tốn nhiều thời gian đối soát số giờ dạy vượt định mức (Overtime) hoặc các ca dạy thay.
* **Đối tượng người dùng**: Quản trị viên (Admin), Giáo viên (Teacher).

| Trường | Nội dung đặc tả |
| :--- | :--- |
| **Use Case ID & Tên** | **UC-12: Quản lý thù lao giáo viên** |
| **Actor** | - Actor chính: Admin<br>- Actor phụ: Giáo viên, Hệ thống |
| **Mục tiêu** | Tự động tính toán lương giáo viên hàng tháng và cung cấp bảng đối soát chi tiết từng buổi dạy của từng giáo viên. |
| **Pre-condition** | Chính sách thù lao của giáo viên đã được cấu hình trong `AccountSalary`. Các buổi dạy trong tháng đã được xác nhận (Confirmed). |
| **Basic Flow** | 1. Admin truy cập tab "Lương" (Salary) trên Dashboard cơ sở.<br>2. Hệ thống gọi API `GET /v1/salaries/schools/:schoolId` kèm theo tháng cần tính lương.<br>3. Hệ thống tự động thực hiện tính toán:<br>&nbsp;&nbsp;&nbsp;- Truy vấn danh sách giáo viên dạy tại cơ sở trong tháng.<br>&nbsp;&nbsp;&nbsp;- Truy vấn tổng số giờ dạy thực tế từ các buổi học đã xác nhận (`Status = Confirmed`).<br>&nbsp;&nbsp;&nbsp;- *Đối với hợp đồng cố định*: Lấy mức lương tháng, nếu tổng giờ dạy vượt qua số giờ cam kết bảo hành (`WarrantyHours`), tính lương OT = (Tổng giờ dạy - Giờ cam kết) * Đơn giá giờ dạy * Tỷ giá tiền tệ.<br>&nbsp;&nbsp;&nbsp;- *Đối với hợp đồng theo giờ*: Tính thù lao = Tổng (Số giờ dạy từng buổi * Đơn giá giờ dạy tương ứng * Tỷ giá).<br>4. Giao diện hiển thị bảng tổng hợp lương của cơ sở.<br>5. Admin có thể lọc danh sách giáo viên theo loại hợp đồng hoặc lọc nhanh những giáo viên có "Thực nhận khác 0đ".<br>6. Admin nhấn nút "Chi tiết" bên cạnh giáo viên để xem đối soát từng buổi học cụ thể.<br>7. Admin thực hiện duyệt và kết xuất bảng lương. |
| **Alternative Flow** | *Giáo viên xem thu nhập*: Giáo viên đăng nhập có thể xem báo cáo thu nhập cá nhân của chính mình. Hệ thống sẽ ẩn bảng tổng hợp của người khác và chỉ hiển thị biểu đồ phân tích giờ dạy/OT cùng chi tiết thù lao các buổi dạy của riêng giáo viên đó. |
| **Exception Flow** | - **Buổi học chưa được xác nhận**: Các buổi học chưa chuyển sang trạng thái "Confirmed" (Ví dụ: mới chỉ học xong nhưng chưa được kiểm duyệt) sẽ không được hệ thống đưa vào tính toán thù lao để tránh sai sót số liệu. |
| **Post-condition** | Bảng lương tháng được lập và đối soát minh bạch, sẵn sàng cho bộ phận kế toán thực hiện thanh toán chuyển khoản. |

---

### Use Case 8: UC-15 - Ghi danh lớp học công khai

* **Mục đích**: Cung cấp giao diện công khai để học viên và phụ huynh tự ghi danh vào một lớp học thông qua liên kết ghi danh riêng biệt của lớp đó, tự động khởi tạo tài khoản và ghi nhận yêu cầu chờ duyệt.
* **Vấn đề thực tế cần giải quyết**: Thay vì nhân viên tư vấn phải xin thông tin và nhập tay thủ công từng học viên mới, phụ huynh có thể tự truy cập link ghi danh để hoàn tất điền hồ sơ và đăng ký tài khoản cho bản thân lẫn con em mình.
* **Đối tượng người dùng**: Phụ huynh (Parent), Học viên (Student).

| Trường | Nội dung đặc tả |
| :--- | :--- |
| **Use Case ID & Tên** | **UC-15: Ghi danh lớp học công khai** |
| **Actor** | - Actor chính: Phụ huynh, Học viên<br>- Actor phụ: Admin (Phê duyệt ghi danh) |
| **Mục tiêu** | Đăng ký hồ sơ, tạo tài khoản và gửi yêu cầu nhập học chờ duyệt vào lớp học mong muốn. |
| **Pre-condition** | Người dùng truy cập vào liên kết ghi danh công khai của lớp học có dạng `/enroll/:courseId` (trong đó `courseId` phải tồn tại hợp lệ trên hệ thống). |
| **Basic Flow** | 1. Người dùng mở đường dẫn ghi danh lớp học.<br>2. Hệ thống tự động gọi API lấy thông tin lớp học công khai và hiển thị tóm tắt ở cột thông tin bên trái (Tên lớp, Cấp độ, Lịch học tuần, Chi nhánh, Ảnh Thumbnail).<br>3. Ở cột bên phải, người dùng điền thông tin phụ huynh (Họ tên, SĐT, Email, Tên đăng nhập và Mật khẩu khởi tạo).<br>4. Người dùng tiếp tục điền thông tin chi tiết của học sinh (Họ tên học sinh, Ngày sinh, Giới tính).<br>5. Người dùng nhấn nút "Hoàn tất ghi danh".<br>6. Backend khởi chạy một Database Transaction:<br>&nbsp;&nbsp;&nbsp;- Tạo tài khoản người dùng `Account` ở trạng thái hoạt động.<br>&nbsp;&nbsp;&nbsp;- Tạo thông tin học sinh `AccountStudent` liên kết với tài khoản phụ huynh.<br>&nbsp;&nbsp;&nbsp;- Ghi nhận trạng thái ghi danh lớp học `CourseStudent` là chờ duyệt (`IsApprove = 0`).<br>7. Hệ thống hiển thị giao diện thông báo đăng ký thành công và cung cấp nút chuyển hướng người dùng đến trang đăng nhập. |
| **Alternative Flow** | Không có. |
| **Exception Flow** | - **Lớp học không tồn tại/đã bị xóa**: Hệ thống hiển thị thông báo lỗi "Mã lớp học không hợp lệ hoặc đã bị xóa!" kèm nút quay về trang login.<br>- **Trùng lặp Tên đăng nhập hoặc Email**: Backend từ chối giao dịch, trả về thông báo lỗi trùng lặp và yêu cầu người dùng thay đổi thông tin tương ứng.<br>- **Lỗi dữ liệu đầu vào**: Nếu nhập sai định dạng email, số điện thoại hoặc bỏ trống các trường bắt buộc, hệ thống hiển thị thông báo lỗi đỏ ngay dưới trường nhập liệu và chặn hành động click gửi form. |
| **Post-condition** | Tài khoản mới được thiết lập. Hồ sơ học sinh được đẩy vào danh sách chờ duyệt của lớp học. Admin có thể xem danh sách này từ Dashboard cơ sở và duyệt học viên vào lớp chính thức. |

---

## 3. THIẾT KẾ DỮ LIỆU

### 3.1 General Class Diagram

Dưới đây là sơ đồ lớp tổng quát (General Class Diagram) thể hiện các thực thể nghiệp vụ cốt lõi, thuộc tính tiêu biểu và mối quan hệ logic giữa các đối tượng trong hệ thống LMS:

```mermaid
classDiagram
    direction TB
    class Account {
        +UniqueIdentifier Id
        +String UserName
        +String FullName
        +String Email
        +String Phone
        +Boolean Active
        +login()
        +updateProfile()
    }
    class AccountRole {
        +Int Id
        +String Name
    }
    class AccountRight {
        +Int Id
        +String RightsName
        +String Label
        +String Controller
        +String Action
    }
    class School {
        +Int Id
        +String Name
        +String Phone
        +String Address
    }
    class Level {
        +Int Id
        +String Name
    }
    class Course {
        +String Id
        +String Name
        +String LinkEnrol
        +Boolean IsOnline
        +Date StartDate
        +Date EndDate
    }
    class Material {
        +Int Id
        +String Name
        +Int Types
    }
    class MaterialTheme {
        +Int Id
        +String Name
        +Int Priority
    }
    class MaterialLesson {
        +Int Id
        +String Name
        +String FileName
        +Int Priority
    }
    class CourseSchedule {
        +Int Id
        +Date FromDate
        +Date ToDate
        +String Schedule
        +Time FromTime
        +Time ToTime
    }
    class CourseScheduleDetail {
        +Int Id
        +Date Date
        +Time FromTime
        +Time ToTime
        +Boolean IsOnline
        +Int Status
    }
    class CourseAttendanceStudent {
        +Int Id
        +DateTime StartDate
        +Int Status
    }
    class CourseAttendanceTeacher {
        +Int Id
        +DateTime StartDate
    }
    class CourseAssignment {
        +Int Id
        +String AssignmentTitle
        +DateTime StartDate
        +DateTime CloseDate
    }
    class CourseAssignmentStudent {
        +Int Id
        +Int IsAsign
    }
    class CourseAssignmentSubmission {
        +Int Id
        +String FileUrl
        +String FileName
        +Boolean IsLate
    }
    class CourseAssignmentStudentEvaluation {
        +Int Id
        +Float Score
        +String Remake
    }
    class AccountSalary {
        +Int Id
        +Int TypeSalary
        +Decimal SalaryPerHour
        +Decimal SalaryPerMonth
        +Int WarrantyHours
    }
    class CourseScheduleDetailSalary {
        +Int Id
        +Int TotalPeriods
        +Int TotalMinutes
        +Decimal SalaryPerHour
        +Decimal SalaryPerMonth
        +Decimal ExchangeRate
    }

    Account "1" -- "0..*" AccountInRole : has
    AccountRole "1" -- "0..*" AccountInRole : defines
    AccountRole "1" -- "0..*" AccountRightInRole : has
    AccountRight "1" -- "0..*" AccountRightInRole : defines
    Account "1" -- "0..*" AccountSalary : configured_by
    School "1" -- "0..*" Course : hosts
    Level "1" -- "0..*" Course : configures
    Course "1" -- "0..*" CourseStudent : has_students
    Account "1" -- "0..*" CourseStudent : registers
    Course "1" -- "0..*" CourseMaterial : contains
    Material "1" -- "0..*" CourseMaterial : references
    Material "1" -- "0..*" MaterialTheme : contains
    MaterialTheme "1" -- "0..*" MaterialLesson : contains
    Course "1" -- "0..*" CourseSchedule : structured_by
    CourseSchedule "1" -- "0..*" CourseScheduleDetail : generates
    Account "1" -- "0..*" CourseSchedule : teaches
    Account "1" -- "0..*" CourseScheduleDetail : teaches
    Course "1" -- "0..*" CourseAttendanceStudent : logs
    Course "1" -- "0..*" CourseAttendanceTeacher : logs
    Account "1" -- "0..*" CourseAttendanceStudent : signs_student
    Account "1" -- "0..*" CourseAttendanceTeacher : signs_teacher
    Course "1" -- "0..*" CourseAssignment : issues
    CourseAssignment "1" -- "0..*" CourseAssignmentStudent : assigns_to
    CourseAssignmentStudent "1" -- "0..*" CourseAssignmentSubmission : submits
    CourseAssignmentStudent "1" -- "0..*" CourseAssignmentStudentEvaluation : graded_by
    CourseScheduleDetail "1" -- "0..*" CourseScheduleDetailSalary : records_pay
```

### 3.2 Mô hình quan hệ thực thể (ERD)

Sơ đồ quan hệ thực thể (ERD) thể hiện cấu trúc vật lý của các bảng cơ sở dữ liệu trong SQL Server và các ràng buộc khóa chính, khóa ngoại liên kết giữa chúng:

```mermaid
erDiagram
    Account {
        UniqueIdentifier Id PK
        NVarChar UserName
        NVarChar FullName
        Date BirthDay
        Int IdGender FK
        NVarChar PasswordSalt
        NVarChar Password
        Boolean Active
        UniqueIdentifier ActiveToken
        NVarChar Phone
        NVarChar Email
        NVarChar Provider
        NVarChar Address
        Int IdCity
        Int IdDistrict
        NVarChar LinkAvatar
        Int Deleted
        NVarChar Created_By
        DateTime Created_Date
        NVarChar Modified_By
        DateTime Modified_Date
    }
    AccountRole {
        Int Id PK
        NVarChar Name
        Int Deleted
    }
    AccountInRole {
        Int Id PK
        UniqueIdentifier IdAccount FK
        Int IdAccountRole FK
        Int Deleted
    }
    AccountRight {
        Int Id PK
        Int Indexes
        NVarChar RightsName
        NVarChar Label
        NVarChar Action
        NVarChar Controller
        NVarChar Area
        Boolean IsDefault
        Int Deleted
    }
    AccountRightInRole {
        Int Id PK
        Int IdAccountRole FK
        Int IdAccountRight FK
        Int Deleted
    }
    School {
        Int Id PK
        NVarChar Name
        NVarChar Phone
        NVarChar Address
        Int IdCity
        Int IdDistrict
        VarChar Thumbnail
        Int Deleted
    }
    Level {
        Int Id PK
        NVarChar Name
        Int Deleted
    }
    Course {
        NVarChar Id PK "Length: 20"
        NVarChar Name
        Int IdSchool FK
        Int IdLevel FK
        NVarChar LinkEnrol
        Boolean IsOnline
        VarChar LinkOnline
        VarChar Thumbnail
        Int Status
        Date StartDate
        Date EndDate
        Int Deleted
    }
    Material {
        Int Id PK
        NVarChar Name
        Int IdLevel FK
        Int Types
        NVarChar ImageUrl
        NVarChar FolderName
        Int Deleted
    }
    MaterialTheme {
        Int Id PK
        Int IdMaterial FK
        NVarChar Name
        NVarChar Title
        Int IdLevel
        Int Priority
        NVarChar FolderName
        Int Deleted
    }
    MaterialLesson {
        Int Id PK
        Int IdMaterial FK
        NVarChar Name
        NVarChar Title
        Int IdLevel
        Int IdTheme FK
        NVarChar FolderName
        NVarChar FileName
        Int Priority
        Int Deleted
    }
    CourseMaterial {
        Int Id PK
        NVarChar IdCourse FK
        Int IdMaterial FK
        Int Deleted
    }
    CourseStudent {
        Int Id PK
        NVarChar IdCourse FK
        UniqueIdentifier IdAccountStudent FK
        Int IsApprove
        DateTime ApproveDate
        Int Deleted
    }
    CourseSchedule {
        Int Id PK
        NVarChar IdCourse FK
        UniqueIdentifier IdAccountTeacher FK
        Date FromDate
        Date ToDate
        NVarChar Schedule
        Time FromTime
        Time ToTime
        Int Deleted
    }
    CourseScheduleDetail {
        Int Id PK
        Int IdCourseSchedule FK
        NVarChar IdCourse FK
        UniqueIdentifier IdAccountTeacher FK
        Date Date
        Time FromTime
        Time ToTime
        Int FromPeriodIndexes
        Int ToPeriodIndexes
        Boolean IsOnline
        VarChar LinkOnline
        TinyInt Status
        NVarChar Note
        Int Deleted
    }
    CourseAttendanceStudent {
        Int Id PK
        UniqueIdentifier IdAccount FK
        UniqueIdentifier IdAccountStudent FK
        NVarChar IdCourse FK
        Int IdLevel
        Int IdTheme
        Int IdLesson
        DateTime StartDate
        TinyInt Status
        Int Deleted
    }
    CourseAttendanceTeacher {
        Int Id PK
        UniqueIdentifier IdAccount FK
        NVarChar IdCourse FK
        Int IdLevel
        Int IdTheme
        Int IdLesson
        DateTime StartDate
        Int Deleted
    }
    CourseAssignment {
        Int Id PK
        NVarChar IdCourse FK
        NVarChar AssignmentTitle
        NVarChar AssignmentFile
        NVarChar AssignmentDescription
        DateTime StartDate
        DateTime CloseDate
        Int IdTheme
        Int IdLesson
        Int ExampleType
        Int Deleted
    }
    CourseAssignmentStudent {
        Int Id PK
        Int IdAssignment FK
        UniqueIdentifier IdAccountStudent FK
        Int IsAsign
        Int Deleted
    }
    CourseAssignmentSubmission {
        Int Id PK
        NVarChar IdCourse FK
        Int IdCourseAssignmentStudent FK
        UniqueIdentifier IdAccountStudent FK
        NVarChar FileUrl
        NVarChar FileName
        Boolean IsLate
        Int Deleted
    }
    CourseAssignmentStudentEvaluation {
        Int Id PK
        Int IdCourseAssignmentStudent FK
        UniqueIdentifier IdAccountStudent FK
        Float Score
        NVarChar Remake
        Int Deleted
    }
    AccountSalary {
        Int Id PK
        UniqueIdentifier IdAccount FK
        TinyInt TypeSalary
        TinyInt TypeTeacher
        TinyInt IdMonetaryUnit
        Decimal SalaryPerHour
        Decimal SalaryPerMonth
        Int WarrantyHours
        Int IdPaymentMethod
        Int NumberAccountBank
        Int Deleted
    }
    CourseScheduleDetailSalary {
        Int Id PK
        Int IdSchool
        Int IdCourseSchedule
        NVarChar IdCourse
        UniqueIdentifier IdAccount FK
        Int RoleOfSalary
        Date Date
        Int TotalPeriods
        Int TotalMinutes
        Int WarrantyHours
        TinyInt TypeSalary
        Decimal SalaryPerMonth
        Decimal SalaryPerHour
        TinyInt IdMonetaryUnit
        Decimal ExchangeRate
        Int Deleted
    }
    CurrencyExchange {
        Int Id PK
        NVarChar Currency
        Decimal ExchangeRate
        Int Deleted
    }

    Account ||--o{ AccountInRole : "has"
    AccountRole ||--o{ AccountInRole : "defines"
    AccountRole ||--o{ AccountRightInRole : "has"
    AccountRight ||--o{ AccountRightInRole : "defines"
    Account ||--o{ AccountSalary : "has"
    School ||--o{ Course : "hosts"
    Level ||--o{ Course : "configures"
    Course ||--o{ CourseStudent : "registers"
    Account ||--o{ CourseStudent : "attends"
    Course ||--o{ CourseMaterial : "assigned_to"
    Material ||--o{ CourseMaterial : "defines"
    Material ||--o{ MaterialTheme : "has"
    MaterialTheme ||--o{ MaterialLesson : "has"
    Course ||--o{ CourseSchedule : "has"
    CourseSchedule ||--o{ CourseScheduleDetail : "defines"
    Account ||--o{ CourseSchedule : "teaches"
    Account ||--o{ CourseScheduleDetail : "teaches"
    Course ||--o{ CourseAttendanceStudent : "tracks"
    Course ||--o{ CourseAttendanceTeacher : "tracks"
    Course ||--o{ CourseAssignment : "contains"
    CourseAssignment ||--o{ CourseAssignmentStudent : "assigned"
    CourseAssignmentStudent ||--o{ CourseAssignmentSubmission : "submits"
    CourseAssignmentStudent ||--o{ CourseAssignmentStudentEvaluation : "evaluates"
```

### 3.3 Mô tả chi tiết các bảng dữ liệu

Dưới đây là mô tả chi tiết cấu trúc các bảng dữ liệu tương ứng với 5 nhóm chức năng trọng tâm của hệ thống:

#### 3.3.1 Nhóm 1: Xác thực & Phân quyền (Auth & RBAC)

##### 1. Bảng `Account` (Tài khoản người dùng)
Bảng lưu trữ thông tin đăng nhập, hồ sơ cá nhân của quản trị viên, giáo viên, học sinh và phụ huynh.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Khóa | NULL? | Mô tả |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Id** | UniqueIdentifier | Mặc định sinh UUID | PK | No | Mã định danh duy nhất của tài khoản. |
| **UserName** | NVarChar(100) | Duy nhất | | Yes | Tên đăng nhập vào hệ thống. |
| **FullName** | NVarChar(100) | | | Yes | Họ và tên đầy đủ của người dùng. |
| **BirthDay** | Date | | | Yes | Ngày sinh của người dùng. |
| **IdGender** | Int | FK (Gender.Id) | FK | Yes | Mã giới tính (Nam/Nữ/Khác). |
| **PasswordSalt** | NVarChar(128) | | | Yes | Chuỗi muối ngẫu nhiên tăng cường bảo mật mật khẩu. |
| **Password** | NVarChar(128) | | | Yes | Mật khẩu tài khoản đã mã hóa. |
| **Active** | Boolean | | | Yes | Trạng thái hoạt động (true: Đang hoạt động, false: Khóa). |
| **ActiveToken** | UniqueIdentifier | | | Yes | Token dùng để kích hoạt tài khoản hoặc đặt lại mật khẩu. |
| **Phone** | NVarChar(11) | | | Yes | Số điện thoại liên lạc. |
| **Email** | NVarChar(100) | | | Yes | Địa chỉ thư điện tử. |
| **Provider** | NVarChar(20) | | | Yes | Nhà cung cấp đăng nhập (Ví dụ: "Credentials", "Google"). |
| **Address** | NVarChar(500) | | | Yes | Địa chỉ cư trú. |
| **IdCity** | Int | | | Yes | Mã thành phố/tỉnh thành. |
| **IdDistrict** | Int | | | Yes | Mã quận/huyện. |
| **LinkAvatar** | NVarChar(500) | | | Yes | Liên kết hình ảnh đại diện người dùng. |
| **Deleted** | Int | Mặc định 0 | | Yes | Cờ xóa mềm (0: Chưa xóa, 1: Đã xóa). |
| **Created_By** | NVarChar(50) | | | Yes | Người tạo tài khoản. |
| **Created_Date** | DateTime | | | Yes | Thời điểm khởi tạo bản ghi. |
| **Modified_By** | NVarChar(50) | | | Yes | Người cập nhật lần cuối. |
| **Modified_Date** | DateTime | | | Yes | Thời điểm cập nhật lần cuối. |

##### 2. Bảng `AccountRole` (Vai trò)
Bảng định nghĩa các nhóm vai trò trong hệ thống (như Admin, Giáo viên, Học sinh, Phụ huynh).

| Tên cột | Kiểu dữ liệu | Ràng buộc | Khóa | NULL? | Mô tả |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Id** | Int | Tự tăng (Identity) | PK | No | Mã định danh duy nhất của vai trò. |
| **Name** | NVarChar(100) | | | Yes | Tên vai trò (Ví dụ: "Admin", "Teacher", "Student"). |
| **Deleted** | Int | Mặc định 0 | | Yes | Cờ xóa mềm. |
| **Created_By** | NVarChar(50) | | | Yes | Người tạo vai trò. |
| **Created_Date** | DateTime | | | Yes | Thời điểm khởi tạo bản ghi. |

##### 3. Bảng `AccountInRole` (Gán vai trò cho tài khoản)
Bảng trung gian liên kết tài khoản với vai trò tương ứng (quan hệ n-n).

| Tên cột | Kiểu dữ liệu | Ràng buộc | Khóa | NULL? | Mô tả |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Id** | Int | Tự tăng (Identity) | PK | No | Mã định danh duy nhất của liên kết. |
| **IdAccount** | UniqueIdentifier | FK (Account.Id) | FK | Yes | Mã tài khoản được gán vai trò. |
| **IdAccountRole** | Int | FK (AccountRole.Id) | FK | Yes | Mã vai trò được gán. |
| **Deleted** | Int | Mặc định 0 | | Yes | Cờ xóa mềm. |

##### 4. Bảng `AccountRight` (Quyền hạn hệ thống)
Bảng lưu trữ các quyền truy cập chi tiết dựa trên API Controller và Action của hệ thống.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Khóa | NULL? | Mô tả |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Id** | Int | Tự tăng (Identity) | PK | No | Mã định danh duy nhất của quyền hạn. |
| **Indexes** | Int | | | Yes | Chỉ số sắp xếp quyền. |
| **RightsName** | NVarChar(50) | | | Yes | Tên quyền (Ví dụ: "CREATE_COURSE"). |
| **Label** | NVarChar(50) | | | Yes | Nhãn hiển thị của quyền hạn trên UI. |
| **RightsDescription** | NVarChar(500) | | | Yes | Mô tả chi tiết quyền hạn làm gì. |
| **Action** | NVarChar(50) | | | Yes | Tên hàm API xử lý (Action). |
| **Controller** | NVarChar(50) | | | Yes | Tên cụm API xử lý (Controller). |
| **Area** | NVarChar(50) | | | Yes | Khu vực phân vùng hệ thống. |
| **IsDefault** | Boolean | | | Yes | Quyền mặc định hệ thống. |
| **Deleted** | Int | Mặc định 0 | | Yes | Cờ xóa mềm. |

##### 5. Bảng `AccountRightInRole` (Gán quyền cho vai trò)
Bảng trung gian định nghĩa tập hợp các quyền chi tiết mà một vai trò được phép thực thi.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Khóa | NULL? | Mô tả |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Id** | Int | Tự tăng (Identity) | PK | No | Mã định danh duy nhất của liên kết. |
| **IdAccountRole** | Int | FK (AccountRole.Id) | FK | Yes | Mã vai trò được cấu hình. |
| **IdAccountRight** | Int | FK (AccountRight.Id) | FK | Yes | Mã quyền hạn được cấp phép. |
| **Deleted** | Int | Mặc định 0 | | Yes | Cờ xóa mềm. |


#### 3.3.2 Nhóm 2: Chương trình học & Lớp học (Curriculum & Classes)

##### 1. Bảng `School` (Cơ sở trường học / Chi nhánh)
Lưu thông tin các cơ sở đào tạo, chi nhánh trực thuộc trung tâm.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Khóa | NULL? | Mô tả |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Id** | Int | Tự tăng (Identity) | PK | No | Mã định danh duy nhất của cơ sở. |
| **Name** | NVarChar(100) | | | Yes | Tên chi nhánh / cơ sở. |
| **Phone** | NVarChar(11) | | | Yes | Số điện thoại chi nhánh. |
| **Address** | NVarChar(500) | | | Yes | Địa chỉ chi nhánh. |
| **IdCity** | Int | | | Yes | Tỉnh/thành của chi nhánh. |
| **IdDistrict** | Int | | | Yes | Quận/huyện của chi nhánh. |
| **Thumbnail** | VarChar(500) | | | Yes | Ảnh đại diện của chi nhánh. |
| **Deleted** | Int | Mặc định 0 | | Yes | Cờ xóa mềm. |

##### 2. Bảng `Level` (Trình độ đào tạo / Cấp học)
Định nghĩa các cấp bậc học lực (Ví dụ: Starter, Elementary, Intermediate, Upper-Intermediate).

| Tên cột | Kiểu dữ liệu | Ràng buộc | Khóa | NULL? | Mô tả |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Id** | Int | Tự tăng (Identity) | PK | No | Mã định danh duy nhất của trình độ. |
| **Name** | NVarChar(100) | | | Yes | Tên cấp độ. |
| **Deleted** | Int | Mặc định 0 | | Yes | Cờ xóa mềm. |

##### 3. Bảng `Course` (Lớp học / Khóa học)
Quản lý thông tin lớp học cụ thể, các thuộc tính tổ chức, liên kết học tập và thời gian hoạt động.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Khóa | NULL? | Mô tả |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Id** | NVarChar(20) | Mã tự soạn | PK | No | Mã lớp học duy nhất (Ví dụ: "CLASS_TOEIC_990"). |
| **Name** | NVarChar(200) | | | Yes | Tên lớp học. |
| **IdSchool** | Int | FK (School.Id) | FK | No | Mã cơ sở trường học quản lý lớp. |
| **IdLevel** | Int | FK (Level.Id) | FK | No | Mã trình độ yêu cầu của lớp học. |
| **LinkEnrol** | NVarChar(500) | | | Yes | Liên kết ghi danh công khai. |
| **IsOnline** | Boolean | | | Yes | Dạy học trực tuyến (true: Online, false: Offline tại cơ sở). |
| **LinkOnline** | VarChar(500) | | | Yes | Liên kết học trực tuyến (Zoom, Google Meet...). |
| **Thumbnail** | VarChar(500) | | | Yes | Hình ảnh thu nhỏ của lớp học. |
| **Status** | Int | | | Yes | Trạng thái lớp học (Ví dụ: 0: Chờ mở, 1: Đang học, 2: Kết thúc). |
| **StartDate** | Date | | | Yes | Ngày khai giảng lớp học. |
| **EndDate** | Date | | | Yes | Ngày bế giảng dự kiến. |
| **Deleted** | Int | Mặc định 0 | | Yes | Cờ xóa mềm. |

##### 4. Bảng `Material` (Giáo trình đào tạo)
Lưu trữ thông tin giáo trình, sách tài liệu chung của hệ thống.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Khóa | NULL? | Mô tả |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Id** | Int | Tự tăng (Identity) | PK | No | Mã định danh giáo trình. |
| **Name** | NVarChar(100) | | | Yes | Tên sách / giáo trình. |
| **IdLevel** | Int | FK (Level.Id) | FK | Yes | Trình độ tương thích của giáo trình. |
| **Types** | Int | | | Yes | Loại giáo trình học tập. |
| **ImageUrl** | NVarChar(255) | | | Yes | Ảnh bìa giáo trình. |
| **FolderName** | NVarChar(50) | | | Yes | Tên thư mục lưu trữ tài liệu vật lý. |
| **Deleted** | Int | Mặc định 0 | | Yes | Cờ xóa mềm. |

##### 5. Bảng `MaterialTheme` (Chủ đề học tập)
Định nghĩa các chương, chủ đề kiến thức lớn nằm trong một giáo trình cụ thể.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Khóa | NULL? | Mô tả |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Id** | Int | Tự tăng (Identity) | PK | No | Mã định danh chủ đề. |
| **IdMaterial** | Int | FK (Material.Id) | FK | Yes | Thuộc về giáo trình nào. |
| **Name** | NVarChar(100) | | | Yes | Tên ngắn của chủ đề. |
| **Title** | NVarChar(100) | | | Yes | Tiêu đề chi tiết của chủ đề. |
| **IdLevel** | Int | | | Yes | Cấp độ chủ đề. |
| **Priority** | Int | | | Yes | Thứ tự sắp xếp hiển thị. |
| **FolderName** | NVarChar(50) | | | Yes | Tên thư mục con vật lý lưu trữ chủ đề. |
| **Deleted** | Int | Mặc định 0 | | Yes | Cờ xóa mềm. |

##### 6. Bảng `MaterialLesson` (Bài học chi tiết)
Chi tiết hóa các bài học cụ thể nằm dưới một chủ đề nhất định.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Khóa | NULL? | Mô tả |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Id** | Int | Tự tăng (Identity) | PK | No | Mã định danh bài học. |
| **IdMaterial** | Int | FK (Material.Id) | FK | Yes | Thuộc về giáo trình nào. |
| **Name** | NVarChar(100) | | | Yes | Tên ngắn của bài học. |
| **Title** | NVarChar(100) | | | Yes | Tiêu đề đầy đủ của bài học. |
| **IdLevel** | Int | | | Yes | Cấp độ bài học. |
| **IdTheme** | Int | FK (MaterialTheme.Id) | FK | Yes | Thuộc về chương/chủ đề nào. |
| **FolderName** | NVarChar(50) | | | Yes | Thư mục vật lý lưu trữ bài học. |
| **FileName** | NVarChar(100) | | | Yes | Tên tệp tin bài giảng chính đính kèm. |
| **Priority** | Int | | | Yes | Thứ tự ưu tiên sắp xếp trong chương. |
| **Deleted** | Int | Mặc định 0 | | Yes | Cờ xóa mềm. |


#### 3.3.3 Nhóm 3: Điểm danh & Lịch học (Attendance & Schedule)

##### 1. Bảng `CourseSchedule` (Khung lịch tuần tổng quát)
Bảng định nghĩa lịch học hàng tuần cố định của một lớp học (Dùng để tính toán sinh lịch chi tiết).

| Tên cột | Kiểu dữ liệu | Ràng buộc | Khóa | NULL? | Mô tả |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Id** | Int | Tự tăng (Identity) | PK | No | Mã định danh khung lịch học. |
| **IdCourse** | NVarChar(20) | FK (Course.Id) | FK | Yes | Mã lớp học được thiết lập lịch. |
| **IdAccountTeacher** | UniqueIdentifier | FK (Account.Id) | FK | Yes | Giáo viên giảng dạy chính được phân bổ. |
| **FromDate** | Date | | | Yes | Ngày bắt đầu áp dụng lịch tuần. |
| **ToDate** | Date | | | Yes | Ngày kết thúc áp dụng lịch tuần. |
| **Schedule** | NVarChar(7) | Ví dụ: "1010000" | | Yes | Chuỗi bit nhị phân đại diện các thứ trong tuần (từ Thứ 2 đến Chủ nhật, 1: có lịch, 0: không lịch). |
| **FromTime** | Time | | | Yes | Thời gian bắt đầu buổi học. |
| **ToTime** | Time | | | Yes | Thời gian kết thúc buổi học. |
| **Deleted** | Int | Mặc định 0 | | Yes | Cờ xóa mềm. |

##### 2. Bảng `CourseScheduleDetail` (Lịch học chi tiết từng buổi)
Lưu thông tin cụ thể của từng buổi học diễn ra trong thực tế (Là cơ sở để điểm danh và tính lương).

| Tên cột | Kiểu dữ liệu | Ràng buộc | Khóa | NULL? | Mô tả |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Id** | Int | Tự tăng (Identity) | PK | No | Mã định danh buổi học chi tiết. |
| **IdCourseSchedule** | Int | FK (CourseSchedule.Id) | FK | Yes | Kế thừa từ khung lịch học nào. |
| **IdCourse** | NVarChar(20) | | | Yes | Mã lớp học. |
| **IdAccountTeacher** | UniqueIdentifier | FK (Account.Id) | FK | Yes | Giáo viên giảng dạy buổi học này (có thể là giáo viên dạy thay). |
| **Date** | Date | | | Yes | Ngày diễn ra buổi học thực tế. |
| **FromTime** | Time | | | Yes | Giờ bắt đầu học thực tế. |
| **ToTime** | Time | | | Yes | Giờ kết thúc học thực tế. |
| **FromPeriodIndexes** | Int | | | Yes | Chỉ số tiết học bắt đầu. |
| **ToPeriodIndexes** | Int | | | Yes | Chỉ số tiết học kết thúc. |
| **IsOnline** | Boolean | | | Yes | Buổi học này diễn ra trực tuyến (true) hay trực tiếp (false). |
| **LinkOnline** | VarChar(500) | | | Yes | Đường dẫn phòng học trực tuyến của riêng buổi học này. |
| **Status** | TinyInt | | | Yes | Trạng thái buổi học (Ví dụ: 0: Chưa diễn ra, 1: Đã hoàn thành/Điểm danh, 2: Đã hủy). |
| **Note** | NVarChar(500) | | | Yes | Ghi chú của giáo viên hoặc admin về buổi học. |
| **Deleted** | Int | Mặc định 0 | | Yes | Cờ xóa mềm. |

##### 3. Bảng `CourseAttendanceStudent` (Điểm danh học viên)
Bảng ghi nhận sự hiện diện và trạng thái chuyên cần của học sinh trong mỗi buổi học.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Khóa | NULL? | Mô tả |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Id** | Int | Tự tăng (Identity) | PK | No | Mã định danh bản ghi điểm danh. |
| **IdAccount** | UniqueIdentifier | | | Yes | Tài khoản phụ huynh hoặc tài khoản ghi nhận. |
| **IdAccountStudent** | UniqueIdentifier | FK (Account.Id) | FK | Yes | Mã tài khoản học sinh được điểm danh. |
| **IdCourse** | NVarChar(20) | FK (Course.Id) | FK | Yes | Mã lớp học. |
| **IdLevel** | Int | | | Yes | Mã cấp độ lớp học tại thời điểm đó. |
| **IdTheme** | Int | | | Yes | Mã chủ đề học tập đang dạy trong buổi. |
| **IdLesson** | Int | | | Yes | Mã bài học cụ thể đang dạy trong buổi. |
| **StartDate** | DateTime | | | Yes | Thời gian điểm danh thực tế. |
| **Status** | TinyInt | 0/1/2/3 | | Yes | Trạng thái chuyên cần (0: Vắng không phép, 1: Có mặt, 2: Vắng có phép, 3: Đi muộn). |
| **Deleted** | Int | Mặc định 0 | | Yes | Cờ xóa mềm. |

##### 4. Bảng `CourseAttendanceTeacher` (Xác nhận buổi dạy của giáo viên)
Bảng lưu trữ thông tin đối soát giờ dạy thực tế của giáo viên để phục vụ quá trình kết toán lương.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Khóa | NULL? | Mô tả |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Id** | Int | Tự tăng (Identity) | PK | No | Mã định danh ghi nhận buổi dạy. |
| **IdAccount** | UniqueIdentifier | FK (Account.Id) | FK | Yes | Mã tài khoản giáo viên thực hiện giảng dạy. |
| **IdCourse** | NVarChar(20) | FK (Course.Id) | FK | Yes | Mã lớp học. |
| **IdLevel** | Int | | | Yes | Trình độ đang dạy. |
| **IdTheme** | Int | | | Yes | Mã chủ đề giảng dạy trong buổi học. |
| **IdLesson** | Int | | | Yes | Mã bài giảng trong buổi học. |
| **StartDate** | DateTime | | | Yes | Thời điểm xác nhận hoàn thành buổi dạy. |
| **Deleted** | Int | Mặc định 0 | | Yes | Cờ xóa mềm. |


#### 3.3.4 Nhóm 4: Bài tập về nhà (Homework & Assignments)

##### 1. Bảng `CourseAssignment` (Danh sách bài tập đã giao)
Lưu thông tin cơ bản của các bài tập do giáo viên tạo ra và giao cho lớp học.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Khóa | NULL? | Mô tả |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Id** | Int | Tự tăng (Identity) | PK | No | Mã định danh bài tập. |
| **IdCourse** | NVarChar(20) | FK (Course.Id) | FK | Yes | Thuộc về lớp học nào. |
| **AssignmentTitle** | NVarChar(500) | | | Yes | Tiêu đề của bài tập. |
| **AssignmentFile** | NVarChar(500) | | | Yes | Liên kết tệp đề bài đính kèm (PDF, Hình ảnh...). |
| **AssignmentDescription** | NVarChar(Max) | | | Yes | Mô tả, yêu cầu chi tiết hoặc câu hỏi đề bài. |
| **StartDate** | DateTime | | | Yes | Thời gian bắt đầu cho phép học sinh nộp bài. |
| **CloseDate** | DateTime | | | Yes | Thời hạn cuối nộp bài tập (Hạn chót). |
| **IdTheme** | Int | | | Yes | Chủ đề liên kết của bài tập. |
| **IdLesson** | Int | | | Yes | Bài học liên kết của bài tập. |
| **ExampleType** | Int | | | Yes | Phân loại bài tập (Ví dụ: Trắc nghiệm, Tự luận, Dự án). |
| **Deleted** | Int | Mặc định 0 | | Yes | Cờ xóa mềm. |

##### 2. Bảng `CourseAssignmentStudent` (Phân bổ bài tập cho học viên)
Bảng trung gian liên kết bài tập với các học sinh cụ thể trong lớp phải hoàn thành bài tập đó.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Khóa | NULL? | Mô tả |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Id** | Int | Tự tăng (Identity) | PK | No | Mã định danh liên kết phân bổ. |
| **IdAssignment** | Int | FK (CourseAssignment.Id) | FK | Yes | Mã bài tập được giao. |
| **IdAccountStudent** | UniqueIdentifier | | | Yes | Mã tài khoản học sinh phải làm bài. |
| **IsAsign** | Int | | | Yes | Trạng thái phân bổ (Ví dụ: 1: Đã giao, 0: Tạm hoãn). |
| **Deleted** | Int | Mặc định 0 | | Yes | Cờ xóa mềm. |

##### 3. Bảng `CourseAssignmentSubmission` (Bài làm học viên nộp)
Bảng ghi nhận các tệp tin bài làm và thông tin thời gian nộp bài thực tế của học sinh.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Khóa | NULL? | Mô tả |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Id** | Int | Tự tăng (Identity) | PK | No | Mã định danh bài nộp. |
| **IdCourse** | NVarChar(20) | | | Yes | Mã lớp học. |
| **IdCourseAssignmentStudent** | Int | FK (CourseAssignmentStudent.Id) | FK | Yes | Liên kết bản ghi phân bổ bài tập. |
| **IdAccountStudent** | UniqueIdentifier | | | Yes | Mã tài khoản học sinh nộp bài. |
| **FileUrl** | NVarChar(500) | | | Yes | Đường dẫn tải tệp bài làm học sinh đã tải lên. |
| **FileName** | NVarChar(250) | | | Yes | Tên tệp tin gốc của bài làm. |
| **IsLate** | Boolean | | | Yes | Trạng thái nộp muộn (true: Quá hạn chót `CloseDate`, false: Đúng hạn). |
| **Deleted** | Int | Mặc định 0 | | Yes | Cờ xóa mềm. |

##### 4. Bảng `CourseAssignmentStudentEvaluation` (Chấm điểm & Đánh giá bài làm)
Lưu kết quả chấm bài của giáo viên đối với từng bài làm của học sinh.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Khóa | NULL? | Mô tả |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Id** | Int | Tự tăng (Identity) | PK | No | Mã định danh đánh giá. |
| **IdCourseAssignmentStudent** | Int | FK (CourseAssignmentStudent.Id) | FK | Yes | Liên kết bản ghi phân bổ bài tập. |
| **IdAccountStudent** | UniqueIdentifier | | | Yes | Mã tài khoản học sinh được đánh giá. |
| **Score** | Float | Hệ số 10 | | Yes | Điểm số của bài làm (0.0 đến 10.0). |
| **Remake** | NVarChar(Max) | | | Yes | Lời nhận xét, phản hồi chi tiết từ giáo viên. |
| **Deleted** | Int | Mặc định 0 | | Yes | Cờ xóa mềm. |


#### 3.3.5 Nhóm 5: Thù lao giáo viên (Teacher Compensation)

##### 1. Bảng `AccountSalary` (Chính sách cấu hình lương cơ bản)
Bảng thiết lập chế độ lương, thù lao giảng dạy cố định hoặc cộng tác viên cho từng giáo viên.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Khóa | NULL? | Mô tả |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Id** | Int | Tự tăng (Identity) | PK | No | Mã định danh cấu hình lương. |
| **IdAccount** | UniqueIdentifier | FK (Account.Id) | FK | Yes | Tài khoản giáo viên được cấu hình lương. |
| **TypeSalary** | TinyInt | | | Yes | Hình thức tính lương (1: Lương cứng theo tháng, 2: Lương theo giờ dạy). |
| **TypeTeacher** | TinyInt | | | Yes | Phân loại hợp đồng giáo viên (1: Cơ hữu/Fulltime, 2: Cộng tác viên/Parttime). |
| **IdMonetaryUnit** | TinyInt | FK (MonetaryUnit.Id) | | Yes | Đơn vị tiền tệ chính thanh toán (1: VND, 2: USD...). |
| **SalaryPerHour** | Decimal(10,0) | | | Yes | Đơn giá thù lao trả cho mỗi giờ dạy thực tế. |
| **SalaryPerMonth** | Decimal(10,0) | | | Yes | Lương cơ bản nhận theo tháng (áp dụng cho Fulltime). |
| **WarrantyHours** | Int | | | Yes | Số giờ dạy định mức tối thiểu cam kết mỗi tháng (giờ bảo hành). |
| **IdPaymentMethod** | Int | FK (PaymentMethod.Id) | | Yes | Phương thức thanh toán lương (Ví dụ: Chuyển khoản, Tiền mặt). |
| **NumberAccountBank** | Int | | | Yes | Số tài khoản ngân hàng nhận lương của giáo viên. |
| **Deleted** | Int | Mặc định 0 | | Yes | Cờ xóa mềm. |

##### 2. Bảng `CourseScheduleDetailSalary` (Chi tiết bảng thù lao theo ca dạy)
Lưu trữ thông tin tính thù lao chi tiết cho từng buổi dạy đã hoàn thành của giáo viên, làm đối soát cuối tháng.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Khóa | NULL? | Mô tả |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Id** | Int | Tự tăng (Identity) | PK | No | Mã định danh dòng thù lao buổi dạy. |
| **IdSchool** | Int | | | Yes | Mã cơ sở trường học xảy ra buổi dạy. |
| **IdCourseSchedule** | Int | | | Yes | Liên kết khung lịch học tổng quát. |
| **IdCourse** | NVarChar(20) | | | Yes | Mã lớp học giảng dạy. |
| **IdAccount** | UniqueIdentifier | | | Yes | Mã tài khoản giáo viên được hưởng thù lao. |
| **RoleOfSalary** | Int | | | Yes | Vai trò tính lương (Ví dụ: 1: Giảng dạy chính, 2: Trợ giảng). |
| **Date** | Date | | | Yes | Ngày diễn ra buổi dạy đối soát. |
| **TotalPeriods** | Int | | | Yes | Tổng số tiết dạy thực tế trong buổi. |
| **TotalMinutes** | Int | | | Yes | Tổng số phút dạy thực tế trong buổi. |
| **WarrantyHours** | Int | | | Yes | Số giờ định mức bảo hành của giáo viên tại thời điểm đó. |
| **TypeSalary** | TinyInt | | | Yes | Kiểu lương được áp dụng (Theo tháng hoặc Theo giờ). |
| **SalaryPerMonth** | Decimal(10,0) | | | Yes | Mức lương tháng áp dụng. |
| **SalaryPerHour** | Decimal(10,0) | | | Yes | Đơn giá giờ dạy áp dụng. |
| **IdMonetaryUnit** | TinyInt | | | Yes | Mã đơn vị tiền tệ áp dụng. |
| **ExchangeRate** | Decimal(10,0) | | | Yes | Tỷ giá quy đổi ngoại tệ tại thời điểm tính thù lao. |
| **Deleted** | Int | Mặc định 0 | | Yes | Cờ xóa mềm. |

##### 3. Bảng `CurrencyExchange` (Cấu hình tỷ giá tiền tệ)
Lưu trữ tỷ giá ngoại tệ phục vụ việc quy đổi chi trả thù lao cho giáo viên nước ngoài hoặc giáo viên trong nước.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Khóa | NULL? | Mô tả |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Id** | Int | Tự tăng (Identity) | PK | No | Mã định danh tỷ giá. |
| **Currency** | NVarChar(100) | | | Yes | Tên đồng tiền (Ví dụ: "USD", "VND"). |
| **ExchangeRate** | Decimal(10,0) | | | Yes | Tỷ giá quy đổi so với đồng tiền cơ sở (Ví dụ: 25000). |
| **Deleted** | Int | Mặc định 0 | | Yes | Cờ xóa mềm. |
