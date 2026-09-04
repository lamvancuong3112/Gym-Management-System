<?php

require_once __DIR__ . '/../models/Sale.php';

class SaleController
{
    private $sale;

    public function __construct($db)
    {
        $this->sale = new Sale($db);
    }

    public function create($data, $userID)
    {
        if (empty($userID)) {
            return [
                'success' => false,
                'message' => 'Không xác định được nhân viên bán hàng'
            ];
        }

        $productID = isset($data['ProductID'])
            ? (int)$data['ProductID']
            : 0;

        $quantity = isset($data['Quantity'])
            ? (int)$data['Quantity']
            : 0;

        $paymentMethod = trim(
            $data['PaymentMethod'] ?? ''
        );

        if ($productID <= 0) {
            return [
                'success' => false,
                'message' => 'Sản phẩm không hợp lệ'
            ];
        }

        if ($quantity <= 0) {
            return [
                'success' => false,
                'message' => 'Số lượng phải lớn hơn 0'
            ];
        }

        if ($paymentMethod === '') {
            return [
                'success' => false,
                'message' => 'Vui lòng chọn phương thức thanh toán'
            ];
        }

        try {

            return $this->sale->createSale(
                $userID,
                $productID,
                $quantity,
                $paymentMethod
            );

        } catch (Throwable $e) {

            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }
    public function getTodaySales()
    {
        try {
            return $this->sale->getTodaySales();
        } catch (Throwable $e) {
            return [
                'success' => false,
                'message' => $e->getMessage(),
                'data' => []
            ];
        }
    }
    public function getAll()
    {
        try {
            return $this->sale->getAllSales();
        } catch (Throwable $e) {
            return [
                'success' => false,
                'message' => $e->getMessage(),
                'data' => []
            ];
        }
    }
}