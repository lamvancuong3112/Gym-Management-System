<?php

session_start();

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../controllers/BookingController.php';
require_once __DIR__ . '/../middleware/authMiddleware.php';

header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'];

$controller = new BookingController($conn);

try {

    // =========================================================
    // GET
    // ADMIN + STAFF + TRAINER
    // =========================================================
    if ($method === 'GET') {

        requireRole(['admin', 'staff', 'trainer']);

        if (isset($_GET['id'])) {
            $result = $controller->getById($_GET['id']);
        } else {
            $result = $controller->getAll();
        }

        echo json_encode(
            $result,
            JSON_UNESCAPED_UNICODE
        );

        exit;
    }

    // =========================================================
    // POST - THÊM BOOKING
    // ADMIN + STAFF
    // =========================================================
    if ($method === 'POST') {

        requireRole(['admin', 'staff']);

        $data = json_decode(
            file_get_contents("php://input"),
            true
        );

        $result = $controller->create(
            $data ?? []
        );

        http_response_code(
            $result['success'] ? 200 : 400
        );

        echo json_encode(
            $result,
            JSON_UNESCAPED_UNICODE
        );

        exit;
    }

    // =========================================================
    // PUT - ĐỔI TRẠNG THÁI
    // ADMIN + STAFF
    // =========================================================
    if ($method === 'PUT') {

        requireRole(['admin', 'staff']);

        $id = $_GET['id'] ?? '';

        if (empty($id)) {
            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Thiếu BookingID"
            ], JSON_UNESCAPED_UNICODE);

            exit;
        }

        $data = json_decode(
            file_get_contents("php://input"),
            true
        );

        $result = $controller->updateStatus(
            $id,
            $data ?? []
        );

        http_response_code(
            $result['success'] ? 200 : 400
        );

        echo json_encode(
            $result,
            JSON_UNESCAPED_UNICODE
        );

        exit;
    }

    // =========================================================
    // METHOD KHÔNG HỖ TRỢ
    // =========================================================

    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Method không được hỗ trợ"
    ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}