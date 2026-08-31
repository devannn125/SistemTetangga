<?php
$ch = curl_init('http://localhost:8000/api/siskamling-schedules');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer 277|HvtDmGdUq2TDExWrbmnCDvKsJyS8Y6IlMbnC1IE1080e151b',
    'Accept: application/json',
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'id_wilayah' => 'WIL-001',
    'id_petugas_citizen' => 'CIT-001',
    'shift' => 'MALAM',
    'tanggal_jadwal' => '2026-08-31'
]));
echo curl_exec($ch);
