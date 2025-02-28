import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AddressResponseDTO } from '../../types/user.address.types';

interface UserAddressState {
    addresses: AddressResponseDTO[]; // Danh sách địa chỉ của người dùng
    currentAddress: AddressResponseDTO | null; // Địa chỉ hiện tại đang xem/chỉnh sửa
    defaultAddress: AddressResponseDTO | null; // Địa chỉ mặc định
    loading: boolean; // Trạng thái tải
    error: string | null; // Lỗi nếu có
    lastRequestTimestamp: number; // Thời gian yêu cầu cuối cùng
}

const initialState: UserAddressState = {
    addresses: [],
    currentAddress: null,
    defaultAddress: null,
    loading: false,
    error: null,
    lastRequestTimestamp: 0
};

// Hàm hỗ trợ để đảm bảo dữ liệu địa chỉ hợp lệ
const ensureAddressData = (address: AddressResponseDTO): AddressResponseDTO => {
    if (!address) return address;
    return {
        ...address,
        addressLine: address.addressLine || '',
        city: address.city || undefined,
        district: address.district || undefined,
        ward: address.ward || undefined,
        phoneNumber: address.phoneNumber || '',
        isDefault: address.isDefault || false
    };
};

const userAddressSlice = createSlice({
    name: 'userAddress',
    initialState,
    reducers: {
        // Bắt đầu tải dữ liệu địa chỉ
        fetchAddressStart(state) {
            state.loading = true;
            state.error = null;
            state.lastRequestTimestamp = Date.now();
        },

        // Thành công khi lấy danh sách địa chỉ
        fetchAddressesSuccess(state, action: PayloadAction<AddressResponseDTO[]>) {
            state.loading = false;
            try {
                if (Array.isArray(action.payload)) {
                    state.addresses = action.payload.map(address => ensureAddressData(address));
                    console.log('Addresses stored in Redux:', state.addresses);

                    // Tìm địa chỉ mặc định (nếu có)
                    const defaultAddress = action.payload.find(addr => addr.isDefault);
                    if (defaultAddress) {
                        state.defaultAddress = ensureAddressData(defaultAddress);
                    }
                } else {
                    console.warn('Received invalid address list data:', action.payload);
                    state.error = 'Dữ liệu danh sách địa chỉ không hợp lệ';
                }
            } catch (error) {
                console.error('Error processing address list data:', error);
                state.error = 'Lỗi xử lý dữ liệu danh sách địa chỉ';
            }
        },

        // Thành công khi lấy chi tiết địa chỉ
        fetchAddressByIdSuccess(state, action: PayloadAction<AddressResponseDTO>) {
            state.loading = false;
            try {
                if (action.payload && action.payload.addressId) {
                    state.currentAddress = ensureAddressData(action.payload);
                    console.log('Address data stored in Redux:', state.currentAddress);
                } else {
                    console.warn('Received invalid address data:', action.payload);
                    state.error = 'Dữ liệu địa chỉ không hợp lệ';
                }
            } catch (error) {
                console.error('Error processing address data:', error);
                state.error = 'Lỗi xử lý dữ liệu địa chỉ';
            }
        },

        // Thành công khi lấy địa chỉ mặc định
        fetchDefaultAddressSuccess(state, action: PayloadAction<AddressResponseDTO>) {
            state.loading = false;
            try {
                if (action.payload && action.payload.addressId) {
                    state.defaultAddress = ensureAddressData(action.payload);
                    console.log('Default address stored in Redux:', state.defaultAddress);
                } else {
                    console.warn('Received invalid default address data:', action.payload);
                    state.error = 'Dữ liệu địa chỉ mặc định không hợp lệ';
                }
            } catch (error) {
                console.error('Error processing default address data:', error);
                state.error = 'Lỗi xử lý dữ liệu địa chỉ mặc định';
            }
        },

        // Thất bại khi tải dữ liệu
        fetchAddressFailure(state, action: PayloadAction<string>) {
            state.loading = false;
            state.error = action.payload;
        },

        // Thêm địa chỉ mới thành công
        createAddressSuccess(state, action: PayloadAction<AddressResponseDTO>) {
            state.loading = false;
            try {
                const newAddress = ensureAddressData(action.payload);
                state.addresses = [...state.addresses, newAddress];
                state.currentAddress = newAddress;

                // Nếu địa chỉ mới là mặc định, cập nhật trong state
                if (newAddress.isDefault) {
                    // Cập nhật các địa chỉ khác không còn là mặc định
                    state.addresses = state.addresses.map(addr =>
                        addr.addressId !== newAddress.addressId
                            ? { ...addr, isDefault: false }
                            : addr
                    );
                    state.defaultAddress = newAddress;
                }

                console.log('Created new address:', newAddress);
            } catch (error) {
                console.error('Error processing new address data:', error);
                state.error = 'Lỗi xử lý dữ liệu địa chỉ mới';
            }
        },

        // Cập nhật địa chỉ thành công
        updateAddressSuccess(state, action: PayloadAction<AddressResponseDTO>) {
            state.loading = false;
            try {
                const updatedAddress = ensureAddressData(action.payload);

                // Cập nhật địa chỉ trong danh sách
                state.addresses = state.addresses.map(addr =>
                    addr.addressId === updatedAddress.addressId ? updatedAddress : addr
                );

                // Cập nhật địa chỉ hiện tại nếu đang xem
                if (state.currentAddress && state.currentAddress.addressId === updatedAddress.addressId) {
                    state.currentAddress = updatedAddress;
                }

                // Xử lý cập nhật địa chỉ mặc định
                if (updatedAddress.isDefault) {
                    // Cập nhật các địa chỉ khác không còn là mặc định
                    state.addresses = state.addresses.map(addr =>
                        addr.addressId !== updatedAddress.addressId
                            ? { ...addr, isDefault: false }
                            : addr
                    );
                    state.defaultAddress = updatedAddress;
                } else if (state.defaultAddress && state.defaultAddress.addressId === updatedAddress.addressId) {
                    // Địa chỉ đã không còn là mặc định, tìm địa chỉ mặc định mới nếu có
                    const newDefault = state.addresses.find(addr => addr.isDefault);
                    state.defaultAddress = newDefault || null;
                }

                console.log('Updated address:', updatedAddress);
            } catch (error) {
                console.error('Error processing updated address data:', error);
                state.error = 'Lỗi xử lý dữ liệu cập nhật địa chỉ';
            }
        },

        // Xóa địa chỉ thành công
        deleteAddressSuccess(state, action: PayloadAction<number>) {
            state.loading = false;
            const addressId = action.payload;

            // Cập nhật danh sách địa chỉ
            state.addresses = state.addresses.filter(addr => addr.addressId !== addressId);

            // Cập nhật địa chỉ hiện tại nếu cần
            if (state.currentAddress && state.currentAddress.addressId === addressId) {
                state.currentAddress = null;
            }

            // Cập nhật địa chỉ mặc định nếu cần
            if (state.defaultAddress && state.defaultAddress.addressId === addressId) {
                // Tìm địa chỉ mặc định mới nếu có
                const newDefault = state.addresses.find(addr => addr.isDefault);
                state.defaultAddress = newDefault || null;
            }

            console.log('Deleted address:', addressId);
        },

        // Đặt địa chỉ làm mặc định thành công
        setDefaultAddressSuccess(state, action: PayloadAction<AddressResponseDTO>) {
            state.loading = false;
            try {
                const defaultAddress = ensureAddressData(action.payload);

                // Cập nhật trạng thái mặc định của tất cả địa chỉ
                state.addresses = state.addresses.map(addr => ({
                    ...addr,
                    isDefault: addr.addressId === defaultAddress.addressId
                }));

                // Cập nhật địa chỉ mặc định
                state.defaultAddress = defaultAddress;

                // Cập nhật địa chỉ hiện tại nếu đang xem
                if (state.currentAddress && state.currentAddress.addressId === defaultAddress.addressId) {
                    state.currentAddress = defaultAddress;
                }

                console.log('Set default address:', defaultAddress);
            } catch (error) {
                console.error('Error processing default address data:', error);
                state.error = 'Lỗi xử lý dữ liệu địa chỉ mặc định';
            }
        },

        // Xóa lỗi
        clearAddressError(state) {
            state.error = null;
        },

        // Reset trạng thái địa chỉ hiện tại
        resetCurrentAddress(state) {
            state.currentAddress = null;
        },

        // Reset toàn bộ trạng thái
        resetAddressState() {
            return initialState;
        }
    },
});

export const {
    fetchAddressStart,
    fetchAddressesSuccess,
    fetchAddressByIdSuccess,
    fetchDefaultAddressSuccess,
    fetchAddressFailure,
    createAddressSuccess,
    updateAddressSuccess,
    deleteAddressSuccess,
    setDefaultAddressSuccess,
    clearAddressError,
    resetCurrentAddress,
    resetAddressState
} = userAddressSlice.actions;

export default userAddressSlice.reducer;