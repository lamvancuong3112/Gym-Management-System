<?php

require_once __DIR__ . '/../models/Progress.php';

class ProgressController
{
    private $progress;

    public function __construct($db)
    {
        $this->progress = new Progress($db);
    }

    // GET tất cả
    public function getAll()
    {
        return [
            "success" => true,
            "data" => $this->progress->getAll()
        ];
    }

    // GET theo ID
    public function getById($progressID)
    {
        $data = $this->progress->findById($progressID);

        if (!$data) {
            return [
                "success" => false,
                "message" => "Không tìm thấy tiến độ"
            ];
        }

        return [
            "success" => true,
            "data" => $data
        ];
    }

    // POST
    public function create($data)
    {
        if (
            empty($data['recordDate']) ||
            empty($data['memberID']) ||
            empty($data['trainerID'])
        ) {
            return [
                "success" => false,
                "message" => "Thiếu thông tin bắt buộc"
            ];
        }

        $result = $this->progress->create(
            $data['recordDate'],
            $data['weight'] ?? null,
            $data['height'] ?? null,
            $data['bodyFat'] ?? null,
            $data['muscleMass'] ?? null,
            $data['memberID'],
            $data['trainerID']
        );

        if ($result) {
            return [
                "success" => true,
                "message" => "Thêm tiến độ thành công"
            ];
        }

        return [
            "success" => false,
            "message" => "Thêm tiến độ thất bại"
        ];
    }

    // PUT
    public function update($data)
    {
        if (
            empty($data['progressID']) ||
            empty($data['recordDate']) ||
            empty($data['memberID']) ||
            empty($data['trainerID'])
        ) {
            return [
                "success" => false,
                "message" => "Thiếu thông tin bắt buộc"
            ];
        }

        $result = $this->progress->update(
            $data['progressID'],
            $data['recordDate'],
            $data['weight'] ?? null,
            $data['height'] ?? null,
            $data['bodyFat'] ?? null,
            $data['muscleMass'] ?? null,
            $data['memberID'],
            $data['trainerID']
        );

        if ($result) {
            return [
                "success" => true,
                "message" => "Cập nhật tiến độ thành công"
            ];
        }

        return [
            "success" => false,
            "message" => "Cập nhật tiến độ thất bại"
        ];
    }

    // DELETE
    public function delete($progressID)
    {
        $result = $this->progress->delete($progressID);

        if ($result) {
            return [
                "success" => true,
                "message" => "Xóa tiến độ thành công"
            ];
        }

        return [
            "success" => false,
            "message" => "Xóa tiến độ thất bại"
        ];
    }
}