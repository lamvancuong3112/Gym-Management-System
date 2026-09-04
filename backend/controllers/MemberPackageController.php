<?php

require_once __DIR__ . '/../models/MemberPackage.php';

class MemberPackageController
{
    private $memberPackage;

    public function __construct($db)
    {
        $this->memberPackage = new MemberPackage($db);
    }

    // Lấy danh sách gói tập của hội viên
    public function getAll()
    {
        return [
            "success" => true,
            "data" => $this->memberPackage->getAll()
        ];
    }

    // Lấy gói tập theo ID
    public function getById($memberPackageID)
    {
        $memberPackage = $this->memberPackage->findById($memberPackageID);

        if (!$memberPackage) {
            return [
                "success" => false,
                "message" => "Không tìm thấy gói tập"
            ];
        }

        return [
            "success" => true,
            "data" => $memberPackage
        ];
    }

    // Thêm gói tập cho hội viên
    public function create($data)
    {
        $required = [
            'startDate',
            'endDate',
            'status',
            'memberID',
            'packageID'
        ];

        foreach ($required as $field) {
            if (!isset($data[$field]) || $data[$field] === '') {
                return [
                    "success" => false,
                    "message" => "Thiếu thông tin: " . $field
                ];
            }
        }

        $created = $this->memberPackage->create(
            $data['startDate'],
            $data['endDate'],
            $data['status'],
            $data['memberID'],
            $data['packageID']
        );

        return [
            "success" => $created,
            "message" => $created
                ? "Thêm gói tập thành công"
                : "Thêm gói tập thất bại"
        ];
    }

    // Cập nhật gói tập
    public function update($data)
    {
        if (empty($data['memberPackageID'])) {
            return [
                "success" => false,
                "message" => "Thiếu MemberPackageID"
            ];
        }

        $memberPackage = $this->memberPackage->findById(
            $data['memberPackageID']
        );

        if (!$memberPackage) {
            return [
                "success" => false,
                "message" => "Không tìm thấy gói tập"
            ];
        }

        $updated = $this->memberPackage->update(
            $data['memberPackageID'],
            $data['startDate'],
            $data['endDate'],
            $data['status'],
            $data['memberID'],
            $data['packageID']
        );

        return [
            "success" => $updated,
            "message" => $updated
                ? "Cập nhật gói tập thành công"
                : "Cập nhật gói tập thất bại"
        ];
    }

    // Xóa gói tập
    public function delete($memberPackageID)
    {
        $memberPackage = $this->memberPackage->findById($memberPackageID);

        if (!$memberPackage) {
            return [
                "success" => false,
                "message" => "Không tìm thấy gói tập"
            ];
        }

        $deleted = $this->memberPackage->delete($memberPackageID);

        return [
            "success" => $deleted,
            "message" => $deleted
                ? "Xóa gói tập thành công"
                : "Xóa gói tập thất bại"
        ];
    }
}