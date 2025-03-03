import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiEdit2, FiTrash2, FiMoreVertical, FiStar, FiHome } from 'react-icons/fi';
import { AddressResponseDTO } from '../../types/user.address.types';
import ConfirmDialog from '../common/ConfirmDialog';

interface AddressCardProps {
    address: AddressResponseDTO;
    selected: boolean;
    onSelect: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onSetDefault?: (addressId: number) => void;
}

const EnhancedAddressCard: React.FC<AddressCardProps> = ({
                                                             address,
                                                             selected,
                                                             onSelect,
                                                             onEdit,
                                                             onDelete,
                                                             onSetDefault
                                                         }) => {
    const { addressId, addressLine, city, district, ward, isDefault, phoneNumber } = address;
    const [showActions, setShowActions] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showDefaultConfirm, setShowDefaultConfirm] = useState(false);

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowActions(false);
        onEdit();
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowActions(false);
        setShowDeleteConfirm(true);
    };

    const handleSetDefaultClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowActions(false);
        setShowDefaultConfirm(true);
    };

    const handleConfirmDelete = () => {
        setShowDeleteConfirm(false);
        onDelete();
    };

    const handleConfirmSetDefault = () => {
        setShowDefaultConfirm(false);
        if (onSetDefault) {
            onSetDefault(addressId);
        }
    };

    const toggleActions = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowActions(!showActions);
    };

    return (
        <>
            <motion.div
                className={`relative border rounded-lg p-4 mb-3 cursor-pointer shadow-md ${
                    selected
                        ? 'border-primary bg-primary/5 dark:bg-primary/10'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750'
                }`}
                onClick={onSelect}
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
                layout
            >
                {isDefault && (
                    <div className="absolute top-0 right-0 w-0 h-0 border-t-[40px] border-r-[40px] border-t-transparent border-r-primary">
                        <div className="absolute top-[-33px] right-[-35px] rotate-45">
                            <FiStar className="w-4 h-4 text-white" />
                        </div>
                    </div>
                )}

                <div className="flex items-start justify-between">
                    <div className="flex-1 pr-4">
                        <div className="flex items-center mb-1">
                            <div className={`p-2 rounded-full ${selected ? 'bg-primary/20' : 'bg-gray-100 dark:bg-gray-700'} mr-3`}>
                                <FiHome className={`w-4 h-4 ${selected ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}`} />
                            </div>
                            <p className="font-medium text-gray-900 dark:text-white">
                                {[addressLine, ward, district, city].filter(Boolean).join(', ')}
                            </p>
                        </div>

                        {phoneNumber && (
                            <div className="flex items-center ml-10 mt-1">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    SĐT: <span className="font-medium">{phoneNumber}</span>
                                </p>
                            </div>
                        )}

                        <div className="mt-2 ml-10 flex items-center flex-wrap gap-2">
                            {isDefault && (
                                <span className="inline-block text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                                    Mặc định
                                </span>
                            )}
                            <span className={`inline-block text-xs ${selected ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'} px-2 py-1 rounded-full`}>
                                {selected ? 'Đã chọn' : 'Địa chỉ giao hàng'}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col items-end space-y-2">
                        <div className="relative">
                            <motion.button
                                className={`w-8 h-8 rounded-full ${selected ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'} flex items-center justify-center`}
                                onClick={toggleActions}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                aria-label="Tùy chọn"
                            >
                                {selected ? (
                                    <FiCheck className="w-4 h-4 text-white" />
                                ) : (
                                    <FiMoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                                )}
                            </motion.button>

                            <AnimatePresence>
                                {showActions && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9, y: 5 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, y: 5 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute top-full right-0 mt-2 w-36 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-10 overflow-hidden border border-gray-100 dark:border-gray-700"
                                        onClick={e => e.stopPropagation()}
                                    >
                                        <div className="py-1">
                                            <motion.button
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                                                onClick={handleEditClick}
                                                whileHover={{ backgroundColor: '#f3f4f6' }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <FiEdit2 className="mr-2 text-blue-500" /> Sửa địa chỉ
                                            </motion.button>

                                            {!isDefault && onSetDefault && (
                                                <motion.button
                                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                                                    onClick={handleSetDefaultClick}
                                                    whileHover={{ backgroundColor: '#f3f4f6' }}
                                                    whileTap={{ scale: 0.98 }}
                                                >
                                                    <FiStar className="mr-2 text-yellow-500" /> Đặt mặc định
                                                </motion.button>
                                            )}

                                            {!isDefault && (
                                                <motion.button
                                                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
                                                    onClick={handleDeleteClick}
                                                    whileHover={{ backgroundColor: 'rgba(254, 226, 226, 0.5)' }}
                                                    whileTap={{ scale: 0.98 }}
                                                >
                                                    <FiTrash2 className="mr-2" /> Xóa địa chỉ
                                                </motion.button>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Delete confirmation dialog */}
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                title="Xác nhận xóa địa chỉ"
                message="Bạn có chắc chắn muốn xóa địa chỉ này? Hành động này không thể hoàn tác."
                confirmText="Xóa địa chỉ"
                cancelText="Hủy"
                type="error"
                onConfirm={handleConfirmDelete}
                onCancel={() => setShowDeleteConfirm(false)}
            />

            {/* Set default confirmation dialog */}
            <ConfirmDialog
                isOpen={showDefaultConfirm}
                title="Đặt làm địa chỉ mặc định"
                message="Bạn có muốn đặt địa chỉ này làm mặc định cho các đơn hàng tiếp theo?"
                confirmText="Đặt mặc định"
                cancelText="Hủy"
                type="info"
                onConfirm={handleConfirmSetDefault}
                onCancel={() => setShowDefaultConfirm(false)}
            />
        </>
    );
};

export default EnhancedAddressCard;