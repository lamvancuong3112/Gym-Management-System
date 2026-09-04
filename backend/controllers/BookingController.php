<?php

require_once __DIR__ . '/../models/Booking.php';

class BookingController
{
    private $booking;

    public function __construct($db)
    {
        $this->booking = new Booking($db);
    }

    // =========================================================
    // GET ALL
    // =========================================================
    public function getAll()
    {
        return [
            "success" => true,
            "data" => $this->booking->getAll()
        ];
    }

    // =========================================================
    // GET BY ID
    // =========================================================
    public function getById($id)
    {
        $data = $this->booking->findById($id);

        if (!$data) {
            return [
                "success" => false,
                "message" => "Không tìm thấy lịch booking"
            ];
        }

        return [
            "success" => true,
            "data" => $data
        ];
    }

    // =========================================================
    // CREATE
    // =========================================================
    public function create($data)
    {
        if (
            empty($data['BookingDate']) ||
            empty($data['StartTime']) ||
            empty($data['EndTime']) ||
            empty($data['MemberID']) ||
            empty($data['TrainerID'])
        ) {
            return [
                "success" => false,
                "message" => "Vui lòng nhập đầy đủ thông tin booking"
            ];
        }

        $status = !empty($data['Status'])
            ? $data['Status']
            : 'Confirmed';

        $bookingID = $this->booking->create(
            $data['BookingDate'],
            $data['StartTime'],
            $data['EndTime'],
            $status,
            (int)$data['MemberID'],
            (int)$data['TrainerID']
        );

        if (!$bookingID) {
            return [
                "success" => false,
                "message" => "Không thể tạo booking"
            ];
        }

        return [
            "success" => true,
            "message" => "Tạo booking thành công",
            "data" => $this->booking->findById($bookingID)
        ];
    }

    // =========================================================
    // UPDATE STATUS
    // =========================================================
    public function updateStatus($id, $data)
    {
        if (empty($id)) {
            return [
                "success" => false,
                "message" => "Thiếu BookingID"
            ];
        }

        if (empty($data['Status'])) {
            return [
                "success" => false,
                "message" => "Thiếu trạng thái booking"
            ];
        }

        $allowedStatus = [
            'Pending',
            'Confirmed',
            'Completed',
            'Cancelled'
        ];

        if (!in_array($data['Status'], $allowedStatus)) {
            return [
                "success" => false,
                "message" => "Trạng thái booking không hợp lệ"
            ];
        }

        $updated = $this->booking->updateStatus(
            $id,
            $data['Status']
        );

        if (!$updated) {
            return [
                "success" => false,
                "message" => "Cập nhật trạng thái thất bại"
            ];
        }

        return [
            "success" => true,
            "message" => "Cập nhật trạng thái booking thành công",
            "data" => $this->booking->findById($id)
        ];
    }
}