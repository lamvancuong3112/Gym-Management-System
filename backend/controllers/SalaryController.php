<?php

require_once __DIR__ . '/../models/Salary.php';

class SalaryController
{
    private $salary;

    public function __construct($db)
    {
        $this->salary = new Salary($db);
    }

    // =========================
    // GET ALL
    // =========================

    public function getAll()
    {
        return [
            "success" => true,
            "data" => $this->salary->getAll()
        ];
    }


    // =========================
    // GET BY ID
    // =========================

    public function getById($id)
    {
        if (empty($id)) {
            return [
                "success" => false,
                "message" => "Thiếu SalaryID"
            ];
        }

        $data = $this->salary->findById($id);

        if (!$data) {
            return [
                "success" => false,
                "message" => "Không tìm thấy bảng lương"
            ];
        }

        return [
            "success" => true,
            "data" => $data
        ];
    }


    // =========================
    // CREATE
    // =========================

    public function create($data)
    {
        if (empty($data['UserID'])) {
            return [
                "success" => false,
                "message" => "Thiếu UserID"
            ];
        }

        $created = $this->salary->create(
            $data['UserID'],
            $data['BaseSalary'],
            $data['Allowance'],
            $data['Bonus'],
            $data['Deduction'],
            $data['WorkDays'],
            $data['LateDays'],
            $data['PTClasses'],
            $data['Note'],
            $data['SalaryMonth'],
            $data['Status']
        );

        return [
            "success" => $created,
            "message" => $created
                ? "Thêm bảng lương thành công"
                : "Thêm bảng lương thất bại"
        ];
    }


    // =========================
    // UPDATE
    // =========================

   public function update($data)
    {
        if (empty($data['SalaryID'])) {
            return [
                "success" => false,
                "message" => "Thiếu SalaryID"
            ];
        }

        $updated = $this->salary->update(
            $data['SalaryID'],
            $data['UserID'],
            $data['BaseSalary'],
            $data['Allowance'],
            $data['Bonus'],
            $data['Deduction'],
            $data['WorkDays'],
            $data['LateDays'],
            $data['PTClasses'],
            $data['Note'],
            $data['SalaryMonth'],
            $data['Status']
        );

        return [
            "success" => $updated,
            "message" => $updated
                ? "Cập nhật bảng lương thành công"
                : "Cập nhật bảng lương thất bại"
        ];
    }


    // =========================
    // DELETE
    // =========================

    public function delete($id)
    {
        if (empty($id)) {
            return [
                "success" => false,
                "message" => "Thiếu SalaryID"
            ];
        }

        $existing = $this->salary->findById($id);

        if (!$existing) {
            return [
                "success" => false,
                "message" => "Không tìm thấy bảng lương"
            ];
        }

        $deleted = $this->salary->delete($id);

        return [
            "success" => $deleted,
            "message" => $deleted
                ? "Xóa bảng lương thành công"
                : "Xóa bảng lương thất bại"
        ];
    }
}