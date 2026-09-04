<?php

class Sale
{
    private $conn;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    public function createSale($userID, $productID, $quantity, $paymentMethod)
    {
        try {
            $this->conn->beginTransaction();

            // Lấy sản phẩm và khóa dòng để tránh bán vượt tồn kho
            $sql = "
                SELECT ProductID, ProductName, Price, Stock
                FROM products
                WHERE ProductID = :productID
                FOR UPDATE
            ";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute([
                ':productID' => $productID
            ]);

            $product = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$product) {
                throw new Exception('Không tìm thấy sản phẩm');
            }

            if ((int)$product['Stock'] < (int)$quantity) {
                throw new Exception(
                    'Không đủ hàng trong kho. Chỉ còn ' .
                    $product['Stock'] . ' sản phẩm.'
                );
            }

            $unitPrice = (float)$product['Price'];
            $subtotal = $unitPrice * (int)$quantity;

            // Tạo Sale
            $sqlSale = "
                INSERT INTO sales
                (
                    TotalAmount,
                    PaymentMethod,
                    Status,
                    FKUserID
                )
                VALUES
                (
                    :totalAmount,
                    :paymentMethod,
                    'Completed',
                    :userID
                )
            ";

            $stmtSale = $this->conn->prepare($sqlSale);

            $stmtSale->execute([
                ':totalAmount' => $subtotal,
                ':paymentMethod' => $paymentMethod,
                ':userID' => $userID
            ]);

            $saleID = $this->conn->lastInsertId();

            // Tạo Sale Item
            $sqlItem = "
                INSERT INTO sale_items
                (
                    FKSaleID,
                    FKProductID,
                    Quantity,
                    UnitPrice,
                    Subtotal
                )
                VALUES
                (
                    :saleID,
                    :productID,
                    :quantity,
                    :unitPrice,
                    :subtotal
                )
            ";

            $stmtItem = $this->conn->prepare($sqlItem);

            $stmtItem->execute([
                ':saleID' => $saleID,
                ':productID' => $productID,
                ':quantity' => $quantity,
                ':unitPrice' => $unitPrice,
                ':subtotal' => $subtotal
            ]);

            // Trừ tồn kho
            $sqlStock = "
                UPDATE products
                SET Stock = Stock - :quantity
                WHERE ProductID = :productID
            ";

            $stmtStock = $this->conn->prepare($sqlStock);

            $stmtStock->execute([
                ':quantity' => $quantity,
                ':productID' => $productID
            ]);

            $this->conn->commit();

            return [
                'success' => true,
                'data' => [
                    'SaleID' => $saleID,
                    'ProductID' => $productID,
                    'ProductName' => $product['ProductName'],
                    'Quantity' => (int)$quantity,
                    'UnitPrice' => $unitPrice,
                    'Subtotal' => $subtotal,
                    'PaymentMethod' => $paymentMethod,
                    'RemainingStock' =>
                        (int)$product['Stock'] - (int)$quantity
                ]
            ];

        } catch (Throwable $e) {

            if ($this->conn->inTransaction()) {
                $this->conn->rollBack();
            }

            throw $e;
        }
    }
    public function getAllSales()
    {
        $sql = "
            SELECT
                s.SaleID,
                s.SaleDate,
                s.TotalAmount,
                s.PaymentMethod,
                s.Status,
                s.FKUserID,

                si.FKProductID AS ProductID,
                si.Quantity,
                si.UnitPrice,
                si.Subtotal AS ItemSubtotal,

                p.ProductName,
                p.Category

            FROM sales s
            LEFT JOIN sale_items si
                ON si.FKSaleID = s.SaleID
            LEFT JOIN products p
                ON p.ProductID = si.FKProductID

            ORDER BY s.SaleDate DESC
        ";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute();

        return [
            'success' => true,
            'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)
        ];
    }
    public function getTodaySales()
    {
        $sql = "
            SELECT
                SaleID,
                SaleDate,
                TotalAmount,
                PaymentMethod,
                Status,
                FKUserID
            FROM sales
            WHERE DATE(SaleDate) = CURDATE()
            ORDER BY SaleDate DESC
        ";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute();

        return [
            'success' => true,
            'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)
        ];
    }
}