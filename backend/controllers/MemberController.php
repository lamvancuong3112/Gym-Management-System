<?php

require_once __DIR__ . '/../models/Member.php';

class MemberController
{
    private $member;

    public function __construct($db)
    {
        $this->member = new Member($db);
    }


    // ============================================================
    // LẤY DANH SÁCH HỘI VIÊN
    // ============================================================
    public function getAll()
    {
        return [
            "success" => true,
            "data" => $this->member->getAll()
        ];
    }


    // ============================================================
    // LẤY HỘI VIÊN THEO ID
    // ============================================================
    public function getById($memberID)
    {
        $member = $this->member->findById($memberID);

        if (!$member) {
            return [
                "success" => false,
                "message" => "Không tìm thấy hội viên"
            ];
        }

        return [
            "success" => true,
            "data" => $member
        ];
    }


    // ============================================================
    // THÊM HỘI VIÊN
    // members + member_package + payments
    // ============================================================
    public function create($data)
    {
        // --------------------------------------------------------
        // 1. Kiểm tra dữ liệu bắt buộc
        // --------------------------------------------------------

        $required = [
            'code',
            'fullname',
            'gender',
            'birthDate',
            'phone',
            'email',
            'address',
            'joinDate',
            'packageID',
            'startDate',
            'endDate',
            'amount',
            'paymentMethod',
            'paymentStatus'
        ];

        foreach ($required as $field) {

            if (
                !isset($data[$field]) ||
                $data[$field] === ''
            ) {
                return [
                    "success" => false,
                    "message" => "Thiếu thông tin: " . $field
                ];
            }
        }


        // --------------------------------------------------------
        // 2. Chuẩn hóa dữ liệu
        // --------------------------------------------------------

        $code = trim($data['code']);
        $fullname = trim($data['fullname']);
        $gender = trim($data['gender']);
        $birthDate = $data['birthDate'];
        $phone = trim($data['phone']);
        $email = trim($data['email']);
        $address = trim($data['address']);
        $joinDate = $data['joinDate'];

        $packageID = (int)$data['packageID'];

        $startDate = $data['startDate'];
        $endDate = $data['endDate'];

        $amount = (float)$data['amount'];

        $paymentMethod = trim($data['paymentMethod']);
        $paymentStatus = trim($data['paymentStatus']);


        // --------------------------------------------------------
        // 3. Kiểm tra PackageID
        // --------------------------------------------------------

        if ($packageID <= 0) {

            return [
                "success" => false,
                "message" => "PackageID không hợp lệ"
            ];
        }


        // --------------------------------------------------------
        // 4. Kiểm tra số tiền
        // --------------------------------------------------------

        if ($amount < 0) {

            return [
                "success" => false,
                "message" => "Số tiền không hợp lệ"
            ];
        }


        // --------------------------------------------------------
        // 5. Gọi Model tạo toàn bộ dữ liệu
        // --------------------------------------------------------

        $result = $this->member->create(
            $code,
            $fullname,
            $gender,
            $birthDate,
            $phone,
            $email,
            $address,
            $joinDate,
            $packageID,
            $startDate,
            $endDate,
            $amount,
            $paymentMethod,
            $paymentStatus
        );


        // --------------------------------------------------------
        // 6. Trả kết quả về Route
        // --------------------------------------------------------

        if (!$result['success']) {

            return [
                "success" => false,
                "message" => $result['message'] ?? "Thêm hội viên thất bại"
            ];
        }


        return [
            "success" => true,
            "message" => "Thêm hội viên thành công",
            "data" => [
                "MemberID" => $result['memberID'],
                "MemberPackageID" => $result['memberPackageID']
            ]
        ];
    }


    // ============================================================
    // CẬP NHẬT HỘI VIÊN
    // ============================================================
    public function update($data)
    {
        if (empty($data['memberID'])) {

            return [
                "success" => false,
                "message" => "Thiếu MemberID"
            ];
        }


        $member = $this->member->findById($data['memberID']);

        if (!$member) {

            return [
                "success" => false,
                "message" => "Không tìm thấy hội viên"
            ];
        }


        $required = [
            'fullname',
            'gender',
            'birthDate',
            'phone',
            'email',
            'address',
            'joinDate',
            'packageID',
            'startDate',
            'endDate',
            'status'
        ];

        foreach ($required as $field) {

            if (
                !isset($data[$field]) ||
                $data[$field] === ''
            ) {

                return [
                    "success" => false,
                    "message" => "Thiếu thông tin: " . $field
                ];
            }
        }


        $updated = $this->member->update(
            $data['memberID'],
            trim($data['fullname']),
            trim($data['gender']),
            $data['birthDate'],
            trim($data['phone']),
            trim($data['email']),
            trim($data['address']),
            $data['joinDate'],
            (int)$data['packageID'],
            $data['startDate'],
            $data['endDate'],
            $data['status']
        );


        return [
            "success" => $updated,
            "message" => $updated
                ? "Cập nhật hội viên thành công"
                : "Cập nhật hội viên thất bại"
        ];
    }


    // ============================================================
    // XÓA HỘI VIÊN
    // ============================================================
    public function delete($memberID)
    {
        if (empty($memberID)) {

            return [
                "success" => false,
                "message" => "Thiếu MemberID"
            ];
        }


        $member = $this->member->findById($memberID);

        if (!$member) {

            return [
                "success" => false,
                "message" => "Không tìm thấy hội viên"
            ];
        }


        $deleted = $this->member->delete($memberID);


        return [
            "success" => $deleted,
            "message" => $deleted
                ? "Xóa hội viên thành công"
                : "Xóa hội viên thất bại"
        ];
    }
}