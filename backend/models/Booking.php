<?php

class Booking
{
    private $conn;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    // =========================================================
    // LẤY DANH SÁCH BOOKING
    // =========================================================
    public function getAll()
    {
        $sql = "
            SELECT
                b.BookingID,
                b.BookingDate,
                b.StartTime,
                b.EndTime,
                b.Status,

                b.MemberID,
                m.Code AS MemberCode,
                m.Fullname AS MemberName,

                b.TrainerID,
                t.FullName AS TrainerName,
                t.Specialty AS TrainerSpecialty

            FROM bookings b

            LEFT JOIN members m
                ON b.MemberID = m.MemberID

            LEFT JOIN trainers t
                ON b.TrainerID = t.TrainerID

            ORDER BY
                b.BookingDate DESC,
                b.StartTime ASC,
                b.BookingID DESC
        ";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // =========================================================
    // LẤY BOOKING THEO ID
    // =========================================================
    public function findById($bookingID)
    {
        $sql = "
            SELECT
                b.BookingID,
                b.BookingDate,
                b.StartTime,
                b.EndTime,
                b.Status,

                b.MemberID,
                m.Code AS MemberCode,
                m.Fullname AS MemberName,

                b.TrainerID,
                t.FullName AS TrainerName,
                t.Specialty AS TrainerSpecialty

            FROM bookings b

            LEFT JOIN members m
                ON b.MemberID = m.MemberID

            LEFT JOIN trainers t
                ON b.TrainerID = t.TrainerID

            WHERE b.BookingID = :bookingID
            LIMIT 1
        ";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute([
            ':bookingID' => $bookingID
        ]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // =========================================================
    // THÊM BOOKING
    // =========================================================
    public function create(
        $bookingDate,
        $startTime,
        $endTime,
        $status,
        $memberID,
        $trainerID
    ) {
        $sql = "
            INSERT INTO bookings
            (
                BookingDate,
                StartTime,
                EndTime,
                Status,
                MemberID,
                TrainerID
            )
            VALUES
            (
                :bookingDate,
                :startTime,
                :endTime,
                :status,
                :memberID,
                :trainerID
            )
        ";

        $stmt = $this->conn->prepare($sql);

        $success = $stmt->execute([
            ':bookingDate' => $bookingDate,
            ':startTime'   => $startTime,
            ':endTime'     => $endTime,
            ':status'     => $status,
            ':memberID'   => $memberID,
            ':trainerID'  => $trainerID
        ]);

        if (!$success) {
            return false;
        }

        return $this->conn->lastInsertId();
    }

    // =========================================================
    // CẬP NHẬT TRẠNG THÁI BOOKING
    // =========================================================
    public function updateStatus($bookingID, $status)
    {
        $sql = "
            UPDATE bookings
            SET Status = :status
            WHERE BookingID = :bookingID
        ";

        $stmt = $this->conn->prepare($sql);

        return $stmt->execute([
            ':status'    => $status,
            ':bookingID' => $bookingID
        ]);
    }
}