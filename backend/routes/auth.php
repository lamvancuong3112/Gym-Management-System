<?php
session_start();

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../middleware/authMiddleware.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {

    $data = json_decode(file_get_contents("php://input"), true);

    $action = $data['action'] ?? '';

    $auth = new AuthController($conn);

    // =========================
    // ĐĂNG NHẬP
    // =========================
    if ($action === 'login') {

        $username = $data['username'] ?? '';
        $password = $data['password'] ?? '';

        if (empty($username) || empty($password)) {
            echo json_encode([
                "success" => false,
                "message" => "Vui lòng nhập đầy đủ username và password"
            ]);
            exit;
        }
        $result = $auth->login($username, $password);

        if ($result['success']) {

            // Member không được đăng nhập hệ thống quản trị
            if ($result['user']['Role'] === 'member') {
                echo json_encode([
                    "success" => false,
                    "message" => "Tài khoản hội viên không được phép đăng nhập hệ thống"
                ]);
                exit;
            }

            $_SESSION['UserID'] = $result['user']['UserID'];
            $_SESSION['Username'] = $result['user']['Username'];
            $_SESSION['Role'] = $result['user']['Role'];
        }

        echo json_encode($result);
        exit;

    }

    // =========================
    // TẠO TÀI KHOẢN
    // =========================
    if ($action === 'create_user') {

        // CHỈ ADMIN ĐƯỢC TẠO TÀI KHOẢN
        requireRole(['admin']);

        $username = $data['username'] ?? '';
        $password = $data['password'] ?? '';
        $role = $data['role'] ?? 'staff';

        if (empty($username) || empty($password)) {
            echo json_encode([
                "success" => false,
                "message" => "Vui lòng nhập đầy đủ username và password"
            ]);
            exit;
        }

        $result = $auth->createUser(
            $username,
            $password,
            $role
        );

        echo json_encode($result);
        exit;
    }

    echo json_encode([
        "success" => false,
        "message" => "Action không hợp lệ"
    ]);

    exit;
}

echo json_encode([
    "success" => false,
    "message" => "Method không được hỗ trợ"
]);