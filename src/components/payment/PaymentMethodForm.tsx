import React from 'react';
import { motion } from 'framer-motion';
import { FiCreditCard, FiX, FiCheck } from 'react-icons/fi';
import { PaymentMethodDTO } from '../../types/payment.method.types';

interface PaymentMethodFormProps {
    paymentMethods: PaymentMethodDTO[];
    selectedMethodId: number | null;
    onSelect: (methodId: number) => void;
    onCancel: () => void;
    onSuccess: () => void;
}

const PaymentMethodForm: React.FC<PaymentMethodFormProps> = ({
                                                                 paymentMethods,
                                                                 selectedMethodId,
                                                                 onSelect,
                                                                 onCancel,
                                                                 onSuccess
                                                             }) => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedMethodId) {
            onSuccess();
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 dark:border-gray-700 p-6 pb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                    <div className="bg-primary/10 p-2 rounded-full mr-2">
                        <FiCreditCard className="w-5 h-5 text-primary" />
                    </div>
                    Chọn phương thức thanh toán
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
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1 mb-6">
                    {paymentMethods.length > 0 ? (
                        paymentMethods.map((method) => (
                            <motion.div
                                key={method.methodId}
                                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                                    selectedMethodId === method.methodId
                                        ? 'border-primary bg-primary/5 dark:bg-primary/10'
                                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                                onClick={() => onSelect(method.methodId)}
                                whileHover={{ scale: 1.01, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className={`p-2 rounded-full ${selectedMethodId === method.methodId ? 'bg-primary/20' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                            <FiCreditCard className={`w-5 h-5 ${selectedMethodId === method.methodId ? 'text-primary' : 'text-gray-600 dark:text-gray-400'}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 dark:text-white truncate">
                                                {method.name}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                                {method.description || method.code}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`flex-shrink-0 inline-flex items-center px-2 py-1 rounded-full text-xs ${
                                            method.status
                                                ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                                        }`}>
                                            {method.status ? 'Hoạt động' : 'Bảo trì'}
                                        </span>
                                        <div
                                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                                selectedMethodId === method.methodId ? 'border-primary bg-primary' : 'border-gray-300 dark:border-gray-600'
                                            }`}
                                        >
                                            {selectedMethodId === method.methodId && <FiCheck className="w-4 h-4 text-white" />}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <p className="text-gray-600 dark:text-gray-300">
                                Không có phương thức thanh toán nào khả dụng.
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-4 border-t border-gray-100 dark:border-gray-700 pt-4">
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
                        disabled={!selectedMethodId}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                        whileHover={selectedMethodId ? { scale: 1.02 } : {}}
                        whileTap={selectedMethodId ? { scale: 0.98 } : {}}
                    >
                        <FiCheck className="mr-2" />
                        Xác nhận
                    </motion.button>
                </div>
            </form>
        </div>
    );
};

export default PaymentMethodForm;