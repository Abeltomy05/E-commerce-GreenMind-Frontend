import { configureStore,combineReducers  } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; 

import userReducer from './userSlice'; 
import adminReducer from './adminSlice'
import cartReducer from './cartSlice'

const rootReducer = combineReducers({
  user: userReducer,
  admin: adminReducer,
  cart: cartReducer,
});

const persistConfig = {
  key: 'root',
  storage, 
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"]
      }
    })
});

const persistor = persistStore(store);

export { store, persistor };