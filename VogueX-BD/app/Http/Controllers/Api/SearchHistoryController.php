<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SearchHistory;

class SearchHistoryController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $searchHistory = SearchHistory::with('user')->get();
        return response()->json($searchHistory);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'search_term' => 'required|string|max:255',
            'filters' => 'nullable|array',
            'results_count' => 'required|integer|min:0'
        ]);

        $searchHistory = SearchHistory::create($validated);
        return response()->json($searchHistory, 201);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show(SearchHistory $searchHistory)
    {
        return response()->json($searchHistory->load('user'));
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, SearchHistory $searchHistory)
    {
        $validated = $request->validate([
            'filters' => 'array',
            'results_count' => 'integer|min:0'
        ]);

        $searchHistory->update($validated);
        return response()->json($searchHistory);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(SearchHistory $searchHistory)
    {
        $searchHistory->delete();
        return response()->json(null, 204);
    }
}
