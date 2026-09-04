<?php

class Feedback
{
    private $conn;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    // Lấy toàn bộ feedback
    public function getAll()
    {
        $sql = "
            SELECT
                f.FeedbackID,
                f.Rating,
                f.Commemt AS Comment,
                f.FeedbackDate,
                f.TrainerID,
                t.FullName AS TrainerName
            FROM feedbacks f
            LEFT JOIN trainers t
                ON f.TrainerID = t.TrainerID
            ORDER BY
                f.FeedbackDate DESC,
                f.FeedbackID DESC
        ";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Lấy feedback theo HLV
    public function getByTrainer($trainerID)
    {
        $sql = "
            SELECT
                f.FeedbackID,
                f.Rating,
                f.Commemt AS Comment,
                f.FeedbackDate,
                f.TrainerID,
                t.FullName AS TrainerName
            FROM feedbacks f
            LEFT JOIN trainers t
                ON f.TrainerID = t.TrainerID
            WHERE f.TrainerID = :trainerID
            ORDER BY
                f.FeedbackDate DESC,
                f.FeedbackID DESC
        ";

        $stmt = $this->conn->prepare($sql);

        $stmt->execute([
            ':trainerID' => $trainerID
        ]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Thêm feedback
    public function create(
        $trainerID,
        $rating,
        $comment,
        $feedbackDate = null
    ) {
        $sql = "
            INSERT INTO feedbacks
            (
                Rating,
                Commemt,
                FeedbackDate,
                TrainerID
            )
            VALUES
            (
                :rating,
                :comment,
                :feedbackDate,
                :trainerID
            )
        ";

        $stmt = $this->conn->prepare($sql);

        $success = $stmt->execute([
            ':rating' => $rating,
            ':comment' => $comment,
            ':feedbackDate' => $feedbackDate ?: date('Y-m-d'),
            ':trainerID' => $trainerID
        ]);

        if (!$success) {
            return false;
        }

        return $this->conn->lastInsertId();
    }

    public function findById($feedbackID)
    {
        $sql = "
            SELECT
                f.FeedbackID,
                f.Rating,
                f.Commemt AS Comment,
                f.FeedbackDate,
                f.TrainerID,
                t.FullName AS TrainerName
            FROM feedbacks f
            LEFT JOIN trainers t
                ON f.TrainerID = t.TrainerID
            WHERE f.FeedbackID = :feedbackID
            LIMIT 1
        ";

        $stmt = $this->conn->prepare($sql);

        $stmt->execute([
            ':feedbackID' => $feedbackID
        ]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}