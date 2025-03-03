// File: components/profile/modals/AddressModal.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AddressForm from '../order/AddressForm';
import { AddressResponseDTO } from '../../types/user.address.types';

interface AddressModalProps {
    isOpen: boolean;
    address?: AddressResponseDTO;
    onSuccess: (address: AddressResponseDTO) => void;
    onClose: () => void;
}

const AddressModal: React.FC<AddressModalProps> = ({
                                                       isOpen,
                                                       address,
                                                       onSuccess,
                                                       onClose
                                                   }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    onClick={(e) => e.target === e.currentTarget && onClose()}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.9, y: 20, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl shadow-xl m-4 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <AddressForm
                            address={address}
                            isEdit={!!address}
                            onSuccess={onSuccess}
                            onCancel={onClose}
                        />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AddressModal;