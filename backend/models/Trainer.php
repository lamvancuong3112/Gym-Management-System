<?php

class Trainer
{
    private $conn;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    public function getAll()
    {
        $sql = "SELECT
                    TrainerID,
                    FullName,
                    Gender,
                    DateofBirth,
                    Phone,
                    Email,
                    Specialty,
                    Experience,
                    Status,
                    UserID
                FROM trainers
                ORDER BY TrainerID ASC";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create($data)
    {
        try {
            $this->conn->beginTransaction();

            // Tạo username riêng cho HLV
            $username = 'trainer_' . $data['Phone'];

            // Mật khẩu mặc định
            $password = password_hash('123456', PASSWORD_DEFAULT);

            // 1. Tạo tài khoản trainer
            $sqlUser = "INSERT INTO users
                        (Username, Password, Role, Status)
                        VALUES
                        (:username, :password, 'trainer', 'active')";

            $stmtUser = $this->conn->prepare($sqlUser);

            $stmtUser->execute([
                ':username' => $username,
                ':password' => $password
            ]);

            $userID = $this->conn->lastInsertId();

            // 2. Tạo HLV
            $sqlTrainer = "INSERT INTO trainers
                        (FullName, Gender, DateofBirth, Phone, Email,
                            Specialty, Experience, Status, UserID)
                        VALUES
                        (:fullname, 'Male', NULL, :phone, NULL,
                            :specialty, :experience, 'Active', :userID)";

            $stmtTrainer = $this->conn->prepare($sqlTrainer);

            $stmtTrainer->execute([
                ':fullname' => $data['FullName'],
                ':phone' => $data['Phone'],
                ':specialty' => $data['Specialty'],
                ':experience' => $data['Experience'],
                ':userID' => $userID
            ]);

            $this->conn->commit();

            return true;

        } catch (Throwable $e) {

            if ($this->conn->inTransaction()) {
                $this->conn->rollBack();
            }

            throw $e;
        }
    }
    public function update($data)
    {
        $sql = "UPDATE trainers SET
                    FullName = :fullname,
                    Phone = :phone,
                    Specialty = :specialty,
                    Experience = :experience,
                    DateofBirth = :dob,
                    Email = :email
                WHERE TrainerID = :id";

        $stmt = $this->conn->prepare($sql);

        return $stmt->execute([
            ':fullname' => $data['FullName'],
            ':phone' => $data['Phone'],
            ':specialty' => $data['Specialty'],
            ':experience' => $data['Experience'],
            ':dob' => $data['DateofBirth'] ?: null,
            ':email' => $data['Email'] ?: null,
            ':id' => $data['TrainerID']
        ]);
    }
    public function delete($trainerID)
    {
        $sql = "DELETE FROM trainers
                WHERE TrainerID = :trainerID";

        $stmt = $this->conn->prepare($sql);

        return $stmt->execute([
            ':trainerID' => $trainerID
        ]);
    }
}