import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    uid: null,
    username: null,
    email: null,
    isVerified: false,
    googleUser: false,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser(state, action) {
            state.uid = action.payload.uid;
            state.username = action.payload.username;
            state.email = action.payload.email;
            state.isVerified = action.payload.isVerified;
            state.googleUser = action.payload.googleUser;
        },
        logoutUser(state) {
            state.uid = null;
            state.username = null;
            state.email = null;
            state.isVerified = false;
        }
    },
});

export const { setUser, logoutUser } = userSlice.actions;

export default userSlice.reducer;