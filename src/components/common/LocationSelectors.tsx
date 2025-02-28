// File: components/common/LocationSelectors.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiMapPin, FiLoader } from 'react-icons/fi';

// Types for the location data
interface Ward {
    code: number;
    codename: string;
    district_code: number;
    division_type: string;
    name: string;
}

interface District {
    code: number;
    codename: string;
    division_type: string;
    name: string;
    province_code: number;
    wards: Ward[];
}

interface Province {
    code: number;
    codename: string;
    division_type: string;
    name: string;
    phone_code: number;
    districts: District[];
}

interface LocationSelectorsProps {
    selectedCity: string;
    selectedDistrict: string;
    selectedWard: string;
    onCityChange: (city: string) => void;
    onDistrictChange: (district: string) => void;
    onWardChange: (ward: string) => void;
    error?: {
        city?: string;
        district?: string;
        ward?: string;
    };
}

const LocationSelectors: React.FC<LocationSelectorsProps> = ({
                                                                 selectedCity,
                                                                 selectedDistrict,
                                                                 selectedWard,
                                                                 onCityChange,
                                                                 onDistrictChange,
                                                                 onWardChange,
                                                                 error = {}
                                                             }) => {
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error1, setError] = useState<string | null>(null);

    // Fetch provinces on component mount
    useEffect(() => {
        const fetchProvinces = async () => {
            setLoading(true);
            try {
                const response = await axios.get('https://provinces.open-api.vn/api/?depth=3');
                setProvinces(response.data);
                setError(null);
            } catch (err) {
                console.error('Error fetching provinces:', err);
                setError('Không thể tải dữ liệu tỉnh/thành phố');
            } finally {
                setLoading(false);
            }
        };

        fetchProvinces();
    }, []);

    // Update districts when province changes
    useEffect(() => {
        if (selectedCity && provinces.length > 0) {
            const selectedProvince = provinces.find(p => p.name === selectedCity);
            if (selectedProvince) {
                setDistricts(selectedProvince.districts);
                if (selectedDistrict) {
                    const districtExists = selectedProvince.districts.some(d => d.name === selectedDistrict);
                    if (!districtExists) {
                        onDistrictChange('');
                        onWardChange('');
                    }
                }
            } else {
                setDistricts([]);
                onDistrictChange('');
                onWardChange('');
            }
        } else {
            setDistricts([]);
            onDistrictChange('');
            onWardChange('');
        }
    }, [selectedCity, provinces, onDistrictChange, onWardChange, selectedDistrict]);

    // Update wards when district changes
    useEffect(() => {
        if (selectedCity && selectedDistrict && districts.length > 0) {
            const selectedDistrictObj = districts.find(d => d.name === selectedDistrict);
            if (selectedDistrictObj) {
                setWards(selectedDistrictObj.wards);
                if (selectedWard) {
                    const wardExists = selectedDistrictObj.wards.some(w => w.name === selectedWard);
                    if (!wardExists) {
                        onWardChange('');
                    }
                }
            } else {
                setWards([]);
                onWardChange('');
            }
        } else {
            setWards([]);
            onWardChange('');
        }
    }, [selectedDistrict, districts, onWardChange, selectedCity, selectedWard]);

    // Handle changes
    const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onCityChange(e.target.value);
    };

    const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onDistrictChange(e.target.value);
    };

    const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onWardChange(e.target.value);
    };

    if (error1) {
        return (
            <div className="rounded-lg p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 w-full max-w-full">
                <p>{error1}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-row space-x-4 w-full max-w-full">
            {/* Province Selector */}
            <div className="flex-1 w-full">
                <label htmlFor="province" className="flex items-center text-sm font-medium text-textDark dark:text-textLight mb-1">
                    Tỉnh/Thành phố <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative w-full">
                    <select
                        id="province"
                        value={selectedCity}
                        onChange={handleProvinceChange}
                        disabled={loading}
                        className={`w-full p-2 pr-8 border ${error.city ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800 dark:text-textLight appearance-none text-sm`}
                    >
                        <option value="">Chọn Tỉnh/Thành phố</option>
                        {provinces.map(province => (
                            <option key={province.code} value={province.name}>
                                {province.name}
                            </option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        {loading ? (
                            <FiLoader className="w-4 h-4 text-gray-400 animate-spin" />
                        ) : (
                            <FiMapPin className="w-4 h-4 text-gray-400" />
                        )}
                    </div>
                </div>
                {error.city && <p className="mt-1 text-xs text-red-500">{error.city}</p>}
            </div>

            {/* District Selector */}
            <div className="flex-1 w-full">
                <label htmlFor="district" className="flex items-center text-sm font-medium text-textDark dark:text-textLight mb-1">
                    Quận/Huyện <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative w-full">
                    <select
                        id="district"
                        value={selectedDistrict}
                        onChange={handleDistrictChange}
                        disabled={!selectedCity || loading}
                        className={`w-full p-2 pr-8 border ${error.district ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800 dark:text-textLight appearance-none text-sm`}
                    >
                        <option value="">Chọn Quận/Huyện</option>
                        {districts.map(district => (
                            <option key={district.code} value={district.name}>
                                {district.name}
                            </option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <FiMapPin className="w-4 h-4 text-gray-400" />
                    </div>
                </div>
                {error.district && <p className="mt-1 text-xs text-red-500">{error.district}</p>}
            </div>

            {/* Ward Selector */}
            <div className="flex-1 w-full">
                <label htmlFor="ward" className="flex items-center text-sm font-medium text-textDark dark:text-textLight mb-1">
                    Phường/Xã <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative w-full">
                    <select
                        id="ward"
                        value={selectedWard}
                        onChange={handleWardChange}
                        disabled={!selectedDistrict || loading}
                        className={`w-full p-2 pr-8 border ${error.ward ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800 dark:text-textLight appearance-none text-sm`}
                    >
                        <option value="">Chọn Phường/Xã</option>
                        {wards.map(ward => (
                            <option key={ward.code} value={ward.name}>
                                {ward.name}
                            </option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <FiMapPin className="w-4 h-4 text-gray-400" />
                    </div>
                </div>
                {error.ward && <p className="mt-1 text-xs text-red-500">{error.ward}</p>}
            </div>
        </div>
    );
};

export default LocationSelectors;