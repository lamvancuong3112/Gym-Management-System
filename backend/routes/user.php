<?php

session_start();

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../controllers/UserController.php';
require_once __DIR__ . '/../middleware/authMiddleware.php';

header('Content-Type: application/json; charset=utf-8');

$controller = new UserController($conn);
$method = $_SERVER['REQUEST_METHOD'];

try {

    // Chỉ Admin được quản lý tài khoản
    requireRole(['admin']);

    if ($method === 'GET') {

        echo json_encode($controller->getAll());
        exit;
    }

    if ($method === 'POST') {

        $data = json_decode(file_get_contents("php://input"), true);

        $result = $controller->create($data);

        http_response_code($result['success'] ? 200 : 400);
        echo json_encode($result);
        exit;
    }

    if ($method === 'PUT') {

        $data = json_decode(file_get_contents("php://input"), true);

        $result = $controller->update($data);

        http_response_code($result['success'] ? 200 : 400);
        echo json_encode($result);
        exit;
    }

    if ($method === 'DELETE') {

        $userID = $_GET['id'] ?? null;

        $result = $controller->delete($userID);

        http_response_code($result['success'] ? 200 : 400);
        echo json_encode($result);
        exit;
    }

    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Method không được hỗ trợ"
    ]);

} catch (Throwable $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}