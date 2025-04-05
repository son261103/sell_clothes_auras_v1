/**
 * Format a number as currency in VND (Vietnamese Dong)
 * @param {number} amount - The amount to format
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount: number): string => {
    if (amount === undefined || amount === null) {
        return '0 ₫';
    }

    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

/**
 * Format a date string to a localized date format
 * @param {string} dateString - The date string to format
 * @returns {string} - Formatted date string
 */
export const formatDate = (dateString: string): string => {
    if (!dateString) return '';

    try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    } catch (error) {
        console.error('Error formatting date:', error);
        return dateString;
    }
};

/**
 * Truncate a string to a specified length and add ellipsis
 * @param {string} str - The string to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} - Truncated string
 */
export const truncateString = (str: string, maxLength: number): string => {
    if (!str) return '';
    if (str.length <= maxLength) return str;

    return str.substring(0, maxLength) + '...';
};

/**
 * Format a number with thousands separators
 * @param {number} num - The number to format
 * @returns {string} - Formatted number string
 */
export const formatNumber = (num: number): string => {
    if (num === undefined || num === null) return '0';

    return new Intl.NumberFormat('vi-VN').format(num);
};

/**
 * Generate a slug from a string (for URL-friendly strings)
 * @param {string} str - The string to convert to a slug
 * @returns {string} - URL-friendly slug
 */
export const generateSlug = (str: string): string => {
    if (!str) return '';

    // Convert Vietnamese characters to ASCII
    const from = 'àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ';
    const to = 'aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyydAAAAAAAAAAAAAAAAAEEEEEEEEEEEIIIIIOOOOOOOOOOOOOOOOOUUUUUUUUUUUYYYYYD';

    let result = str;
    for (let i = 0; i < from.length; i++) {
        result = result.replace(new RegExp(from[i], 'g'), to[i]);
    }

    return result
        .toLowerCase()
        .replace(/[^a-z0-9\-\s]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with a single hyphen
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};