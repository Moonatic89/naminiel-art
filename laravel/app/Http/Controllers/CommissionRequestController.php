<?php

namespace App\Http\Controllers;

use App\Models\CommissionRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CommissionRequestController extends Controller
{
    public function index()
    {
        return Inertia::render('Commission/AdminIndex', [
            'requests' => CommissionRequest::latest()->paginate(20),
        ]);
    }

    public function create()
    {
        return Inertia::render('Commission/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'type' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:5000'],
        ]);

        CommissionRequest::create($validated);

        return back()->with('success', 'Richiesta inviata. Ti rispondero appena possibile.');
    }
}
