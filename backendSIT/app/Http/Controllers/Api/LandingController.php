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
        if ($profile) {
            $profile->video_url = ($profile->video_path && Storage::disk('public')->exists($profile->video_path))
                ? Storage::disk('public')->url($profile->video_path)
                : null;

            $profile->hero_image_url = ($profile->hero_image_path && Storage::disk('public')->exists($profile->hero_image_path))
                ? Storage::disk('public')->url($profile->hero_image_path)
                : null;
        }
        
        $articles = LandingArticle::where('is_published', true)
            ->orderBy('published_at', 'desc')
            ->take(3)
            ->get()
            ->map(function ($article) {
                $article->image_url = ($article->image_path && Storage::disk('public')->exists($article->image_path))
                    ? Storage::disk('public')->url($article->image_path)
                    : null;
                return $article;
            });

        $umkms = LandingUmkm::where('is_active', true)
            ->inRandomOrder()
            ->take(6)
            ->get()
            ->map(function ($umkm) {
                $umkm->image_url = ($umkm->image_path && Storage::disk('public')->exists($umkm->image_path))
                    ? Storage::disk('public')->url($umkm->image_path)
                    : null;
                return $umkm;
            });

        return response()->json([
            'profile' => $profile,
            'articles' => $articles,
            'umkms' => $umkms,
        ]);
    }
}
