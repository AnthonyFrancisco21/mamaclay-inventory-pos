<?php
session_start();

if (!isset($_SESSION['admin_id'])) {
    http_response_code(403); 
    echo json_encode(["error" => "You don't have permission to access this."]);
    exit();
}

include("database.php");

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$pageSize = 15;
$offset = ($page - 1) * $pageSize;

$sql = "
    SELECT msg_id,
           client_name,
           client_email, 
           subject, 
           message, 
           message_date, 
           is_read 
    FROM message_tbl
    WHERE isDeleted = 0
    ORDER BY msg_id DESC
    LIMIT ? OFFSET ?
";

$stmt = $conn->prepare($sql);

if (!$stmt) {
    echo json_encode(["error" => $conn->error]);
    exit();
}

$stmt->bind_param("ii", $pageSize, $offset);
$stmt->execute();
$result = $stmt->get_result();

$messages = [];
while ($row = $result->fetch_assoc()) {
    $date = new DateTime($row['message_date']);
    $now = new DateTime();

    if ($date->format('Y-m-d') === $now->format('Y-m-d')) {
        $row['message_date'] = $date->format('g:i A'); // Today → time only
    } else {
        $row['message_date'] = $date->format('M j');   // Otherwise → Sep 21
    }

    $messages[] = $row;
}

// Get total count (for pagination info)
$countSql = "SELECT COUNT(*) AS total FROM message_tbl WHERE isDeleted = 0";
$countResult = $conn->query($countSql);
$total = $countResult->fetch_assoc()["total"];

echo json_encode([
    "messages" => $messages,
    "total" => $total,
    "page" => $page,
    "pageSize" => $pageSize
]);

$stmt->close();
$conn->close();
?>
