// File: components/profile/AddressesTab.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiMapPin } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import useUserAddress from '../../hooks/useUserAddress';
import EnhancedAddressCard from '../order/EnhancedAddressCard';
import ConfirmDialog from '../common/ConfirmDialog';
import { AddressResponseDTO } from '../../types/user.address.types';

interface AddressesTabProps {
    onAddAddress: () => void;
    onEditAddress: (address: AddressResponseDTO) => void;
}

const AddressesTab: React.FC<AddressesTabProps> = ({ onAddAddress, onEditAddress }) => {
    const {
        sortedAddresses,
        deleteAddress,
        setAsDefaultAddress
    } = useUserAddress();

    const [showDeleteAddressConfirm, setShowDeleteAddressConfirm] = useState(false);
    const [addressToDelete, setAddressToDelete] = useState<number | null>(null);

    const handleDeleteAddress = (addressId: number) => {
        setAddressToDelete(addressId);
        setShowDeleteAddressConfirm(true);
    };

    const confirmDeleteAddress = async () => {
        if (!addressToDelete) return;

        try {
            await deleteAddress(addressToDelete);
            setShowDeleteAddressConfirm(false);
            setAddressToDelete(null);
            toast.success('Đã xóa địa chỉ thành công!');
        } catch (error) {
            console.error('Error deleting address:', error);
            toast.error('Không thể xóa địa chỉ. Vui lòng thử lại sau.');
        }
    };

    return (
        <motion.div
            key="addresses"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Sổ địa chỉ</h2>
                <motion.button
                    onClick={onAddAddress}
                    className="px-4 py-2 flex items-center space-x-2 bg-primary text-white rounded-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <FiPlus className="w-4 h-4" />
                    <span>Thêm địa chỉ mới</span>
                </motion.button>
            </div>

            {sortedAddresses && sortedAddresses.length > 0 ? (
                <div className="space-y-4">
                    {sortedAddresses.map(address => (
                        <motion.div
                            key={address.addressId}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <EnhancedAddressCard
                                address={address}
                                selected={false}
                                onSelect={() => {}}
                                onEdit={() => onEditAddress(address)}
                                onDelete={() => handleDeleteAddress(address.addressId)}
                                onSetDefault={setAsDefaultAddress}
                            />
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-10 shadow-md text-center">
                    <FiMapPin className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Chưa có địa chỉ nào</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Bạn chưa có địa chỉ nào. Hãy thêm địa chỉ mới để tiện cho việc đặt hàng.</p>
                    <motion.button
                        onClick={onAddAddress}
                        className="px-4 py-2 bg-primary text-white rounded-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Thêm địa chỉ mới
                    </motion.button>
                </div>
            )}

            {/* Delete Address Confirmation */}
            <ConfirmDialog
                isOpen={showDeleteAddressConfirm}
                title="Xác nhận xóa địa chỉ"
                message="Bạn có chắc chắn muốn xóa địa chỉ này? Hành động này không thể hoàn tác."
                confirmText="Xóa địa chỉ"
                cancelText="Hủy"
                type="error"
                onConfirm={confirmDeleteAddress}
                onCancel={() => {
                    setShowDeleteAddressConfirm(false);
                    setAddressToDelete(null);
                }}
            />
        </motion.div>
    );
};

export default AddressesTab;