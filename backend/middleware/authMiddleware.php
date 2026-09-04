<?php

function requireRole($allowedRoles)
{
    // Kiểm tra đã đăng nhập chưa
    if (!isset($_SESSION['UserID'])) {
        http_response_code(401);

        echo json_encode([
            "success" => false,
            "message" => "Chưa đăng nhập"
        ]);

        exit;
    }

    // Lấy role từ session
    $role = $_SESSION['Role'] ?? '';

    // Kiểm tra quyền
    if (!in_array($role, $allowedRoles)) {
        http_response_code(403);

        echo json_encode([
            "success" => false,
            "message" => "Bạn không có quyền thực hiện chức năng này"
        ]);

        exit;
    }
}