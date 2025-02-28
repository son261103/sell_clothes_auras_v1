import React, { useState } from 'react';
import { FiX, FiCheck } from 'react-icons/fi';
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
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-textDark dark:text-textLight">Chọn phương thức vận chuyển</h2>
                <button onClick={onCancel} className="text-gray-500 dark:text-gray-400">
                    <FiX className="w-6 h-6" />
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="mb-6 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/50 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
                    {shippingMethods.length > 0 ? (
                        <div className="space-y-2">
                            {shippingMethods.map(method => (
                                <div
                                    key={method.id}
                                    className={`border rounded-lg p-4 cursor-pointer shadow-sm ${
                                        localSelectedMethodId === method.id
                                            ? 'border-primary bg-primary/5 dark:bg-primary/10'
                                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                                    }`}
                                    onClick={() => setLocalSelectedMethodId(method.id)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <p className="font-medium text-textDark dark:text-textLight">{method.name}</p>
                                            <p className="text-sm text-secondary/70 dark:text-textLight/70">
                                                {method.estimatedDeliveryTime} -{' '}
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(method.baseFee)}
                                            </p>
                                        </div>
                                        <div
                                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                                localSelectedMethodId === method.id ? 'border-primary bg-primary' : 'border-gray-300 dark:border-gray-600'
                                            }`}
                                        >
                                            {localSelectedMethodId === method.id && <FiCheck className="w-4 h-4 text-white" />}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <p className="text-grey-600 dark:text-grey-300">Không có phương thức vận chuyển nào.</p>
                        </div>
                    )}
                </div>

                <div className="flex justify-end mt-6 space-x-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        disabled={!localSelectedMethodId || loading}
                        className="px-4 py-2 bg-primary text-white rounded-md disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {loading ? <LoadingSpinner size="small" color="white" /> : 'Xác nhận'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ShippingMethodForm;