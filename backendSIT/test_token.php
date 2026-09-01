<?php
$user = App\Models\User::where("email", "dukuh@sukamaju.test")->first();
echo $user->createToken("test")->plainTextToken;

