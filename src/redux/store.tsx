import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import productReducer from './slices/productSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        product: productReducer,
        // Thêm các reducer khác nếu cần
    },
});

// Định nghĩa các type cho RootState và AppDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;