<?php

require_once __DIR__ . '/../models/EmployeeAttendance.php';

class EmployeeAttendanceController
{
    private $employeeAttendance;

    public function __construct($db)
    {
        $this->employeeAttendance = new EmployeeAttendance($db);
    }

    // =========================
    // LẤY TẤT CẢ CHẤM CÔNG
    // ADMIN
    // =========================
    public function getAll()
    {
        return [
            "success" => true,
            "data" => $this->employeeAttendance->getAll()
        ];
    }


    // =========================
    // LẤY CHẤM CÔNG THEO USER
    // STAFF + TRAINER
    // =========================
    public function getByUserID($userID)
    {
        if (empty($userID)) {
            return [
                "success" => false,
                "message" => "Không xác định được UserID"
            ];
        }

        // Lấy tất cả rồi lọc theo UserID
        $all = $this->employeeAttendance->getAll();

        $data = array_values(
            array_filter(
                $all,
                function ($item) use ($userID) {
                    return $item['UserID'] == $userID;
                }
            )
        );

        return [
            "success" => true,
            "data" => $data
        ];
    }


    // =========================
    // LẤY CHẤM CÔNG THEO ID
    // =========================
    public function getById($id)
    {
        $attendance = $this->employeeAttendance->findById($id);

        if (!$attendance) {
            return [
                "success" => false,
                "message" => "Không tìm thấy dữ liệu chấm công"
            ];
        }

        return [
            "success" => true,
            "data" => $attendance
        ];
    }


    // =========================
    // CHECK-IN
    // STAFF + TRAINER
    // =========================
    public function checkIn($data, $userID)
    {
        if (empty($userID)) {
            return [
                "success" => false,
                "message" => "Không xác định được UserID"
            ];
        }

        $checkInTime = $data['checkInTime'] ?? date('H:i:s');
        $attendanceDate = $data['attendanceDate'] ?? date('Y-m-d');


        // Kiểm tra ngày
        if (empty($attendanceDate)) {
            return [
                "success" => false,
                "message" => "Thiếu ngày chấm công"
            ];
        }


        // Không cho check-in 2 lần trong cùng một ngày
        $all = $this->employeeAttendance->getAll();

        foreach ($all as $item) {

            if (
                $item['UserID'] == $userID &&
                $item['AttendanceDate'] == $attendanceDate
            ) {
                return [
                    "success" => false,
                    "message" => "Bạn đã check-in trong ngày hôm nay"
                ];
            }
        }


        $created = $this->employeeAttendance->create(
            $checkInTime,
            $attendanceDate,
            $userID
        );

        return [
            "success" => $created,
            "message" => $created
                ? "Check-in thành công"
                : "Check-in thất bại"
        ];
    }


    // =========================
    // CHECK-OUT
    // STAFF + TRAINER
    // =========================
    public function checkOut(
        $id,
        $data,
        $currentUserID,
        $currentRole
    ) {

        if (empty($id)) {
            return [
                "success" => false,
                "message" => "Thiếu EmployeeAttendanceID"
            ];
        }


        $attendance = $this->employeeAttendance->findById($id);

        if (!$attendance) {
            return [
                "success" => false,
                "message" => "Không tìm thấy dữ liệu chấm công"
            ];
        }


        // ==========================================
        // STAFF + TRAINER
        // CHỈ ĐƯỢC CHECK-OUT BẢN GHI CỦA MÌNH
        // ==========================================
        if ($currentRole !== 'admin') {

            if ($attendance['UserID'] != $currentUserID) {

                return [
                    "success" => false,
                    "message" => "Bạn không có quyền check-out bản ghi này"
                ];
            }
        }


        // Không cho check-out lần 2
        if (!empty($attendance['CheckOutTime'])) {

            return [
                "success" => false,
                "message" => "Nhân viên đã check-out"
            ];
        }


        $checkOutTime = $data['checkOutTime'] ?? date('H:i:s');


        $updated = $this->employeeAttendance->updateCheckOut(
            $id,
            $checkOutTime
        );


        return [
            "success" => $updated,
            "message" => $updated
                ? "Check-out thành công"
                : "Check-out thất bại"
        ];
    }


    // =========================
    // XÓA CHẤM CÔNG
    // CHỈ ADMIN
    // =========================
    public function delete($id)
    {
        $attendance = $this->employeeAttendance->findById($id);

        if (!$attendance) {
            return [
                "success" => false,
                "message" => "Không tìm thấy dữ liệu chấm công"
            ];
        }


        $deleted = $this->employeeAttendance->delete($id);

        return [
            "success" => $deleted,
            "message" => $deleted
                ? "Xóa chấm công thành công"
                : "Xóa chấm công thất bại"
        ];
    }
}