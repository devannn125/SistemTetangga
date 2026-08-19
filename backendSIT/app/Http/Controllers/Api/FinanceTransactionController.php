<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\FinanceTransactionRequest;
use App\Http\Resources\FinanceTransactionResource;
use App\Models\FinanceTransaction;
use Illuminate\Http\Request;

class FinanceTransactionController extends BaseApiController
{
    public function index(Request $request)
    {
        $this->authorizeModule('KEUANGAN', 'VIEW');

        $query = FinanceTransaction::query()->with('wilayah')->latest('tanggal');

        $this->scopeQuery($query, 'KEUANGAN', 'VIEW');

        if ($request->has('tipe')) {
            $query->where('tipe', $request->query('tipe'));
        }
        if ($request->has('from')) {
            $query->whereDate('tanggal', '>=', $request->query('from'));
        }
        if ($request->has('to')) {
            $query->whereDate('tanggal', '<=', $request->query('to'));
        }

        return FinanceTransactionResource::collection($query->paginate($request->query('per_page', 25)));
    }

    public function store(FinanceTransactionRequest $request)
    {
        $this->authorizeModule('KEUANGAN', 'CREATE');

        $data = $request->validated();
        $data['dicatat_oleh'] = $this->requestUser()->id_users;

        $transaction = FinanceTransaction::create($data);

        $this->audit('KEUANGAN', 'CREATE', 'keuangan_transaksi', $transaction->id_keuangan_transaksi);

        return (new FinanceTransactionResource($transaction->load('wilayah')))->response()->setStatusCode(201);
    }

    public function show(string $id)
    {
        $this->authorizeModule('KEUANGAN', 'VIEW');

        return new FinanceTransactionResource(FinanceTransaction::with('wilayah')->findOrFail($id));
    }

    public function update(FinanceTransactionRequest $request, string $id)
    {
        $this->authorizeModule('KEUANGAN', 'UPDATE');

        $transaction = FinanceTransaction::findOrFail($id);
        $old = $transaction->toArray();
        $transaction->update($request->validated());

        $this->audit('KEUANGAN', 'UPDATE', 'keuangan_transaksi', $transaction->id_keuangan_transaksi, $old, $transaction->toArray());

        return new FinanceTransactionResource($transaction);
    }

    public function destroy(string $id)
    {
        $this->authorizeModule('KEUANGAN', 'DELETE');

        $transaction = FinanceTransaction::findOrFail($id);
        $transaction->delete();

        $this->audit('KEUANGAN', 'DELETE', 'keuangan_transaksi', $transaction->id_keuangan_transaksi);

        return response()->noContent();
    }
}
