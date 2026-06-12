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
| FR-13 | Phân quyền đăng ký | Hệ thống chặn chức năng đăng ký tài khoản tự do trên UI và API của hệ thống để kiểm soát dữ liệu người dùng nội bộ. | Admin | High |

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

    %% Relationships
    (UC-03: Cấu hình lịch & Tạo lớp học) ..> (UC-02: Quản lý cơ sở trường học) : <<include>>
    (UC-05: Điểm danh học viên) ..> (UC-04: Quản lý lịch giảng dạy) : <<include>>
    (UC-07: Chỉnh sửa & Gia hạn bài tập) ..> (UC-06: Giao bài tập học viên) : <<extend>>
    (UC-09: Chấm điểm bài làm) ..> (UC-08: Xem tài liệu & Nộp bài làm) : <<include>>
    (UC-10: Đánh giá định kỳ học lực) ..> (UC-11: Xem Báo cáo học tập cá nhân) : <<include>>
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
