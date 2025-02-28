import React from 'react';
import { FiCheck } from 'react-icons/fi';
import { ShippingMethodDTO } from '../../types/shipping.types';

interface ShippingMethodSelectorProps {
    shippingMethods: ShippingMethodDTO[];
    selectedMethodId: number | null;
    onSelect: (methodId: number) => void;
}

const ShippingMethodSelector: React.FC<ShippingMethodSelectorProps> = ({ shippingMethods, selectedMethodId, onSelect }) => {
    return (
        <div className="space-y-2">
            {shippingMethods.map(method => (
                <div
                    key={method.id}
                    className={`border rounded-lg p-4 cursor-pointer shadow-sm hover:shadow-md transition-all duration-200 ${
                        selectedMethodId === method.id
                            ? 'border-primary bg-primary/5 dark:bg-primary/10'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                    }`}
                    onClick={() => onSelect(method.id)}
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
                                selectedMethodId === method.id ? 'border-primary bg-primary' : 'border-gray-300 dark:border-gray-600'
                            }`}
                        >
                            {selectedMethodId === method.id && <FiCheck className="w-4 h-4 text-white" />}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ShippingMethodSelector;