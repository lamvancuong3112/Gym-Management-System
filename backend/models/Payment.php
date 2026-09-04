<?php

class Payment
{
    private $conn;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    // Lấy tất cả thanh toán
    public function getAll()
    {
        $sql = "SELECT * FROM payments
                ORDER BY PaymentsID DESC";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Tìm thanh toán theo ID
    public function findById($paymentsID)
    {
        $sql = "SELECT * FROM payments
                WHERE PaymentsID = :paymentsID";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":paymentsID", $paymentsID);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Thêm thanh toán
    public function create(
        $amount,
        $paymentMethod,
        $paymentDate,
        $status,
        $memberPackageID
    ) {
        $sql = "INSERT INTO payments
                (Amount, PaymentMethod, PaymentDate, Status, MemberPackageID)
                VALUES
                (:amount, :paymentMethod, :paymentDate, :status, :memberPackageID)";

        $stmt = $this->conn->prepare($sql);

        $stmt->bindParam(":amount", $amount);
        $stmt->bindParam(":paymentMethod", $paymentMethod);
        $stmt->bindParam(":paymentDate", $paymentDate);
        $stmt->bindParam(":status", $status);
        $stmt->bindParam(":memberPackageID", $memberPackageID);

        return $stmt->execute();
    }

    // Cập nhật thanh toán
    public function update(
        $paymentsID,
        $amount,
        $paymentMethod,
        $paymentDate,
        $status,
        $memberPackageID
    ) {
        $sql = "UPDATE payments SET
                    Amount = :amount,
                    PaymentMethod = :paymentMethod,
                    PaymentDate = :paymentDate,
                    Status = :status,
                    MemberPackageID = :memberPackageID
                WHERE PaymentsID = :paymentsID";

        $stmt = $this->conn->prepare($sql);

        $stmt->bindParam(":paymentsID", $paymentsID);
        $stmt->bindParam(":amount", $amount);
        $stmt->bindParam(":paymentMethod", $paymentMethod);
        $stmt->bindParam(":paymentDate", $paymentDate);
        $stmt->bindParam(":status", $status);
        $stmt->bindParam(":memberPackageID", $memberPackageID);

        return $stmt->execute();
    }

    // Xóa thanh toán
    public function delete($paymentsID)
    {
        $sql = "DELETE FROM payments
                WHERE PaymentsID = :paymentsID";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":paymentsID", $paymentsID);

        return $stmt->execute();
    }
}