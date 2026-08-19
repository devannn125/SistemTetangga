<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\ModuleResource;
use App\Models\Module;
use Illuminate\Http\Request;

class ModuleController extends BaseApiController
{
    public function index(Request $request)
    {
        $this->authorizeModule('MASTER', 'VIEW');

        return ModuleResource::collection(Module::query()->orderBy('urutan')->get());
    }

    public function store(Request $request)
    {
        $this->authorizeModule('MASTER', 'CREATE');

        $data = $request->validate([
            'kode_module' => ['required', 'string', 'max:50', 'unique:module,kode_module'],
            'nama_module' => ['required', 'string', 'max:100'],
            'urutan' => ['nullable', 'integer', 'min:0'],
        ]);

        $module = Module::create($data);

        $this->audit('MASTER', 'CREATE', 'module', $module->id_module);

        return (new ModuleResource($module))->response()->setStatusCode(201);
    }

    public function show(string $id)
    {
        $this->authorizeModule('MASTER', 'VIEW');

        return new ModuleResource(Module::findOrFail($id));
    }

    public function update(Request $request, string $id)
    {
        $this->authorizeModule('MASTER', 'UPDATE');

        $module = Module::findOrFail($id);
        $old = $module->toArray();

        $data = $request->validate([
            'kode_module' => ['required', 'string', 'max:50', 'unique:module,kode_module,'.$id.',id_module'],
            'nama_module' => ['required', 'string', 'max:100'],
            'urutan' => ['nullable', 'integer', 'min:0'],
        ]);

        $module->update($data);

        $this->audit('MASTER', 'UPDATE', 'module', $module->id_module, $old, $module->toArray());

        return new ModuleResource($module);
    }

    public function destroy(string $id)
    {
        $this->authorizeModule('MASTER', 'DELETE');

        $module = Module::findOrFail($id);
        $module->delete();

        $this->audit('MASTER', 'DELETE', 'module', $module->id_module);

        return response()->noContent();
    }
}
