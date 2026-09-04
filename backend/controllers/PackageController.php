<?php

require_once __DIR__ . '/../models/Package.php';

class PackageController
{
    private $package;

    public function __construct($db)
    {
        $this->package = new Package($db);
    }

    // Lấy tất cả gói tập
    public function getAll()
    {
        return [
            "success" => true,
            "data" => $this->package->getAll()
        ];
    }

    // Lấy gói tập theo ID
    public function getById($packageID)
    {
        $package = $this->package->findById($packageID);

        if (!$package) {
            return [
                "success" => false,
                "message" => "Không tìm thấy gói tập"
            ];
        }

        return [
            "success" => true,
            "data" => $package
        ];
    }

    // Thêm gói tập
    public function create($data)
    {
        $required = [
            'packageName',
            'duration',
            'price'
        ];

        foreach ($required as $field) {
            if (!isset($data[$field]) || $data[$field] === '') {
                return [
                    "success" => false,
                    "message" => "Thiếu thông tin: " . $field
                ];
            }
        }

        // Description có thể để trống
        $description = $data['description'] ?? null;

        $created = $this->package->create(
            $data['packageName'],
            $data['duration'],
            $data['price'],
            $description
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
        if (empty($data['packageID'])) {
            return [
                "success" => false,
                "message" => "Thiếu PackageID"
            ];
        }

        $package = $this->package->findById($data['packageID']);

        if (!$package) {
            return [
                "success" => false,
                "message" => "Không tìm thấy gói tập"
            ];
        }

        $required = [
            'packageName',
            'duration',
            'price'
        ];

        foreach ($required as $field) {
            if (!isset($data[$field]) || $data[$field] === '') {
                return [
                    "success" => false,
                    "message" => "Thiếu thông tin: " . $field
                ];
            }
        }

        $description = $data['description'] ?? null;

        $updated = $this->package->update(
            $data['packageID'],
            $data['packageName'],
            $data['duration'],
            $data['price'],
            $description
        );

        return [
            "success" => $updated,
            "message" => $updated
                ? "Cập nhật gói tập thành công"
                : "Cập nhật gói tập thất bại"
        ];
    }

    // Xóa gói tập
    public function delete($packageID)
    {
        $package = $this->package->findById($packageID);

        if (!$package) {
            return [
                "success" => false,
                "message" => "Không tìm thấy gói tập"
            ];
        }

        $deleted = $this->package->delete($packageID);

        return [
            "success" => $deleted,
            "message" => $deleted
                ? "Xóa gói tập thành công"
                : "Xóa gói tập thất bại"
        ];
    }
}