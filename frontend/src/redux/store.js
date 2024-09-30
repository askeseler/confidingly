// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import formReducer from './FormSlice';
import mapReducer from './MapSlice';
import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';
import { combineReducers } from 'redux';
const persistConfig = {key: 'root',storage,};
const rootReducer = combineReducers({form: formReducer,map: mapReducer});
const persistedReducer = persistReducer(persistConfig, rootReducer);
export const store = configureStore({reducer: persistedReducer,});
export const persistor = persistStore(store);
