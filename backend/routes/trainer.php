<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../controllers/TrainerController.php';

header('Content-Type: application/json; charset=utf-8');

$controller = new TrainerController($conn);

try {

    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {

        echo json_encode(
            $controller->getAll(),
            JSON_UNESCAPED_UNICODE
        );

        exit;
    }

    if ($method === 'POST') {

        $data = json_decode(
            file_get_contents("php://input"),
            true
        );

        if (!empty($_GET['id'])) {

            $data['TrainerID'] = $_GET['id'];

            $result = $controller->update($data);

        } else {

            $result = $controller->create($data);
        }

        http_response_code(
            $result['success'] ? 200 : 400
        );

        echo json_encode(
            $result,
            JSON_UNESCAPED_UNICODE
        );

        exit;
    }
    if ($method === 'DELETE') {

        $trainerID = $_GET['id'] ?? null;

        $result = $controller->delete($trainerID);

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