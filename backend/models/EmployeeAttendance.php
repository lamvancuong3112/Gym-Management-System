<?php

class EmployeeAttendance
{
    private $conn;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    // Lấy tất cả chấm công
    public function getAll()
    {
        $sql = "SELECT 
                    ea.EmployeeAttendanceID,
                    ea.CheckInTime,
                    ea.CheckOutTime,
                    ea.AttendanceDate,
                    ea.UserID,
                    u.Username,
                    u.Role
                FROM employee_attendance ea
                INNER JOIN users u ON ea.UserID = u.UserID
                ORDER BY ea.EmployeeAttendanceID DESC";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Lấy chấm công theo ID
    public function findById($employeeAttendanceID)
    {
        $sql = "SELECT 
                    ea.EmployeeAttendanceID,
                    ea.CheckInTime,
                    ea.CheckOutTime,
                    ea.AttendanceDate,
                    ea.UserID,
                    u.Username,
                    u.Role
                FROM employee_attendance ea
                INNER JOIN users u ON ea.UserID = u.UserID
                WHERE ea.EmployeeAttendanceID = :id";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":id", $employeeAttendanceID);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Thêm chấm công - CHECK IN
    public function create(
        $checkInTime,
        $attendanceDate,
        $userID
    ) {
        $sql = "INSERT INTO employee_attendance
                (CheckInTime, AttendanceDate, UserID)
                VALUES
                (:checkInTime, :attendanceDate, :userID)";

        $stmt = $this->conn->prepare($sql);

        $stmt->bindParam(":checkInTime", $checkInTime);
        $stmt->bindParam(":attendanceDate", $attendanceDate);
        $stmt->bindParam(":userID", $userID);

        return $stmt->execute();
    }

    // Cập nhật chấm công - CHECK OUT
    public function updateCheckOut(
        $employeeAttendanceID,
        $checkOutTime
    ) {
        $sql = "UPDATE employee_attendance
                SET CheckOutTime = :checkOutTime
                WHERE EmployeeAttendanceID = :id";

        $stmt = $this->conn->prepare($sql);

        $stmt->bindParam(":checkOutTime", $checkOutTime);
        $stmt->bindParam(":id", $employeeAttendanceID);

        return $stmt->execute();
    }

    // Xóa chấm công
    public function delete($employeeAttendanceID)
    {
        $sql = "DELETE FROM employee_attendance
                WHERE EmployeeAttendanceID = :id";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":id", $employeeAttendanceID);

        return $stmt->execute();
    }
}