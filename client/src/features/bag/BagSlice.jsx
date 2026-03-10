import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  bags: {},
};

const bagSlice = createSlice({
  name: "bag",
  initialState,
  reducers: {
    initializeBag: (state, action) => {
      const { userId } = action.payload;

      // Ensure bags object is defined
      if (!state.bags) {
        state.bags = {};
      }

      if (!state.bags[userId]) {
        state.bags[userId] = {
          quantities: {},
          calculatedSubtotal: 0,
        };
        console.log(state.bags);
      }
    },
    addToBagQty: (state, action) => {
      const { userId, productId } = action.payload;

      state.bags[userId].quantities[productId] = 1;
    },
    updateQuantity: (state, action) => {
      const { userId, productId, quantity } = action.payload;
      if (!state.bags[userId]) return; 

      if (quantity > 0) {
        state.bags[userId].quantities[productId] = quantity;
      } else {
        delete state.bags[userId].quantities[productId];
      }
    },
    removeProduct: (state, action) => {
      const { userId, productId } = action.payload;
      if (!state.bags[userId]) return; 
      delete state.bags[userId].quantities[productId];
    },
    storeSubtotal: (state, action) => {
      const { userId, subtotal } = action.payload;
      if (state.bags[userId]) {
        state.bags[userId].calculatedSubtotal = subtotal;
      }
    },
    emptyBag: (state, action) => {
      const { userId } = action.payload;
      if (state.bags[userId]) {
        state.bags[userId] = {
          quantities: {},
          calculatedSubtotal: 0,
        };
      }
    },
  },
});

export const { initializeBag, addToBagQty, updateQuantity, removeProduct, storeSubtotal, emptyBag } =
  bagSlice.actions;

export default bagSlice.reducer;
