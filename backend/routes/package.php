<?php

session_start();

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../controllers/PackageController.php';
require_once __DIR__ . '/../middleware/authMiddleware.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

$package = new PackageController($conn);


// =========================
// GET - XEM GÓI TẬP
// ADMIN + STAFF
// =========================
if ($method === 'GET') {

    requireRole(['admin', 'staff']);

    if (isset($_GET['id'])) {

        $result = $package->getById($_GET['id']);

        echo json_encode($result);
        exit;
    }

    $result = $package->getAll();

    echo json_encode($result);
    exit;
}


// =========================
// POST - THÊM GÓI TẬP
// CHỈ ADMIN
// =========================
if ($method === 'POST') {

    requireRole(['admin']);

    $data = json_decode(
        file_get_contents("php://input"),
        true
    );

    $result = $package->create($data);

    echo json_encode($result);
    exit;
}


// =========================
// PUT - SỬA GÓI TẬP
// CHỈ ADMIN
// =========================
if ($method === 'PUT') {

    requireRole(['admin']);

    $data = json_decode(
        file_get_contents("php://input"),
        true
    );

    $result = $package->update($data);

    echo json_encode($result);
    exit;
}


// =========================
// DELETE - XÓA GÓI TẬP
// CHỈ ADMIN
// =========================
if ($method === 'DELETE') {

    requireRole(['admin']);

    $packageID = $_GET['id'] ?? '';

    if (empty($packageID)) {

        echo json_encode([
            "success" => false,
            "message" => "Thiếu PackageID"
        ]);

        exit;
    }

    $result = $package->delete($packageID);

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