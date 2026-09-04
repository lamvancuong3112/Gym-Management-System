<?php

require_once __DIR__ . '/../models/User.php';

class AuthController
{
    private $user;

    public function __construct($db)
    {
        $this->user = new User($db);
    }

    // Đăng nhập
    public function login($username, $password)
{
    $user = $this->user->findByUsername($username);

    if (!$user) {
        return [
            "success" => false,
            "message" => "Username không tồn tại"
        ];
    }

    if (!password_verify($password, $user['Password'])) {
        return [
            "success" => false,
            "message" => "Sai mật khẩu"
        ];
    }

    // Kiểm tra trạng thái tài khoản
    if (strtolower($user['Status']) !== 'active') {
        return [
            "success" => false,
            "message" => "Tài khoản đã bị khóa hoặc không hoạt động"
        ];
    }

    return [
        "success" => true,
        "message" => "Đăng nhập thành công",
        "user" => [
            "UserID" => $user['UserID'],
            "Username" => $user['Username'],
            "Role" => strtolower($user['Role']),
            "Status" => $user['Status']
        ]
    ];
}

    // Tạo tài khoản
    public function createUser($username, $password, $role)
    {
        // Kiểm tra username đã tồn tại chưa
        $existingUser = $this->user->findByUsername($username);

        if ($existingUser) {
            return [
                "success" => false,
                "message" => "Username đã tồn tại"
            ];
        }

        // Tạo tài khoản
        $created = $this->user->createUser($username, $password, $role);

        if (!$created) {
            return [
                "success" => false,
                "message" => "Tạo tài khoản thất bại"
            ];
        }

        return [
            "success" => true,
            "message" => "Tạo tài khoản thành công"
        ];
    }
}