<?php

session_start();

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../controllers/FeedbackController.php';
require_once __DIR__ . '/../middleware/authMiddleware.php';

header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'];

$controller = new FeedbackController($conn);

try {

    // =========================================================
    // GET
    // ADMIN + STAFF + TRAINER
    // =========================================================

    if ($method === 'GET') {

        requireRole(['admin', 'staff', 'trainer']);

        if (isset($_GET['trainerID'])) {

            $result = $controller->getByTrainer(
                (int)$_GET['trainerID']
            );

        } elseif (isset($_GET['id'])) {

            $result = $controller->getById(
                (int)$_GET['id']
            );

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
    // POST
    // ADMIN + STAFF + TRAINER
    // =========================================================

    if ($method === 'POST') {

        requireRole(['admin', 'staff', 'trainer']);

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
    // METHOD NOT ALLOWED
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