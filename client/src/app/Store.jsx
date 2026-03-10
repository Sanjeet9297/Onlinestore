import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers} from 'redux'
import userReducer from '../features/users/UserSlice';
import bagReducer from '../features/bag/BagSlice';
import offerReducer from '../features/offers/OfferSlice';

//persist Config
const persistConfig = {
    key : "root",
    storage
}

const rootReducer = combineReducers({
    user: userReducer,
    bag: bagReducer,
    offers: offerReducer,
})

//persist reducer
const persistedReducer  = persistReducer(persistConfig, rootReducer);

const store = configureStore({
    reducer: persistedReducer,
});

export const persistor = persistStore(store);
export default store;