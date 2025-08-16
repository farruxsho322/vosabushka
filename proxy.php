<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

$data = $_POST;
error_log("Received POST data: " . print_r($data, true)); // Логирование в error_log
if (empty($data)) {
    echo json_encode(['result' => 'error', 'error' => 'No data received']);
    exit;
}

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://app.frontpad.ru/api/index.php?new_order');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Для тестирования
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
$result = curl_exec($ch);
if (curl_errno($ch)) {
    $error = 'Curl error: ' . curl_error($ch);
    error_log($error);
    echo json_encode(['result' => 'error', 'error' => $error]);
} else {
    echo $result;
}
curl_close($ch);
?>