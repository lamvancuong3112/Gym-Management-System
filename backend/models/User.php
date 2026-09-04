<?php

class User
{
    private $conn;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    // Tìm user theo username
    public function findByUsername($username)
    {
        $sql = "SELECT * FROM users
                WHERE Username = :username
                LIMIT 1";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":username", $username);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Lấy tất cả tài khoản
    public function getAll()
    {
        $sql = "SELECT UserID, Username, Role, Status
                FROM users
                ORDER BY UserID ASC";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Tạo tài khoản
    public function createUser($username, $password, $role = "staff")
    {
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

        $sql = "INSERT INTO users
                    (Username, Password, Role, Status)
                VALUES
                    (:username, :password, :role, 'active')";

        $stmt = $this->conn->prepare($sql);

        $stmt->bindParam(":username", $username);
        $stmt->bindParam(":password", $hashedPassword);
        $stmt->bindParam(":role", $role);

        return $stmt->execute();
    }

    // Cập nhật tài khoản
    public function updateUser($userID, $username, $role, $status)
    {
        $sql = "UPDATE users SET
                    Username = :username,
                    Role = :role,
                    Status = :status
                WHERE UserID = :userID";

        $stmt = $this->conn->prepare($sql);

        return $stmt->execute([
            ':username' => $username,
            ':role' => $role,
            ':status' => $status,
            ':userID' => $userID
        ]);
    }

    // Xóa tài khoản
    public function deleteUser($userID)
    {
        $sql = "DELETE FROM users
                WHERE UserID = :userID";

        $stmt = $this->conn->prepare($sql);

        return $stmt->execute([
            ':userID' => $userID
        ]);
    }
}