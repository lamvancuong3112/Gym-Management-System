<?php

class MemberPackage
{
    private $conn;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    // Lấy tất cả gói tập của hội viên
    public function getAll()
    {
        $sql = "SELECT * FROM member_package
                ORDER BY MemberPackageID DESC";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Tìm gói tập của hội viên theo ID
    public function findById($memberPackageID)
    {
        $sql = "SELECT * FROM member_package
                WHERE MemberPackageID = :memberPackageID";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":memberPackageID", $memberPackageID);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Thêm gói tập cho hội viên
    public function create(
        $startDate,
        $endDate,
        $status,
        $memberID,
        $packageID
    ) {
        $sql = "INSERT INTO member_package
                (StartDate, EndDate, Status, MemberID, PackageID)
                VALUES
                (:startDate, :endDate, :status, :memberID, :packageID)";

        $stmt = $this->conn->prepare($sql);

        $stmt->bindParam(":startDate", $startDate);
        $stmt->bindParam(":endDate", $endDate);
        $stmt->bindParam(":status", $status);
        $stmt->bindParam(":memberID", $memberID);
        $stmt->bindParam(":packageID", $packageID);

        return $stmt->execute();
    }

    // Cập nhật gói tập
    public function update(
        $memberPackageID,
        $startDate,
        $endDate,
        $status,
        $memberID,
        $packageID
    ) {
        $sql = "UPDATE member_package SET
                    StartDate = :startDate,
                    EndDate = :endDate,
                    Status = :status,
                    MemberID = :memberID,
                    PackageID = :packageID
                WHERE MemberPackageID = :memberPackageID";

        $stmt = $this->conn->prepare($sql);

        $stmt->bindParam(":memberPackageID", $memberPackageID);
        $stmt->bindParam(":startDate", $startDate);
        $stmt->bindParam(":endDate", $endDate);
        $stmt->bindParam(":status", $status);
        $stmt->bindParam(":memberID", $memberID);
        $stmt->bindParam(":packageID", $packageID);

        return $stmt->execute();
    }

    // Xóa gói tập của hội viên
    public function delete($memberPackageID)
    {
        $sql = "DELETE FROM member_package
                WHERE MemberPackageID = :memberPackageID";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":memberPackageID", $memberPackageID);

        return $stmt->execute();
    }
}