<?php

class Product
{
    private $conn;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    // Lấy danh sách sản phẩm
    public function getAll()
    {
        $sql = "SELECT *
                FROM products
                ORDER BY ProductID ASC";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Thêm sản phẩm
    public function create(
        $productName,
        $category,
        $price,
        $stock,
        $description,
        $status = 'Active'
    ) {
        $sql = "INSERT INTO products
                    (ProductName, Category, Price, Stock, Description, Status)
                VALUES
                    (:productName, :category, :price, :stock, :description, :status)";

        $stmt = $this->conn->prepare($sql);

        return $stmt->execute([
            ':productName' => $productName,
            ':category' => $category,
            ':price' => $price,
            ':stock' => $stock,
            ':description' => $description,
            ':status' => $status
        ]);
    }

    // Tìm sản phẩm theo ID
    public function findById($productID)
    {
        $sql = "SELECT *
                FROM products
                WHERE ProductID = :productID";

        $stmt = $this->conn->prepare($sql);

        $stmt->execute([
            ':productID' => $productID
        ]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Cập nhật sản phẩm
    public function update(
        $productID,
        $productName,
        $category,
        $price,
        $stock,
        $description,
        $status = 'Active'
    ) {
        $sql = "UPDATE products SET
                    ProductName = :productName,
                    Category = :category,
                    Price = :price,
                    Stock = :stock,
                    Description = :description,
                    Status = :status
                WHERE ProductID = :productID";

        $stmt = $this->conn->prepare($sql);

        return $stmt->execute([
            ':productID' => $productID,
            ':productName' => $productName,
            ':category' => $category,
            ':price' => $price,
            ':stock' => $stock,
            ':description' => $description,
            ':status' => $status
        ]);
    }

    // Xóa sản phẩm
    public function delete($productID)
    {
        $sql = "DELETE FROM products
                WHERE ProductID = :productID";

        $stmt = $this->conn->prepare($sql);

        return $stmt->execute([
            ':productID' => $productID
        ]);
    }

    // Nhập thêm tồn kho
    public function incrementStock(
        $productID,
        $quantity
    ) {
        $sql = "UPDATE products
                SET Stock = Stock + :quantity
                WHERE ProductID = :productID";

        $stmt = $this->conn->prepare($sql);

        return $stmt->execute([
            ':productID' => $productID,
            ':quantity' => $quantity
        ]);
    }
}