<?php

require_once __DIR__ . '/../models/Payment.php';

class PaymentController
{
    private $payment;

    public function __construct($db)
    {
        $this->payment = new Payment($db);
    }

    // Lấy danh sách thanh toán
    public function getAll()
    {
        return [
            "success" => true,
            "data" => $this->payment->getAll()
        ];
    }

    // Lấy thanh toán theo ID
    public function getById($paymentsID)
    {
        $payment = $this->payment->findById($paymentsID);

        if (!$payment) {
            return [
                "success" => false,
                "message" => "Không tìm thấy thanh toán"
            ];
        }

        return [
            "success" => true,
            "data" => $payment
        ];
    }

    // Thêm thanh toán
    public function create($data)
    {
        $required = [
            'amount',
            'paymentMethod',
            'paymentDate',
            'status',
            'memberPackageID'
        ];

        foreach ($required as $field) {
            if (!isset($data[$field]) || $data[$field] === '') {
                return [
                    "success" => false,
                    "message" => "Thiếu thông tin: " . $field
                ];
            }
        }

        $created = $this->payment->create(
            $data['amount'],
            $data['paymentMethod'],
            $data['paymentDate'],
            $data['status'],
            $data['memberPackageID']
        );

        return [
            "success" => $created,
            "message" => $created
                ? "Thêm thanh toán thành công"
                : "Thêm thanh toán thất bại"
        ];
    }

    // Cập nhật thanh toán
    public function update($data)
    {
        if (empty($data['paymentsID'])) {
            return [
                "success" => false,
                "message" => "Thiếu PaymentsID"
            ];
        }

        $payment = $this->payment->findById($data['paymentsID']);

        if (!$payment) {
            return [
                "success" => false,
                "message" => "Không tìm thấy thanh toán"
            ];
        }

        $updated = $this->payment->update(
            $data['paymentsID'],
            $data['amount'],
            $data['paymentMethod'],
            $data['paymentDate'],
            $data['status'],
            $data['memberPackageID']
        );

        return [
            "success" => $updated,
            "message" => $updated
                ? "Cập nhật thanh toán thành công"
                : "Cập nhật thanh toán thất bại"
        ];
    }

    // Xóa thanh toán
    public function delete($paymentsID)
    {
        $payment = $this->payment->findById($paymentsID);

        if (!$payment) {
            return [
                "success" => false,
                "message" => "Không tìm thấy thanh toán"
            ];
        }

        $deleted = $this->payment->delete($paymentsID);

        return [
            "success" => $deleted,
            "message" => $deleted
                ? "Xóa thanh toán thành công"
                : "Xóa thanh toán thất bại"
        ];
    }
}