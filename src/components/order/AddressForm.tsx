import React, { useState, useEffect } from 'react';
import { FiCheck, FiX, FiLoader, FiHome, FiPhone, FiMap } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { AddressResponseDTO, AddressRequestDTO, UpdateAddressDTO } from '../../types/user.address.types';
import useUserAddress from '../../hooks/useUserAddress';
import { toast } from 'react-hot-toast';
import LocationSelectors from '../common/LocationSelectors';

interface AddressFormProps {
    address?: AddressResponseDTO;
    onSuccess?: (address: AddressResponseDTO) => void;
    onCancel?: () => void;
    isEdit?: boolean;
}

const AddressForm: React.FC<AddressFormProps> = ({ address, onSuccess, onCancel, isEdit = false }) => {
    const { createAddress, updateAddress, loading } = useUserAddress();
    const [submitting, setSubmitting] = useState(false);

    const [addressLine, setAddressLine] = useState(address?.addressLine || '');
    const [city, setCity] = useState(address?.city || '');
    const [district, setDistrict] = useState(address?.district || '');
    const [ward, setWard] = useState(address?.ward || '');
    const [phoneNumber, setPhoneNumber] = useState(address?.phoneNumber || '');
    const [isDefault, setIsDefault] = useState(address?.isDefault || false);

    const [errors, setErrors] = useState({
        addressLine: '',
        city: '',
        district: '',
        ward: '',
        phoneNumber: '',
    });

    // Update form when editing address changes
    useEffect(() => {
        if (address) {
            setAddressLine(address.addressLine || '');
            setCity(address.city || '');
            setDistrict(address.district || '');
            setWard(address.ward || '');
            setPhoneNumber(address.phoneNumber || '');
            setIsDefault(address.isDefault || false);
        }
    }, [address]);

    const validateForm = (): boolean => {
        const newErrors = { addressLine: '', city: '', district: '', ward: '', phoneNumber: '' };
        let isValid = true;

        if (!addressLine.trim()) {
            newErrors.addressLine = 'Vui lòng nhập địa chỉ chi tiết';
            isValid = false;
        }
        if (!city) {
            newErrors.city = 'Vui lòng chọn tỉnh/thành phố';
            isValid = false;
        }
        if (!district) {
            newErrors.district = 'Vui lòng chọn quận/huyện';
            isValid = false;
        }
        if (!ward) {
            newErrors.ward = 'Vui lòng chọn phường/xã';
            isValid = false;
        }
        if (!phoneNumber.trim()) {
            newErrors.phoneNumber = 'Vui lòng nhập số điện thoại';
            isValid = false;
        } else if (!/^\d{10,11}$/.test(phoneNumber)) {
            newErrors.phoneNumber = 'Số điện thoại không hợp lệ (10-11 số)';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const isFormValid = validateForm();

        if (!isFormValid) {
            return;
        }

        setSubmitting(true);
        try {
            const addressData = { addressLine, city, district, ward, phoneNumber, isDefault };
            let result: AddressResponseDTO;

            if (isEdit && address) {
                result = await updateAddress(address.addressId, addressData as UpdateAddressDTO);
                toast.success('Cập nhật địa chỉ thành công');
            } else {
                result = await createAddress(addressData as AddressRequestDTO);
                toast.success('Thêm địa chỉ mới thành công');
            }

            if (onSuccess) {
                onSuccess(result);
            }

            if (!isEdit) {
                setAddressLine('');
                setCity('');
                setDistrict('');
                setWard('');
                setPhoneNumber('');
                setIsDefault(false);
            }
        } catch (error) {
            console.error('Error saving address:', error);
            toast.error('Đã xảy ra lỗi khi lưu địa chỉ. Vui lòng thử lại.');
        } finally {
            setSubmitting(false);
        }
    };

    const isFormDisabled = loading || submitting;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-5 border-b border-gray-100 dark:border-gray-700 pb-4 px-6 pt-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                    <div className="bg-primary/10 p-2 rounded-full mr-2">
                        <FiMap className="w-5 h-5 text-primary" />
                    </div>
                    {isEdit ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}
                </h2>
                {onCancel && (
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={onCancel}
                        disabled={isFormDisabled}
                        className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 transition-colors"
                    >
                        <FiX className="w-5 h-5" />
                    </motion.button>
                )}
            </div>

            <motion.form
                onSubmit={handleSubmit}
                className="space-y-5 px-6 pb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                <div>
                    <label htmlFor="addressLine" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                        <FiHome className="w-4 h-4 mr-1 text-primary" /> Địa chỉ chi tiết <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                        type="text"
                        id="addressLine"
                        value={addressLine}
                        onChange={(e) => setAddressLine(e.target.value)}
                        disabled={isFormDisabled}
                        className={`w-full p-2 border ${errors.addressLine ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-white dark:bg-gray-700 dark:text-white disabled:opacity-70 disabled:cursor-not-allowed transition-colors`}
                        placeholder="Số nhà, tên đường, tòa nhà..."
                    />
                    {errors.addressLine && (
                        <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-1 text-sm text-red-500 flex items-center"
                        >
                            <FiX className="w-4 h-4 mr-1" /> {errors.addressLine}
                        </motion.p>
                    )}
                </div>

                {/* Khu vực địa chỉ */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                        <FiMap className="w-4 h-4 mr-1 text-primary" /> Khu vực địa chỉ <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="mt-1">
                        <LocationSelectors
                            selectedCity={city}
                            selectedDistrict={district}
                            selectedWard={ward}
                            onCityChange={setCity}
                            onDistrictChange={setDistrict}
                            onWardChange={setWard}
                            error={{
                                city: errors.city,
                                district: errors.district,
                                ward: errors.ward
                            }}
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                        <FiPhone className="w-4 h-4 mr-1 text-primary" /> Số điện thoại <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                        type="text"
                        id="phoneNumber"
                        value={phoneNumber}
                        onChange={(e) => {
                            // Only allow digits
                            const value = e.target.value.replace(/\D/g, '');
                            setPhoneNumber(value);
                        }}
                        disabled={isFormDisabled}
                        className={`w-full p-2 border ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-white dark:bg-gray-700 dark:text-white disabled:opacity-70 disabled:cursor-not-allowed transition-colors`}
                        placeholder="Ví dụ: 0912345678"
                        maxLength={11}
                    />
                    {errors.phoneNumber && (
                        <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-1 text-sm text-red-500 flex items-center"
                        >
                            <FiX className="w-4 h-4 mr-1" /> {errors.phoneNumber}
                        </motion.p>
                    )}
                </div>

                <div className="pt-1">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={isDefault}
                            onChange={(e) => setIsDefault(e.target.checked)}
                            disabled={isFormDisabled}
                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 dark:border-gray-600 rounded disabled:opacity-70 disabled:cursor-not-allowed"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                            Đặt làm địa chỉ mặc định
                        </span>
                    </label>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-gray-100 dark:border-gray-700 mt-4">
                    {onCancel && (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="button"
                            onClick={onCancel}
                            disabled={isFormDisabled}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            <FiX className="mr-1" /> Hủy
                        </motion.button>
                    )}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isFormDisabled}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                    >
                        {isFormDisabled ? (
                            <>
                                <FiLoader className="w-4 h-4 mr-2 animate-spin" />
                                Đang xử lý...
                            </>
                        ) : (
                            <>
                                <FiCheck className="mr-1" />
                                {isEdit ? 'Cập nhật' : 'Thêm địa chỉ'}
                            </>
                        )}
                    </motion.button>
                </div>
            </motion.form>
        </div>
    );
};

export default AddressForm;