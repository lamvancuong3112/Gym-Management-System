-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 18, 2026 at 09:41 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `gym_management`
--

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `AttendanceID` int(11) NOT NULL,
  `CheckInTime` time NOT NULL,
  `CheckOutTime` time DEFAULT NULL,
  `AttendanceDate` date NOT NULL,
  `MemberID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `attendance`
--

INSERT INTO `attendance` (`AttendanceID`, `CheckInTime`, `CheckOutTime`, `AttendanceDate`, `MemberID`) VALUES
(1, '07:30:00', '09:00:00', '2026-03-05', 1),
(2, '08:00:00', '09:30:00', '2026-03-05', 2),
(3, '17:00:00', '18:30:00', '2026-03-06', 3),
(4, '18:00:00', '19:30:00', '2026-03-06', 4),
(5, '07:00:00', '08:30:00', '2026-03-07', 5),
(6, '09:00:00', '10:30:00', '2026-03-07', 6);

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `BookingID` int(11) NOT NULL,
  `BookingDate` date NOT NULL,
  `StartTime` time NOT NULL,
  `EndTime` time NOT NULL,
  `Status` varchar(20) NOT NULL,
  `MemberID` int(11) NOT NULL,
  `TrainerID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`BookingID`, `BookingDate`, `StartTime`, `EndTime`, `Status`, `MemberID`, `TrainerID`) VALUES
(1, '2026-03-05', '08:00:00', '09:00:00', 'Confirmed', 1, 1),
(2, '2026-03-05', '09:00:00', '10:00:00', 'Confirmed', 2, 2),
(3, '2026-03-06', '17:00:00', '18:00:00', 'Completed', 3, 1),
(4, '2026-03-06', '18:00:00', '19:00:00', 'Confirmed', 4, 2),
(5, '2026-03-07', '08:00:00', '09:00:00', 'Cancelled', 5, 1),
(6, '2026-03-07', '09:00:00', '10:00:00', 'Confirmed', 6, 2);

-- --------------------------------------------------------

--
-- Table structure for table `feedbacks`
--

