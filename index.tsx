import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { type Resident } from '@/types';
import { Link } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { route } from 'ziggy-js';
import {
    Megaphone,
    Trash2,
    UserPlus,
    Eye,
    Pencil,
    Search,
    ChevronLeft,
    ChevronRight,
    ChevronFirst,
    ChevronLast,
    Users,
    Filter,
    Download,
    SlidersHorizontal
} from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

// Add Pagination props interface
interface PaginationProps {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface Props {
    residents: {
        data: Resident[];
        links: PaginationProps['links'];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    filters?: {
        search?: string;
    };
}

export default function ResidentIndex({ residents, filters = {} }: Props) {
    const { flash, auth } = usePage<SharedData>().props;
    const { processing, delete: destroy } = useForm();

    const userType = auth.user.user_type.toLowerCase();

    // Auto-detect route prefix from current user
    const getRoute = (name: string, params?: any) => {
        const prefixMap: Record<string, string> = {
            'admin': 'admin',
            'medical_staff': 'medical',
            'field_worker': 'bhw',
            'bhw': 'bhw', // alias
            'patient': 'patient'
        };

        const prefix = prefixMap[userType] || 'bhw'; // Fallback to bhw
        return route(`${prefix}.resident.${name}`, params);
    };

    // Helper functions (add these above breadcrumbs)
    const getDashboardTitle = (): string => {
        const map: Record<string, string> = {
            'admin': 'Admin Dashboard',
            'medical_staff': 'Medical Staff',
            'field_worker': 'BHW Dashboard',
            'bhw': 'BHW Dashboard',
            'patient': 'Patient Dashboard',
        };
        return map[userType] || 'Dashboard'; // Safe fallback
    };

    const getDashboardRoute = (): string => {
        const map: Record<string, string> = {
            'admin': '/admin/dashboard',
            'medical_staff': '/medical/dashboard',
            'field_worker': '/bhw/dashboard',
            'bhw': '/bhw/dashboard',
            'patient': '/patient/dashboard',
        };
        return map[userType] || '/dashboard'; // Safe fallback
    };

    const getPageTitle = (): string => {
        const map: Record<string, string> = {
            'admin': 'Residents Management',
            'medical_staff': 'Resident Records',
            'field_worker': 'Residents Management',
            'bhw': 'Residents Management',
            'patient': 'My Health Records',
        };
        return map[userType] || 'Residents'; // Safe fallback
    };

    // Search form state
    const [search, setSearch] = useState(filters?.search || '');
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Are you sure you want to delete resident: ${name}? This action cannot be undone.`)) {
            destroy(getRoute('destroy', id));
        }
    }

    // Handle search submission
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(getRoute('index'), { search, per_page: itemsPerPage }, {
            preserveState: true,
            replace: true
        });
    }

    // Clear search
    const clearSearch = () => {
        setSearch('');
        router.get(getRoute('index'), { per_page: itemsPerPage }, {
            preserveState: true,
            replace: true
        });
    }

    // Handle pagination
    const handlePagination = (url: string | null) => {
        if (url) {
            router.get(url, { per_page: itemsPerPage }, {
                preserveState: true,
                replace: true
            });
        }
    }

    // Handle items per page change
    const handleItemsPerPageChange = (value: string) => {
        const newPerPage = parseInt(value);
        setItemsPerPage(newPerPage);
        router.get(getRoute('index'), { search, per_page: newPerPage }, {
            preserveState: true,
            replace: true
        });
    }

    // Dynamic breadcrumbs
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: getDashboardTitle(),
            href: getDashboardRoute(),
        },
        {
            title: getPageTitle(),
            href: getRoute('index'),
        },
    ];


    // Enhanced Pagination component
    const Pagination = () => {
        const { links, current_page, last_page, from, to, total } = residents;

        // Get visible page numbers (current page, 2 before, 2 after, first, last)
        const getVisiblePages = () => {
            const pages = [];
            const showPages = 5; // Number of page buttons to show

            let startPage = Math.max(1, current_page - Math.floor(showPages / 2));
            let endPage = Math.min(last_page, startPage + showPages - 1);

            // Adjust if we're at the beginning
            if (endPage - startPage + 1 < showPages) {
                startPage = Math.max(1, endPage - showPages + 1);
            }

            // Always show first page
            if (startPage > 1) {
                pages.push(1);
                if (startPage > 2) pages.push('...');
            }

            // Add page numbers
            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }

            // Always show last page
            if (endPage < last_page) {
                if (endPage < last_page - 1) pages.push('...');
                pages.push(last_page);
            }

            return pages;
        };

        const visiblePages = getVisiblePages();

        return (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-gradient-to-r from-gray-50 to-blue-50/30 border-t">
                {/* Results Info */}
                <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                        <span className="font-medium">Results:</span>
                        <span className="text-blue-600 font-semibold">{from}-{to}</span>
                        <span>of</span>
                        <span className="text-blue-600 font-semibold">{total}</span>
                    </div>

                    {/* Items per page selector */}
                    <div className="flex items-center gap-2">
                        <span className="text-gray-500">Show:</span>
                        <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                            <SelectTrigger className="w-20 h-8 text-sm">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                                <SelectItem value="100">100</SelectItem>
                            </SelectContent>
                        </Select>
                        <span className="text-gray-500">per page</span>
                    </div>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center gap-1">
                    {/* First Page */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePagination(links[0].url)}
                        disabled={current_page === 1}
                        className="h-9 w-9 p-0 border-gray-300 hover:bg-blue-50 hover:border-blue-200 transition-all"
                        title="First page"
                    >
                        <ChevronFirst className="w-4 h-4" />
                    </Button>

                    {/* Previous Page */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePagination(links[0].url)}
                        disabled={current_page === 1}
                        className="h-9 px-3 border-gray-300 hover:bg-blue-50 hover:border-blue-200 transition-all"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        <span className="hidden sm:inline">Prev</span>
                    </Button>

                    {/* Page Numbers */}
                    <div className="flex items-center mx-2">
                        {visiblePages.map((page, index) => (
                            page === '...' ? (
                                <span key={index} className="px-2 py-1 text-gray-400">...</span>
                            ) : (
                                <Button
                                    key={index}
                                    variant={page === current_page ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => {
                                        const pageLink = links.find(link =>
                                            link.label === page.toString() && link.url
                                        );
                                        if (pageLink) handlePagination(pageLink.url);
                                    }}
                                    className={`h-9 min-w-9 font-medium mx-0.5 transition-all ${page === current_page
                                        ? 'bg-blue-600 text-white shadow-sm border-blue-600'
                                        : 'border-gray-300 hover:bg-blue-50 hover:border-blue-200 text-gray-700'
                                        }`}
                                >
                                    {page}
                                </Button>
                            )
                        ))}
                    </div>

                    {/* Next Page */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePagination(links[links.length - 1].url)}
                        disabled={current_page === last_page}
                        className="h-9 px-3 border-gray-300 hover:bg-blue-50 hover:border-blue-200 transition-all"
                    >
                        <span className="hidden sm:inline">Next</span>
                        <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>

                    {/* Last Page */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            const lastPageLink = links[links.length - 1];
                            // Find the actual last page URL (not the "next" button)
                            const actualLastPageLink = links.find(link =>
                                link.label === last_page.toString() && link.url
                            );
                            handlePagination(actualLastPageLink?.url || lastPageLink.url);
                        }}
                        disabled={current_page === last_page}
                        className="h-9 w-9 p-0 border-gray-300 hover:bg-blue-50 hover:border-blue-200 transition-all"
                        title="Last page"
                    >
                        <ChevronLast className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Resident Management" />

            <div className="space-y-6 p-6">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                                    Residents Management
                                </h1>
                                <p className="text-gray-600">
                                    Manage and view all resident records in the system
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href={getRoute('create')}>
                            <Button className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 shadow-sm transition-colors">
                                <UserPlus className="w-4 h-4" />
                                Add Resident
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Flash Message */}
                {flash.message && (
                    <Alert className="w-64 border-green-200 bg-green-50/80 backdrop-blur-sm">
                        <Megaphone className="h-4 w-4 text-green-600" />
                        <AlertTitle className="text-green-800 font-medium">Success!</AlertTitle>
                        <AlertDescription className="text-green-700">
                            {flash.message}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Search and Controls Card */}
                <Card className=" shadow-sm border-gray-200/80 bg-gray-100 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
                            {/* Search Input */}
                            <div className="flex-1 w-full">
                                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                                    Search Residents
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        id="search"
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search by name or address..."
                                        className="w-full pl-10 pr-10 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                    {search && (
                                        <button
                                            type="button"
                                            onClick={clearSearch}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                            aria-label="Clear search"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 w-full lg:w-auto">
                                <Button
                                    type="submit"
                                    onClick={handleSearch}
                                    className="bg-blue-600 hover:bg-blue-700 px-6 shadow-sm flex-1 lg:flex-none py-3"
                                >
                                    <Search className="w-4 h-4 mr-2" />
                                    Search
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Residents Table Card */}
                <Card className="shadow-sm border-gray-200/80 overflow-hidden backdrop-blur-sm">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50/30 border-b">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <CardTitle className="text-xl text-gray-900">Residents List</CardTitle>
                                <CardDescription>
                                    {residents.data.length > 0
                                        ? `Showing ${residents.data.length} of ${residents.total} residents`
                                        : 'No resident records found'
                                    }
                                </CardDescription>
                            </div>
                            {residents.data.length > 0 && (
                                <Badge variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-blue-200">
                                    Page {residents.current_page} of {residents.last_page}
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-gray-50/50">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="w-20 font-semibold text-gray-700 py-4">ID</TableHead>
                                        <TableHead className="font-semibold text-gray-700 py-4">Name</TableHead>
                                        <TableHead className="font-semibold text-gray-700 py-4">Age</TableHead>
                                        <TableHead className="font-semibold text-gray-700 py-4">Gender</TableHead>
                                        <TableHead className="font-semibold text-gray-700 py-4">Date of Birth</TableHead>
                                        <TableHead className="font-semibold text-gray-700 py-4">Contact No.</TableHead>
                                        <TableHead className="font-semibold text-gray-700 py-4">Address</TableHead>
                                        <TableHead className="text-center font-semibold text-gray-700 py-4 w-40">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {residents.data.length > 0 ? (
                                        residents.data.map((resident) => {
                                            const normalizedGender = resident.gender?.toLowerCase();
                                            const isMale = normalizedGender === 'male';
                                            const isFemale = normalizedGender === 'female';

                                            return (
                                                <TableRow
                                                    key={resident.id}
                                                    className="group hover:bg-blue-50/30 transition-colors border-b border-gray-100"
                                                >
                                                    <TableCell className="font-medium text-gray-600 py-4">
                                                        <div className="flex items-center gap-2">
                                                            {resident.id}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-4">
                                                        <div className="flex flex-col space-y-2">
                                                            <span className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                                {resident.name}
                                                            </span>
                                                            {Boolean(resident.is_pwd) && (
                                                                <div className="flex items-center gap-2">
                                                                    <Badge
                                                                        variant="destructive"
                                                                        className="bg-red-100 text-red-800 hover:bg-red-200 border-red-200 text-xs"
                                                                    >
                                                                        PWD
                                                                    </Badge>
                                                                    {resident.pwd_category && (
                                                                        <span className="text-xs text-gray-500 capitalize">
                                                                            {resident.pwd_category}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-4">
                                                        <Badge variant="secondary">
                                                            {resident.age}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="py-4">
                                                        <Badge
                                                            variant="secondary"
                                                            className={`capitalize ${isMale
                                                                ? 'bg-gray-50 text-blue-800'
                                                                : isFemale
                                                                    ? 'bg-gray-50 text-pink-800'
                                                                    : 'bg-gray-50 text-gray-800'
                                                                }`}
                                                        >
                                                            {resident.gender || 'Unknown'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="py-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium text-gray-900">
                                                                {resident.date_of_birth
                                                                    ? new Date(resident.date_of_birth).toLocaleDateString('en-US', {
                                                                        year: 'numeric',
                                                                        month: 'short',
                                                                        day: 'numeric'
                                                                    })
                                                                    : <span className="text-sm text-gray-400 italic">N/A</span>
                                                                }
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-4">
                                                        <div className="flex items-center gap-2">
                                                            {resident.contact_number ? (
                                                                <>
                                                                    <span className="text-sm text-gray-900 font-medium">
                                                                        {resident.contact_number}
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                <span className="text-sm text-gray-400 italic">N/A</span>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-4 max-w-[200px]">
                                                        <p
                                                            className="text-sm text-gray-600 truncate"
                                                            title={resident.address || undefined}
                                                        >
                                                            {resident.address}
                                                        </p>
                                                    </TableCell>
                                                    <TableCell className="py-4">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <Link href={getRoute('show', resident.id)}>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-8 w-8 p-0 text-blue-800 hover:bg-blue-100 hover:text-blue-700 transition-colors rounded-lg"
                                                                    title="View resident details"
                                                                >
                                                                    <Eye className="w-4 h-4" />
                                                                </Button>
                                                            </Link>
                                                            <Link href={getRoute('edit', resident.id)}>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-8 w-8 p-0 text-green-800 hover:bg-green-100 hover:text-green-700 transition-colors rounded-lg"
                                                                    title="Edit resident information"
                                                                >
                                                                    <Pencil className="w-4 h-4" />
                                                                </Button>
                                                            </Link>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                disabled={processing}
                                                                onClick={() => handleDelete(resident.id, resident.name)}
                                                                className="h-8 w-8 p-0 text-red-800 hover:bg-red-100 hover:text-red-700 transition-colors rounded-lg"
                                                                title="Delete resident record"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-12">
                                                <div className="flex flex-col items-center gap-3 text-gray-500">
                                                    <Users className="w-16 h-16 text-gray-300" />
                                                    <div className="text-lg font-medium">
                                                        {filters?.search
                                                            ? 'No matching residents found'
                                                            : 'No residents found'
                                                        }
                                                    </div>
                                                    <p className="text-sm max-w-md text-center text-gray-400">
                                                        {filters?.search
                                                            ? 'Try adjusting your search terms or clear the search to see all residents.'
                                                            : 'Get started by adding your first resident record.'
                                                        }
                                                    </p>
                                                    {!filters?.search && (
                                                        <Link href={getRoute('create')}>
                                                            <Button className="mt-2 bg-green-600 hover:bg-green-700">
                                                                <UserPlus className="w-4 h-4 mr-2" />
                                                                Add First Resident
                                                            </Button>
                                                        </Link>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Enhanced Pagination */}
                        {residents.data.length > 0 && <Pagination />}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}