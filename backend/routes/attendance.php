<?php

session_start();

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../controllers/AttendanceController.php';
require_once __DIR__ . '/../middleware/authMiddleware.php';

header('Content-Type: application/json; charset=utf-8');

$controller = new AttendanceController($conn);

$method = $_SERVER['REQUEST_METHOD'];

try {

    if ($method === 'GET') {

        requireRole(['admin', 'staff', 'trainer']);

        if (isset($_GET['id'])) {
            $result = $controller->getById($_GET['id']);
        } else {
            $result = $controller->getAll();
        }

        echo json_encode($result, JSON_UNESCAPED_UNICODE);
        exit;
    }


    if ($method === 'POST') {

        requireRole(['admin', 'staff']);

        $data = json_decode(
            file_get_contents('php://input'),
            true
        );

        $result = $controller->checkIn($data ?: []);

        http_response_code(
            $result['success'] ? 200 : 400
        );

        echo json_encode($result, JSON_UNESCAPED_UNICODE);
        exit;
    }


    if ($method === 'PUT') {

        requireRole(['admin', 'staff']);

        $id = $_GET['id'] ?? '';

        if (empty($id)) {
            http_response_code(400);

            echo json_encode([
                'success' => false,
                'message' => 'Thiếu AttendanceID'
            ], JSON_UNESCAPED_UNICODE);

            exit;
        }

        $data = json_decode(
            file_get_contents('php://input'),
            true
        );

        if (isset($_GET['update']) && $_GET['update'] === '1') {

            $data = $data ?: [];
            $data['AttendanceID'] = $id;

            $result = $controller->update($data);

        } else {

            $result = $controller->checkOut($id);
        }

        http_response_code(
            $result['success'] ? 200 : 400
        );

        echo json_encode($result, JSON_UNESCAPED_UNICODE);
        exit;
    }


    if ($method === 'DELETE') {

        requireRole(['admin']);

        $id = $_GET['id'] ?? '';

        if (empty($id)) {
            http_response_code(400);

            echo json_encode([
                'success' => false,
                'message' => 'Thiếu AttendanceID'
            ], JSON_UNESCAPED_UNICODE);

            exit;
        }

        $result = $controller->delete($id);

        http_response_code(
            $result['success'] ? 200 : 400
        );

        echo json_encode($result, JSON_UNESCAPED_UNICODE);
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