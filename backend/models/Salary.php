<?php

class Salary
{
    private $conn;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    // Lấy tất cả bảng lương
    public function getAll()
    {
        $sql = "SELECT
                    s.SalaryID,
                    s.UserID,
                    u.Username,
                    u.Role,
                    s.BaseSalary,
                    s.Allowance,
                    s.Bonus,
                    s.Deduction,
                    s.WorkDays,
                    s.LateDays,
                    s.PTClasses,
                    s.Note,
                    s.SalaryMonth,
                    s.Status,
                    s.CreatedAt
                FROM salaries s
                INNER JOIN users u ON s.UserID = u.UserID
                ORDER BY s.SalaryID DESC";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Lấy lương theo ID
    public function findById($salaryID)
    {
        $sql = "SELECT
                    s.SalaryID,
                    s.UserID,
                    u.Username,
                    u.Role,
                    s.BaseSalary,
                    s.Allowance,
                    s.Bonus,
                    s.Deduction,
                    s.WorkDays,
                    s.LateDays,
                    s.PTClasses,
                    s.Note,
                    s.SalaryMonth,
                    s.Status,
                    s.CreatedAt
                FROM salaries s
                INNER JOIN users u ON s.UserID = u.UserID
                WHERE s.SalaryID = :id";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":id", $salaryID);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Thêm bảng lương
    public function create(
        $userID,
        $baseSalary,
        $allowance,
        $bonus,
        $deduction,
        $workDays,
        $lateDays,
        $ptClasses,
        $note,
        $salaryMonth,
        $status
    ) {
        $sql = "INSERT INTO salaries
                (
                    UserID,
                    BaseSalary,
                    Allowance,
                    Bonus,
                    Deduction,
                    WorkDays,
                    LateDays,
                    PTClasses,
                    Note,
                    SalaryMonth,
                    Status
                )
                VALUES
                (
                    :userID,
                    :baseSalary,
                    :allowance,
                    :bonus,
                    :deduction,
                    :workDays,
                    :lateDays,
                    :ptClasses,
                    :note,
                    :salaryMonth,
                    :status
                )";

        $stmt = $this->conn->prepare($sql);

        return $stmt->execute([
            ':userID' => $userID,
            ':baseSalary' => $baseSalary,
            ':allowance' => $allowance,
            ':bonus' => $bonus,
            ':deduction' => $deduction,
            ':workDays' => $workDays,
            ':lateDays' => $lateDays,
            ':ptClasses' => $ptClasses,
            ':note' => $note,
            ':salaryMonth' => $salaryMonth,
            ':status' => $status
        ]);
    }

    // Cập nhật bảng lương
    public function update(
        $salaryID,
        $userID,
        $baseSalary,
        $allowance,
        $bonus,
        $deduction,
        $workDays,
        $lateDays,
        $ptClasses,
        $note,
        $salaryMonth,
        $status
    ) {
        $sql = "UPDATE salaries SET
                    UserID = :userID,
                    BaseSalary = :baseSalary,
                    Allowance = :allowance,
                    Bonus = :bonus,
                    Deduction = :deduction,
                    WorkDays = :workDays,
                    LateDays = :lateDays,
                    PTClasses = :ptClasses,
                    Note = :note,
                    SalaryMonth = :salaryMonth,
                    Status = :status
                WHERE SalaryID = :salaryID";

        $stmt = $this->conn->prepare($sql);

        return $stmt->execute([
            ':salaryID' => $salaryID,
            ':userID' => $userID,
            ':baseSalary' => $baseSalary,
            ':allowance' => $allowance,
            ':bonus' => $bonus,
            ':deduction' => $deduction,
            ':workDays' => $workDays,
            ':lateDays' => $lateDays,
            ':ptClasses' => $ptClasses,
            ':note' => $note,
            ':salaryMonth' => $salaryMonth,
            ':status' => $status
        ]);
    }

    // Xóa bảng lương
    public function delete($salaryID)
    {
        $sql = "DELETE FROM salaries
                WHERE SalaryID = :id";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":id", $salaryID);

        return $stmt->execute();
    }
}