CREATE TABLE `feedbacks` (
  `FeedbackID` int(11) NOT NULL,
  `Rating` int(11) NOT NULL,
  `Commemt` text DEFAULT NULL,
  `FeedbackDate` date NOT NULL,
  `TrainerID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `feedbacks`
--

INSERT INTO `feedbacks` (`FeedbackID`, `Rating`, `Commemt`, `FeedbackDate`, `TrainerID`) VALUES
(1, 5, 'Huấn luyện viên hướng dẫn rất nhiệt tình.', '2026-03-05', 1),
(2, 4, 'HLV có chuyên môn tốt và hỗ trợ tận tình.', '2026-03-06', 2),
(3, 5, 'Giáo án tập phù hợp với mục tiêu.', '2026-03-07', 1),
(4, 4, 'Thái độ phục vụ tốt, hướng dẫn dễ hiểu.', '2026-03-08', 2),
(5, 5, 'Rất hài lòng với quá trình tập luyện.', '2026-03-09', 1),
(6, 3, 'Cần cải thiện thời gian phản hồi.', '2026-03-10', 2);

-- --------------------------------------------------------

--
-- Table structure for table `members`
--

CREATE TABLE `members` (
  `MemberID` int(11) NOT NULL,
  `Fullname` varchar(100) NOT NULL,
  `Gender` varchar(10) DEFAULT NULL,
  `BirthDate` date DEFAULT NULL,
  `Phone` varchar(15) DEFAULT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `Address` varchar(255) DEFAULT NULL,
  `JoinDate` date NOT NULL,
  `UserID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `members`
--

INSERT INTO `members` (`MemberID`, `Fullname`, `Gender`, `BirthDate`, `Phone`, `Email`, `Address`, `JoinDate`, `UserID`) VALUES
(1, 'Nguyễn Văn An', 'Male', '2002-05-15', '0901234567', 'an@gmail.com', 'TP. Hồ Chí Minh', '2026-01-10', 5),
(2, 'Trần Thị Bình', 'Female', '2003-08-20', '0912345678', 'binh@gmail.com', 'TP. Hồ Chí Minh', '2026-01-15', 6),
(3, 'Lê Minh Cường', 'Male', '2001-11-10', '0923456789', 'cuong@gmail.com', 'Củ Chi', '2026-02-01', 7),
(4, 'Phạm Hoàng Nam', 'Male', '2004-03-25', '0934567890', 'nam@gmail.com', 'Bình Dương', '2026-02-10', 5),
(5, 'Võ Ngọc Mai', 'Female', '2002-12-05', '0945678901', 'mai@gmail.com', 'Thủ Đức', '2026-02-20', 6),
(6, 'Đặng Quốc Huy', 'Male', '2003-06-18', '0956789012', 'huy@gmail.com', 'Quận 9', '2026-03-01', 7);

-- --------------------------------------------------------

--
-- Table structure for table `member_package`
--

CREATE TABLE `member_package` (
  `MemberPackageID` int(11) NOT NULL,
  `StartDate` date NOT NULL,
  `EndDate` date NOT NULL,
  `Status` varchar(20) NOT NULL,
  `MemberID` int(11) NOT NULL,
  `PackageID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `member_package`
--

INSERT INTO `member_package` (`MemberPackageID`, `StartDate`, `EndDate`, `Status`, `MemberID`, `PackageID`) VALUES
(1, '2026-01-10', '2026-02-10', 'Active', 1, 1),
(2, '2026-01-15', '2026-04-15', 'Active', 2, 2),
(3, '2026-02-01', '2026-08-01', 'Active', 3, 3),
(4, '2026-02-10', '2027-02-10', 'Active', 4, 4),
(5, '2026-02-20', '2026-05-20', 'Active', 5, 5),
(6, '2026-03-01', '2026-04-01', 'Active', 6, 1);

-- --------------------------------------------------------

--
-- Table structure for table `packages`
--

CREATE TABLE `packages` (
  `PackageID` int(11) NOT NULL,
  `PackageName` varchar(100) NOT NULL,
  `Duration` int(11) NOT NULL,
  `Price` decimal(12,2) NOT NULL,
  `Description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `packages`
--

INSERT INTO `packages` (`PackageID`, `PackageName`, `Duration`, `Price`, `Description`) VALUES
(1, 'Gói 1 tháng', 1, 500000.00, 'Gói tập gym cơ bản trong 1 tháng'),
(2, 'Gói 3 tháng', 3, 1300000.00, 'Gói tập gym trong 3 tháng'),
(3, 'Gói 6 tháng', 6, 2400000.00, 'Gói tập gym trong 6 tháng'),
(4, 'Gói 12 tháng', 12, 4200000.00, 'Gói tập gym trong 12 tháng'),
(5, 'Gói Premium 3 tháng', 3, 2000000.00, 'Tập gym kết hợp hỗ trợ huấn luyện viên');

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `PaymentsID` int(11) NOT NULL,
  `Amount` decimal(12,2) NOT NULL,
  `PaymentMethod` varchar(30) NOT NULL,
  `PaymentDate` date NOT NULL,
  `Status` varchar(20) NOT NULL,
  `MemberPackageID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`PaymentsID`, `Amount`, `PaymentMethod`, `PaymentDate`, `Status`, `MemberPackageID`) VALUES
(1, 500000.00, 'Cash', '2026-01-10', 'Paid', 1),
(2, 1300000.00, 'Banking', '2026-01-15', 'Paid', 2),
(3, 2400000.00, 'Banking', '2026-02-01', 'Paid', 3),
(4, 4200000.00, 'Banking', '2026-02-10', 'Paid', 4),
(5, 2000000.00, 'Cash', '2026-02-20', 'Paid', 5),
(6, 500000.00, 'Momo', '2026-03-01', 'Paid', 6);

-- --------------------------------------------------------

--
-- Table structure for table `progress`
--

CREATE TABLE `progress` (
  `ProgressID` int(11) NOT NULL,
  `RecordDate` date NOT NULL,
  `Weight` decimal(5,2) DEFAULT NULL,
  `Height` decimal(5,2) DEFAULT NULL,
  `BodyFat` decimal(5,2) DEFAULT NULL,
  `MuscleMass` decimal(5,2) DEFAULT NULL,
  `MemberID` int(11) NOT NULL,
  `TrainerID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `progress`
--

INSERT INTO `progress` (`ProgressID`, `RecordDate`, `Weight`, `Height`, `BodyFat`, `MuscleMass`, `MemberID`, `TrainerID`) VALUES
(1, '2026-03-01', 68.50, 168.00, 18.50, 52.30, 1, 1),
(2, '2026-03-01', 55.20, 160.00, 24.00, 38.50, 2, 2),
(3, '2026-03-02', 72.00, 175.00, 20.50, 54.80, 3, 1),
(4, '2026-03-02', 80.50, 178.00, 22.00, 60.20, 4, 2),
(5, '2026-03-03', 58.30, 162.00, 23.50, 39.80, 5, 1),
(6, '2026-03-03', 70.10, 170.00, 19.00, 53.70, 6, 2);

-- --------------------------------------------------------

--
-- Table structure for table `trainers`
--

CREATE TABLE `trainers` (
  `TrainerID` int(11) NOT NULL,
  `FullName` varchar(100) NOT NULL,
  `Gender` varchar(10) DEFAULT NULL,
  `DateofBirth` date DEFAULT NULL,
  `Phone` varchar(15) DEFAULT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `Specialty` varchar(100) DEFAULT NULL,
  `Experience` int(11) DEFAULT NULL,
  `Status` varchar(20) DEFAULT NULL,
  `UserID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `trainers`
--

INSERT INTO `trainers` (`TrainerID`, `FullName`, `Gender`, `DateofBirth`, `Phone`, `Email`, `Specialty`, `Experience`, `Status`, `UserID`) VALUES
(1, 'Nguyễn Minh Tuấn', 'Male', '1995-03-15', '0961234567', 'tuan.trainer@gmail.com', 'Tăng cơ giảm mỡ', 5, 'Active', 3),
(2, 'Trần Quốc Hùng', 'Male', '1992-07-20', '0972345678', 'hung.trainer@gmail.com', 'Bodybuilding', 8, 'Active', 4);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `UserID` int(11) NOT NULL,
  `Username` varchar(50) NOT NULL,
  `Password` varchar(255) NOT NULL,
  `Role` varchar(20) NOT NULL,
  `Status` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`UserID`, `Username`, `Password`, `Role`, `Status`) VALUES
(1, 'admin', '123456', 'Admin', 'Active'),
(2, 'manager', '123456', 'Manager', 'Active'),
(3, 'trainer01', '123456', 'Trainer', 'Active'),
(4, 'trainer02', '123456', 'Trainer', 'Active'),
(5, 'member01', '123456', 'Member', 'Active'),
(6, 'member02', '123456', 'Member', 'Active'),
(7, 'member03', '123456', 'Member', 'Inactive');

-- --------------------------------------------------------

--
-- Table structure for table `workout_plan`
--

CREATE TABLE `workout_plan` (
  `PlanID` int(11) NOT NULL,
  `PlanName` varchar(100) NOT NULL,
  `Goal` varchar(100) NOT NULL,
  `Description` text DEFAULT NULL,
  `CreateDate` date NOT NULL,
  `MemberID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `workout_plan`
--

INSERT INTO `workout_plan` (`PlanID`, `PlanName`, `Goal`, `Description`, `CreateDate`, `MemberID`) VALUES
(1, 'Beginner Full Body', 'Tăng cơ', 'Chương trình tập toàn thân dành cho người mới bắt đầu.', '2026-03-01', 1),
(2, 'Fat Loss Program', 'Giảm mỡ', 'Chương trình kết hợp tập tạ và cardio để giảm mỡ.', '2026-03-01', 2),
(3, 'Muscle Building', 'Tăng cơ', 'Chương trình tập trung phát triển khối lượng cơ.', '2026-03-02', 3),
(4, 'Strength Program', 'Tăng sức mạnh', 'Chương trình tập trung vào các bài compound.', '2026-03-02', 4),
(5, 'Weight Loss Beginner', 'Giảm cân', 'Giáo án dành cho người mới bắt đầu giảm cân.', '2026-03-03', 5),
(6, 'Lean Muscle', 'Tăng cơ giảm mỡ', 'Chương trình hướng tới tăng cơ và kiểm soát lượng mỡ.', '2026-03-03', 6);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`AttendanceID`),
  ADD KEY `MemberID` (`MemberID`);

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`BookingID`),
  ADD KEY `MemberID` (`MemberID`),
  ADD KEY `TrainerID` (`TrainerID`);

--
-- Indexes for table `feedbacks`
--
ALTER TABLE `feedbacks`
  ADD PRIMARY KEY (`FeedbackID`),
  ADD KEY `TrainerID` (`TrainerID`);

--
-- Indexes for table `members`
--
ALTER TABLE `members`
  ADD PRIMARY KEY (`MemberID`),
  ADD KEY `UserID` (`UserID`);

--
-- Indexes for table `member_package`
--
ALTER TABLE `member_package`
  ADD PRIMARY KEY (`MemberPackageID`),
  ADD KEY `MemberID` (`MemberID`),
  ADD KEY `PackageID` (`PackageID`);

--
-- Indexes for table `packages`
--
ALTER TABLE `packages`
  ADD PRIMARY KEY (`PackageID`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`PaymentsID`),
  ADD KEY `MemberPackageID` (`MemberPackageID`);

--
-- Indexes for table `progress`
--
ALTER TABLE `progress`
  ADD PRIMARY KEY (`ProgressID`),
  ADD KEY `MemberID` (`MemberID`),
  ADD KEY `TrainerID` (`TrainerID`);

--
-- Indexes for table `trainers`
--
ALTER TABLE `trainers`
  ADD PRIMARY KEY (`TrainerID`),
  ADD KEY `UserID` (`UserID`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`UserID`),
  ADD UNIQUE KEY `Username` (`Username`);

--
-- Indexes for table `workout_plan`
--
ALTER TABLE `workout_plan`
  ADD PRIMARY KEY (`PlanID`),
  ADD KEY `MemberID` (`MemberID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `AttendanceID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `BookingID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `feedbacks`
--
ALTER TABLE `feedbacks`
  MODIFY `FeedbackID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `members`
--
ALTER TABLE `members`
  MODIFY `MemberID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `member_package`
--
ALTER TABLE `member_package`
  MODIFY `MemberPackageID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `packages`
--
ALTER TABLE `packages`
  MODIFY `PackageID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `PaymentsID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `progress`
--
ALTER TABLE `progress`
  MODIFY `ProgressID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `trainers`
--
ALTER TABLE `trainers`
  MODIFY `TrainerID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `UserID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `workout_plan`
--
ALTER TABLE `workout_plan`
  MODIFY `PlanID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`MemberID`) REFERENCES `members` (`MemberID`);

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`MemberID`) REFERENCES `members` (`MemberID`),
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`TrainerID`) REFERENCES `trainers` (`TrainerID`);

