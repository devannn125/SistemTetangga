<?php $r = json_decode(file_get_contents("api_res.json"), true); foreach($r["data"] as $m) echo $m["jabatan"]." - ".$m["wilayah"]["nama_wilayah"].PHP_EOL;
