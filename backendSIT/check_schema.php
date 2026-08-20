<?php

echo "=== users table columns ===\n";
$cols = \Illuminate\Support\Facades\Schema::getColumnListing('users');
print_r($cols);

echo "\n=== wilayah table columns ===\n";
$cols = \Illuminate\Support\Facades\Schema::getColumnListing('wilayah');
print_r($cols);

echo "\n=== users PK type ===\n";
echo \Illuminate\Support\Facades\Schema::getColumnType('users', 'id_users').PHP_EOL;

echo "\n=== wilayah PK type ===\n";
echo \Illuminate\Support\Facades\Schema::getColumnType('wilayah', 'id_wilayah').PHP_EOL;