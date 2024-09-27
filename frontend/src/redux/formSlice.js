import { createSlice } from '@reduxjs/toolkit';
const initialState = {
  latitude: 0,
  longitude: 0,
  checkbox: false,
  inputField: '',};
const formSlice = createSlice({
  name: 'form',
  initialState,
  reducers: {
    updateLatitude: (state, action) => {state.latitude = action.payload;},
    incrementLongitude: (state) => {state.longitude += 1;},
    decrementLongitude: (state) => {state.longitude -= 1;},
    toggleCheckbox: (state) => {state.checkbox = !state.checkbox;},
    updateInputField: (state, action) => {state.inputField = action.payload;},
  },});
export const {updateLatitude,incrementLongitude,decrementLongitude,
	toggleCheckbox,updateInputField,} = formSlice.actions;
  export default formSlice.reducer;
