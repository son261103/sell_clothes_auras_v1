import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';

// Base selectors không dùng createSelector - chỉ truy cập trực tiếp state
const getAddresses = (state: RootState) => state.userAddress.addresses;
const getCurrentAddress = (state: RootState) => state.userAddress.currentAddress;
const getDefaultAddress = (state: RootState) => state.userAddress.defaultAddress;
const getAddressLoadingState = (state: RootState) => state.userAddress.loading;
const getAddressErrorState = (state: RootState) => state.userAddress.error;
const getLastAddressRequestTimestamp = (state: RootState) => state.userAddress.lastRequestTimestamp;

// Selectors cơ bản
export const selectAddresses = getAddresses;
export const selectCurrentAddress = getCurrentAddress;
export const selectDefaultAddress = getDefaultAddress;
export const selectAddressLoading = getAddressLoadingState;
export const selectAddressError = getAddressErrorState;
export const selectLastAddressRequestTimestamp = getLastAddressRequestTimestamp;

// Selector lấy số lượng địa chỉ
export const selectAddressCount = createSelector(
    [getAddresses],
    (addresses) => addresses.length
);

// Selector kiểm tra xem có địa chỉ nào không
export const selectHasAddresses = createSelector(
    [getAddresses],
    (addresses) => addresses.length > 0
);

// Selector kiểm tra xem có địa chỉ mặc định không
export const selectHasDefaultAddress = createSelector(
    [getDefaultAddress],
    (defaultAddress) => defaultAddress !== null
);

// Selector lấy địa chỉ theo ID
export const selectAddressById = createSelector(
    [
        (state: RootState) => getAddresses(state),
        (_: RootState, addressId: number) => addressId
    ],
    (addresses, addressId) => {
        return addresses.find(address => address.addressId === addressId) || null;
    }
);

// Selector lấy địa chỉ mặc định nếu có, nếu không lấy địa chỉ đầu tiên
export const selectDefaultOrFirstAddress = createSelector(
    [getAddresses, getDefaultAddress],
    (addresses, defaultAddress) => {
        if (defaultAddress) return defaultAddress;
        return addresses.length > 0 ? addresses[0] : null;
    }
);

// Selector lấy danh sách địa chỉ đã sắp xếp (mặc định lên đầu)
export const selectSortedAddresses = createSelector(
    [getAddresses],
    (addresses) => {
        return [...addresses].sort((a, b) => {
            // Địa chỉ mặc định được đưa lên đầu
            if (a.isDefault && !b.isDefault) return -1;
            if (!a.isDefault && b.isDefault) return 1;
            return 0;
        });
    }
);

// Selector lấy tất cả các thành phố/tỉnh từ địa chỉ người dùng
export const selectAllCities = createSelector(
    [getAddresses],
    (addresses) => {
        const cities = new Set<string>();
        addresses.forEach(address => {
            if (address.city) {
                cities.add(address.city);
            }
        });
        return Array.from(cities).sort();
    }
);

// Selector lấy tất cả các quận/huyện từ địa chỉ người dùng
export const selectAllDistricts = createSelector(
    [getAddresses],
    (addresses) => {
        const districts = new Set<string>();
        addresses.forEach(address => {
            if (address.district) {
                districts.add(address.district);
            }
        });
        return Array.from(districts).sort();
    }
);

// Selector lấy tất cả các phường/xã từ địa chỉ người dùng
export const selectAllWards = createSelector(
    [getAddresses],
    (addresses) => {
        const wards = new Set<string>();
        addresses.forEach(address => {
            if (address.ward) {
                wards.add(address.ward);
            }
        });
        return Array.from(wards).sort();
    }
);

// Selector lấy tất cả số điện thoại từ địa chỉ người dùng
export const selectAllPhoneNumbers = createSelector(
    [getAddresses],
    (addresses) => {
        const phoneNumbers = new Set<string>();
        addresses.forEach(address => {
            if (address.phoneNumber) {
                phoneNumbers.add(address.phoneNumber);
            }
        });
        return Array.from(phoneNumbers);
    }
);

// Selector lấy địa chỉ có thể dùng cho đơn hàng
export const selectValidAddressesForOrder = createSelector(
    [getAddresses],
    (addresses) => {
        // Địa chỉ hợp lệ cho đơn hàng phải có số điện thoại
        return addresses.filter(address => address.phoneNumber && address.phoneNumber.length > 0);
    }
);

// Selector kiểm tra một địa chỉ có phải là địa chỉ mặc định
export const selectIsDefaultAddress = createSelector(
    [
        (state: RootState) => getAddresses(state),
        (_: RootState, addressId: number) => addressId
    ],
    (addresses, addressId) => {
        const address = addresses.find(addr => addr.addressId === addressId);
        return address ? address.isDefault : false;
    }
);

// Selector để format địa chỉ thành chuỗi đầy đủ
export const selectFormattedAddress = createSelector(
    [
        (state: RootState) => getAddresses(state),
        (_: RootState, addressId: number) => addressId
    ],
    (addresses, addressId) => {
        const address = addresses.find(addr => addr.addressId === addressId);
        if (!address) return '';

        const parts = [
            address.addressLine,
            address.ward,
            address.district,
            address.city
        ].filter(Boolean);

        return parts.join(', ');
    }
);

// Selector để lấy địa chỉ đầy đủ kèm số điện thoại
export const selectFormattedAddressWithPhone = createSelector(
    [
        (state: RootState) => getAddresses(state),
        (_: RootState, addressId: number) => addressId
    ],
    (addresses, addressId) => {
        const address = addresses.find(addr => addr.addressId === addressId);
        if (!address) return '';

        const addressParts = [
            address.addressLine,
            address.ward,
            address.district,
            address.city
        ].filter(Boolean);

        const formattedAddress = addressParts.join(', ');
        return address.phoneNumber ?
            `${formattedAddress} - SĐT: ${address.phoneNumber}` :
            formattedAddress;
    }
);

// Selector để kiểm tra địa chỉ có số điện thoại hay không
export const selectAddressHasPhone = createSelector(
    [
        (state: RootState) => getAddresses(state),
        (_: RootState, addressId: number) => addressId
    ],
    (addresses, addressId) => {
        const address = addresses.find(addr => addr.addressId === addressId);
        return address ? Boolean(address.phoneNumber) : false;
    }
);