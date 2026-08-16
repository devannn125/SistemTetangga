<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\FinanceTransactionRequest;
use App\Http\Resources\FinanceTransactionResource;
use App\Models\FinanceTransaction;

class FinanceTransactionController extends Controller
{
    public function index()
    {
        return FinanceTransactionResource::collection(FinanceTransaction::latest('tanggal')->paginate(15));
    }

    public function store(FinanceTransactionRequest $request)
    {
        return new FinanceTransactionResource(FinanceTransaction::create($request->validated()));
    }

    public function show(FinanceTransaction $financeTransaction)
    {
        return new FinanceTransactionResource($financeTransaction);
    }

    public function update(FinanceTransactionRequest $request, FinanceTransaction $financeTransaction)
    {
        $financeTransaction->update($request->validated());

        return new FinanceTransactionResource($financeTransaction);
    }

    public function destroy(FinanceTransaction $financeTransaction)
    {
        $financeTransaction->delete();

        return response()->noContent();
    }
}