--
-- Constraints for table `feedbacks`
--
ALTER TABLE `feedbacks`
  ADD CONSTRAINT `feedbacks_ibfk_1` FOREIGN KEY (`TrainerID`) REFERENCES `trainers` (`TrainerID`);

--
-- Constraints for table `members`
--
ALTER TABLE `members`
  ADD CONSTRAINT `members_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`);

--
-- Constraints for table `member_package`
--
ALTER TABLE `member_package`
  ADD CONSTRAINT `member_package_ibfk_1` FOREIGN KEY (`MemberID`) REFERENCES `members` (`MemberID`),
  ADD CONSTRAINT `member_package_ibfk_2` FOREIGN KEY (`PackageID`) REFERENCES `packages` (`PackageID`);

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`MemberPackageID`) REFERENCES `member_package` (`MemberPackageID`);

--
-- Constraints for table `progress`
--
ALTER TABLE `progress`
  ADD CONSTRAINT `progress_ibfk_1` FOREIGN KEY (`MemberID`) REFERENCES `members` (`MemberID`),
  ADD CONSTRAINT `progress_ibfk_2` FOREIGN KEY (`TrainerID`) REFERENCES `trainers` (`TrainerID`);

--
-- Constraints for table `trainers`
--
ALTER TABLE `trainers`
  ADD CONSTRAINT `trainers_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`);

--
-- Constraints for table `workout_plan`
--
ALTER TABLE `workout_plan`
  ADD CONSTRAINT `workout_plan_ibfk_1` FOREIGN KEY (`MemberID`) REFERENCES `members` (`MemberID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
