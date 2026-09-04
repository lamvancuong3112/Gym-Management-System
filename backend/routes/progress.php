<?php

session_start();

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../controllers/ProgressController.php';
require_once __DIR__ . '/../middleware/authMiddleware.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

$progress = new ProgressController($conn);


// =========================
// GET - XEM TIẾN ĐỘ
// ADMIN + STAFF
// =========================
if ($method === 'GET') {

    requireRole(['admin', 'staff','trainer']);

    if (isset($_GET['id'])) {
        $result = $progress->getById($_GET['id']);

        echo json_encode($result);
        exit;
    }

    $result = $progress->getAll();

    echo json_encode($result);
    exit;
}


// =========================
// POST - THÊM TIẾN ĐỘ
// ADMIN + STAFF
// =========================
if ($method === 'POST') {

    requireRole(['admin', 'staff','trainer']);

    $data = json_decode(
        file_get_contents("php://input"),
        true
    );

    $result = $progress->create($data);

    echo json_encode($result);
    exit;
}


// =========================
// PUT - SỬA TIẾN ĐỘ
// CHỈ ADMIN
// =========================
if ($method === 'PUT') {

    requireRole(['admin']);

    $data = json_decode(
        file_get_contents("php://input"),
        true
    );

    $result = $progress->update($data);

    echo json_encode($result);
    exit;
}


// =========================
// DELETE - XÓA TIẾN ĐỘ
// CHỈ ADMIN
// =========================
if ($method === 'DELETE') {

    requireRole(['admin']);

    $progressID = $_GET['id'] ?? '';

    if (empty($progressID)) {
        echo json_encode([
            "success" => false,
            "message" => "Thiếu ProgressID"
        ]);
        exit;
    }

    $result = $progress->delete($progressID);

    echo json_encode($result);
    exit;
}


// =========================
// METHOD KHÔNG HỖ TRỢ
// =========================
http_response_code(405);

echo json_encode([
    "success" => false,
    "message" => "Method không được hỗ trợ"
]);