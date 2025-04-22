<?php
// Allow requests from your React app and allow cookies
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

session_start();

if (!isset($_SESSION['views'])) {
  $_SESSION['views'] = 0;
}
$_SESSION['views']++;

echo json_encode([
  "views" => $_SESSION['views'],
  "timestamp" => date("Y-m-d H:i:s")
]);
?>
