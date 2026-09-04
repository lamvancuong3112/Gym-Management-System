<?php

require_once __DIR__ . '/../models/Feedback.php';

class FeedbackController
{
    private $feedback;

    public function __construct($db)
    {
        $this->feedback = new Feedback($db);
    }

    public function getAll()
    {
        return [
            "success" => true,
            "data" => $this->feedback->getAll()
        ];
    }

    public function getByTrainer($trainerID)
    {
        return [
            "success" => true,
            "data" => $this->feedback->getByTrainer($trainerID)
        ];
    }

    public function getById($feedbackID)
    {
        $data = $this->feedback->findById($feedbackID);

        if (!$data) {
            return [
                "success" => false,
                "message" => "Không tìm thấy feedback"
            ];
        }

        return [
            "success" => true,
            "data" => $data
        ];
    }

    public function create($data)
    {
        if (
            empty($data['TrainerID']) ||
            !isset($data['Rating']) ||
            empty(trim($data['Comment'] ?? ''))
        ) {
            return [
                "success" => false,
                "message" => "Thiếu thông tin feedback"
            ];
        }

        $trainerID = (int)$data['TrainerID'];
        $rating = (int)$data['Rating'];
        $comment = trim($data['Comment']);

        if ($rating < 1 || $rating > 5) {
            return [
                "success" => false,
                "message" => "Đánh giá phải từ 1 đến 5 sao"
            ];
        }

        $feedbackID = $this->feedback->create(
            $trainerID,
            $rating,
            $comment,
            $data['FeedbackDate'] ?? null
        );

        if (!$feedbackID) {
            return [
                "success" => false,
                "message" => "Không thể thêm feedback"
            ];
        }

        return [
            "success" => true,
            "message" => "Thêm feedback thành công",
            "data" => $this->feedback->findById($feedbackID)
        ];
    }
}