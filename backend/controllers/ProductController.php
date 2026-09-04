<?php

require_once __DIR__ . '/../models/Product.php';

class ProductController
{
    private $product;

    public function __construct($db)
    {
        $this->product = new Product($db);
    }

    // GET - Lấy danh sách sản phẩm
    public function getAll()
    {
        return [
            "success" => true,
            "data" => $this->product->getAll()
        ];
    }

    // POST - Thêm sản phẩm
    public function create($data)
    {
        if (
            empty($data['ProductName']) ||
            !isset($data['Category']) ||
            !isset($data['Price']) ||
            !isset($data['Stock'])
        ) {
            return [
                "success" => false,
                "message" => "Thiếu thông tin sản phẩm"
            ];
        }

        $created = $this->product->create(
            trim($data['ProductName']),
            trim($data['Category']),
            $data['Price'],
            $data['Stock'],
            trim($data['Description'] ?? ''),
            $data['Status'] ?? 'Active'
        );

        return [
            "success" => $created,
            "message" => $created
                ? "Thêm sản phẩm thành công"
                : "Thêm sản phẩm thất bại"
        ];
    }

    // PUT - Sửa sản phẩm
    public function update($data)
    {
        if (empty($data['ProductID'])) {
            return [
                "success" => false,
                "message" => "Thiếu ProductID"
            ];
        }

        $updated = $this->product->update(
            $data['ProductID'],
            trim($data['ProductName']),
            trim($data['Category']),
            $data['Price'],
            $data['Stock'],
            trim($data['Description'] ?? ''),
            $data['Status'] ?? 'Active'
        );

        return [
            "success" => $updated,
            "message" => $updated
                ? "Cập nhật sản phẩm thành công"
                : "Cập nhật sản phẩm thất bại"
        ];
    }

    // DELETE - Xóa sản phẩm
    public function delete($productID)
    {
        if (empty($productID)) {
            return [
                "success" => false,
                "message" => "Thiếu ProductID"
            ];
        }

        $deleted = $this->product->delete($productID);

        return [
            "success" => $deleted,
            "message" => $deleted
                ? "Xóa sản phẩm thành công"
                : "Xóa sản phẩm thất bại"
        ];
    }

    // PATCH - Nhập thêm tồn kho
    public function incrementStock($data)
    {
        if (
            empty($data['ProductID']) ||
            !isset($data['addQuantity'])
        ) {
            return [
                "success" => false,
                "message" => "Thiếu thông tin nhập kho"
            ];
        }

        $updated = $this->product->incrementStock(
            $data['ProductID'],
            $data['addQuantity']
        );

        return [
            "success" => $updated,
            "message" => $updated
                ? "Nhập thêm tồn kho thành công"
                : "Nhập kho thất bại"
        ];
    }
}