<?php
// Writing to a file
$file = fopen("example.txt", "w");
fwrite($file, "Hello, PHP file handling!");
fclose($file);

// Reading from a file
$file = fopen("example.txt", "r");
$content = fread($file, filesize("example.txt"));
fclose($file);

echo "File content: " . $content;
?>
