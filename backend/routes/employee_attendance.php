<?php

session_start();

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../controllers/EmployeeAttendanceController.php';
require_once __DIR__ . '/../middleware/authMiddleware.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

$controller = new EmployeeAttendanceController($conn);


// =========================
// GET
// ADMIN: xem tất cả
// STAFF + TRAINER: xem của mình
// =========================
if ($method === 'GET') {

    requireRole(['admin', 'staff', 'trainer']);

    if ($_SESSION['Role'] === 'admin') {

        $result = $controller->getAll();

    } else {

        $result = $controller->getByUserID(
            $_SESSION['UserID']
        );
    }

    echo json_encode($result, JSON_UNESCAPED_UNICODE);
    exit;
}


// =========================
// POST - CHECK-IN
// ADMIN + STAFF + TRAINER
// =========================
if ($method === 'POST') {

    requireRole(['admin', 'staff', 'trainer']);

    $data = json_decode(
        file_get_contents("php://input"),
        true
    );

    $result = $controller->checkIn(
        $data ?? [],
        $_SESSION['UserID']
    );

    echo json_encode($result, JSON_UNESCAPED_UNICODE);
    exit;
}


// =========================
// PUT - CHECK-OUT
// ADMIN + STAFF + TRAINER
// =========================
if ($method === 'PUT') {

    requireRole(['admin', 'staff', 'trainer']);

    $id = $_GET['id'] ?? '';

    if (empty($id)) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Thiếu EmployeeAttendanceID"
        ], JSON_UNESCAPED_UNICODE);

        exit;
    }

    $data = json_decode(
        file_get_contents("php://input"),
        true
    );

    $result = $controller->checkOut(
        $id,
        $data ?? [],
        $_SESSION['UserID'],
        $_SESSION['Role']
    );

    echo json_encode($result, JSON_UNESCAPED_UNICODE);
    exit;
}


// =========================
// DELETE
// CHỈ ADMIN
// =========================
if ($method === 'DELETE') {

    requireRole(['admin']);

    $id = $_GET['id'] ?? '';

    if (empty($id)) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Thiếu EmployeeAttendanceID"
        ], JSON_UNESCAPED_UNICODE);

        exit;
    }

    $result = $controller->delete($id);

    echo json_encode($result, JSON_UNESCAPED_UNICODE);
    exit;
}


// =========================
// METHOD KHÔNG HỖ TRỢ
// =========================
http_response_code(405);

echo json_encode([
    "success" => false,
    "message" => "Method không được hỗ trợ"
], JSON_UNESCAPED_UNICODE);