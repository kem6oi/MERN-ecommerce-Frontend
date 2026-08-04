import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { addToCart, deleteItemFromCart, fetchItemsByUserId, resetCart, updateCart } from './cartAPI';

const initialState = {
  status: 'idle',
  items: [],
  cartLoaded: false
};

export const addToCartAsync = createAsyncThunk(
  'cart/addToCart',
  async ({item, alert}, { getState }) => {
    const state = getState();
    const user = state.auth.loggedInUserToken;
    if (user) {
      const response = await addToCart(item);
      alert.success('Item Added to Cart');
      return response.data;
    } else {
      const product = state.product.selectedProduct;
      const cartItem = {
        id: Date.now().toString(),
        product,
        quantity: item.quantity || 1,
        color: item.color,
        size: item.size
      };
      const localCart = localStorage.getItem('cart');
      const cart = localCart ? JSON.parse(localCart) : [];
      cart.push(cartItem);
      localStorage.setItem('cart', JSON.stringify(cart));
      alert.success('Item Added to Cart');
      return cartItem;
    }
  }
);

export const fetchItemsByUserIdAsync = createAsyncThunk(
  'cart/fetchItemsByUserId',
  async (_, { getState }) => {
    const state = getState();
    const user = state.auth.loggedInUserToken;
    if (user) {
      const response = await fetchItemsByUserId();
      return response.data;
    } else {
      const localCart = localStorage.getItem('cart');
      return localCart ? JSON.parse(localCart) : [];
    }
  }
);

export const updateCartAsync = createAsyncThunk(
  'cart/updateCart',
  async (update, { getState }) => {
    const state = getState();
    const user = state.auth.loggedInUserToken;
    if (user) {
      const response = await updateCart(update);
      return response.data;
    } else {
      const localCart = localStorage.getItem('cart');
      const cart = localCart ? JSON.parse(localCart) : [];
      const index = cart.findIndex(item => item.id === update.id);
      if (index > -1) {
        cart[index] = { ...cart[index], ...update };
        localStorage.setItem('cart', JSON.stringify(cart));
        return cart[index];
      }
      return update;
    }
  }
);

export const deleteItemFromCartAsync = createAsyncThunk(
  'cart/deleteItemFromCart',
  async (itemId, { getState }) => {
    const state = getState();
    const user = state.auth.loggedInUserToken;
    if (user) {
      const response = await deleteItemFromCart(itemId);
      return response.data;
    } else {
      const localCart = localStorage.getItem('cart');
      const cart = localCart ? JSON.parse(localCart) : [];
      const index = cart.findIndex(item => item.id === itemId);
      if (index > -1) {
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
      }
      return { id: itemId };
    }
  }
);

export const resetCartAsync = createAsyncThunk(
  'cart/resetCart',
  async (_, { getState }) => {
    const state = getState();
    const user = state.auth.loggedInUserToken;
    if (user) {
      const response = await resetCart();
      return response.data;
    } else {
      localStorage.removeItem('cart');
      return { status: 'success' };
    }
  }
);

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
  },
  extraReducers: (builder) => {
    builder
      .addCase(addToCartAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        state.items.push(action.payload);
      })
      .addCase(fetchItemsByUserIdAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchItemsByUserIdAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        state.items = action.payload;
        state.cartLoaded = true;
      })
      .addCase(fetchItemsByUserIdAsync.rejected, (state, action) => {
        state.status = 'idle';
        state.cartLoaded = true;
      })
      .addCase(updateCartAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateCartAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        const index =  state.items.findIndex(item=>item.id===action.payload.id)
        state.items[index] = action.payload;
      })
      .addCase(deleteItemFromCartAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteItemFromCartAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        const index =  state.items.findIndex(item=>item.id===action.payload.id)
        state.items.splice(index,1);
      })
      .addCase(resetCartAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(resetCartAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        state.items = [];
      })
  },
});

// export const { increment } = cartSlice.actions;

export const selectItems = (state) => state.cart.items;
export const selectCartStatus = (state) => state.cart.status;
export const selectCartLoaded = (state) => state.cart.cartLoaded;

export default cartSlice.reducer;
