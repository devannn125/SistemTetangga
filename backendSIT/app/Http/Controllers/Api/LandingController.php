<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LandingProfile;
use App\Models\LandingArticle;
use App\Models\LandingUmkm;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class LandingController extends Controller
{
    public function index()
    {
        $profile = LandingProfile::first();
        if ($profile && $profile->video_path) {
            $profile->video_url = Storage::disk('public')->url($profile->video_path);
        }
        if ($profile && $profile->hero_image_path) {
            $profile->hero_image_url = Storage::disk('public')->url($profile->hero_image_path);
        }
        
        $articles = LandingArticle::where('is_published', true)
            ->orderBy('published_at', 'desc')
            ->take(3)
            ->get()
            ->map(function ($article) {
                if ($article->image_path) {
                    $article->image_url = Storage::disk('public')->url($article->image_path);
                }
                return $article;
            });

        $umkms = LandingUmkm::where('is_active', true)
            ->inRandomOrder()
            ->take(6)
            ->get()
            ->map(function ($umkm) {
                if ($umkm->image_path) {
                    $umkm->image_url = Storage::disk('public')->url($umkm->image_path);
                }
                return $umkm;
            });

        return response()->json([
            'profile' => $profile,
            'articles' => $articles,
            'umkms' => $umkms,
        ]);
    }
}
