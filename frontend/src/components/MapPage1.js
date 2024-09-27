// src/App.js
import React, { useRef, useState } from 'react';
//import { connect } from 'react-redux';
//import {

//} from '../redux/MapSlice';
import Map from './Map';

const MapPage = () => {
  const mapRef = useRef(); // Create a ref for the Map component

  // Define state for address and name
  const [address, setAddress] = useState('');
  const [name, setName] = useState('');

  // Handle address input change
  const handleAddressChange = (event) => {
    setAddress(event.target.value); // Update address state
  };

  // Handle name input change
  const handleNameChange = (event) => {
    setName(event.target.value); // Update name state
  };

  // Handle search button click
  const handleSearchClick = () => {
    // Call the fetchTilesLonLat method in the Map component
    if (mapRef.current) {
      mapRef.current.fetchCoordinates(address); // Call the method
    }
  };

  return (
    <>
      <div className="map-container">
        <Map ref={mapRef} address={address} /> {/* Pass address to Map component */}

        <div className="map-menu">
          <div className="map-input-group">
            <label className="map-input-label">Address</label>
            <div className="map-input-wrapper">
              <input
                type="text"
                name="address"
                value={address} // Bind address state
                onChange={handleAddressChange} // Call local handler
                className="map-input-field"
              />
              <button
                className="map-green-button"
                onClick={handleSearchClick} // Call local handler
              >
                Search
              </button>
            </div>
          </div>

          <div className="map-input-group">
            <label className="map-input-label">Name</label>
            <div className="map-input-wrapper">
              <input
                type="text"
                name="name"
                value={name} // Bind name state
                onChange={handleNameChange} // Call local handler
                className="map-input-field"
              />
              <button className="map-blue-button">⌖</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

//const mapStateToProps = (state) => ({});
//const mapDispatchToProps = {};
//export default connect(mapStateToProps, mapDispatchToProps)(MapPage);
export default MapPage;