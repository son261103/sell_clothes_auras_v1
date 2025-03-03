import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiCheck, FiTruck } from 'react-icons/fi';
import { ShippingMethodDTO } from '../../types/shipping.types';
import LoadingSpinner from '../common/LoadingSpinner';

interface ShippingMethodFormProps {
    shippingMethods: ShippingMethodDTO[];
    selectedMethodId: number | null;
    onSelect: (methodId: number) => void;
    onCancel: () => void;
    onSuccess: () => void;
}

const ShippingMethodForm: React.FC<ShippingMethodFormProps> = ({
                                                                   shippingMethods,
                                                                   selectedMethodId,
                                                                   onSelect,
                                                                   onCancel,
                                                                   onSuccess
                                                               }) => {
    const [loading, setLoading] = useState(false);
    const [localSelectedMethodId, setLocalSelectedMethodId] = useState<number | null>(selectedMethodId);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (localSelectedMethodId) {
            onSelect(localSelectedMethodId);
            setTimeout(() => {
                setLoading(false);
                onSuccess();
            }, 500);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 dark:border-gray-700 p-6 pb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                    <div className="bg-primary/10 p-2 rounded-full mr-2">
                        <FiTruck className="w-5 h-5 text-primary" />
                    </div>
                    Chọn phương thức vận chuyển
                </h2>
                <motion.button
                    onClick={onCancel}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <FiX className="w-5 h-5" />
                </motion.button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 pt-2">
                <div className="mb-6 max-h-80 overflow-y-auto pr-1">
                    {shippingMethods.length > 0 ? (
                        <div className="space-y-3">
                            {shippingMethods.map(method => (
                                <motion.div
                                    key={method.id}
                                    className={`border rounded-lg p-4 cursor-pointer shadow-sm ${
                                        localSelectedMethodId === method.id
                                            ? 'border-primary bg-primary/5 dark:bg-primary/10'
                                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                                    }`}
                                    onClick={() => setLocalSelectedMethodId(method.id)}
                                    whileHover={{ scale: 1.01, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className={`p-2 rounded-full ${localSelectedMethodId === method.id ? 'bg-primary/20' : 'bg-gray-100 dark:bg-gray-700'} mr-3`}>
                                                <FiTruck className={`w-5 h-5 ${localSelectedMethodId === method.id ? 'text-primary' : 'text-gray-600 dark:text-gray-400'}`} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900 dark:text-white">{method.name}</p>
                                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                    <span>{method.estimatedDeliveryTime}</span>
                                                    <span className="mx-2">•</span>
                                                    <span className="font-medium text-primary">
                                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(method.baseFee)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div
                                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                                localSelectedMethodId === method.id ? 'border-primary bg-primary' : 'border-gray-300 dark:border-gray-600'
                                            }`}
                                        >
                                            {localSelectedMethodId === method.id && <FiCheck className="w-4 h-4 text-white" />}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <p className="text-gray-600 dark:text-gray-300">Không có phương thức vận chuyển nào.</p>
                        </div>
                    )}
                </div>

                <div className="flex justify-end mt-6 space-x-4 border-t border-gray-100 dark:border-gray-700 pt-4">
                    <motion.button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        Hủy
                    </motion.button>
                    <motion.button
                        type="submit"
                        disabled={!localSelectedMethodId || loading}
                        className="px-4 py-2 bg-primary text-white rounded-lg disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center"
                        whileHover={!loading && localSelectedMethodId ? { scale: 1.02 } : {}}
                        whileTap={!loading && localSelectedMethodId ? { scale: 0.98 } : {}}
                    >
                        {loading ? <LoadingSpinner size="small" color="white" /> : (
                            <>
                                <FiCheck className="mr-2" />
                                Xác nhận
                            </>
                        )}
                    </motion.button>
                </div>
            </form>
        </div>
    );
};

export default ShippingMethodForm;