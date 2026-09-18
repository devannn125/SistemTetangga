<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LandingProfile;
use App\Models\LandingArticle;
use App\Models\LandingUmkm;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AdminLandingController extends Controller
{
    // === PROFILE ===
    public function getProfile()
    {
        $profile = LandingProfile::first() ?? new LandingProfile();
        if ($profile->video_path) {
            $profile->video_url = Storage::disk('public')->url($profile->video_path);
        }
        if ($profile->hero_image_path) {
            $profile->hero_image_url = Storage::disk('public')->url($profile->hero_image_path);
        }
        return response()->json($profile);
    }

    public function updateProfile(Request $request)
    {
        $validated = $request->validate([
            'brand_name' => 'nullable|string|max:255',
            'hero_title' => 'nullable|string|max:255',
            'hero_subtitle' => 'nullable|string|max:255',
            'hero_image_file' => 'nullable|image|max:10240', // 10MB
            'visi' => 'nullable|string',
            'misi' => 'nullable|string',
            'sejarah' => 'nullable|string',
            'video_file' => 'nullable|file|mimes:mp4,webm|max:102400', // 100MB
            'kontak_email' => 'nullable|email|max:255',
            'kontak_hp' => 'nullable|string|max:50',
            'kontak_alamat' => 'nullable|string',
        ]);

        $profile = LandingProfile::first();
        if (!$profile) {
            $profile = new LandingProfile();
        }

        if ($request->hasFile('video_file')) {
            if ($profile->video_path) {
                Storage::disk('public')->delete($profile->video_path);
            }
            $validated['video_path'] = $request->file('video_file')->store('landing/videos', 'public');
        }

        if ($request->hasFile('hero_image_file')) {
            if ($profile->hero_image_path) {
                Storage::disk('public')->delete($profile->hero_image_path);
            }
            $validated['hero_image_path'] = $request->file('hero_image_file')->store('landing/images', 'public');
        }

        $profile->fill($validated);
        $profile->save();

        if ($profile->video_path) {
            $profile->video_url = Storage::disk('public')->url($profile->video_path);
        }
        if ($profile->hero_image_path) {
            $profile->hero_image_url = Storage::disk('public')->url($profile->hero_image_path);
        }

        return response()->json($profile);
    }

    // === ARTICLES ===
    public function getArticles()
    {
        $articles = LandingArticle::orderBy('created_at', 'desc')->get()->map(function ($article) {
            if ($article->image_path) {
                $article->image_url = Storage::disk('public')->url($article->image_path);
            }
            return $article;
        });
        return response()->json($articles);
    }

    public function storeArticle(Request $request)
    {
        $validated = $request->validate([
            'judul' => 'required|string|max:255',
            'konten' => 'required|string',
            'image' => 'nullable|image|max:10240',
            'is_published' => 'boolean',
        ]);

        $slug = Str::slug($validated['judul']) . '-' . time();
        $imagePath = null;

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('landing/articles', 'public');
        }

        $article = LandingArticle::create([
            'judul' => $validated['judul'],
            'slug' => $slug,
            'konten' => $validated['konten'],
            'image_path' => $imagePath,
            'is_published' => $request->input('is_published', true),
            'published_at' => $request->input('is_published', true) ? now() : null,
        ]);

        return response()->json($article);
    }

    public function updateArticle(Request $request, $id)
    {
        $article = LandingArticle::findOrFail($id);
        
        $validated = $request->validate([
            'judul' => 'required|string|max:255',
            'konten' => 'required|string',
            'image' => 'nullable|image|max:10240',
            'is_published' => 'boolean',
        ]);

        if ($request->hasFile('image')) {
            if ($article->image_path) {
                Storage::disk('public')->delete($article->image_path);
            }
            $article->image_path = $request->file('image')->store('landing/articles', 'public');
        }

        $article->judul = $validated['judul'];
        $article->konten = $validated['konten'];
        $article->is_published = $request->input('is_published', true);
        if ($article->is_published && !$article->published_at) {
            $article->published_at = now();
        } elseif (!$article->is_published) {
            $article->published_at = null;
        }
        $article->save();

        return response()->json($article);
    }

    public function destroyArticle($id)
    {
        $article = LandingArticle::findOrFail($id);
        if ($article->image_path) {
            Storage::disk('public')->delete($article->image_path);
        }
        $article->delete();
        return response()->noContent();
    }

    // === UMKM ===
    public function getUmkms()
    {
        $umkms = LandingUmkm::orderBy('created_at', 'desc')->get()->map(function ($umkm) {
            if ($umkm->image_path) {
                $umkm->image_url = Storage::disk('public')->url($umkm->image_path);
            }
            return $umkm;
        });
        return response()->json($umkms);
    }

    public function storeUmkm(Request $request)
    {
        $validated = $request->validate([
            'nama_usaha' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'nama_pemilik' => 'nullable|string|max:255',
            'no_hp' => 'nullable|string|max:20',
            'image' => 'nullable|image|max:10240',
            'is_active' => 'boolean',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('landing/umkm', 'public');
        }

        $umkm = LandingUmkm::create([
            'nama_usaha' => $validated['nama_usaha'],
            'deskripsi' => $validated['deskripsi'],
            'nama_pemilik' => $validated['nama_pemilik'],
            'no_hp' => $validated['no_hp'],
            'image_path' => $imagePath,
            'is_active' => $request->input('is_active', true),
        ]);

        return response()->json($umkm);
    }

    public function updateUmkm(Request $request, $id)
    {
        $umkm = LandingUmkm::findOrFail($id);
        
        $validated = $request->validate([
            'nama_usaha' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'nama_pemilik' => 'nullable|string|max:255',
            'no_hp' => 'nullable|string|max:20',
            'image' => 'nullable|image|max:10240',
            'is_active' => 'boolean',
        ]);

        if ($request->hasFile('image')) {
            if ($umkm->image_path) {
                Storage::disk('public')->delete($umkm->image_path);
            }
            $umkm->image_path = $request->file('image')->store('landing/umkm', 'public');
        }

        $umkm->nama_usaha = $validated['nama_usaha'];
        $umkm->deskripsi = $validated['deskripsi'];
        $umkm->nama_pemilik = $validated['nama_pemilik'];
        $umkm->no_hp = $validated['no_hp'];
        $umkm->is_active = $request->input('is_active', true);
        $umkm->save();

        return response()->json($umkm);
    }

    public function destroyUmkm($id)
    {
        $umkm = LandingUmkm::findOrFail($id);
        if ($umkm->image_path) {
            Storage::disk('public')->delete($umkm->image_path);
        }
        $umkm->delete();
        return response()->noContent();
    }
}
