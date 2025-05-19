import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiImage, FiX, FiUpload, FiSliders } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Định nghĩa interface cho kết quả tìm kiếm
interface SearchProduct {
  product_id: number;
  name: string;
  price: number;
  sale_price: number | null;
  thumbnail: string;
  image_url: string;
  category_name: string;
  brand_name: string;
  distance: number;
}

interface SearchResponse {
  success: boolean;
  message: string;
  products: SearchProduct[];
  category_filter?: string;
}

interface ImageSearchWidgetProps {
  isDarkMode: boolean;
}

const ImageSearchWidget: React.FC<ImageSearchWidgetProps> = ({ isDarkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [topK, setTopK] = useState<number>(20);
  const [threshold, setThreshold] = useState<number>(0.3);
  const [useCategoryFilter, setUseCategoryFilter] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toggle widget open/closed state
  const toggleWidget = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      // Reset states when closing
      setSelectedImage(null);
      setSelectedFile(null);
      setSearchResults(null);
      setShowSettings(false);
    }
  };

  // Toggle settings panel
  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
      // Reset search results when new image is selected
      setSearchResults(null);
    }
  };

  // Trigger file input click
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  // Handle search by image
  const handleSearch = async () => {
    if (!selectedFile) {
      toast.error('Vui lòng chọn một hình ảnh để tìm kiếm');
      return;
    }

    setIsSearching(true);
    setSearchResults(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      // Sử dụng URL tương đối để tận dụng proxy của Vite
      const apiUrl = `/api/products/search-by-image?top_k=${topK}&threshold=${threshold}&use_category_filter=${useCategoryFilter}`;
      console.log('Sending request to:', apiUrl);

      const response = await axios.post<SearchResponse>(
        apiUrl,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json',
          }
        }
      );

      setSearchResults(response.data);

      if (response.data.success && response.data.products.length > 0) {
        toast.success(response.data.message || 'Tìm thấy sản phẩm tương tự');
      } else {
        toast.error(response.data.message || 'Không tìm thấy sản phẩm tương tự');
      }
    } catch (error) {
      console.error('Error searching by image:', error);
      toast.error('Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại sau.');
    } finally {
      setIsSearching(false);
    }
  };

  // Animation variants
  const buttonVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 },
    hover: { scale: 1.1 },
    tap: { scale: 0.95 }
  };

  const containerVariants = {
    closed: {
      width: '56px',
      height: '56px',
      borderRadius: '50%'
    },
    open: {
      width: searchResults ? '400px' : '300px',
      height: 'auto', // Thay đổi height thành auto để tự điều chỉnh theo nội dung
      maxHeight: '80vh', // Giới hạn chiều cao tối đa để không vượt quá màn hình
      borderRadius: '16px'
    }
  };

  // Format price with Vietnamese currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <div className="fixed bottom-8 left-8 z-50">
      <motion.div
        variants={containerVariants}
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 25
        }}
        className={`
          overflow-hidden shadow-lg
          ${isDarkMode
            ? 'bg-gray-800 text-white'
            : 'bg-white text-gray-800'}
          flex flex-col items-center justify-center
        `}
        style={{
          boxShadow: isDarkMode
            ? "0 8px 25px rgba(0, 0, 0, 0.3)"
            : "0 8px 25px rgba(0, 0, 0, 0.1)"
        }}
      >
        {!isOpen ? (
          // Closed state - just show the button
          <motion.button
            variants={buttonVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            whileHover="hover"
            whileTap="tap"
            onClick={toggleWidget}
            className="w-full h-full flex items-center justify-center"
            aria-label="Tìm kiếm bằng hình ảnh"
          >
            <div className="relative">
              <FiImage className="w-6 h-6 text-primary" />
              <FiSearch className="w-3 h-3 absolute -bottom-1 -right-1 text-primary" />
            </div>
          </motion.button>
        ) : (
          // Open state - show the image search interface
          <div className="w-full h-full flex flex-col p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium">Tìm kiếm bằng hình ảnh</h3>
              <div className="flex items-center">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-1 mr-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                  title="Tùy chọn tìm kiếm"
                >
                  <FiSliders className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleWidget}
                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <FiX className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Settings panel */}
            {showSettings && (
              <div className={`mb-3 p-3 rounded-lg text-sm ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h4 className="font-medium mb-2">Tùy chọn tìm kiếm</h4>

                <div className="mb-2">
                  <label className="block mb-1 text-xs">Số lượng kết quả (1-50)</label>
                  <div className="flex items-center">
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={topK}
                      onChange={(e) => setTopK(parseInt(e.target.value))}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-300 dark:bg-gray-600"
                    />
                    <span className="ml-2 min-w-[30px] text-center">{topK}</span>
                  </div>
                </div>

                <div className="mb-2">
                  <label className="block mb-1 text-xs">Ngưỡng tương đồng (0-1)</label>
                  <div className="flex items-center">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={threshold}
                      onChange={(e) => setThreshold(parseFloat(e.target.value))}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-300 dark:bg-gray-600"
                    />
                    <span className="ml-2 min-w-[30px] text-center">{threshold}</span>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="categoryFilter"
                    checked={useCategoryFilter}
                    onChange={(e) => setUseCategoryFilter(e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="categoryFilter" className="text-xs">Lọc theo danh mục</label>
                </div>
              </div>
            )}

            {/* Search results */}
            {searchResults ? (
              <div className="flex-grow flex flex-col w-full overflow-hidden">
                <div className="mb-2 text-sm">
                  <p className="font-medium">{searchResults.message}</p>
                  {searchResults.category_filter && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Danh mục: {searchResults.category_filter}
                    </p>
                  )}
                </div>

                {searchResults.products.length > 0 ? (
                  <div className="flex-grow overflow-y-auto pr-1 scrollbar-thin" style={{ maxHeight: '300px' }}>
                    <div className="grid grid-cols-2 gap-2">
                      {searchResults.products.map((product) => (
                        <div
                          key={product.product_id}
                          className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} cursor-pointer transition-colors`}
                          onClick={() => window.open(`/products/${product.product_id}`, '_blank')}
                        >
                          <div className="aspect-square mb-1 overflow-hidden rounded-md">
                            <img
                              src={product.thumbnail || product.image_url}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <h5 className="text-xs font-medium line-clamp-1">{product.name}</h5>
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-medium text-primary">
                              {product.sale_price ? formatPrice(product.sale_price) : formatPrice(product.price)}
                            </span>
                            {product.sale_price && (
                              <span className="line-through text-gray-500 text-[10px]">
                                {formatPrice(product.price)}
                              </span>
                            )}
                          </div>
                          <div className="mt-1 text-xs text-gray-500">
                            <span className="mr-1">{product.category_name}</span>
                            <span>•</span>
                            <span className="ml-1">{product.brand_name}</span>
                          </div>
                          <div className="mt-1 text-xs">
                            <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                              {Math.round((1 - product.distance) * 100)}% tương đồng
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex-grow flex items-center justify-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Không tìm thấy sản phẩm nào phù hợp
                    </p>
                  </div>
                )}

                <div className="mt-3 flex justify-between">
                  <button
                    onClick={() => {
                      setSearchResults(null);
                      setSelectedImage(null);
                      setSelectedFile(null);
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                  >
                    Tìm kiếm mới
                  </button>
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className={`px-3 py-1.5 rounded-full text-xs ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                  >
                    {showSettings ? 'Ẩn tùy chọn' : 'Tùy chọn'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-grow flex flex-col items-center justify-center">
                  {selectedImage ? (
                    // Show selected image preview
                    <div className="relative w-full flex flex-col items-center justify-center">
                      <div className="relative w-full max-h-[200px] flex items-center justify-center mb-4">
                        <img
                          src={selectedImage}
                          alt="Preview"
                          className="max-w-full max-h-[200px] object-contain rounded-lg"
                        />
                        <button
                          onClick={() => {
                            setSelectedImage(null);
                            setSelectedFile(null);
                          }}
                          className="absolute top-2 right-2 bg-gray-800/70 text-white p-1 rounded-full"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Nút tìm kiếm được đặt ngay dưới hình ảnh */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSearch}
                        className="px-4 py-2 bg-primary text-white rounded-full flex items-center text-sm"
                        disabled={isSearching}
                      >
                        {isSearching ? (
                          <>
                            <span className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            Đang tìm...
                          </>
                        ) : (
                          <>
                            <FiSearch className="w-4 h-4 mr-2" />
                            Tìm kiếm
                          </>
                        )}
                      </motion.button>
                    </div>
                  ) : (
                    // Show upload area
                    <div
                      className={`
                        w-full flex flex-col items-center justify-center
                        border-2 border-dashed rounded-lg p-4
                        ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}
                      `}
                    >
                      <FiImage className="w-12 h-12 mb-4 text-gray-400" />
                      <p className="text-sm text-center mb-4">
                        Tải lên hình ảnh để tìm kiếm sản phẩm tương tự
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleBrowseClick}
                        className="px-4 py-2 bg-primary text-white rounded-full flex items-center text-sm"
                      >
                        <FiUpload className="w-4 h-4 mr-2" />
                        Chọn hình ảnh
                      </motion.button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept="image/jpeg,image/png,image/gif,image/webp,image/avif,image/heic,image/heif"
                        className="hidden"
                      />
                    </div>
                  )}
                </div>

{/* Nút tìm kiếm đã được di chuyển vào trong phần hiển thị hình ảnh */}
              </>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ImageSearchWidget;
