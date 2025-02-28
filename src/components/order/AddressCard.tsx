// File: components/order/AddressCard.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { FiMapPin, FiCheck, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { AddressResponseDTO } from '../../types/user.address.types';

interface AddressCardProps {
    address: AddressResponseDTO;
    selected: boolean;
    onSelect: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

const AddressCard: React.FC<AddressCardProps> = ({
                                                     address,
                                                     selected,
                                                     onSelect,
                                                     onEdit,
                                                     onDelete
                                                 }) => {
    const { addressLine, city, district, ward, isDefault, phoneNumber } = address;

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        onEdit();
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete();
    };

    return (
        <motion.div
            whileHover={{ scale: 1.01 }}
            className={`border rounded-lg p-4 mb-3 cursor-pointer shadow-sm hover:shadow-md transition-all duration-200 ${
                selected ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
            }`}
            onClick={onSelect}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center mb-1">
                        <FiMapPin className="w-5 h-5 text-primary mr-2 flex-shrink-0" />
                        <p className="font-medium text-textDark dark:text-textLight">
                            {[addressLine, ward, district, city].filter(Boolean).join(', ')}
                        </p>
                    </div>
                    {phoneNumber && (
                        <p className="text-sm text-secondary/70 dark:text-textLight/70 ml-7">SĐT: {phoneNumber}</p>
                    )}
                    <div className="mt-2 ml-7 flex items-center">
                        {isDefault && (
                            <span className="inline-block text-xs bg-primary/20 text-primary px-2 py-1 rounded-full mr-2">Mặc định</span>
                        )}
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            selected ? 'border-primary bg-primary' : 'border-gray-300 dark:border-gray-600'
                        }`}
                    >
                        {selected && <FiCheck className="w-4 h-4 text-white" />}
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                        onClick={handleEdit}
                        aria-label="Sửa địa chỉ"
                    >
                        <FiEdit2 className="w-4 h-4" />
                    </motion.button>
                    {!isDefault && (
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                            onClick={handleDelete}
                            aria-label="Xóa địa chỉ"
                        >
                            <FiTrash2 className="w-4 h-4" />
                        </motion.button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default AddressCard;