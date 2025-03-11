import {configureStore} from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import productReducer from './slices/productSlice';
import cartReducer from './slices/cartSlice';
import orderReducer from './slices/orderSlice';
import userAddressReducer from "./slices/userAddressSlice.tsx";
import shippingReducer from "./slices/shippingSlice.tsx";
import paymentReducer from "./slices/paymentSlice.tsx";
import paymentMethodReducer from "./slices/paymentMethodSlice.tsx";
import couponReducer from "./slices/couponSlice.tsx";
import brandCategoryReducer from "./slices/brandCategorySlice.tsx";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        product: productReducer,
        cart: cartReducer,
        order: orderReducer,
        shipping: shippingReducer,
        userAddress: userAddressReducer,
        payment: paymentReducer,
        paymentMethod: paymentMethodReducer,
        coupon: couponReducer,
        brandCategory: brandCategoryReducer,

        // Thêm các reducer khác nếu cần
    },
});

// Định nghĩa các type cho RootState và AppDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;