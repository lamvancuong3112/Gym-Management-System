<?php

class Attendance
{
    private $conn;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    // =========================================================
    // GET ALL
    // =========================================================
    public function getAll()
    {
        $sql = "
            SELECT
                a.AttendanceID,
                a.CheckInTime,
                a.CheckOutTime,
                a.AttendanceDate,
                a.MemberID,
                m.Code AS MemberCode,
                m.Fullname AS MemberName
            FROM attendance a
            LEFT JOIN members m
                ON a.MemberID = m.MemberID
            ORDER BY
                a.AttendanceDate DESC,
                a.CheckInTime DESC,
                a.AttendanceID DESC
        ";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // =========================================================
    // GET BY ID
    // =========================================================
    public function findById($attendanceID)
    {
        $sql = "
            SELECT
                a.AttendanceID,
                a.CheckInTime,
                a.CheckOutTime,
                a.AttendanceDate,
                a.MemberID,
                m.Code AS MemberCode,
                m.Fullname AS MemberName
            FROM attendance a
            LEFT JOIN members m
                ON a.MemberID = m.MemberID
            WHERE a.AttendanceID = :attendanceID
            LIMIT 1
        ";

        $stmt = $this->conn->prepare($sql);

        $stmt->execute([
            ':attendanceID' => $attendanceID
        ]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // =========================================================
    // CHECK-IN
    // =========================================================
    public function checkIn($memberID)
    {
        $sql = "
            INSERT INTO attendance
            (
                CheckInTime,
                AttendanceDate,
                MemberID
            )
            VALUES
            (
                CURTIME(),
                CURDATE(),
                :memberID
            )
        ";

        $stmt = $this->conn->prepare($sql);

        $success = $stmt->execute([
            ':memberID' => $memberID
        ]);

        if (!$success) {
            return false;
        }

        return $this->conn->lastInsertId();
    }

    // =========================================================
    // CHECK-OUT
    // =========================================================
    public function checkOut($attendanceID)
    {
        $sql = "
            UPDATE attendance
            SET CheckOutTime = CURTIME()
            WHERE AttendanceID = :attendanceID
              AND CheckOutTime IS NULL
        ";

        $stmt = $this->conn->prepare($sql);

        return $stmt->execute([
            ':attendanceID' => $attendanceID
        ]);
    }

    // =========================================================
    // UPDATE
    // =========================================================
    public function update(
        $attendanceID,
        $attendanceDate,
        $checkInTime,
        $checkOutTime
    ) {
        $sql = "
            UPDATE attendance
            SET
                AttendanceDate = :attendanceDate,
                CheckInTime = :checkInTime,
                CheckOutTime = :checkOutTime
            WHERE AttendanceID = :attendanceID
        ";

        $stmt = $this->conn->prepare($sql);

        return $stmt->execute([
            ':attendanceDate' => $attendanceDate,
            ':checkInTime' => $checkInTime,
            ':checkOutTime' => $checkOutTime ?: null,
            ':attendanceID' => $attendanceID
        ]);
    }

    // =========================================================
    // DELETE
    // =========================================================
    public function delete($attendanceID)
    {
        $sql = "
            DELETE FROM attendance
            WHERE AttendanceID = :attendanceID
        ";

        $stmt = $this->conn->prepare($sql);

        return $stmt->execute([
            ':attendanceID' => $attendanceID
        ]);
    }
}