<?php

session_start();

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../controllers/MemberController.php';
require_once __DIR__ . '/../middleware/authMiddleware.php';

header('Content-Type: application/json; charset=UTF-8');

$method = $_SERVER['REQUEST_METHOD'];

$member = new MemberController($conn);


// ============================================================
// GET - XEM DANH SÁCH / CHI TIẾT HỘI VIÊN
// ADMIN + STAFF
// ============================================================

if ($method === 'GET') {

    requireRole(['admin', 'staff','trainer']);

    if (isset($_GET['id'])) {

        $result = $member->getById($_GET['id']);

        echo json_encode(
            $result,
            JSON_UNESCAPED_UNICODE
        );

        exit;
    }

    $result = $member->getAll();

    echo json_encode(
        $result,
        JSON_UNESCAPED_UNICODE
    );

    exit;
}


// ============================================================
// POST - THÊM HỘI VIÊN
// ADMIN + STAFF
//
// POST này sẽ tạo:
// 1. members
// 2. member_package
// 3. payments
// ============================================================

if ($method === 'POST') {

    requireRole(['admin', 'staff']);


    // --------------------------------------------------------
    // Đọc JSON từ Frontend
    // --------------------------------------------------------

    $rawData = file_get_contents("php://input");

    $data = json_decode($rawData, true);


    // Kiểm tra JSON
    if (!is_array($data)) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Dữ liệu JSON không hợp lệ"
        ], JSON_UNESCAPED_UNICODE);

        exit;
    }


    // --------------------------------------------------------
    // Gọi Controller
    // --------------------------------------------------------

    $result = $member->create($data);


    // Nếu thất bại
    if (!$result['success']) {

        http_response_code(400);

        echo json_encode(
            $result,
            JSON_UNESCAPED_UNICODE
        );

        exit;
    }


    // Thành công
    echo json_encode(
        $result,
        JSON_UNESCAPED_UNICODE
    );

    exit;
}


// ============================================================
// PUT - CẬP NHẬT THÔNG TIN HỘI VIÊN
// CHỈ ADMIN
// ============================================================

if ($method === 'PUT') {

    requireRole(['admin']);

    $rawData = file_get_contents("php://input");

    $data = json_decode($rawData, true);


    if (!is_array($data)) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Dữ liệu JSON không hợp lệ"
        ], JSON_UNESCAPED_UNICODE);

        exit;
    }


    $result = $member->update($data);


    if (!$result['success']) {

        http_response_code(400);

        echo json_encode(
            $result,
            JSON_UNESCAPED_UNICODE
        );

        exit;
    }


    echo json_encode(
        $result,
        JSON_UNESCAPED_UNICODE
    );

    exit;
}


// ============================================================
// DELETE - XÓA HỘI VIÊN
// CHỈ ADMIN
// ============================================================

if ($method === 'DELETE') {

    requireRole(['admin']);

    $memberID = $_GET['id'] ?? '';


    if (empty($memberID)) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Thiếu MemberID"
        ], JSON_UNESCAPED_UNICODE);

        exit;
    }


    $result = $member->delete($memberID);


    if (!$result['success'] && isset($result['message'])) {

        http_response_code(400);

        echo json_encode(
            $result,
            JSON_UNESCAPED_UNICODE
        );

        exit;
    }


    echo json_encode([
        "success" => true,
        "message" => "Xóa hội viên thành công"
    ], JSON_UNESCAPED_UNICODE);

    exit;
}


// ============================================================
// METHOD KHÔNG ĐƯỢC HỖ TRỢ
// ============================================================

http_response_code(405);

echo json_encode([
    "success" => false,
    "message" => "Method không được hỗ trợ"
], JSON_UNESCAPED_UNICODE);