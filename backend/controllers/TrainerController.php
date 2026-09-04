<?php

require_once __DIR__ . '/../models/Trainer.php';

class TrainerController
{
    private $trainer;

    public function __construct($db)
    {
        $this->trainer = new Trainer($db);
    }

    public function getAll()
    {
        return [
            "success" => true,
            "data" => $this->trainer->getAll()
        ];
    }

    public function create($data)
    {
        if (
            empty($data['FullName']) ||
            empty($data['Phone']) ||
            empty($data['Specialty']) ||
            !isset($data['Experience'])
        ) {
            return [
                "success" => false,
                "message" => "Thiếu thông tin HLV"
            ];
        }

        $created = $this->trainer->create($data);

        return [
            "success" => $created,
            "message" => $created
                ? "Thêm HLV thành công"
                : "Thêm HLV thất bại"
        ];
    }
    public function update($data)
    {
        if (empty($data['TrainerID'])) {
            return [
                "success" => false,
                "message" => "Thiếu TrainerID"
            ];
        }

        $updated = $this->trainer->update($data);

        return [
            "success" => $updated,
            "message" => $updated
                ? "Cập nhật HLV thành công"
                : "Cập nhật HLV thất bại"
        ];
    }
    public function delete($trainerID)
    {
        if (empty($trainerID)) {
            return [
                "success" => false,
                "message" => "Thiếu TrainerID"
            ];
        }

        $deleted = $this->trainer->delete($trainerID);

        return [
            "success" => $deleted,
            "message" => $deleted
                ? "Xóa HLV thành công"
                : "Xóa HLV thất bại"
        ];
    }
}