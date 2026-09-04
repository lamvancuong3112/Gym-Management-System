<?php

session_start();

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../controllers/ProductController.php';
require_once __DIR__ . '/../middleware/authMiddleware.php';

header('Content-Type: application/json; charset=utf-8');

$product = new ProductController($conn);

$method = $_SERVER['REQUEST_METHOD'];

try {

    // GET - ADMIN + STAFF
    if ($method === 'GET') {

        requireRole(['admin', 'staff']);

        echo json_encode(
            $product->getAll()
        );

        exit;
    }


    // POST - ADMIN
    if ($method === 'POST') {

        requireRole(['admin']);

        $data = json_decode(
            file_get_contents("php://input"),
            true
        );

        echo json_encode(
            $product->create($data)
        );

        exit;
    }


    // PUT - ADMIN
    if ($method === 'PUT') {

        requireRole(['admin']);

        $data = json_decode(
            file_get_contents("php://input"),
            true
        );

        echo json_encode(
            $product->update($data)
        );

        exit;
    }


    // DELETE - ADMIN
    if ($method === 'DELETE') {

        requireRole(['admin']);

        $productID = $_GET['id'] ?? null;

        if (empty($productID)) {

            echo json_encode([
                "success" => false,
                "message" => "Thiếu ProductID"
            ]);

            exit;
        }

        echo json_encode(
            $product->delete($productID)
        );

        exit;
    }


    // PATCH - ADMIN + STAFF
    if ($method === 'PATCH') {

        requireRole(['admin', 'staff']);

        $data = json_decode(
            file_get_contents("php://input"),
            true
        );

        echo json_encode(
            $product->incrementStock($data)
        );

        exit;
    }


    // Method khác
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