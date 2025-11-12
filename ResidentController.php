<?php

namespace App\Http\Controllers;

use App\Models\Resident;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ResidentController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->get('search');
        
        $residents = Resident::when($search, function ($query, $search) {
            return $query->where('name', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%")
                    ->orWhere('gender', 'like', "%{$search}%");
        })
        ->orderBy('id', 'asc')
        ->paginate(10); // Changed from get() to paginate(10)

        // Preserve search parameter in pagination links
        if ($request->has('search')) {
            $residents->appends(['search' => $request->search]);
        }

        return Inertia::render('resident/index', [
            'residents' => $residents,
            'filters' => $request->only(['search'])
        ]);
    }

    public function create()
    {
        return Inertia::render('resident/create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'age' => 'required|integer',
            'address' => 'required|string|max:500',
            'gender' => 'required|string|max:10',
            'is_pwd' => 'boolean',
            'pwd_category' => 'nullable|string|max:255',
        ]);

        Resident::create($request->all());

        
        // FIXED: Use dynamic route detection
        return $this->redirectToResidentIndex('Resident created successfully!');
    }

    public function show(Resident $resident)
    {
        $resident->load('medical_histories');

        return Inertia::render('resident/show', [
            'resident' => $resident,
            'medical_histories' => $resident->medical_histories,
        ]);
    }

    public function edit(Resident $resident)
    {
        return Inertia::render('resident/edit', [
            'resident' => $resident,
        ]);
    }

    public function update(Request $request, Resident $resident)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'age' => 'required|integer',
            'address' => 'required|string|max:500',
            'gender' => 'required|string|max:10',
            'is_pwd' => 'boolean',
            'pwd_category' => 'nullable|string|max:255',
        ]);

        $resident->update($request->all());

        // FIXED: Use dynamic route detection
        return $this->redirectToResidentIndex('Resident updated successfully!');
    }

    public function destroy(Resident $resident)
    {
        $resident->delete();

        // FIXED: Use dynamic route detection
        return $this->redirectToResidentIndex('Resident deleted successfully!');
    }


    /**
     * Dynamically redirect to the appropriate resident index route
     * based on the current route prefix
     */
    private function redirectToResidentIndex(string $message)
    {
        $currentRoute = request()->route()->getName();
        
        // Debug: Check what route we're currently on
        // \Log::info('Current route: ' . $currentRoute);
         if (str_contains($currentRoute, 'bhw.')) {
            return redirect()->route('bhw.resident.index')->with('message', $message);
        } elseif (str_contains($currentRoute, 'admin.')) {
            return redirect()->route('admin.resident.index')->with('message', $message);
        } elseif (str_contains($currentRoute, 'medical.')) {
            return redirect()->route('medical.resident.index')->with('message', $message);
        }

        // Fallback - try the basic route or use back() as last resort
        try {
            return redirect()->route('resident.index')->with('message', $message);
        } catch (\Exception $e) {
            // If even the basic route doesn't exist, go back
            return redirect()->back()->with('message', $message);
        }
    }
}