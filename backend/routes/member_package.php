<?php

session_start();

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../controllers/MemberPackageController.php';
require_once __DIR__ . '/../middleware/authMiddleware.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

$memberPackage = new MemberPackageController($conn);


// =========================
// GET - XEM GÓI CỦA HỘI VIÊN
// ADMIN + STAFF
// =========================
if ($method === 'GET') {

    requireRole(['admin', 'staff']);

    if (isset($_GET['id'])) {
        $result = $memberPackage->getById($_GET['id']);

        echo json_encode($result);
        exit;
    }

    $result = $memberPackage->getAll();

    echo json_encode($result);
    exit;
}


// =========================
// POST - ĐĂNG KÝ GÓI
// ADMIN + STAFF
// =========================
if ($method === 'POST') {

    requireRole(['admin','staff']);

    $data = json_decode(
        file_get_contents("php://input"),
        true
    );

    $result = $memberPackage->create($data);

    echo json_encode($result);
    exit;
}


// =========================
// PUT - CẬP NHẬT GÓI
// ADMIN + STAFF
// =========================
if ($method === 'PUT') {

    requireRole(['admin']);

    $data = json_decode(
        file_get_contents("php://input"),
        true
    );

    $result = $memberPackage->update($data);

    echo json_encode($result);
    exit;
}


// =========================
// DELETE - XÓA GÓI
// CHỈ ADMIN
// =========================
if ($method === 'DELETE') {

    requireRole(['admin']);

    $memberPackageID = $_GET['id'] ?? '';

    if (empty($memberPackageID)) {
        echo json_encode([
            "success" => false,
            "message" => "Thiếu MemberPackageID"
        ]);
        exit;
    }

    $result = $memberPackage->delete($memberPackageID);

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