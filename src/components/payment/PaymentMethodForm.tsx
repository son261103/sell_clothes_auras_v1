import React from 'react';
import { FiCreditCard, FiX } from 'react-icons/fi';
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
        <div className="relative">
            <button
                onClick={onCancel}
                className="absolute top-0 right-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
                <FiX className="w-6 h-6" />
            </button>

            <h2 className="text-xl font-bold text-textDark dark:text-textLight mb-4">
                Chọn phương thức thanh toán
            </h2>

            <form onSubmit={handleSubmit}>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                    {paymentMethods.length > 0 ? (
                        paymentMethods.map((method) => (
                            <div
                                key={method.methodId}
                                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                                    selectedMethodId === method.methodId
                                        ? 'border-primary bg-primary/10'
                                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                                onClick={() => onSelect(method.methodId)}
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <FiCreditCard className="w-6 h-6 text-primary flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-textDark dark:text-textLight truncate">
                                                {method.name}
                                            </p>
                                            <p className="text-sm text-secondary/70 dark:text-textLight/70 truncate">
                                                {method.description || method.code}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`flex-shrink-0 inline-flex items-center px-2 py-1 rounded-full text-sm ${
                                        method.status
                                            ? 'bg-green-100 text-green-600'
                                            : 'bg-red-100 text-red-600'
                                    }`}>
                                        {method.status ? 'Hoạt động' : 'Bảo trì'}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-600 dark:text-gray-300 py-4">
                            Không có phương thức thanh toán nào khả dụng.
                        </p>
                    )}
                </div>

                <div className="mt-6 flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        disabled={!selectedMethodId}
                        className="px-4 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        Xác nhận
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PaymentMethodForm;