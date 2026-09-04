<?php

class Member
{
    private $conn;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    // ============================================================
    // LẤY DANH SÁCH HỘI VIÊN
    // ============================================================
    public function getAll()
    {
        $sql = "
            SELECT
                m.MemberID,
                m.Code,
                m.Fullname,
                m.Gender,
                m.BirthDate,
                m.Phone,
                m.Email,
                m.Address,
                m.JoinDate,
                m.UserID,

                mp.MemberPackageID,
                mp.StartDate,
                mp.EndDate,
                mp.Status AS PackageStatus,

                p.PackageID,
                p.PackageName,
                p.Duration,
                p.Price,

                pay.PaymentMethod,
                pay.PaymentDate,
                pay.Status AS PaymentStatus

            FROM members m

            LEFT JOIN member_package mp
                ON m.MemberID = mp.MemberID

            LEFT JOIN packages p
                ON mp.PackageID = p.PackageID

            LEFT JOIN payments pay
                ON mp.MemberPackageID = pay.MemberPackageID

            ORDER BY m.MemberID DESC
        ";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }


    // ============================================================
    // TÌM HỘI VIÊN THEO ID
    // ============================================================
    public function findById($memberID)
    {
        $sql = "
            SELECT
                m.MemberID,
                m.Code,
                m.Fullname,
                m.Gender,
                m.BirthDate,
                m.Phone,
                m.Email,
                m.Address,
                m.JoinDate,
                m.UserID,

                mp.MemberPackageID,
                mp.StartDate,
                mp.EndDate,
                mp.Status AS PackageStatus,

                p.PackageID,
                p.PackageName,
                p.Duration,
                p.Price,

                pay.PaymentMethod,
                pay.PaymentDate,
                pay.Status AS PaymentStatus

            FROM members m

            LEFT JOIN member_package mp
                ON m.MemberID = mp.MemberID

            LEFT JOIN packages p
                ON mp.PackageID = p.PackageID

            LEFT JOIN payments pay
                ON mp.MemberPackageID = pay.MemberPackageID

            WHERE m.MemberID = :memberID

            LIMIT 1
        ";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":memberID", $memberID);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }


    // ============================================================
    // THÊM HỘI VIÊN + GÓI TẬP + THANH TOÁN
    // ============================================================
    public function create(
        $code,
        $fullname,
        $gender,
        $birthDate,
        $phone,
        $email,
        $address,
        $joinDate,
        $packageID,
        $startDate,
        $endDate,
        $amount,
        $paymentMethod,
        $paymentStatus
    ) {

        try {

            // Bắt đầu transaction
            $this->conn->beginTransaction();


            // ====================================================
            // 1. INSERT MEMBERS
            // ====================================================

            $sqlMember = "
                INSERT INTO members
                (
                    Code,
                    Fullname,
                    Gender,
                    BirthDate,
                    Phone,
                    Email,
                    Address,
                    JoinDate
                )
                VALUES
                (
                    :code,
                    :fullname,
                    :gender,
                    :birthDate,
                    :phone,
                    :email,
                    :address,
                    :joinDate
                )
            ";

            $stmtMember = $this->conn->prepare($sqlMember);

            $stmtMember->bindParam(":code", $code);
            $stmtMember->bindParam(":fullname", $fullname);
            $stmtMember->bindParam(":gender", $gender);
            $stmtMember->bindParam(":birthDate", $birthDate);
            $stmtMember->bindParam(":phone", $phone);
            $stmtMember->bindParam(":email", $email);
            $stmtMember->bindParam(":address", $address);
            $stmtMember->bindParam(":joinDate", $joinDate);

            $stmtMember->execute();


            // Lấy MemberID vừa tạo
            $memberID = $this->conn->lastInsertId();


            // ====================================================
            // 2. INSERT MEMBER_PACKAGE
            // ====================================================

            $packageStatus =
                ($paymentStatus === 'Completed')
                    ? 'Active'
                    : 'Pending';

            $sqlPackage = "
                INSERT INTO member_package
                (
                    StartDate,
                    EndDate,
                    Status,
                    MemberID,
                    PackageID
                )
                VALUES
                (
                    :startDate,
                    :endDate,
                    :status,
                    :memberID,
                    :packageID
                )
            ";

            $stmtPackage = $this->conn->prepare($sqlPackage);

            $stmtPackage->bindParam(":startDate", $startDate);
            $stmtPackage->bindParam(":endDate", $endDate);
            $stmtPackage->bindParam(":status", $packageStatus);
            $stmtPackage->bindParam(":memberID", $memberID);
            $stmtPackage->bindParam(":packageID", $packageID);

            $stmtPackage->execute();


            // Lấy MemberPackageID vừa tạo
            $memberPackageID = $this->conn->lastInsertId();


            // ====================================================
            // 3. INSERT PAYMENTS
            // ====================================================

            $sqlPayment = "
                INSERT INTO payments
                (
                    Amount,
                    PaymentMethod,
                    PaymentDate,
                    Status,
                    MemberPackageID
                )
                VALUES
                (
                    :amount,
                    :paymentMethod,
                    CURDATE(),
                    :status,
                    :memberPackageID
                )
            ";

            $stmtPayment = $this->conn->prepare($sqlPayment);

            $stmtPayment->bindParam(":amount", $amount);
            $stmtPayment->bindParam(":paymentMethod", $paymentMethod);
            $stmtPayment->bindParam(":status", $paymentStatus);
            $stmtPayment->bindParam(":memberPackageID", $memberPackageID);

            $stmtPayment->execute();


            // ====================================================
            // 4. HOÀN TẤT
            // ====================================================

            $this->conn->commit();


            return [
                "success" => true,
                "memberID" => $memberID,
                "memberPackageID" => $memberPackageID
            ];

        } catch (PDOException $e) {

            // Có lỗi → hoàn tác toàn bộ
            if ($this->conn->inTransaction()) {
                $this->conn->rollBack();
            }

            return [
                "success" => false,
                "message" => $e->getMessage()
            ];
        }
    }


    // ============================================================
    // CẬP NHẬT HỘI VIÊN
    // ============================================================
    public function update(
    $memberID,
    $fullname,
    $gender,
    $birthDate,
    $phone,
    $email,
    $address,
    $joinDate,
    $packageID,
    $startDate,
    $endDate,
    $status
) {
    try {
        $this->conn->beginTransaction();

        // Cập nhật thông tin hội viên
        $sql = "UPDATE members SET
                    Fullname = :fullname,
                    Gender = :gender,
                    BirthDate = :birthDate,
                    Phone = :phone,
                    Email = :email,
                    Address = :address,
                    JoinDate = :joinDate
                WHERE MemberID = :memberID";

        $stmt = $this->conn->prepare($sql);

        $stmt->execute([
            ':fullname' => $fullname,
            ':gender' => $gender,
            ':birthDate' => $birthDate,
            ':phone' => $phone,
            ':email' => $email,
            ':address' => $address,
            ':joinDate' => $joinDate,
            ':memberID' => $memberID
        ]);

        // Cập nhật gói tập
        $sqlPackage = "UPDATE member_package SET
                            PackageID = :packageID,
                            StartDate = :startDate,
                            EndDate = :endDate,
                            Status = :status
                       WHERE MemberID = :memberID";

        $stmtPackage = $this->conn->prepare($sqlPackage);

        $stmtPackage->execute([
            ':packageID' => $packageID,
            ':startDate' => $startDate,
            ':endDate' => $endDate,
            ':status' => $status,
            ':memberID' => $memberID
        ]);

        $this->conn->commit();

        return true;

    } catch (PDOException $e) {

        if ($this->conn->inTransaction()) {
            $this->conn->rollBack();
        }

        error_log("Update Member Error: " . $e->getMessage());

        return false;
    }
}


    // ============================================================
    // XÓA HỘI VIÊN
    // ============================================================
    public function delete($memberID)
    {
        try {

            $this->conn->beginTransaction();


            // Lấy các MemberPackageID của hội viên
            $sqlPackage = "
                SELECT MemberPackageID
                FROM member_package
                WHERE MemberID = :memberID
            ";

            $stmtPackage = $this->conn->prepare($sqlPackage);
            $stmtPackage->bindParam(":memberID", $memberID);
            $stmtPackage->execute();

            $packages = $stmtPackage->fetchAll(PDO::FETCH_COLUMN);


            // Xóa payments trước
            if (!empty($packages)) {

                $sqlPayment = "
                    DELETE FROM payments
                    WHERE MemberPackageID = :memberPackageID
                ";

                $stmtPayment = $this->conn->prepare($sqlPayment);

                foreach ($packages as $memberPackageID) {
                    $stmtPayment->bindParam(
                        ":memberPackageID",
                        $memberPackageID
                    );
                    $stmtPayment->execute();
                }
            }


            // Xóa member_package
            $sqlMemberPackage = "
                DELETE FROM member_package
                WHERE MemberID = :memberID
            ";

            $stmtMemberPackage = $this->conn->prepare($sqlMemberPackage);
            $stmtMemberPackage->bindParam(":memberID", $memberID);
            $stmtMemberPackage->execute();


            // Xóa members
            $sqlMember = "
                DELETE FROM members
                WHERE MemberID = :memberID
            ";

            $stmtMember = $this->conn->prepare($sqlMember);
            $stmtMember->bindParam(":memberID", $memberID);
            $stmtMember->execute();


            $this->conn->commit();

            return true;

        } catch (PDOException $e) {

            if ($this->conn->inTransaction()) {
                $this->conn->rollBack();
            }

            return false;
        }
    }
}