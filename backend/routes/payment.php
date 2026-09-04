<?php

session_start();

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../controllers/PaymentController.php';
require_once __DIR__ . '/../middleware/authMiddleware.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

$payment = new PaymentController($conn);


// =========================
// GET - XEM THANH TOÁN
// ADMIN + STAFF
// =========================
if ($method === 'GET') {

    requireRole(['admin', 'staff']);

    if (isset($_GET['id'])) {
        $result = $payment->getById($_GET['id']);

        echo json_encode($result);
        exit;
    }

    $result = $payment->getAll();

    echo json_encode($result);
    exit;
}


// =========================
// POST - THÊM THANH TOÁN
// ADMIN + STAFF
// =========================
if ($method === 'POST') {

    requireRole(['admin', 'staff']);

    $data = json_decode(
        file_get_contents("php://input"),
        true
    );

    $result = $payment->create($data);

    echo json_encode($result);
    exit;
}


// =========================
// PUT - SỬA THANH TOÁN
// CHỈ ADMIN
// =========================
if ($method === 'PUT') {

    requireRole(['admin']);

    $data = json_decode(
        file_get_contents("php://input"),
        true
    );

    $result = $payment->update($data);

    echo json_encode($result);
    exit;
}


// =========================
// DELETE - XÓA THANH TOÁN
// CHỈ ADMIN
// =========================
if ($method === 'DELETE') {

    requireRole(['admin']);

    $paymentsID = $_GET['id'] ?? '';

    if (empty($paymentsID)) {
        echo json_encode([
            "success" => false,
            "message" => "Thiếu PaymentsID"
        ]);
        exit;
    }

    $result = $payment->delete($paymentsID);

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