<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\InventoryPurchaseRequest;
use App\Http\Resources\InventoryPurchaseResource;
use App\Models\InventoryPurchase;
use App\Services\RbacService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class InventoryPurchaseController extends BaseApiController
{
    public function index(Request $request)
    {
        $this->authorizeModule('INVENTARIS', 'VIEW');

        $query = InventoryPurchase::query()->with(['diajukanOleh', 'disetujuiOleh', 'wilayah'])->latest();

        $scope = $this->rbac->scopeFor($this->requestUser(), 'INVENTARIS', 'VIEW');

        if ($scope === RbacService::SCOPE_OWN) {
            $query->where('diajukan_oleh', $this->requestUser()->id_users);
        } else {
            $scopeIds = $this->rbac->wilayahScopeIds($this->requestUser(), 'INVENTARIS', 'VIEW');
            if ($scopeIds !== null) {
                $query->whereIn('id_wilayah', $scopeIds);
            }
        }

        // Bendahara only sees approved purchases
        if ($this->rbac->hasAnyRole($this->requestUser(), ['BENDAHARA']) && ! $this->rbac->hasAnyRole($this->requestUser(), ['RT'])) {
            $query->where('status', 'DISETUJUI');
        }

        if ($request->has('status')) {
            $query->where('status', $request->query('status'));
        }

        return InventoryPurchaseResource::collection($query->paginate($request->query('per_page', 25)));
    }

    public function store(InventoryPurchaseRequest $request)
    {
        $this->authorizeModule('INVENTARIS', 'CREATE');

        $user = $this->requestUser();

        $data = $request->validated();
        $data['status'] = 'DIAJUKAN';
        $data['diajukan_oleh'] = $user->id_users;
        $data['id_wilayah'] = $user->citizen?->id_wilayah ?? $this->rbac->anchorWilayahId($user);

        $purchase = InventoryPurchase::create($data);

        $this->audit('INVENTARIS', 'CREATE', 'inventory_purchase', $purchase->id_inventory_purchase);

        return (new InventoryPurchaseResource($purchase->load(['diajukanOleh', 'disetujuiOleh', 'wilayah'])))->response()->setStatusCode(201);
    }

    public function show(string $id)
    {
        $this->authorizeModule('INVENTARIS', 'VIEW');

        return new InventoryPurchaseResource(InventoryPurchase::with(['diajukanOleh', 'disetujuiOleh', 'wilayah'])->findOrFail($id));
    }

    public function update(InventoryPurchaseRequest $request, string $id)
    {
        $data = $request->validated();

        $isStatusTransition = array_key_exists('status', $data);
        $transition = strtoupper((string) ($data['status'] ?? ''));

        if ($isStatusTransition && in_array($transition, ['DISETUJUI', 'DITOLAK'], true)) {
            $this->authorizeModule('INVENTARIS', 'APPROVE');
            $this->assertInScope($id, 'APPROVE');
        } else {
            $this->authorizeModule('INVENTARIS', 'UPDATE');
        }

        $purchase = InventoryPurchase::findOrFail($id);
        $old = $purchase->toArray();

        if ($transition === 'DISETUJUI') {
            $data['disetujui_oleh'] = $this->requestUser()->id_users;
            $data['disetujui_at'] = now();
        } elseif ($transition === 'DITOLAK') {
            $data['disetujui_oleh'] = $this->requestUser()->id_users;
            $data['disetujui_at'] = now();
        }

        $purchase->update($data);

        $this->audit('INVENTARIS', 'UPDATE', 'inventory_purchase', $purchase->id_inventory_purchase, $old, $purchase->toArray());

        return new InventoryPurchaseResource($purchase->load(['diajukanOleh', 'disetujuiOleh', 'wilayah']));
    }

    public function destroy(string $id)
    {
        $this->authorizeModule('INVENTARIS', 'DELETE');

        $purchase = InventoryPurchase::findOrFail($id);
        $purchase->delete();

        $this->audit('INVENTARIS', 'DELETE', 'inventory_purchase', $id);

        return response()->noContent();
    }

    private function assertInScope(string $id, string $action): void
    {
        $purchase = InventoryPurchase::findOrFail($id);

        $scopeIds = $this->rbac->wilayahScopeIds($this->requestUser(), 'INVENTARIS', $action);
        if ($scopeIds !== null && ! in_array($purchase->id_wilayah, $scopeIds, true)) {
            abort(403, 'Pengajuan pembelian di luar lingkup wilayah Anda.');
        }
    }
}