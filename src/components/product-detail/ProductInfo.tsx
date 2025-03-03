import React, { useState } from 'react';
import { ProductResponseDTO } from '../../types/product.types';

interface ProductInfoProps {
    product: ProductResponseDTO;
    formatPrice: (price: number) => string;
}

const ProductInfo: React.FC<ProductInfoProps> = ({
                                                     product,
                                                     formatPrice
                                                 }) => {
    const [expanded, setExpanded] = useState<boolean>(false);

    const extendedDescription = product.description || `
        Không có mô tả chi tiết cho sản phẩm này. Tuy nhiên, sản phẩm được thiết kế với chất liệu cao cấp, mang lại sự thoải mái tối đa trong mọi hoạt động. 
        Với công nghệ thấm hút mồ hôi tiên tiến, sản phẩm giúp bạn giữ mát và khô thoáng trong suốt quá trình tập luyện. 
        Ngoài ra, thiết kế ergonomi hiện đại không chỉ tăng cường sự linh hoạt mà còn tạo nên phong cách độc đáo, phù hợp với mọi phong cách sống. 
        Sản phẩm được sản xuất bởi thương hiệu uy tín, đảm bảo chất lượng và độ bền cao. Hãy trải nghiệm ngay để cảm nhận sự khác biệt!
    `;

    const paragraphs = extendedDescription.trim().split('\n').map(line => line.trim()).filter(line => line);
    const displayParagraphs = expanded ? paragraphs : paragraphs.slice(0, 2);
    const hasMoreContent = paragraphs.length > 2;

    const renderBrandCategory = () => {
        return (
            <div className="flex flex-wrap gap-4 mb-6" data-aos="fade-up">
                {product.brand && (
                    <div className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Thương hiệu: <span className="text-primary dark:text-accent">{product.brand.name}</span>
                        </span>
                    </div>
                )}

                {product.category && (
                    <div className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Danh mục: <span className="text-primary dark:text-accent">{product.category.name}</span>
                        </span>
                    </div>
                )}
            </div>
        );
    };

    const renderPriceInfo = () => {
        if (!product.price) return null;

        return (
            <div className="mt-6 bg-gray-100 dark:bg-gray-700 p-4 rounded-lg" data-aos="fade-up" data-aos-delay="100">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Giá bán</h3>
                    <div className="text-right">
                        {product.salePrice ? (
                            <>
                                <p className="text-lg font-bold text-primary dark:text-accent">
                                    {formatPrice(product.salePrice)}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 line-through">
                                    {formatPrice(product.price)}
                                </p>
                                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                                    Tiết kiệm {Math.round((1 - product.salePrice / product.price) * 100)}%
                                </p>
                            </>
                        ) : (
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                                {formatPrice(product.price)}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full" data-aos="fade-up" data-aos-delay="200">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <span className="inline-block w-1 h-6 bg-primary dark:bg-accent mr-3 rounded"></span>
                {product.name}
            </h2>

            {renderBrandCategory()}
            {renderPriceInfo()}

            <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6" data-aos="fade-up" data-aos-delay="150">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Mô tả sản phẩm</h3>
                <div className="text-gray-600 dark:text-gray-300 text-base leading-relaxed space-y-4">
                    {displayParagraphs.map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                    ))}
                </div>

                {hasMoreContent && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="mt-4 text-primary dark:text-accent hover:underline font-medium text-sm focus:outline-none transition-colors"
                    >
                        {expanded ? 'Thu gọn' : 'Xem thêm'}
                    </button>
                )}
            </div>

            <div className="mt-6 text-sm text-gray-500 dark:text-gray-400" data-aos="fade-up" data-aos-delay="200">
                <p>Mã sản phẩm: #{product.productId}</p>
                <p>Cập nhật lần cuối: {new Date(product.updatedAt).toLocaleDateString('vi-VN')}</p>
            </div>
        </div>
    );
};

export default ProductInfo;