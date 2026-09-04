<?php

class Package
{
    private $conn;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    // Lấy danh sách tất cả gói tập
    public function getAll()
    {
        $sql = "SELECT * FROM packages ORDER BY PackageID DESC";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Tìm gói tập theo ID
    public function findById($packageID)
    {
        $sql = "SELECT * FROM packages
                WHERE PackageID = :packageID";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":packageID", $packageID);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Thêm gói tập
    public function create(
        $packageName,
        $duration,
        $price,
        $description
    ) {
        $sql = "INSERT INTO packages
                (PackageName, Duration, Price, Description)
                VALUES
                (:packageName, :duration, :price, :description)";

        $stmt = $this->conn->prepare($sql);

        $stmt->bindParam(":packageName", $packageName);
        $stmt->bindParam(":duration", $duration);
        $stmt->bindParam(":price", $price);
        $stmt->bindParam(":description", $description);

        return $stmt->execute();
    }

    // Cập nhật gói tập
    public function update(
        $packageID,
        $packageName,
        $duration,
        $price,
        $description
    ) {
        $sql = "UPDATE packages SET
                    PackageName = :packageName,
                    Duration = :duration,
                    Price = :price,
                    Description = :description
                WHERE PackageID = :packageID";

        $stmt = $this->conn->prepare($sql);

        $stmt->bindParam(":packageID", $packageID);
        $stmt->bindParam(":packageName", $packageName);
        $stmt->bindParam(":duration", $duration);
        $stmt->bindParam(":price", $price);
        $stmt->bindParam(":description", $description);

        return $stmt->execute();
    }

    // Xóa gói tập
    public function delete($packageID)
    {
        $sql = "DELETE FROM packages
                WHERE PackageID = :packageID";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":packageID", $packageID);

        return $stmt->execute();
    }
}