<?php

require_once __DIR__ . '/../models/User.php';

class UserController
{
    private $user;

    public function __construct($db)
    {
        $this->user = new User($db);
    }

    // Lấy danh sách tài khoản
    public function getAll()
    {
        return [
            "success" => true,
            "data" => $this->user->getAll()
        ];
    }

    // Tạo tài khoản
    public function create($data)
    {
        if (
            empty($data['username']) ||
            empty($data['password']) ||
            empty($data['role'])
        ) {
            return [
                "success" => false,
                "message" => "Thiếu thông tin tài khoản"
            ];
        }

        $created = $this->user->createUser(
            trim($data['username']),
            $data['password'],
            trim($data['role'])
        );

        return [
            "success" => $created,
            "message" => $created
                ? "Tạo tài khoản thành công"
                : "Tạo tài khoản thất bại"
        ];
    }

    // Cập nhật tài khoản
    public function update($data)
    {
        if (empty($data['userID'])) {
            return [
                "success" => false,
                "message" => "Thiếu UserID"
            ];
        }

        $updated = $this->user->updateUser(
            $data['userID'],
            trim($data['username']),
            trim($data['role']),
            trim($data['status'])
        );

        return [
            "success" => $updated,
            "message" => $updated
                ? "Cập nhật tài khoản thành công"
                : "Cập nhật tài khoản thất bại"
        ];
    }

    // Xóa tài khoản
    public function delete($userID)
    {
        if (empty($userID)) {
            return [
                "success" => false,
                "message" => "Thiếu UserID"
            ];
        }

        $deleted = $this->user->deleteUser($userID);

        return [
            "success" => $deleted,
            "message" => $deleted
                ? "Xóa tài khoản thành công"
                : "Xóa tài khoản thất bại"
        ];
    }
}