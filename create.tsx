import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { type Resident } from '@/types';
import { Button } from "@/components/ui/button";
import { route } from 'ziggy-js';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CircleAlert, Calendar, Phone, User, MapPin } from 'lucide-react';
import { useEffect } from 'react';

export default function ResidentCreate({ residents }: { residents: Resident[] }) {
    // Get user type to determine correct routes
    const { props } = usePage();
    const { auth } = props as any;
    const userType = auth?.user?.user_type?.toLowerCase() || 'admin';
    
    const getRoute = (name: string, params?: any) => {
        const prefix = userType === 'admin' ? 'admin' : 'bhw';
        return route(`${prefix}.resident.${name}`, params);
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: userType === 'admin' ? 'Admin Dashboard' : 'BHW Dashboard',
            href: userType === 'admin' ? '/admin/dashboard' : '/bhw/dashboard',
        },
        {
            title: 'Residents',
            href: getRoute('index'),
        },
        {
            title: 'New Record',
            href: getRoute('create'),
        },
    ];

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        age: '',
        gender: '',
        address: '',
        is_pwd: false,
        pwd_category: '',
        date_of_birth: '',
        contact_number: '',
    });

    // Auto-calculate age from date of birth
    useEffect(() => {
        if (data.date_of_birth) {
            const today = new Date();
            const birthDate = new Date(data.date_of_birth);
            let calculatedAge = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                calculatedAge--;
            }
            
            setData('age', calculatedAge.toString());
        }
    }, [data.date_of_birth]);

    const handlesubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(getRoute('store'));
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add New Resident" />
            <div className="py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Form Container */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        {/* Form Header */}
                        <div className="bg-blue-50 px-6 py-4">
                            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                                <User className="w-5 h-5" />
                                New Resident Record
                            </h2>
                        </div>

                        <form onSubmit={handlesubmit} className="p-6 space-y-8">
                            {/* Error Alert */}
                            {Object.keys(errors).length > 0 && (
                                <Alert className="border-red-200 bg-red-50 text-red-800 shadow-sm">
                                    <CircleAlert className="h-4 w-4" />
                                    <AlertTitle className="text-red-800">Validation Errors</AlertTitle>
                                    <AlertDescription>
                                        <ul className="list-disc list-inside space-y-1">
                                            {Object.entries(errors).map(([key, message]) => (
                                                <li key={key} className="text-sm">{message as string}</li>
                                            ))}
                                        </ul>
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Personal Information Section */}
                            <div className="space-y-6">
                                <div className="border-b border-gray-200 pb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        Personal Information
                                    </h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Name */}
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                            Full Name
                                        </Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            placeholder="Enter full name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="w-full transition-all duration-200 border-gray-300 focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400"
                                        />
                                    </div>

                                    {/* Gender */}
                                    <div className="space-y-2">
                                        <Label htmlFor="gender" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                            Gender
                                        </Label>
                                        <select
                                            id="gender"
                                            name="gender"
                                            value={data.gender}
                                            onChange={(e) => setData('gender', e.target.value)}
                                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 hover:border-gray-400"
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Date of Birth */}
                                    <div className="space-y-2">
                                        <Label htmlFor="date_of_birth" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            Date of Birth
                                        </Label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <Input
                                                type="date"
                                                id="date_of_birth"
                                                name="date_of_birth"
                                                value={data.date_of_birth}
                                                onChange={(e) => setData('date_of_birth', e.target.value)}
                                                className="pl-10 w-full transition-all duration-200 border-gray-300 focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400"
                                                max={new Date().toISOString().split('T')[0]}
                                            />
                                        </div>
                                        {data.date_of_birth && (
                                            <p className="text-xs text-green-600 font-medium">
                                                Age automatically calculated: {data.age} years old
                                            </p>
                                        )}
                                    </div>

                                    {/* Age */}
                                    <div className="space-y-2">
                                        <Label htmlFor="age" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                            Age
                                        </Label>
                                        <Input
                                            type="number"
                                            id="age"
                                            name="age"
                                            placeholder="Age"
                                            min="0"
                                            max="150"
                                            value={data.age}
                                            onChange={(e) => setData('age', e.target.value)}
                                            className="w-full transition-all duration-200 border-gray-300 focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400"
                                        />
                                    </div>

                                    {/* Contact Number */}
                                    <div className="space-y-2">
                                        <Label htmlFor="contact_number" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                            <Phone className="w-4 h-4" />
                                            Contact Number
                                        </Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <Input
                                                id="contact_number"
                                                name="contact_number"
                                                placeholder="+63 912 345 6789"
                                                value={data.contact_number}
                                                onChange={(e) => setData('contact_number', e.target.value)}
                                                className="pl-10 w-full transition-all duration-200 border-gray-300 focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Address */}
                                <div className="space-y-2">
                                    <Label htmlFor="address" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        Address
                                    </Label>
                                    <Textarea
                                        id="address"
                                        name="address"
                                        placeholder="Enter complete address"
                                        rows={3}
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        className="w-full transition-all duration-200 border-gray-300 focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400 resize-none"
                                    />
                                </div>
                            </div>

                            {/* PWD Section */}
                            <div className="space-y-6 bg-blue-50 rounded-xl p-6 border border-blue-100">
                                <div className="border-b border-blue-200 pb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        Disability Information
                                    </h3>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors duration-200">
                                        <input
                                            type="checkbox"
                                            id="is_pwd"
                                            name="is_pwd"
                                            checked={data.is_pwd}
                                            onChange={(e) => setData('is_pwd', e.target.checked)}
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                                        />
                                        <label htmlFor="is_pwd" className="text-sm font-medium text-gray-700 cursor-pointer">
                                            This resident is a Person with Disability (PWD)
                                        </label>
                                    </div>

                                    {data.is_pwd && (
                                        <div className="space-y-2 animate-in fade-in duration-300">
                                            <Label htmlFor="pwd_category" className="text-sm font-medium text-gray-700">
                                                PWD Category 
                                            </Label>
                                            <select
                                                id="pwd_category"
                                                name="pwd_category"
                                                value={data.pwd_category}
                                                onChange={(e) => setData('pwd_category', e.target.value)}
                                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 hover:border-gray-400"
                                            >
                                                <option value="">Select Disability Category</option>
                                                <option value="visual impairment">Visual Impairment</option>
                                                <option value="hearing impairment">Hearing Impairment</option>
                                                <option value="mobility disability">Mobility Disability</option>
                                                <option value="intellectual disability">Intellectual Disability</option>
                                                <option value="mental disability">Mental Disability</option>
                                                <option value="multiple disabilities">Multiple Disabilities</option>
                                            </select>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Please select the appropriate disability category for this resident.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Submit Section */}
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-200">
                                <div className="text-sm text-gray-500">
                                    All fields are required unless otherwise noted.
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => window.history.back()}
                                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        disabled={processing}
                                        type="submit"
                                        className="bg-blue-700 hover:bg-blue-800  text-white shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-2.5 font-medium"
                                    >
                                        {processing ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Creating Resident...
                                            </div>
                                        ) : (
                                            'Create Resident Record'
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}