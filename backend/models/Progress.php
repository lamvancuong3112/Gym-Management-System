<?php

class Progress
{
    private $conn;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    // Lấy tất cả tiến độ
    public function getAll()
    {
        $sql = "SELECT * FROM progress ORDER BY ProgressID DESC";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Tìm tiến độ theo ID
    public function findById($progressID)
    {
        $sql = "SELECT * FROM progress
                WHERE ProgressID = :progressID";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":progressID", $progressID);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Thêm tiến độ
    public function create(
        $recordDate,
        $weight,
        $height,
        $bodyFat,
        $muscleMass,
        $memberID,
        $trainerID
    ) {
        $sql = "INSERT INTO progress
                (
                    RecordDate,
                    Weight,
                    Height,
                    BodyFat,
                    MuscleMass,
                    MemberID,
                    TrainerID
                )
                VALUES
                (
                    :recordDate,
                    :weight,
                    :height,
                    :bodyFat,
                    :muscleMass,
                    :memberID,
                    :trainerID
                )";

        $stmt = $this->conn->prepare($sql);

        $stmt->bindParam(":recordDate", $recordDate);
        $stmt->bindParam(":weight", $weight);
        $stmt->bindParam(":height", $height);
        $stmt->bindParam(":bodyFat", $bodyFat);
        $stmt->bindParam(":muscleMass", $muscleMass);
        $stmt->bindParam(":memberID", $memberID);
        $stmt->bindParam(":trainerID", $trainerID);

        return $stmt->execute();
    }

    // Cập nhật tiến độ
    public function update(
        $progressID,
        $recordDate,
        $weight,
        $height,
        $bodyFat,
        $muscleMass,
        $memberID,
        $trainerID
    ) {
        $sql = "UPDATE progress SET
                    RecordDate = :recordDate,
                    Weight = :weight,
                    Height = :height,
                    BodyFat = :bodyFat,
                    MuscleMass = :muscleMass,
                    MemberID = :memberID,
                    TrainerID = :trainerID
                WHERE ProgressID = :progressID";

        $stmt = $this->conn->prepare($sql);

        $stmt->bindParam(":progressID", $progressID);
        $stmt->bindParam(":recordDate", $recordDate);
        $stmt->bindParam(":weight", $weight);
        $stmt->bindParam(":height", $height);
        $stmt->bindParam(":bodyFat", $bodyFat);
        $stmt->bindParam(":muscleMass", $muscleMass);
        $stmt->bindParam(":memberID", $memberID);
        $stmt->bindParam(":trainerID", $trainerID);

        return $stmt->execute();
    }

    // Xóa tiến độ
    public function delete($progressID)
    {
        $sql = "DELETE FROM progress
                WHERE ProgressID = :progressID";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":progressID", $progressID);

        return $stmt->execute();
    }
}