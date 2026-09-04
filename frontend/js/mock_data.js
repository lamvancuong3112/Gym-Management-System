/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ PHÒNG GYM (GYM MANAGEMENT SYSTEM)
 * DỮ LIỆU ĐỒNG BỘ 100% CHUẨN TỪ CSDL DATABASE `gym_management.sql` (mock_data.js)
 * ==============================================================================
 */

const STORAGE_KEY = 'GYM_MANAGEMENT_DB_V7';



// Dữ liệu đúng từng bản ghi trong gym_management.sql
const DEFAULT_DATABASE = {
  // 1. Bảng users (7 bản ghi chuẩn SQL + 1 tài khoản Staff demo)
  users: [
    { UserID: 1, Username: 'admin', Fullname: 'Văn Điền', Role: 'Admin', RoleTitle: 'Quản lý phòng tập', Status: 'Active' },
    { UserID: 2, Username: 'manager', Fullname: 'Nguyễn Văn Quản Lý', Role: 'Manager', RoleTitle: 'Quản lý chi nhánh', Status: 'Active' },
    { UserID: 3, Username: 'trainer01', Fullname: 'Nguyễn Minh Tuấn', Role: 'Trainer', RoleTitle: 'Huấn luyện viên', Status: 'Active' },
    { UserID: 4, Username: 'trainer02', Fullname: 'Trần Quốc Hùng', Role: 'Trainer', RoleTitle: 'Huấn luyện viên', Status: 'Active' },
    { UserID: 5, Username: 'member01', Fullname: 'Nguyễn Văn An', Role: 'Member', RoleTitle: 'Hội viên', Status: 'Active' },
    { UserID: 6, Username: 'member02', Fullname: 'Trần Thị Bình', Role: 'Member', RoleTitle: 'Hội viên', Status: 'Active' },
    { UserID: 7, Username: 'member03', Fullname: 'Lê Minh Cường', Role: 'Member', RoleTitle: 'Hội viên', Status: 'Inactive' },
    { UserID: 8, Username: 'staff01', Fullname: 'Văn Cường', Role: 'Staff', RoleTitle: 'Nhân viên hỗ trợ', Status: 'Active' }
  ],
  
  // 2. Bảng members (6 bản ghi chuẩn từ SQL)
  members: [
    { MemberID: 1, Code: 'HV-1001', Fullname: 'Nguyễn Văn An', Gender: 'Male', BirthDate: '2002-05-15', Phone: '0901234567', Email: 'an@gmail.com', Address: 'TP. Hồ Chí Minh', JoinDate: '2026-01-10', UserID: 5, PackageName: 'Gói 1 tháng', Price: 500000, PaymentStatus: 'Paid', PaymentMethod: 'VietQR', Status: 'Active', EndDate: '2026-02-10' },
    { MemberID: 2, Code: 'HV-1002', Fullname: 'Trần Thị Bình', Gender: 'Female', BirthDate: '2003-08-20', Phone: '0912345678', Email: 'binh@gmail.com', Address: 'TP. Hồ Chí Minh', JoinDate: '2026-01-15', UserID: 6, PackageName: 'Gói 3 tháng', Price: 1300000, PaymentStatus: 'Paid', PaymentMethod: 'Tiền mặt', Status: 'Active', EndDate: '2026-04-15' },
    { MemberID: 3, Code: 'HV-1003', Fullname: 'Lê Minh Cường', Gender: 'Male', BirthDate: '2001-11-10', Phone: '0923456789', Email: 'cuong@gmail.com', Address: 'Củ Chi', JoinDate: '2026-02-01', UserID: 7, PackageName: 'Gói 6 tháng', Price: 2400000, PaymentStatus: 'Paid', PaymentMethod: 'VietQR', Status: 'Active', EndDate: '2026-08-01' },
    { MemberID: 4, Code: 'HV-1004', Fullname: 'Phạm Hoàng Nam', Gender: 'Male', BirthDate: '2004-03-25', Phone: '0934567890', Email: 'nam@gmail.com', Address: 'Bình Dương', JoinDate: '2026-02-10', UserID: 5, PackageName: 'Gói 12 tháng', Price: 4200000, PaymentStatus: 'Paid', PaymentMethod: 'Thẻ POS', Status: 'Active', EndDate: '2027-02-10' },
    { MemberID: 5, Code: 'HV-1005', Fullname: 'Võ Ngọc Mai', Gender: 'Female', BirthDate: '2002-12-05', Phone: '0945678901', Email: 'mai@gmail.com', Address: 'Thủ Đức', JoinDate: '2026-02-20', UserID: 6, PackageName: 'Gói Premium 3 tháng', Price: 2000000, PaymentStatus: 'Paid', PaymentMethod: 'VietQR', Status: 'Active', EndDate: '2026-05-20' },
    { MemberID: 6, Code: 'HV-1006', Fullname: 'Đặng Quốc Huy', Gender: 'Male', BirthDate: '2003-06-18', Phone: '0956789012', Email: 'huy@gmail.com', Address: 'Quận 9', JoinDate: '2026-03-01', UserID: 7, PackageName: 'Gói 1 tháng', Price: 500000, PaymentStatus: 'Paid', PaymentMethod: 'Tiền mặt', Status: 'Active', EndDate: '2026-04-01' }
  ],


  // 3. Bảng packages (5 bản ghi chuẩn từ SQL)
  packages: [
    { PackageID: 1, PackageName: 'Gói 1 tháng', Duration: 1, Price: 500000, Description: 'Gói tập gym cơ bản trong 1 tháng' },
    { PackageID: 2, PackageName: 'Gói 3 tháng', Duration: 3, Price: 1300000, Description: 'Gói tập gym trong 3 tháng' },
    { PackageID: 3, PackageName: 'Gói 6 tháng', Duration: 6, Price: 2400000, Description: 'Gói tập gym trong 6 tháng' },
    { PackageID: 4, PackageName: 'Gói 12 tháng', Duration: 12, Price: 4200000, Description: 'Gói tập gym trong 12 tháng' },
    { PackageID: 5, PackageName: 'Gói Premium 3 tháng', Duration: 3, Price: 2000000, Description: 'Tập gym kết hợp hỗ trợ huấn luyện viên' }
  ],

  // 4. Bảng member_package (6 bản ghi chuẩn từ SQL)
  member_package: [
    { MemberPackageID: 1, StartDate: '2026-01-10', EndDate: '2026-02-10', Status: 'Active', MemberID: 1, PackageID: 1 },
    { MemberPackageID: 2, StartDate: '2026-01-15', EndDate: '2026-04-15', Status: 'Active', MemberID: 2, PackageID: 2 },
    { MemberPackageID: 3, StartDate: '2026-02-01', EndDate: '2026-08-01', Status: 'Active', MemberID: 3, PackageID: 3 },
    { MemberPackageID: 4, StartDate: '2026-02-10', EndDate: '2027-02-10', Status: 'Active', MemberID: 4, PackageID: 4 },
    { MemberPackageID: 5, StartDate: '2026-02-20', EndDate: '2026-05-20', Status: 'Active', MemberID: 5, PackageID: 5 },
    { MemberPackageID: 6, StartDate: '2026-03-01', EndDate: '2026-04-01', Status: 'Active', MemberID: 6, PackageID: 1 }
  ],

  // 5. Bảng trainers (2 bản ghi chuẩn từ SQL)
  trainers: [
    { TrainerID: 1, FullName: 'Nguyễn Minh Tuấn', Gender: 'Male', DateofBirth: '1995-03-15', Phone: '0961234567', Email: 'tuan.trainer@gmail.com', Specialty: 'Tăng cơ giảm mỡ', Experience: 5, Rating: 4.8, TotalStudents: 12, MonthlyIncome: 8500000, Status: 'Active', UserID: 3 },
    { TrainerID: 2, FullName: 'Trần Quốc Hùng', Gender: 'Male', DateofBirth: '1992-07-20', Phone: '0972345678', Email: 'hung.trainer@gmail.com', Specialty: 'Bodybuilding', Experience: 8, Rating: 5.0, TotalStudents: 15, MonthlyIncome: 11200000, Status: 'Active', UserID: 4 }
  ],

  // 6. Bảng bookings (6 bản ghi chuẩn từ SQL)
  bookings: [
    { BookingID: 1, BookingDate: '2026-03-05', StartTime: '08:00', EndTime: '09:00', Status: 'Confirmed', MemberID: 1, MemberName: 'Nguyễn Văn An', TrainerID: 1, TrainerName: 'Nguyễn Minh Tuấn', Notes: 'Luyện tập ngực & tay trước' },
    { BookingID: 2, BookingDate: '2026-03-05', StartTime: '09:00', EndTime: '10:00', Status: 'Confirmed', MemberID: 2, MemberName: 'Trần Thị Bình', TrainerID: 2, TrainerName: 'Trần Quốc Hùng', Notes: 'Tư vấn dinh dưỡng & cardio' },
    { BookingID: 3, BookingDate: '2026-03-06', StartTime: '17:00', EndTime: '18:00', Status: 'Completed', MemberID: 3, MemberName: 'Lê Minh Cường', TrainerID: 1, TrainerName: 'Nguyễn Minh Tuấn', Notes: 'Compound Squat & Lưng xô' },
    { BookingID: 4, BookingDate: '2026-03-06', StartTime: '18:00', EndTime: '19:00', Status: 'Confirmed', MemberID: 4, MemberName: 'Phạm Hoàng Nam', TrainerID: 2, TrainerName: 'Trần Quốc Hùng', Notes: 'Deadlift & Vai' },
    { BookingID: 5, BookingDate: '2026-03-07', StartTime: '08:00', EndTime: '09:00', Status: 'Cancelled', MemberID: 5, MemberName: 'Võ Ngọc Mai', TrainerID: 1, TrainerName: 'Nguyễn Minh Tuấn', Notes: 'Cardio đốt mỡ' },
    { BookingID: 6, BookingDate: '2026-03-07', StartTime: '09:00', EndTime: '10:00', Status: 'Confirmed', MemberID: 6, MemberName: 'Đặng Quốc Huy', TrainerID: 2, TrainerName: 'Trần Quốc Hùng', Notes: 'Tập bắp chân & bụng' }
  ],

  // 7. Bảng attendance (6 bản ghi chuẩn từ SQL)
  attendance: [
    { AttendanceID: 1, MemberID: 1, MemberName: 'Nguyễn Văn An', MemberCode: 'HV-1001', CheckInTime: '07:30', CheckOutTime: '09:00', AttendanceDate: '2026-03-05' },
    { AttendanceID: 2, MemberID: 2, MemberName: 'Trần Thị Bình', MemberCode: 'HV-1002', CheckInTime: '08:00', CheckOutTime: '09:30', AttendanceDate: '2026-03-05' },
    { AttendanceID: 3, MemberID: 3, MemberName: 'Lê Minh Cường', MemberCode: 'HV-1003', CheckInTime: '17:00', CheckOutTime: '18:30', AttendanceDate: '2026-03-06' },
    { AttendanceID: 4, MemberID: 4, MemberName: 'Phạm Hoàng Nam', MemberCode: 'HV-1004', CheckInTime: '18:00', CheckOutTime: '19:30', AttendanceDate: '2026-03-06' },
    { AttendanceID: 5, MemberID: 5, MemberName: 'Võ Ngọc Mai', MemberCode: 'HV-1005', CheckInTime: '07:00', CheckOutTime: '08:30', AttendanceDate: '2026-03-07' },
    { AttendanceID: 6, MemberID: 6, MemberName: 'Đặng Quốc Huy', MemberCode: 'HV-1006', CheckInTime: '09:00', CheckOutTime: '10:30', AttendanceDate: '2026-03-07' }
  ],

  // 8. Bảng payments (8 bản ghi đa dạng hình thức thanh toán)
  payments: [
    { PaymentsID: 1, Code: 'HD-801', MemberName: 'Nguyễn Văn An', PackageName: 'Gói 1 tháng', Amount: 500000, PaymentMethod: 'Cash', PaymentDate: '2026-01-10', Status: 'Paid', MemberPackageID: 1 },
    { PaymentsID: 2, Code: 'HD-802', MemberName: 'Trần Thị Bình', PackageName: 'Gói 3 tháng', Amount: 1300000, PaymentMethod: 'Banking', PaymentDate: '2026-01-15', Status: 'Paid', MemberPackageID: 2 },
    { PaymentsID: 3, Code: 'HD-803', MemberName: 'Lê Minh Cường', PackageName: 'Gói 6 tháng', Amount: 2400000, PaymentMethod: 'VNPay-QR', PaymentDate: '2026-02-01', Status: 'Paid', MemberPackageID: 3 },
    { PaymentsID: 4, Code: 'HD-804', MemberName: 'Phạm Hoàng Nam', PackageName: 'Gói 12 tháng', Amount: 4200000, PaymentMethod: 'Visa/Master', PaymentDate: '2026-02-10', Status: 'Paid', MemberPackageID: 4 },
    { PaymentsID: 5, Code: 'HD-805', MemberName: 'Võ Ngọc Mai', PackageName: 'Gói Premium 3 tháng', Amount: 2000000, PaymentMethod: 'ZaloPay', PaymentDate: '2026-02-20', Status: 'Paid', MemberPackageID: 5 },
    { PaymentsID: 6, Code: 'HD-806', MemberName: 'Đặng Quốc Huy', PackageName: 'Gói 1 tháng', Amount: 500000, PaymentMethod: 'Momo', PaymentDate: '2026-03-01', Status: 'Paid', MemberPackageID: 6 },
    { PaymentsID: 7, Code: 'HD-807', MemberName: 'Hoàng Văn Thắng', PackageName: 'Gói 6 tháng', Amount: 2400000, PaymentMethod: 'Banking', PaymentDate: '2026-03-05', Status: 'Paid', MemberPackageID: 7 },
    { PaymentsID: 8, Code: 'HD-808', MemberName: 'Bùi Tuyết Nhung', PackageName: 'Gói 12 tháng', Amount: 4200000, PaymentMethod: 'VNPay-QR', PaymentDate: '2026-03-08', Status: 'Paid', MemberPackageID: 8 }
  ],


  // 9. Bảng progress (6 bản ghi chuẩn từ SQL)
  progress: [
    { ProgressID: 1, MemberID: 1, MemberName: 'Nguyễn Văn An', RecordDate: '2026-03-01', Weight: 68.5, Height: 168.0, BodyFat: 18.5, MuscleMass: 52.3, TrainerName: 'Nguyễn Minh Tuấn' },
    { ProgressID: 2, MemberID: 2, MemberName: 'Trần Thị Bình', RecordDate: '2026-03-01', Weight: 55.2, Height: 160.0, BodyFat: 24.0, MuscleMass: 38.5, TrainerName: 'Trần Quốc Hùng' },
    { ProgressID: 3, MemberID: 3, MemberName: 'Lê Minh Cường', RecordDate: '2026-03-02', Weight: 72.0, Height: 175.0, BodyFat: 20.5, MuscleMass: 54.8, TrainerName: 'Nguyễn Minh Tuấn' },
    { ProgressID: 4, MemberID: 4, MemberName: 'Phạm Hoàng Nam', RecordDate: '2026-03-02', Weight: 80.5, Height: 178.0, BodyFat: 22.0, MuscleMass: 60.2, TrainerName: 'Trần Quốc Hùng' },
    { ProgressID: 5, MemberID: 5, MemberName: 'Võ Ngọc Mai', RecordDate: '2026-03-03', Weight: 58.3, Height: 162.0, BodyFat: 23.5, MuscleMass: 39.8, TrainerName: 'Nguyễn Minh Tuấn' },
    { ProgressID: 6, MemberID: 6, MemberName: 'Đặng Quốc Huy', RecordDate: '2026-03-03', Weight: 70.1, Height: 170.0, BodyFat: 19.0, MuscleMass: 53.7, TrainerName: 'Trần Quốc Hùng' }
  ],

  // 10. Bảng workout_plan (6 bản ghi chuẩn từ SQL)
  workout_plan: [
    { PlanID: 1, MemberID: 1, MemberName: 'Nguyễn Văn An', PlanName: 'Beginner Full Body', Goal: 'Tăng cơ', Description: 'Chương trình tập toàn thân dành cho người mới bắt đầu.', CreateDate: '2026-03-01' },
    { PlanID: 2, MemberID: 2, MemberName: 'Trần Thị Bình', PlanName: 'Fat Loss Program', Goal: 'Giảm mỡ', Description: 'Chương trình kết hợp tập tạ và cardio để giảm mỡ.', CreateDate: '2026-03-01' },
    { PlanID: 3, MemberID: 3, MemberName: 'Lê Minh Cường', PlanName: 'Muscle Building', Goal: 'Tăng cơ', Description: 'Chương trình tập trung phát triển khối lượng cơ.', CreateDate: '2026-03-02' },
    { PlanID: 4, MemberID: 4, MemberName: 'Phạm Hoàng Nam', PlanName: 'Strength Program', Goal: 'Tăng sức mạnh', Description: 'Chương trình tập trung vào các bài compound.', CreateDate: '2026-03-02' },
    { PlanID: 5, MemberID: 5, MemberName: 'Võ Ngọc Mai', PlanName: 'Weight Loss Beginner', Goal: 'Giảm cân', Description: 'Giáo án dành cho người mới bắt đầu giảm cân.', CreateDate: '2026-03-03' },
    { PlanID: 6, MemberID: 6, MemberName: 'Đặng Quốc Huy', PlanName: 'Lean Muscle', Goal: 'Tăng cơ giảm mỡ', Description: 'Chương trình hướng tới tăng cơ và kiểm soát lượng mỡ.', CreateDate: '2026-03-03' }
  ],

  // 11. Bảng feedbacks (6 bản ghi chuẩn từ SQL)
  feedbacks: [
    { FeedbackID: 1, TrainerID: 1, TrainerName: 'Nguyễn Minh Tuấn', MemberName: 'Nguyễn Văn An', Rating: 5, Comment: 'Huấn luyện viên hướng dẫn rất nhiệt tình.', FeedbackDate: '2026-03-05' },
    { FeedbackID: 2, TrainerID: 2, TrainerName: 'Trần Quốc Hùng', MemberName: 'Trần Thị Bình', Rating: 4, Comment: 'HLV có chuyên môn tốt và hỗ trợ tận tình.', FeedbackDate: '2026-03-06' },
    { FeedbackID: 3, TrainerID: 1, TrainerName: 'Nguyễn Minh Tuấn', MemberName: 'Lê Minh Cường', Rating: 5, Comment: 'Giáo án tập phù hợp với mục tiêu.', FeedbackDate: '2026-03-07' },
    { FeedbackID: 4, TrainerID: 2, TrainerName: 'Trần Quốc Hùng', MemberName: 'Phạm Hoàng Nam', Rating: 4, Comment: 'Thái độ phục vụ tốt, hướng dẫn dễ hiểu.', FeedbackDate: '2026-03-08' },
    { FeedbackID: 5, TrainerID: 1, TrainerName: 'Nguyễn Minh Tuấn', MemberName: 'Võ Ngọc Mai', Rating: 5, Comment: 'Rất hài lòng với quá trình tập luyện.', FeedbackDate: '2026-03-09' },
    { FeedbackID: 6, TrainerID: 2, TrainerName: 'Trần Quốc Hùng', MemberName: 'Đặng Quốc Huy', Rating: 3, Comment: 'Cần cải thiện thời gian phản hồi.', FeedbackDate: '2026-03-10' }
  ],

  // 12. Bảng products / Kho hàng bán lẻ (Khớp 100% CSDL MySQL `gym_management_system.products`)
  products: [
    { ProductID: 1, ID: 1, ProductName: 'Whey Protein', Name: 'Whey Protein', Category: 'Supplement', Price: 850000, Stock: 20, Description: 'Sữa protein hỗ trợ bổ sung đạm cho người tập gym', Status: 'Active' },
    { ProductID: 2, ID: 2, ProductName: 'Mass Gainer', Name: 'Mass Gainer', Category: 'Supplement', Price: 720000, Stock: 15, Description: 'Sản phẩm hỗ trợ tăng cân và bổ sung năng lượng', Status: 'Active' },
    { ProductID: 3, ID: 3, ProductName: 'Pre Workout', Name: 'Pre Workout', Category: 'Supplement', Price: 450000, Stock: 10, Description: 'Thực phẩm bổ sung trước khi tập luyện', Status: 'Active' },
    { ProductID: 4, ID: 4, ProductName: 'Áo Gym', Name: 'Áo Gym', Category: 'Clothing', Price: 250000, Stock: 30, Description: 'Áo thể thao dành cho hội viên', Status: 'Active' },
    { ProductID: 5, ID: 5, ProductName: 'Quần Short Gym', Name: 'Quần Short Gym', Category: 'Clothing', Price: 220000, Stock: 25, Description: 'Quần short thể thao', Status: 'Active' },
    { ProductID: 6, ID: 6, ProductName: 'Găng Tay Gym', Name: 'Găng Tay Gym', Category: 'Accessory', Price: 180000, Stock: 20, Description: 'Găng tay hỗ trợ tập luyện', Status: 'Active' },
    { ProductID: 7, ID: 7, ProductName: 'Bình Nước Gym', Name: 'Bình Nước Gym', Category: 'Accessory', Price: 120000, Stock: 35, Description: 'Bình nước thể thao 750ml', Status: 'Active' },
    { ProductID: 8, ID: 8, ProductName: 'Nước Suối', Name: 'Nước Suối', Category: 'Beverage', Price: 15000, Stock: 100, Description: 'Nước suối đóng chai', Status: 'Active' }
  ],

  inventory: [
    { ProductID: 1, ID: 1, ProductName: 'Whey Protein', Name: 'Whey Protein', Category: 'Supplement', Price: 850000, Stock: 20, Description: 'Sữa protein hỗ trợ bổ sung đạm cho người tập gym', Status: 'Còn hàng' },
    { ProductID: 2, ID: 2, ProductName: 'Mass Gainer', Name: 'Mass Gainer', Category: 'Supplement', Price: 720000, Stock: 15, Description: 'Sản phẩm hỗ trợ tăng cân và bổ sung năng lượng', Status: 'Còn hàng' },
    { ProductID: 3, ID: 3, ProductName: 'Pre Workout', Name: 'Pre Workout', Category: 'Supplement', Price: 450000, Stock: 10, Description: 'Thực phẩm bổ sung trước khi tập luyện', Status: 'Còn hàng' },
    { ProductID: 4, ID: 4, ProductName: 'Áo Gym', Name: 'Áo Gym', Category: 'Clothing', Price: 250000, Stock: 30, Description: 'Áo thể thao dành cho hội viên', Status: 'Còn hàng' },
    { ProductID: 5, ID: 5, ProductName: 'Quần Short Gym', Name: 'Quần Short Gym', Category: 'Clothing', Price: 220000, Stock: 25, Description: 'Quần short thể thao', Status: 'Còn hàng' },
    { ProductID: 6, ID: 6, ProductName: 'Găng Tay Gym', Name: 'Găng Tay Gym', Category: 'Accessory', Price: 180000, Stock: 20, Description: 'Găng tay hỗ trợ tập luyện', Status: 'Còn hàng' },
    { ProductID: 7, ID: 7, ProductName: 'Bình Nước Gym', Name: 'Bình Nước Gym', Category: 'Accessory', Price: 120000, Stock: 35, Description: 'Bình nước thể thao 750ml', Status: 'Còn hàng' },
    { ProductID: 8, ID: 8, ProductName: 'Nước Suối', Name: 'Nước Suối', Category: 'Beverage', Price: 15000, Stock: 100, Description: 'Nước suối đóng chai', Status: 'Còn hàng' }
  ],

  // 14. Bảng salaries (Khớp 100% Figma Prototype)
  salaries: [
    { ID: 1, Code: 'NV102', Name: 'Trần Quốc Bảo', Role: 'Trainer (FT)', WorkDays: '26/26', Sessions: 42, LateDays: 0, BaseSalary: 8000000, Allowance: 8400000, Bonus: 0, Deduction: 0, Note: '', TotalSalary: 16400000, Status: 'Đã duyệt' },
    { ID: 2, Code: 'NV105', Name: 'Nguyễn Thị Yến', Role: 'Trainer (PT)', WorkDays: '20/26', Sessions: 36, LateDays: 2, BaseSalary: 4500000, Allowance: 7200000, Bonus: 0, Deduction: 0, Note: '', TotalSalary: 11700000, Status: 'Đã duyệt' },
    { ID: 3, Code: 'NV108', Name: 'Lê Đức Mạnh', Role: 'Trainer (FT)', WorkDays: '26/26', Sessions: 34, LateDays: 1, BaseSalary: 8000000, Allowance: 6800000, Bonus: 0, Deduction: 0, Note: '', TotalSalary: 14800000, Status: 'Đã duyệt' },
    { ID: 4, Code: 'NV201', Name: 'Phạm Anh Tuấn', Role: 'Staff', WorkDays: '24/26', Sessions: 0, LateDays: 4, BaseSalary: 6500000, Allowance: 300000, Bonus: 0, Deduction: 0, Note: '', TotalSalary: 6800000, Status: 'Đã duyệt' },
    { ID: 5, Code: 'NV110', Name: 'Võ Minh Tâm', Role: 'Trainer (FT)', WorkDays: '25/26', Sessions: 27, LateDays: 0, BaseSalary: 8000000, Allowance: 5400000, Bonus: 0, Deduction: 0, Note: '', TotalSalary: 13400000, Status: 'Đã duyệt' },
    { ID: 6, Code: 'NV112', Name: 'Lâm Thế Vinh', Role: 'Trainer (PT)', WorkDays: '18/26', Sessions: 12, LateDays: 0, BaseSalary: 4500000, Allowance: 2400000, Bonus: 0, Deduction: 0, Note: '', TotalSalary: 6900000, Status: 'Đã duyệt' }
  ],

  // 15. Bảng staff_attendance (Chấm công nhân viên & HLV chuẩn MySQL)
  staff_attendance: [
    { AttendanceStaffID: 1, UserID: 8, StaffCode: 'NV201', StaffName: 'Lâm Văn Cường', ShiftDate: '2026-08-31', ShiftName: 'Ca Sáng (06:00 - 14:00)', CheckInTime: '05:55:00', CheckOutTime: '14:05:00', WorkHours: 8.15, Status: 'OnTime', Note: 'Đúng giờ' },
    { AttendanceStaffID: 2, UserID: 8, StaffCode: 'NV201', StaffName: 'Lâm Văn Cường', ShiftDate: '2026-08-30', ShiftName: 'Ca Sáng (06:00 - 14:00)', CheckInTime: '06:12:00', CheckOutTime: '14:00:00', WorkHours: 7.80, Status: 'Late', Note: 'Đi trễ 12p do kẹt xe' },
    { AttendanceStaffID: 3, UserID: 8, StaffCode: 'NV201', StaffName: 'Lâm Văn Cường', ShiftDate: '2026-08-29', ShiftName: 'Ca Sáng (06:00 - 14:00)', CheckInTime: '05:58:00', CheckOutTime: '14:00:00', WorkHours: 8.00, Status: 'OnTime', Note: 'Đúng giờ' },
    { AttendanceStaffID: 4, UserID: 8, StaffCode: 'NV201', StaffName: 'Lâm Văn Cường', ShiftDate: '2026-08-28', ShiftName: 'Ca Chiều (14:00 - 22:00)', CheckInTime: '13:50:00', CheckOutTime: '22:05:00', WorkHours: 8.25, Status: 'OnTime', Note: 'Tăng ca kiểm kho' },
    { AttendanceStaffID: 5, UserID: 8, StaffCode: 'NV201', StaffName: 'Lâm Văn Cường', ShiftDate: '2026-08-27', ShiftName: 'Ca Sáng (06:00 - 14:00)', CheckInTime: '05:52:00', CheckOutTime: '14:00:00', WorkHours: 8.10, Status: 'OnTime', Note: 'Đúng giờ' },
    { AttendanceStaffID: 6, UserID: 8, StaffCode: 'NV201', StaffName: 'Lâm Văn Cường', ShiftDate: '2026-08-26', ShiftName: 'Ca Sáng (06:00 - 14:00)', CheckInTime: '05:50:00', CheckOutTime: '14:00:00', WorkHours: 8.15, Status: 'OnTime', Note: 'Đúng giờ' },
    { AttendanceStaffID: 7, UserID: 8, StaffCode: 'NV201', StaffName: 'Lâm Văn Cường', ShiftDate: '2026-08-25', ShiftName: 'Ca Sáng (06:00 - 14:00)', CheckInTime: '05:56:00', CheckOutTime: '14:00:00', WorkHours: 8.05, Status: 'OnTime', Note: 'Đúng giờ' }
  ]
};


const MockDB = {
  getDB() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        this.saveDB(DEFAULT_DATABASE);
        return JSON.parse(JSON.stringify(DEFAULT_DATABASE));
      }
      return JSON.parse(data);
    } catch (e) {
      return JSON.parse(JSON.stringify(DEFAULT_DATABASE));
    }
  },

  saveDB(db) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch (e) {}
  },

  resetDB() {
    localStorage.removeItem(STORAGE_KEY);
    return this.getDB();
  }
};

window.MockDB = MockDB;
