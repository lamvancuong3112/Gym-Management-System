<?php

require_once __DIR__ . '/../models/Attendance.php';

class AttendanceController
{
    private $attendance;

    public function __construct($db)
    {
        $this->attendance = new Attendance($db);
    }

    // =========================================================
    // GET ALL
    // =========================================================
    public function getAll()
    {
        return [
            "success" => true,
            "data" => $this->attendance->getAll()
        ];
    }

    // =========================================================
    // GET BY ID
    // =========================================================
    public function getById($attendanceID)
    {
        if (empty($attendanceID)) {
            return [
                "success" => false,
                "message" => "Thiếu AttendanceID"
            ];
        }

        $data = $this->attendance->findById($attendanceID);

        if (!$data) {
            return [
                "success" => false,
                "message" => "Không tìm thấy bản ghi điểm danh"
            ];
        }

        return [
            "success" => true,
            "data" => $data
        ];
    }

    // =========================================================
    // CHECK-IN
    // =========================================================
    public function checkIn($data)
    {
        if (empty($data['MemberID'])) {
            return [
                "success" => false,
                "message" => "Vui lòng chọn hội viên"
            ];
        }

        $attendanceID = $this->attendance->checkIn(
            $data['MemberID']
        );

        if (!$attendanceID) {
            return [
                "success" => false,
                "message" => "Check-in thất bại"
            ];
        }

        return [
            "success" => true,
            "message" => "Check-in thành công",
            "data" => $this->attendance->findById($attendanceID)
        ];
    }

    // =========================================================
    // CHECK-OUT
    // =========================================================
    public function checkOut($attendanceID)
    {
        if (empty($attendanceID)) {
            return [
                "success" => false,
                "message" => "Thiếu AttendanceID"
            ];
        }

        $record = $this->attendance->findById($attendanceID);

        if (!$record) {
            return [
                "success" => false,
                "message" => "Không tìm thấy bản ghi điểm danh"
            ];
        }

        if (!empty($record['CheckOutTime'])) {
            return [
                "success" => false,
                "message" => "Bản ghi này đã check-out"
            ];
        }

        $updated = $this->attendance->checkOut($attendanceID);

        if (!$updated) {
            return [
                "success" => false,
                "message" => "Check-out thất bại"
            ];
        }

        return [
            "success" => true,
            "message" => "Check-out thành công",
            "data" => $this->attendance->findById($attendanceID)
        ];
    }

    // =========================================================
    // UPDATE
    // =========================================================
    public function update($data)
    {
        if (empty($data['AttendanceID'])) {
            return [
                "success" => false,
                "message" => "Thiếu AttendanceID"
            ];
        }

        $updated = $this->attendance->update(
            $data['AttendanceID'],
            $data['AttendanceDate'] ?? null,
            $data['CheckInTime'] ?? null,
            $data['CheckOutTime'] ?? null
        );

        if (!$updated) {
            return [
                "success" => false,
                "message" => "Cập nhật điểm danh thất bại"
            ];
        }

        return [
            "success" => true,
            "message" => "Cập nhật điểm danh thành công",
            "data" => $this->attendance->findById(
                $data['AttendanceID']
            )
        ];
    }

    // =========================================================
    // DELETE
    // =========================================================
    public function delete($attendanceID)
    {
        if (empty($attendanceID)) {
            return [
                "success" => false,
                "message" => "Thiếu AttendanceID"
            ];
        }

        $record = $this->attendance->findById($attendanceID);

        if (!$record) {
            return [
                "success" => false,
                "message" => "Không tìm thấy bản ghi điểm danh"
            ];
        }

        $deleted = $this->attendance->delete($attendanceID);

        if (!$deleted) {
            return [
                "success" => false,
                "message" => "Xóa điểm danh thất bại"
            ];
        }

        return [
            "success" => true,
            "message" => "Xóa điểm danh thành công"
        ];
    }
}