<?php

session_start();

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../controllers/SaleController.php';
require_once __DIR__ . '/../middleware/authMiddleware.php';

header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'];

try {

            // =========================
            // GET - DOANH THU BÁN HÀNG HÔM NAY
            // ADMIN + STAFF
            // =========================
            if ($method === 'GET') {
                requireRole(['admin', 'staff']);

                $controller = new SaleController($conn);

                $result = $controller->getAll();

                echo json_encode(
                    $result,
                    JSON_UNESCAPED_UNICODE
                );

                exit;
            }

            if ($method === 'POST') {

    

        // Admin + Staff được bán hàng
        requireRole(['admin', 'staff']);

        $data = json_decode(
            file_get_contents('php://input'),
            true
        );

        $controller = new SaleController($conn);

        $result = $controller->create(
            $data ?? [],
            $_SESSION['UserID']
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

    http_response_code(405);

    echo json_encode([
        'success' => false,
        'message' => 'Method không được hỗ trợ'
    ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}